import { supabase } from './supabaseClient';
import { PurchaseItem } from '../types';

export const purchaseService = {
  async getPOs() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:purchase_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createPO(po: {
    supplier_id: string;
    items: PurchaseItem[];
    total_amount: number;
  }) {
    // 1️⃣ Create PO
    const { data: order, error } = await supabase
      .from('purchase_orders')
      .insert({
        supplier_id: po.supplier_id,
        total_amount: po.total_amount,
      })
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ Insert items
    const itemsPayload = po.items.map(i => ({
      purchase_order_id: order.id,
      product_id: i.product_id,
      variant_id: i.variant_id ?? null,
      quantity: i.quantity,
      unit_cost: i.unit_cost,
    }));

    await supabase.from('purchase_items').insert(itemsPayload);

    // 3️⃣ Increase stock
    for (const i of po.items) {
      if (i.variant_id) {
        const { data: v } = await supabase
          .from('variants')
          .select('stock, product_id')
          .eq('id', i.variant_id)
          .single();

        if (!v) continue;

        await supabase
          .from('variants')
          .update({ stock: v.stock + i.quantity })
          .eq('id', i.variant_id);

        const { data: vars } = await supabase
          .from('variants')
          .select('stock')
          .eq('product_id', v.product_id);

        const total = vars?.reduce((s, x) => s + x.stock, 0) ?? 0;
        await supabase.from('products').update({ stock: total }).eq('id', v.product_id);
      } else {
        const { data: p } = await supabase
          .from('products')
          .select('stock')
          .eq('id', i.product_id)
          .single();

        if (!p) continue;

        await supabase
          .from('products')
          .update({ stock: p.stock + i.quantity })
          .eq('id', i.product_id);
      }
    }
  },

  async deletePO(id: string) {
    const { data: items } = await supabase
      .from('purchase_items')
      .select('*')
      .eq('purchase_order_id', id);

    if (items) {
      for (const i of items) {
        if (i.variant_id) {
          const { data: v } = await supabase
            .from('variants')
            .select('stock, product_id')
            .eq('id', i.variant_id)
            .single();

          if (!v) continue;

          await supabase
            .from('variants')
            .update({ stock: v.stock - i.quantity })
            .eq('id', i.variant_id);

          const { data: vars } = await supabase
            .from('variants')
            .select('stock')
            .eq('product_id', v.product_id);

          const total = vars?.reduce((s, x) => s + x.stock, 0) ?? 0;
          await supabase.from('products').update({ stock: total }).eq('id', v.product_id);
        } else {
          const { data: p } = await supabase
            .from('products')
            .select('stock')
            .eq('id', i.product_id)
            .single();

          if (!p) continue;

          await supabase
            .from('products')
            .update({ stock: p.stock - i.quantity })
            .eq('id', i.product_id);
        }
      }
    }

    await supabase.from('purchase_items').delete().eq('purchase_order_id', id);
    await supabase.from('purchase_orders').delete().eq('id', id);
  },
};
