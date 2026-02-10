import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
} from 'lucide-react';
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

  /* ---------- DATE HELPERS ---------- */
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

  /* ---------- GROUP EXPENSES ---------- */
  const expenseByCategory = expenses.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 items-center">
        <QuickBtn onClick={() => { setFrom(today()); setTo(today()); }}>
          Today
        </QuickBtn>
        <QuickBtn onClick={() => { setFrom(startOfMonth()); setTo(undefined); }}>
          This Month
        </QuickBtn>
        <QuickBtn onClick={() => {
          setFrom(startOfLastMonth());
          setTo(endOfLastMonth());
        }}>
          Last Month
        </QuickBtn>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={from || ''}
            onChange={(e) => setFrom(e.target.value || undefined)}
            className="border rounded px-2 py-1 text-sm"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={to || ''}
            onChange={(e) => setTo(e.target.value || undefined)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading Profit &amp; Loss…
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Revenue"
              value={totalSales}
              icon={<TrendingUp />}
              color="green"
            />
            <MetricCard
              label="Expenses"
              value={totalExpenses}
              icon={<TrendingDown />}
              color="red"
            />
            <MetricCard
              label="Net Profit"
              value={profit}
              icon={<Wallet />}
              color={profit >= 0 ? 'green' : 'red'}
            />
            <MetricCard
              label="Status"
              value={profit >= 0 ? 1 : 0}
              display={profit >= 0 ? 'Profitable' : 'Loss'}
              icon={<BarChart3 />}
              color={profit >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* EXPENSE BREAKDOWN */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              Expense Breakdown
            </h3>

            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-gray-500 text-sm">
                No expenses recorded for this period.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <tr key={cat} className="border-b last:border-0">
                      <td className="py-2">{cat}</td>
                      <td className="py-2 text-right font-medium">
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

/* ---------- UI HELPERS ---------- */

const MetricCard = ({
  label,
  value,
  icon,
  color,
  display,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'red';
  display?: string;
}) => (
  <div className="bg-white border rounded-xl shadow-sm p-4 flex justify-between items-center">
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold text-${color}-600`}>
        {display ?? `₹${value.toFixed(2)}`}
      </p>
    </div>
    <div className={`p-2 rounded-full bg-${color}-50 text-${color}-600`}>
      {icon}
    </div>
  </div>
);

const QuickBtn = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100 text-sm"
  >
    {children}
  </button>
);

export default ProfitLoss;
