import { supabase } from './supabaseClient';

export const purchaseService = {
  /* ===============================
     CREATE PURCHASE ORDER
     =============================== */
  async createPO(data: {
    supplier_id: string;
    items: {
      product_id?: string;        // optional → allows new product
      product_name?: string;      // required if product_id missing
      quantity: number;
      unit_cost: number;
    }[];
  }) {
    /* 1️⃣ Normalize items (ensure product exists) */
    const normalizedItems: {
      product_id: string;
      quantity: number;
      unit_cost: number;
    }[] = [];

    for (const item of data.items) {
      let productId = item.product_id;

      // 🔹 Create product if missing
      if (!productId) {
        if (!item.product_name) {
          throw new Error('Product name is required for new products');
        }

        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            name: item.product_name,
            cost_price: item.unit_cost,
            sell_price: item.unit_cost * 1.3, // default margin
            stock: 0,
            has_variants: false,
          })
          .select()
          .single();

        if (error || !newProduct) throw error;

        productId = newProduct.id;
      }

      normalizedItems.push({
        product_id: productId,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      });
    }

    /* 2️⃣ Calculate total */
    const totalAmount = normalizedItems.reduce(
      (sum, i) => sum + i.quantity * i.unit_cost,
      0
    );

    /* 3️⃣ Create PO */
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (poError || !po) throw poError;

    /* 4️⃣ Insert PO items */
    const itemsPayload = normalizedItems.map((i) => ({
      purchase_order_id: po.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
      line_total: i.quantity * i.unit_cost,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsPayload);

    if (itemsError) throw itemsError;

    /* 5️⃣ Increase stock */
    await this.adjustStock(normalizedItems, 'add');

    return po;
  },
  /* ===============================
     GET PURCHASE ORDERS
     =============================== */
  async getPOs() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
      *,
      supplier:suppliers(*),
      items:purchase_items(*)
    `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load POs', error);
      return [];
    }

    return data;
  },

  /* ===============================
     DELETE PURCHASE ORDER
     =============================== */
  async deletePO(poId: string) {
    /* 1️⃣ Fetch items */
    const { data: items, error } = await supabase
      .from('purchase_items')
      .select('product_id, quantity')
      .eq('purchase_order_id', poId);

    if (error) throw error;

    /* 2️⃣ Roll back stock */
    if (items?.length) {
      await this.adjustStock(items, 'deduct');
    }

    /* 3️⃣ Delete PO (items cascade) */
    const { error: deleteError } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', poId);

    if (deleteError) throw deleteError;
  },

  /* ===============================
     STOCK HANDLER
     =============================== */
  async adjustStock(
    items: {
      product_id: string;
      quantity: number;
    }[],
    mode: 'add' | 'deduct'
  ) {
    const factor = mode === 'add' ? 1 : -1;

    for (const item of items) {
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
  },
};
