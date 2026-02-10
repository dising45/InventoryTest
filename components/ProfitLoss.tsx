import React, { useEffect, useState } from 'react';
import { profitLossService } from '../services/plService.supabase';

interface Expense {
  amount: number;
  category: string;
}

const ProfitLoss: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  const [totalSales, setTotalSales] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [profit, setProfit] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    load();
  }, [from, to]);

  const load = async () => {
    setLoading(true);
    const res = await profitLossService.getSummary(from, to);
    setTotalSales(res.totalSales);
    setTotalExpenses(res.totalExpenses);
    setProfit(res.profit);
    setExpenses(res.expenses);
    setLoading(false);
  };

  /* ---------- QUICK DATE HELPERS ---------- */
  const today = () => new Date().toISOString().slice(0, 10);

  const startOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  };

  const startOfLastMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 10);
  };

  const endOfLastMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 0)
      .toISOString()
      .slice(0, 10);
  };

  /* ---------- CATEGORY GROUPING ---------- */
  const expenseByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* DATE FILTERS */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setFrom(today()); setTo(today()); }} className="btn">
          Today
        </button>
        <button onClick={() => { setFrom(startOfMonth()); setTo(undefined); }} className="btn">
          This Month
        </button>
        <button
          onClick={() => {
            setFrom(startOfLastMonth());
            setTo(endOfLastMonth());
          }}
          className="btn"
        >
          Last Month
        </button>

        <div className="flex items-center gap-2 ml-4">
          <input
            type="date"
            value={from || ''}
            onChange={(e) => setFrom(e.target.value || undefined)}
            className="border px-2 py-1 rounded"
          />
          <span>to</span>
          <input
            type="date"
            value={to || ''}
            onChange={(e) => setTo(e.target.value || undefined)}
            className="border px-2 py-1 rounded"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading P&amp;L…</div>
      ) : (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-3 gap-4">
            <Card title="Total Sales" value={totalSales} />
            <Card title="Total Expenses" value={totalExpenses} />
            <Card
              title="Net Profit"
              value={profit}
              highlight={profit >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* CATEGORY BREAKDOWN */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Expenses by Category
            </h3>

            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-gray-500">No expenses recorded</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <tr key={cat} className="border-b last:border-0">
                      <td className="py-2">{cat}</td>
                      <td className="py-2 text-right">
                        ₹{amt.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ---------- CARD ---------- */
const Card = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number;
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
      ₹{value.toFixed(2)}
    </p>
  </div>
);

/* ---------- BUTTON STYLE ---------- */
const btn =
  'px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100 text-sm';

export default ProfitLoss;
