import { supabase } from './supabaseClient';

export const plService = {
  async getPL(from: string, to: string) {
    const [{ data: sales }, { data: expenses }] = await Promise.all([
      supabase
        .from('sales_orders')
        .select('total_amount')
        .gte('created_at', from)
        .lte('created_at', to),

      supabase
        .from('expenses')
        .select('amount')
        .gte('expense_date', from)
        .lte('expense_date', to),
    ]);

    const totalSales =
      sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0;

    const totalExpenses =
      expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;

    return {
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
    };
  },
};
