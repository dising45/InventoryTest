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

    /* ---------- SALES MTD ---------- */
    const { data: salesMTD } = await supabase
      .from('sales_orders')
      .select(`
        total_amount,
        order_date,
        sales_items (
          quantity,
          cost_price
        )
      `)
      .gte('order_date', monthStart);

    const totalSalesMTD =
      salesMTD?.reduce((s, r) => s + Number(r.total_amount), 0) ?? 0;

    const totalCOGS_MTD =
      salesMTD?.reduce((sum, sale) => {
        const itemsCOGS =
          (sale.sales_items as any[])?.reduce(
            (iSum: number, item: any) =>
              iSum + Number(item.cost_price) * Number(item.quantity),
            0
          ) ?? 0;
        return sum + itemsCOGS;
      }, 0) ?? 0;

    /* ---------- SALES TODAY ---------- */
    const totalSalesToday =
      salesMTD
        ?.filter((r) => r.order_date === today)
        .reduce((s, r) => s + Number(r.total_amount), 0) ?? 0;

    /* ---------- EXPENSES ---------- */
    const { data: expensesMTD } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', monthStart);

    const totalExpensesMTD =
      expensesMTD?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

    /* ---------- PROFIT ---------- */
    const grossProfitMTD = totalSalesMTD - totalCOGS_MTD;
    const netProfitMTD = grossProfitMTD - totalExpensesMTD;

    const profitMargin =
      totalSalesMTD > 0
        ? (netProfitMTD / totalSalesMTD) * 100
        : 0;

    /* ---------- INVENTORY ---------- */
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('stock, cost_price');

    if (productError) {
      console.error('DASHBOARD INVENTORY ERROR', productError);
      throw productError;
    }

    const inventoryValue =
      products?.reduce(
        (sum, p) => sum + Number(p.stock) * Number(p.cost_price),
        0
      ) ?? 0;

    const lowStockCount =
      products?.filter((p) => Number(p.stock) <= 5).length ?? 0;

    return {
      salesMTD: totalSalesMTD,
      salesToday: totalSalesToday,
      expensesMTD: totalExpensesMTD,
      netProfitMTD,
      grossProfitMTD,
      totalCOGS_MTD,
      profitMargin,
      inventoryValue,
      lowStockCount,
    };
  },
};