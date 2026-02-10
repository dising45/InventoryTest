import React, { useState } from 'react';
import { plService } from '../services/plService.supabase';

export default function ProfitLoss() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!from || !to) return;
    setResult(await plService.getPL(from, to));
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-xl font-bold">Profit & Loss</h2>

      <div className="flex gap-2">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={run} className="bg-indigo-600 text-white px-4 rounded">
          Calculate
        </button>
      </div>

      {result && (
        <div className="bg-white p-4 rounded shadow">
          <p>Sales: ₹ {result.totalSales.toFixed(2)}</p>
          <p>Expenses: ₹ {result.totalExpenses.toFixed(2)}</p>
          <p className="font-bold">
            Net Profit: ₹ {result.netProfit.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
