import { supabase } from './supabaseClient';

export const profitLossService = {
  async getSummary(from?: string, to?: string) {
    /* ---------- SALES ---------- */
    let salesQuery = supabase
      .from('sales_orders')
      .select('total_amount');

    if (from) salesQuery = salesQuery.gte('created_at', from);
    if (to) salesQuery = salesQuery.lte('created_at', to);

    const { data: sales } = await salesQuery;

    const totalSales =
      sales?.reduce((sum, s) => sum + Number(s.total_amount || 0), 0) ?? 0;

    /* ---------- EXPENSES ---------- */
    let expenseQuery = supabase
      .from('expenses')
      .select('amount, category');

    if (from) expenseQuery = expenseQuery.gte('expense_date', from);
    if (to) expenseQuery = expenseQuery.lte('expense_date', to);

    const { data: expenses } = await expenseQuery;

    const totalExpenses =
      expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) ?? 0;

    return {
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      expenses: expenses ?? [],
    };
  },
};
