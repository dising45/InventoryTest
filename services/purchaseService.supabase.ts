import { supabase } from './supabaseClient';
import { SalesItem } from '../types';

export const purchaseService = {
  /* ===============================
     CREATE PURCHASE ORDER
     =============================== */
  async createPO(data: {
    supplier_id: string;
    items: {
      product_id: string;
      variant_id?: string;
      quantity: number;
      unit_cost: number;
    }[];
  }) {
    /* 1️⃣ Calculate total */
    const totalAmount = data.items.reduce(
      (sum, i) => sum + i.quantity * i.unit_cost,
      0
    );

    /* 2️⃣ Create PO */
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: data.supplier_id,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (poError || !po) throw poError;

    /* 3️⃣ Insert items */
    const itemsPayload = data.items.map((i) => ({
      purchase_order_id: po.id,
      product_id: i.product_id,
      variant_id: i.variant_id ?? null,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
      line_total: i.quantity * i.unit_cost,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_items')
      .insert(itemsPayload);

    if (itemsError) throw itemsError;

    /* 4️⃣ Increase stock */
    await this.adjustStock(data.items, 'add');

    return po;
  },

  /* ===============================
     DELETE PURCHASE ORDER
     =============================== */
  async deletePO(poId: string) {
    /* 1️⃣ Fetch items */
    const { data: items, error } = await supabase
      .from('purchase_items')
      .select('*')
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
     STOCK HANDLER (SAFE)
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

        const newVariantStock = variant.stock + item.quantity * factor;

        await supabase
          .from('variants')
          .update({ stock: newVariantStock })
          .eq('id', variant.id);

        /* Recalculate product stock */
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

      /* -------- Simple Product -------- */
      } else {
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
