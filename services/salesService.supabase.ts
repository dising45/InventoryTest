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

  async createSale(sale: {
    customer_id: string;
    items: SalesItem[];
    total_amount: number;
  }) {
    /* -------------------------------
       1️⃣ Create Sales Order
    --------------------------------*/
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

    if (orderError || !order) {
      console.error('Order creation failed', orderError);
      throw orderError;
    }

    /* -------------------------------
       2️⃣ Create Sales Items
    --------------------------------*/
    const itemsToInsert = sale.items.map(item => ({
      sales_order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('sales_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Sales items insert failed', itemsError);
      throw itemsError;
    }

    /* -------------------------------
       3️⃣ Deduct Inventory Stock
    --------------------------------*/
    for (const item of sale.items) {
      /* -------- Variant Product -------- */
      if (item.variant_id) {
        // Fetch variant with product_id
        const { data: variant, error: variantError } = await supabase
          .from('variants')
          .select('id, stock, product_id')
          .eq('id', item.variant_id)
          .single();

        if (variantError || !variant) {
          console.error('Variant not found', item.variant_id);
          continue;
        }

        // Update variant stock
        const newVariantStock = variant.stock - item.quantity;

        await supabase
          .from('variants')
          .update({ stock: newVariantStock })
          .eq('id', variant.id);

        // Recalculate total product stock from variants
        const { data: allVariants } = await supabase
          .from('variants')
          .select('stock')
          .eq('product_id', variant.product_id);

        const totalProductStock =
          allVariants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

        await supabase
          .from('products')
          .update({ stock: totalProductStock })
          .eq('id', variant.product_id);

      /* -------- Simple Product -------- */
      } else {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, stock')
          .eq('id', item.product_id)
          .single();

        if (productError || !product) {
          console.error('Product not found', item.product_id);
          continue;
        }

        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', product.id);
      }
    }

    return order;
  },
};
