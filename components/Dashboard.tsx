import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService.supabase';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setKpi(await dashboardService.getKPIs());
    setLoading(false);
  };

  if (loading) return <div>Loading dashboard…</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card title="MTD Sales" value={kpi.salesMTD} />
      <Card title="MTD Expenses" value={kpi.expensesMTD} />
      <Card
        title="MTD Profit"
        value={kpi.profitMTD}
        highlight={kpi.profitMTD >= 0 ? 'green' : 'red'}
      />
      <Card
        title="Profit Margin"
        value={`${kpi.profitMargin.toFixed(1)}%`}
      />

      <Card title="Sales Today" value={kpi.salesToday} />
      <Card title="Inventory Value" value={kpi.inventoryValue} />
      <Card
        title="Low Stock Items"
        value={kpi.lowStockCount}
        highlight={kpi.lowStockCount > 0 ? 'red' : undefined}
      />
    </div>
  );
};

const Card = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number | string;
  highlight?: 'green' | 'red';
}) => (
  <div className="bg-white border rounded-lg p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p
      className={`text-xl font-bold ${
        highlight === 'green'
          ? 'text-green-600'
          : highlight === 'red'
          ? 'text-red-600'
          : 'text-gray-900'
      }`}
    >
      {typeof value === 'number' ? `₹${value.toFixed(2)}` : value}
    </p>
  </div>
);

export default Dashboard;
