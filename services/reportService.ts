import { getExpenses } from './expenseService';
import { getSales } from './salesService';
import { getProducts } from './inventoryService';
import { DashboardMetrics } from '../types';

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Aggregate data from other services
  const expenses = await getExpenses();
  const sales = await getSales();
  const products = await getProducts();

  const totalRevenue = sales.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total_amount : 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalOrders = sales.length;
  
  let lowStockCount = 0;
  products.forEach(p => {
    if (p.has_variants && p.variants) {
      p.variants.forEach(v => {
        if (v.stock_quantity < 5) lowStockCount++;
      });
    } else {
      if (p.stock_quantity < 5) lowStockCount++;
    }
  });

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    lowStockCount,
    totalOrders
  };
};
