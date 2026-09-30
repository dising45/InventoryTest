import { supabase } from './supabaseClient';
import { generateSKU } from './inventoryService.supabase';

type POItemInput = {
  product_id?: string;        // optional → new product (non-legacy only)
  product_name?: string;      // required if new
  has_variants?: boolean;
  variant_id?: string | null;
  variant_name?: string;
  quantity: number;
  unit_cost: number;
  sell_price?: number;        // only for new product
};

type POChargeInput = {
  description?: string;
  amount: number;
  category: string;           // expense category (Shipping / Packaging / Other)
};

type POInput = {
  supplier_id: string;
  notes?: string;
  bill_date?: string;         // yyyy-mm-dd; defaults to today
  discount?: number;
  discount_type?: 'flat' | 'percent';
  status?: 'unpaid' | 'paid';
  is_legacy?: boolean;
  items: POItemInput[];
  charges?: POChargeInput[];
};

/* ---------- pure helpers ---------- */
const round2 = (n: number) => Math.round(n * 100) / 100;

function computeTotals(input: POInput) {
  const goodsSubtotal = input.items.reduce(
    (sum, i) => sum + i.quantity * i.unit_cost,
    0
  );
  const discount = Number(input.discount ?? 0);
  const discountValue =
    input.discount_type === 'percent'
      ? goodsSubtotal * (discount / 100)
      : discount;
  const scale = goodsSubtotal > 0 ? (goodsSubtotal - discountValue) / goodsSubtotal : 1;
  const chargesTotal = (input.charges ?? []).reduce((s, c) => s + Number(c.amount || 0), 0);
  const totalAmount = round2(goodsSubtotal - discountValue + chargesTotal);
  return { goodsSubtotal, discountValue, scale, chargesTotal, totalAmount };
}

export const purchaseService = {
  /* ===============================
     CREATE VENDOR BILL
     =============================== */
  async createPO(data: POInput) {
    const { scale, totalAmount } = computeTotals(data);
    const isLegacy = !!data.is_legacy;
    const status = data.status ?? 'unpaid';

    /* 1️⃣ Insert bill header */
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
        notes: data.notes ?? null,
        bill_date: data.bill_date ?? new Date().toISOString().slice(0, 10),
        discount: Number(data.discount ?? 0),
        discount_type: data.discount_type ?? 'flat',
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
        is_legacy: isLegacy,
      })
      .select()
      .single();

    if (poError || !po) throw poError;

    try {
      /* 2️⃣ Resolve + insert items */
      const resolvedItems = await this.resolveItems(data.items, isLegacy);
      if (resolvedItems.length > 0) {
        const itemsPayload = resolvedItems.map((i) => ({
          purchase_order_id: po.id,
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_cost: i.unit_cost,
          line_total: i.quantity * i.unit_cost,
        }));
        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsPayload);
        if (itemsError) throw itemsError;
      }

      /* 3️⃣ Stock + cost price (skipped for legacy bills) */
      if (!isLegacy) {
        await this.adjustStock(resolvedItems, 'add');
        for (const i of resolvedItems) {
          await supabase
            .from('products')
            .update({ cost_price: round2(i.unit_cost * scale) })
            .eq('id', i.product_id);
        }
      }

      /* 4️⃣ Insert charge rows */
      const chargeRows = await this.insertCharges(po.id, data.charges ?? []);

      /* 5️⃣ If created as paid, post charge expenses */
      if (status === 'paid') {
        await this.createChargeExpenses(po, chargeRows);
      }

      return po;
    } catch (err) {
      /* Roll back: remove any charge expenses, then the bill (charges cascade) */
      await this.deleteChargeExpenses(po.id);
      await supabase.from('purchase_orders').delete().eq('id', po.id);
      throw err;
    }
  },

  /* ===============================
     UPDATE VENDOR BILL (full edit)
     =============================== */
  async updatePO(poId: string, data: POInput) {
    const { scale, totalAmount } = computeTotals(data);
    const isLegacy = !!data.is_legacy;

    /* Existing state */
    const { data: existing } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', poId)
      .single();
    if (!existing) throw new Error('Bill not found');

    const { data: oldItems } = await supabase
      .from('purchase_items')
      .select('product_id, variant_id, quantity')
      .eq('purchase_order_id', poId);

    /* 1️⃣ Reverse old stock (only if the old bill affected stock) */
    if (!existing.is_legacy && oldItems && oldItems.length > 0) {
      await this.adjustStock(oldItems, 'deduct');
    }

    /* 2️⃣ Replace items */
    await supabase.from('purchase_items').delete().eq('purchase_order_id', poId);
    const resolvedItems = await this.resolveItems(data.items, isLegacy);
    if (resolvedItems.length > 0) {
      const itemsPayload = resolvedItems.map((i) => ({
        purchase_order_id: poId,
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
        line_total: i.quantity * i.unit_cost,
      }));
      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsPayload);
      if (itemsError) throw itemsError;
    }

    /* 3️⃣ Re-apply stock + cost price (skipped for legacy) */
    if (!isLegacy) {
      await this.adjustStock(resolvedItems, 'add');
      for (const i of resolvedItems) {
        await supabase
          .from('products')
          .update({ cost_price: round2(i.unit_cost * scale) })
          .eq('id', i.product_id);
      }
    }

    /* 4️⃣ Rebuild charges + their expenses */
    await this.deleteChargeExpenses(poId);
    await supabase.from('purchase_charges').delete().eq('purchase_order_id', poId);
    const chargeRows = await this.insertCharges(poId, data.charges ?? []);

    const status = data.status ?? existing.status ?? 'unpaid';

    /* 5️⃣ Update header */
    const { data: po, error: updErr } = await supabase
      .from('purchase_orders')
      .update({
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
        notes: data.notes ?? null,
        bill_date: data.bill_date ?? existing.bill_date,
        discount: Number(data.discount ?? 0),
        discount_type: data.discount_type ?? 'flat',
        status,
        paid_at: status === 'paid' ? existing.paid_at ?? new Date().toISOString() : null,
        is_legacy: isLegacy,
      })
      .eq('id', poId)
      .select()
      .single();
    if (updErr) throw updErr;

    /* 6️⃣ Post charge expenses if paid */
    if (status === 'paid') {
      await this.createChargeExpenses(po, chargeRows);
    }

    return po;
  },

  /* ===============================
     MARK PAID / UNPAID
     =============================== */
  async markPaid(poId: string) {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', poId)
      .single();
    if (!po || po.status === 'paid') return po;

    const { data: charges } = await supabase
      .from('purchase_charges')
      .select('*')
      .eq('purchase_order_id', poId);

    await this.createChargeExpenses(po, charges ?? []);

    const { data: updated } = await supabase
      .from('purchase_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', poId)
      .select()
      .single();
    return updated;
  },

  async markUnpaid(poId: string) {
    await this.deleteChargeExpenses(poId);
    const { data: updated } = await supabase
      .from('purchase_orders')
      .update({ status: 'unpaid', paid_at: null })
      .eq('id', poId)
      .select()
      .single();
    return updated;
  },

  /* ===============================
     READ
     =============================== */
  async getPOs() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
      *,
      supplier:suppliers(*),
      items:purchase_items(
        *,
        product:products(name),
        variant:variants(name)
      ),
      charges:purchase_charges(*)
    `)
      .order('bill_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /* ===============================
     DELETE VENDOR BILL
     =============================== */
  async deletePO(poId: string) {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('is_legacy')
      .eq('id', poId)
      .single();

    // Roll back stock (only for non-legacy bills that touched stock)
    if (!po?.is_legacy) {
      const { data: items } = await supabase
        .from('purchase_items')
        .select('product_id, variant_id, quantity')
        .eq('purchase_order_id', poId);
      if (items && items.length > 0) {
        await this.adjustStock(items, 'deduct');
      }
    }

    // Remove any generated charge expenses
    await this.deleteChargeExpenses(poId);

    await supabase.from('purchase_items').delete().eq('purchase_order_id', poId);
    // purchase_charges rows cascade with the bill
    const { error } = await supabase.from('purchase_orders').delete().eq('id', poId);
    if (error) throw error;
  },

  /* ===============================
     INTERNAL HELPERS
     =============================== */

  /** Resolve item inputs to concrete { product_id, variant_id, quantity, unit_cost }.
   *  Non-legacy: creates new products/variants when no product_id is given.
   *  Legacy: informational only — drops lines that have no existing product_id. */
  async resolveItems(items: POItemInput[], isLegacy: boolean) {
    const resolved: {
      product_id: string;
      variant_id: string | null;
      quantity: number;
      unit_cost: number;
    }[] = [];

    for (const item of items) {
      let productId = item.product_id;

      if (!productId) {
        if (isLegacy) continue; // legacy bills never create products
        if (!item.product_name) throw new Error('Product name required for new product');

        const sku = await generateSKU();
        const { data: product, error } = await supabase
          .from('products')
          .insert({
            name: item.product_name,
            has_variants: item.has_variants ?? false,
            cost_price: item.unit_cost,
            sell_price: item.sell_price ?? item.unit_cost * 3,
            stock: 0,
            sku,
          })
          .select()
          .single();
        if (error || !product) throw error;
        productId = product.id;

        if (item.has_variants && item.variant_name) {
          const { data: variant } = await supabase
            .from('variants')
            .insert({
              product_id: productId,
              name: item.variant_name,
              stock: 0,
              price_modifier: 0,
            })
            .select()
            .single();
          resolved.push({
            product_id: productId,
            variant_id: variant?.id ?? null,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          });
          continue;
        }
      }

      resolved.push({
        product_id: productId!,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      });
    }

    return resolved;
  },

  async insertCharges(poId: string, charges: POChargeInput[]) {
    const valid = charges.filter((c) => Number(c.amount) > 0);
    if (valid.length === 0) return [];
    const { data, error } = await supabase
      .from('purchase_charges')
      .insert(
        valid.map((c) => ({
          purchase_order_id: poId,
          description: c.description ?? null,
          amount: Number(c.amount),
          category: c.category || 'Other',
        }))
      )
      .select();
    if (error) throw error;
    return data ?? [];
  },

  /** Create one expense per charge (if not already linked) and store expense_id. */
  async createChargeExpenses(po: any, charges: any[]) {
    if (!charges || charges.length === 0) return;

    const { data: supplier } = await supabase
      .from('suppliers')
      .select('name')
      .eq('id', po.supplier_id)
      .single();
    const supplierName = supplier?.name ?? undefined;
    const reference = po.po_number ?? `BILL-${String(po.id).slice(0, 6).toUpperCase()}`;

    for (const charge of charges) {
      if (charge.expense_id) continue; // already posted
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert([
          {
            expense_date: po.bill_date ?? new Date().toISOString().slice(0, 10),
            category: charge.category || 'Other',
            description: charge.description || charge.category || 'Vendor bill charge',
            amount: Number(charge.amount),
            vendor: supplierName ?? null,
            reference,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from('purchase_charges')
        .update({ expense_id: expense.id })
        .eq('id', charge.id);
    }
  },

  /** Delete all expenses generated by a bill's charges and clear the links. */
  async deleteChargeExpenses(poId: string) {
    const { data: charges } = await supabase
      .from('purchase_charges')
      .select('id, expense_id')
      .eq('purchase_order_id', poId);

    for (const charge of charges ?? []) {
      if (charge.expense_id) {
        await supabase.from('expenses').delete().eq('id', charge.expense_id);
        await supabase
          .from('purchase_charges')
          .update({ expense_id: null })
          .eq('id', charge.id);
      }
    }
  },

  /* ===============================
     STOCK HANDLER
     =============================== */
  async adjustStock(
    items: {
      product_id: string;
      variant_id?: string | null;
      quantity: number;
    }[],
    mode: 'add' | 'deduct'
  ) {
    const factor = mode === 'add' ? 1 : -1;

    for (const item of items) {
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('variants')
          .select('id, stock, product_id')
          .eq('id', item.variant_id)
          .single();
        if (!variant) continue;

        await supabase
          .from('variants')
          .update({ stock: variant.stock + item.quantity * factor })
          .eq('id', variant.id);

        const { data: allVariants } = await supabase
          .from('variants')
          .select('stock')
          .eq('product_id', variant.product_id);

        const totalStock = allVariants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

        await supabase
          .from('products')
          .update({ stock: totalStock })
          .eq('id', variant.product_id);
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('id', item.product_id)
          .single();
        if (!product) continue;

        await supabase
          .from('products')
          .update({ stock: product.stock + item.quantity * factor })
          .eq('id', product.id);
      }
    }
  },
};
