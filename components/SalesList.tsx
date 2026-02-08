import React, { useEffect, useState } from 'react';
import { SalesOrder } from '../types';
import { getSales, deleteSale } from '../services/salesService';

interface SalesListProps {
  onCreate: () => void;
}

export const SalesList: React.FC<SalesListProps> = ({ onCreate }) => {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  
  const fetchSales = async () => {
    const data = await getSales();
    setSales(data);
  };

  useEffect(() => { fetchSales(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Refund and delete this sale? Stock will be restored.")) {
      await deleteSale(id);
      fetchSales();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Sales Orders</h2>
        <button onClick={onCreate} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          + New Sale
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(sale.sale_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {sale.customer?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                  ${sale.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-900">Refund</button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
               <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No sales recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};