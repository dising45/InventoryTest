import React, { useEffect, useState } from 'react';
import { getDashboardMetrics } from '../services/reportService';
import { DashboardMetrics } from '../types';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading Dashboard...</div>;

  const cards = [
    { label: 'Total Revenue', value: `$${metrics.totalRevenue.toFixed(2)}`, color: 'bg-indigo-500' },
    { label: 'Net Profit', value: `$${metrics.netProfit.toFixed(2)}`, color: 'bg-emerald-500' },
    { label: 'Orders', value: metrics.totalOrders, color: 'bg-blue-500' },
    { label: 'Low Stock Alerts', value: metrics.lowStockCount, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${card.color} text-white`}>
               {/* Simple Icon Placeholder */}
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64 flex items-center justify-center text-slate-400">
           Chart Placeholder (Revenue over time)
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-64 flex items-center justify-center text-slate-400">
           Chart Placeholder (Top Products)
        </div>
      </div>
    </div>
  );
};