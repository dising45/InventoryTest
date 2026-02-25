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
      .order('order_date', { ascending: false });

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
    order_date: string;
  }) {
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        customer_id: sale.customer_id,
        subtotal: sale.subtotal,
        discount: sale.discount ?? 0,
        discount_type: sale.discount_type ?? 'flat',
        tax: sale.tax ?? 0,
        tax_type: sale.tax_type ?? 'percentage',
        total_amount: sale.total_amount,
        order_date: sale.order_date,
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
     UPDATE Status
  ==========================*/
  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('sales_orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error
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
      order_date: string;
    }
  ) {
    // 1️⃣ Restore stock
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

    // 3️⃣ Update order
    const { error: orderError } = await supabase
      .from('sales_orders')
      .update({
        customer_id: sale.customer_id,
        subtotal: sale.total_amount,
        total_amount: sale.total_amount,
        order_date: sale.order_date,   // ✅ FIXED
        discount: sale.discount,
        discount_type: sale.discount_type,
        tax: sale.tax,
        tax_type: sale.tax_type,
      })
      .eq('id', salesOrderId);

    if (orderError) throw orderError;

    // 4️⃣ Insert new items
    await this.insertItems(salesOrderId, sale.items);

    // 5️⃣ Deduct stock
    await this.deductStock(sale.items);
  },
  // Delete stock
  async deleteSale(salesOrderId: string) {
    try {
      // 1️⃣ Fetch items
      const { data: items, error: fetchError } = await supabase
        .from('sales_items')
        .select('*')
        .eq('sales_order_id', salesOrderId)

      if (fetchError) {
        console.error('FETCH ITEMS ERROR:', fetchError)
        throw fetchError
      }

      // 2️⃣ Restore stock
      if (items?.length) {
        await this.restoreStock(items as SalesItem[])
      }

      // 3️⃣ Delete items
      const { error: deleteItemsError } = await supabase
        .from('sales_items')
        .delete()
        .eq('sales_order_id', salesOrderId)

      if (deleteItemsError) {
        console.error('DELETE ITEMS ERROR:', deleteItemsError)
        throw deleteItemsError
      }

      // 4️⃣ Delete order
      const { error: deleteOrderError } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', salesOrderId)

      if (deleteOrderError) {
        console.error('DELETE ORDER ERROR:', deleteOrderError)
        throw deleteOrderError
      }

      return true

    } catch (err) {
      console.error('FULL DELETE FAILED:', err)
      throw err
    }
  },

  /* =========================
     HELPERS
  ==========================*/
  async insertItems(salesOrderId: string, items: SalesItem[]) {
    const payload = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('cost_price')
        .eq('id', item.product_id)
        .single();

      payload.push({
        sales_order_id: salesOrderId,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: Number(product?.cost_price ?? 0), // 🔥 snapshot
        line_total: item.quantity * item.unit_price,
      });
    }

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
