import { supabase } from './supabaseClient';

export const dashboardService = {
  async getKPIs() {
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .slice(0, 10);

    /* ---------- SALES ---------- */
    const { data: salesMTD } = await supabase
      .from('sales_orders')
      .select('total_amount')
      .gte('created_at', monthStart);

    const { data: salesToday } = await supabase
      .from('sales_orders')
      .select('total_amount')
      .gte('created_at', today);

    const totalSalesMTD =
      salesMTD?.reduce((s, r) => s + Number(r.total_amount), 0) ?? 0;

    const totalSalesToday =
      salesToday?.reduce((s, r) => s + Number(r.total_amount), 0) ?? 0;

    /* ---------- EXPENSES ---------- */
    const { data: expensesMTD } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', monthStart);

    const totalExpensesMTD =
      expensesMTD?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

    /* ---------- INVENTORY ---------- */
    const { data: products } = await supabase
      .from('products')
      .select('stock, buy_price');

    const inventoryValue =
      products?.reduce(
        (s, p) => s + Number(p.stock) * Number(p.buy_price),
        0
      ) ?? 0;

    const lowStockCount =
      products?.filter((p) => Number(p.stock) <= 5).length ?? 0;

    /* ---------- PROFIT ---------- */
    const profitMTD = totalSalesMTD - totalExpensesMTD;
    const profitMargin =
      totalSalesMTD > 0
        ? (profitMTD / totalSalesMTD) * 100
        : 0;

    return {
      salesMTD: totalSalesMTD,
      salesToday: totalSalesToday,
      expensesMTD: totalExpensesMTD,
      profitMTD,
      profitMargin,
      inventoryValue,
      lowStockCount,
    };
  },
};
