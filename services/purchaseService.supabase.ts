import { supabase } from './supabaseClient';

export const purchaseService = {
  /* ===============================
     CREATE PURCHASE ORDER
     =============================== */
  async createPO(data: {
    supplier_id: string;
    items: {
      product_id?: string;        // optional → new product
      product_name?: string;      // required if new
      has_variants?: boolean;
      variant_id?: string;
      variant_name?: string;
      quantity: number;
      unit_cost: number;
      sell_price?: number;        // only for new product
    }[];
  }) {
    /* 1️⃣ Calculate PO total */
    const totalAmount = data.items.reduce(
      (sum, i) => sum + i.quantity * i.unit_cost,
      0
    );

    /* 2️⃣ Create Purchase Order */
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (poError || !po) throw poError;

    /* 3️⃣ Resolve products (create if needed) */
    const resolvedItems = [];

    for (const item of data.items) {
      let productId = item.product_id;

      /* ---------- Create NEW product if needed ---------- */
      if (!productId) {
        if (!item.product_name) {
          throw new Error('Product name required for new product');
        }

        const { data: product, error } = await supabase
          .from('products')
          .insert({
            name: item.product_name,
            has_variants: item.has_variants ?? false,
            base_cost_price: item.unit_cost,
            sell_price: item.sell_price ?? item.unit_cost * 1.3,
            stock: item.has_variants ? 0 : item.quantity,
          })
          .select()
          .single();

        if (error || !product) throw error;
        productId = product.id;

        /* ---------- Optional variant creation ---------- */
        if (item.has_variants && item.variant_name) {
          const { data: variant } = await supabase
            .from('variants')
            .insert({
              product_id: productId,
              name: item.variant_name,
              stock: item.quantity,
              price_modifier: 0,
            })
            .select()
            .single();

          resolvedItems.push({
            product_id: productId,
            variant_id: variant?.id ?? null,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          });

          continue;
        }
      }

      resolvedItems.push({
        product_id: productId!,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      });
    }

    /* 4️⃣ Insert purchase items */
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

    /* 5️⃣ Update base_cost_price + stock */
    await this.adjustStock(resolvedItems, 'add');

    /* Update base cost price (latest PO wins) */
    for (const i of resolvedItems) {
      await supabase
        .from('products')
        .update({ base_cost_price: i.unit_cost })
        .eq('id', i.product_id);
    }

    return po;
  },
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
      )
    `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
      /* -------- Variant -------- */
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('variants')
          .select('id, stock, product_id')
          .eq('id', item.variant_id)
          .single();

        if (!variant) continue;

        await supabase
          .from('variants')
          .update({
            stock: variant.stock + item.quantity * factor,
          })
          .eq('id', variant.id);

        const { data: allVariants } = await supabase
          .from('variants')
          .select('stock')
          .eq('product_id', variant.product_id);

        const totalStock =
          allVariants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

        await supabase
          .from('products')
          .update({ stock: totalStock })
          .eq('id', variant.product_id);
      }
      /* -------- Simple Product -------- */
      else {
        const { data: product } = await supabase
          .from('products')
          .select('id, stock')
          .eq('id', item.product_id)
          .single();

        if (!product) continue;

        await supabase
          .from('products')
          .update({
            stock: product.stock + item.quantity * factor,
          })
          .eq('id', product.id);
      }
    }
  },
};
