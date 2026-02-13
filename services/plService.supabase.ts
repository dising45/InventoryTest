import { supabase } from './supabaseClient';

export const profitLossService = {
  async getSummary(from?: string, to?: string) {

    /* ---------- SALES WITH ITEMS ---------- */
    let salesQuery = supabase
      .from('sales_orders')
      .select(`
        total_amount,
        order_date,
        sales_items (
          quantity,
          cost_price,
          unit_price
        )
      `);

    if (from) salesQuery = salesQuery.gte('order_date', from);
    if (to) salesQuery = salesQuery.lte('order_date', to);

    const { data: sales } = await salesQuery;

    const totalRevenue =
      sales?.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) ?? 0;

    const totalCOGS =
      sales?.reduce((sum, sale) => {
        const itemsCOGS =
          sale.sales_items?.reduce(
            (iSum: number, item: any) =>
              iSum + Number(item.cost_price) * Number(item.quantity),
            0
          ) ?? 0;
        return sum + itemsCOGS;
      }, 0) ?? 0;

    const grossProfit = totalRevenue - totalCOGS;

    /* ---------- EXPENSES ---------- */
    let expenseQuery = supabase
      .from('expenses')
      .select('amount, category, expense_date');

    if (from) expenseQuery = expenseQuery.gte('expense_date', from);
    if (to) expenseQuery = expenseQuery.lte('expense_date', to);

    const { data: expenses } = await expenseQuery;

    const totalExpenses =
      expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;

    const netProfit = grossProfit - totalExpenses;

    const netMargin =
      totalRevenue > 0
        ? (netProfit / totalRevenue) * 100
        : 0;

    return {
      revenue: totalRevenue,
      cogs: totalCOGS,
      grossProfit,
      totalExpenses,
      expensesList: expenses ?? [],
      netProfit,
      netMargin,
    };


  },
};
