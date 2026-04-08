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

    // Previous month range
    const prevMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0 // last day of prev month
    ).toISOString().slice(0, 10);
    const prevMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    ).toISOString().slice(0, 10);

    /* ---------- ALL SALES (for MTD + all-time + prev month) ---------- */
    const { data: allSales } = await supabase
      .from('sales_orders')
      .select(`
        total_amount,
        order_date,
        sales_items (
          quantity,
          cost_price
        )
      `)
      .order('order_date', { ascending: false });

    const calcTotals = (sales: any[] | null) => {
      const list = sales ?? [];
      const revenue = list.reduce((s, r) => s + Number(r.total_amount), 0);
      const cogs = list.reduce((sum, sale) => {
        const itemsCOGS =
          (sale.sales_items as any[])?.reduce(
            (iSum: number, item: any) =>
              iSum + Number(item.cost_price) * Number(item.quantity),
            0
          ) ?? 0;
        return sum + itemsCOGS;
      }, 0);
      return { revenue, cogs };
    };

    // MTD
    const salesMTDList = allSales?.filter(r => r.order_date >= monthStart) ?? [];
    const mtd = calcTotals(salesMTDList);

    // Today
    const totalSalesToday =
      salesMTDList
        .filter((r) => r.order_date === today)
        .reduce((s, r) => s + Number(r.total_amount), 0);

    // Previous month
    const salesPrevList = allSales?.filter(r => r.order_date >= prevMonthStart && r.order_date <= prevMonthEnd) ?? [];
    const prev = calcTotals(salesPrevList);

    // All time
    const allTime = calcTotals(allSales);

    /* ---------- EXPENSES ---------- */
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('amount, expense_date');

    const expensesMTD = allExpenses?.filter(e => e.expense_date >= monthStart) ?? [];
    const totalExpensesMTD = expensesMTD.reduce((s, r) => s + Number(r.amount), 0);

    const expensesPrev = allExpenses?.filter(e => e.expense_date >= prevMonthStart && e.expense_date <= prevMonthEnd) ?? [];
    const totalExpensesPrev = expensesPrev.reduce((s, r) => s + Number(r.amount), 0);

    const totalExpensesAll = allExpenses?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

    /* ---------- PROFIT (MTD) ---------- */
    const grossProfitMTD = mtd.revenue - mtd.cogs;
    const netProfitMTD = grossProfitMTD - totalExpensesMTD;
    const profitMarginMTD = mtd.revenue > 0 ? (netProfitMTD / mtd.revenue) * 100 : 0;

    /* ---------- PROFIT (Prev Month) ---------- */
    const grossProfitPrev = prev.revenue - prev.cogs;
    const netProfitPrev = grossProfitPrev - totalExpensesPrev;

    /* ---------- PROFIT (All Time) ---------- */
    const grossProfitAll = allTime.revenue - allTime.cogs;
    const netProfitAll = grossProfitAll - totalExpensesAll;
    const profitMarginAll = allTime.revenue > 0 ? (netProfitAll / allTime.revenue) * 100 : 0;

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

    // Determine if MTD has meaningful data
    const hasMTDData = mtd.revenue > 0 || totalExpensesMTD > 0;

    return {
      // MTD
      salesMTD: mtd.revenue,
      salesToday: totalSalesToday,
      expensesMTD: totalExpensesMTD,
      netProfitMTD,
      grossProfitMTD,
      totalCOGS_MTD: mtd.cogs,
      profitMargin: profitMarginMTD,

      // Previous month
      salesPrevMonth: prev.revenue,
      netProfitPrevMonth: netProfitPrev,

      // All time
      salesAllTime: allTime.revenue,
      netProfitAllTime: netProfitAll,
      profitMarginAllTime: profitMarginAll,
      expensesAllTime: totalExpensesAll,

      // Flags
      hasMTDData,

      // Inventory
      inventoryValue,
      lowStockCount,
    };
  },
};
