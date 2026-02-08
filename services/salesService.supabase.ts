import { supabase } from './supabaseClient';
import { SalesOrder, SalesItem } from '../types';

export const salesService = {
  /* =========================
     GET SALES
  ==========================*/
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

  /* =========================
     CREATE SALE
  ==========================*/
  async createSale(sale: {
    customer_id: string;
    items: SalesItem[];
    total_amount: number;
  }) {
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        customer_id: sale.customer_id,
        subtotal: sale.total_amount,
        total_amount: sale.total_amount,
        status: 'completed',
      })
      .select()
      .single();

    if (orderError || !order) throw orderError;

    await this.insertItems(order.id, sale.items);
    await this.deductStock(sale.items);

    return order;
  },

  /* =========================
     UPDATE SALE (EDIT)
     restore → replace → deduct
  ==========================*/
  async updateSale(
    salesOrderId: string,
    sale: {
      customer_id: string;
      items: SalesItem[];
      total_amount: number;
    }
  ) {
    // 1️⃣ Restore stock from old items
    const { data: oldItems } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sales_order_id', salesOrderId);

    if (oldItems?.length) {
      await this.restoreStock(oldItems as SalesItem[]);
    }

    // 2️⃣ Delete old items
    await supabase
      .from('sales_items')
      .delete()
      .eq('sales_order_id', salesOrderId);

    // 3️⃣ Update order totals
    const { error: orderError } = await supabase
      .from('sales_orders')
      .update({
        customer_id: sale.customer_id,
        subtotal: sale.total_amount,
        total_amount: sale.total_amount,
      })
      .eq('id', salesOrderId);

    if (orderError) throw orderError;

    // 4️⃣ Insert new items
    await this.insertItems(salesOrderId, sale.items);

    // 5️⃣ Deduct stock again
    await this.deductStock(sale.items);
  },

  /* =========================
     DELETE SALE
     full restore
  ==========================*/
  async deleteSale(salesOrderId: string) {
    const { data: items } = await supabase
      .from('sales_items')
      .select('*')
      .eq('sales_order_id', salesOrderId);

    if (items?.length) {
      await this.restoreStock(items as SalesItem[]);
    }

    await supabase
      .from('sales_items')
      .delete()
      .eq('sales_order_id', salesOrderId);

    const { error } = await supabase
      .from('sales_orders')
      .delete()
      .eq('id', salesOrderId);

    if (error) throw error;
  },

  /* =========================
     HELPERS
  ==========================*/
  async insertItems(salesOrderId: string, items: SalesItem[]) {
    const payload = items.map(item => ({
      sales_order_id: salesOrderId,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
    }));

    const { error } = await supabase
      .from('sales_items')
      .insert(payload);

    if (error) throw error;
  },

  async deductStock(items: SalesItem[]) {
    await this.applyStock(items, -1);
  },

  async restoreStock(items: SalesItem[]) {
    await this.applyStock(items, 1);
  },

  async applyStock(items: SalesItem[], factor: 1 | -1) {
    for (const item of items) {
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('variants')
          .select('stock, product_id')
          .eq('id', item.variant_id)
          .single();

        if (!variant) continue;

        await supabase
          .from('variants')
          .update({
            stock: variant.stock + factor * item.quantity,
          })
          .eq('id', item.variant_id);

        // Recalculate product stock
        const { data: variants } = await supabase
          .from('variants')
          .select('stock')
          .eq('product_id', variant.product_id);

        const totalStock =
          variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

        await supabase
          .from('products')
          .update({ stock: totalStock })
          .eq('id', variant.product_id);
      } else {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (!product) continue;

        await supabase
          .from('products')
          .update({
            stock: product.stock + factor * item.quantity,
          })
          .eq('id', item.product_id);
      }
    }
  },
};
