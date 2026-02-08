import React, { useMemo } from 'react';
import { Product, InventoryStats } from '../types';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const stats: InventoryStats = useMemo(() => {
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      totalStock += p.stock;
      // Value based on buy price * stock (Cost of Inventory)
      totalValue += p.buy_price * p.stock;
      if (p.stock < 10) lowStockCount++;
    });

    return {
      totalProducts: products.length,
      totalStock,
      totalValue,
      lowStockCount,
    };
  }, [products]);

  // Data for the chart: Top 5 products by stock value
  const chartData = useMemo(() => {
    const data = products
      .map(p => ({
        name: p.name,
        value: p.sell_price * p.stock
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    return data;
  }, [products]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-emerald-500"
          subtext="Based on buy price"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-500"
          subtext={`${stats.totalStock} total units`}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          color="bg-amber-500"
          subtext="Items with < 10 units"
        />
        <StatCard
          title="Potential Revenue"
          value={`$${products.reduce((acc, p) => acc + (p.sell_price * p.stock), 0).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-indigo-500"
          subtext="Estimated total sales"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products by Potential Value</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 12 }} 
                  interval={0}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
               No data available
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
