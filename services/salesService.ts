import { supabase } from './supabaseClient';
import { SalesOrder, SalesItem } from '../types';

export const salesService = {
  /* ===============================
     GET SALES
  =============================== */
  async getSales(): Promise<SalesOrder[]> {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        *,
        customer:customers(*),
        items:sales_items(
          *,
          product:products(name),
          variant:variants(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SalesOrder[];
  },

  /* ===============================
     CREATE SALE (ATOMIC)
  =============================== */
  async createSale(input: {
    customer_id: string;
    items: SalesItem[];
    total_amount: number;
  }) {
    const payload = input.items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }));

    const { data, error } = await supabase.rpc(
      'create_sale_transaction',
      {
        p_customer_id: input.customer_id,
        p_total_amount: input.total_amount,
        p_items: payload,
      }
    );

    if (error) throw error;
    return data;
  },

  /* ===============================
     UPDATE SALE (SAFE STRATEGY)
     → restore inventory
     → recreate sale
  =============================== */
  async updateSale(
    orderId: string,
    input: {
      customer_id: string;
      items: SalesItem[];
      total_amount: number;
    }
  ) {
    const { error: deleteError } = await supabase.rpc(
      'delete_sale_transaction',
      { p_order_id: orderId }
    );
    if (deleteError) throw deleteError;

    return this.createSale(input);
  },

  /* ===============================
     DELETE SALE
  =============================== */
  async deleteSale(orderId: string) {
    const { error } = await supabase.rpc(
      'delete_sale_transaction',
      { p_order_id: orderId }
    );
    if (error) throw error;
  },
};
