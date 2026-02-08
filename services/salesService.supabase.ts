import { supabase } from './supabaseClient';
import { SalesOrder, SalesItem } from '../types';

export const salesService = {
  async getSales(): Promise<SalesOrder[]> {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        *,
        items:sales_items(*),
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
    return data as SalesOrder[];
  },

  async createSale(sale: { customer_id: string; items: SalesItem[]; total_amount: number }) {
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        customer_id: sale.customer_id,
        subtotal: sale.total_amount,   // ✅ REQUIRED
        total_amount: sale.total_amount,
        status: 'completed'
      })
      .select()
      .single();


    if (orderError) throw orderError;

    // 2. Create Sales Items
    const itemsToInsert = sale.items.map(item => ({
      sales_order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('sales_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Deduct Stock (Sequential Safe Updates)
    // Note: In a production environment, this should be a Database Function (RPC) to ensure atomicity.
    for (const item of sale.items) {
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('variants')
          .select('stock')
          .eq('id', item.variant_id)
          .single();

        if (variant) {
          await supabase
            .from('variants')
            .update({ stock: variant.stock - item.quantity })
            .eq('id', item.variant_id);
        }
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    return order;
  }
};
