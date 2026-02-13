// ProfitLoss.tsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Calendar,
  ArrowRight,
  PieChart,
  Loader2,
  Filter,
  Download,
  Sparkles
} from 'lucide-react'
import { profitLossService } from '../services/plService.supabase'

interface Expense {
  amount: number
  category: string
}

const ProfitLoss: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<string>('this_month')

  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [profit, setProfit] = useState(0)
  const [expenses, setExpenses] = useState<Expense[]>([])

  /* ---------- DATE HELPERS ---------- */
  const today = () => new Date().toISOString().slice(0, 10)
  const startOfMonth = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
  }
  const startOfLastMonth = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10)
  }
  const endOfLastMonth = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10)
  }

  useEffect(() => {
    setFrom(startOfMonth())
    setTo(today())
  }, [])

  useEffect(() => {
    load()
  }, [from, to])


  const load = async () => {
    setLoading(true)
    try {
      const res = await profitLossService.getSummary(from || undefined, to || undefined)
      setTotalSales(res.revenue || 0)
      setTotalExpenses(res.totalExpenses || 0)
      setProfit(res.netProfit || 0)
      // Note: Logic for expenses category mapping remains as is
      // 🔥 THIS FEEDS THE CHART
      setExpenses(Array.isArray(res.expensesList) ? res.expensesList : [])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFilter = (type: string) => {
    setActiveFilter(type)
    if (type === 'today') {
      setFrom(today()); setTo(today())
    } else if (type === 'this_month') {
      setFrom(startOfMonth()); setTo(today())
    } else if (type === 'last_month') {
      setFrom(startOfLastMonth()); setTo(endOfLastMonth())
    } else if (type === 'lifetime') {
      setFrom(''); setTo('')
    }
  }

  const expenseByCategory = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, e) => {
      const amt = Number(e.amount || 0)
      if (amt > 0) acc[e.category] = (acc[e.category] || 0) + amt
      return acc
    }, {})
  }, [expenses])

  const sortedExpenses = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a)
  const maxExpense = sortedExpenses.length > 0 ? sortedExpenses[0][1] : 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-8">

      {/* FILTER CONTROL BAR */}
      <div className="bg-white/70 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-4 sticky top-4 z-30 ring-1 ring-black/[0.03]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          <div className="hidden md:flex bg-gray-100 p-2 rounded-xl text-gray-500">
            <Filter className="w-4 h-4" />
          </div>
          <QuickBtn active={activeFilter === 'today'} onClick={() => handleQuickFilter('today')} label="Today" />
          <QuickBtn active={activeFilter === 'this_month'} onClick={() => handleQuickFilter('this_month')} label="This Month" />
          <QuickBtn active={activeFilter === 'last_month'} onClick={() => handleQuickFilter('last_month')} label="Last Month" />
          <QuickBtn active={activeFilter === 'lifetime'} onClick={() => handleQuickFilter('lifetime')} label="All Time" />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto ml-auto">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setActiveFilter('custom'); }}
            className="flex-1 md:w-32 bg-transparent px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none"
          />
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setActiveFilter('custom'); }}
            className="flex-1 md:w-32 bg-transparent px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 tracking-wide uppercase">Analysing Finances...</p>
        </div>
      ) : (
        <>
          {/* MAIN KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard label="Revenue" value={formatCurrency(totalSales)} icon={<TrendingUp className="w-5 h-5" />} color="emerald" subtext="Gross income" />
            <MetricCard label="Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="w-5 h-5" />} color="rose" subtext="Total outgoing" />
            <MetricCard label="Net Profit" value={formatCurrency(profit)} icon={<Wallet className="w-5 h-5" />} color={profit >= 0 ? 'indigo' : 'orange'} subtext="Balance" />

            <div className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-300 ${profit >= 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-rose-50/50 border-rose-100'
              }`}>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</p>
                  <h3 className={`text-2xl font-black mt-1 tabular-nums ${profit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                    {totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : '0'}%
                  </h3>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">Profit Margin</p>
                </div>
                <div className={`p-2 rounded-xl shadow-sm ${profit >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 opacity-10">
                <BarChart3 className="w-20 h-20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EXPENSE ANALYSIS CHART */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Expense Distribution</h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Report</span>
                </div>
              </div>

              {sortedExpenses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-900 font-bold">No Transaction Data</p>
                  <p className="text-gray-400 text-xs mt-1">Change your filters to see breakdown</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedExpenses.map(([cat, amt]) => {
                    const percentage = maxExpense > 0 ? (amt / maxExpense) * 100 : 0
                    const totalPercentage = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : '0'
                    return (
                      <div key={cat} className="group">
                        <div className="flex justify-between items-end mb-2">
                          <span className="font-bold text-gray-700 text-sm group-hover:text-indigo-600 transition-colors">{cat}</span>
                          <div className="text-right">
                            <span className="font-black text-gray-900 tabular-nums">{formatCurrency(amt)}</span>
                            <span className="text-[10px] text-gray-400 ml-2 font-black tracking-tighter uppercase">{totalPercentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100/50 rounded-full h-2.5 overflow-hidden ring-1 ring-gray-200/20">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* AI/SUMMARY CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Business Health</span>
                </div>

                <h4 className="text-3xl font-bold mb-2 tracking-tight">
                  {profit >= 0 ? 'Surplus Peak' : 'Deficit Alert'}
                </h4>
                <p className="text-indigo-200/60 text-sm mb-8 leading-relaxed">
                  {profit >= 0
                    ? "Your operational efficiency is high. Consider reinvesting the surplus into inventory."
                    : "Outgoing costs are currently higher than sales. Audit your top 3 expense categories."}
                </p>

                <div className="space-y-4">
                  <SummaryRow label="Gross Revenue" value={formatCurrency(totalSales)} />
                  <SummaryRow label="Operational Costs" value={`-${formatCurrency(totalExpenses)}`} isRed />
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Net Cashflow</span>
                    <span className={`text-xl font-black tabular-nums ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </div>
              </div>

              <button className="mt-8 group w-full py-4 bg-white text-slate-900 rounded-2xl text-sm font-black hover:bg-indigo-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl">
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-1" /> Export Statement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- INTERNAL UI COMPONENTS ---------- */

const MetricCard = ({ label, value, icon, color, subtext }: any) => {
  const styles: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/20",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20",
    orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20",
  }

  return (
    <div className={`group bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${styles[color].split(' ')[2]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${styles[color].split(' ')[0]} ${styles[color].split(' ')[1]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">{value}</h3>
        <p className="text-[10px] text-gray-400 font-medium mt-1">{subtext}</p>
      </div>
    </div>
  )
}

const SummaryRow = ({ label, value, isRed }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-xs font-medium text-indigo-100/50 group-hover:text-indigo-100 transition-colors">{label}</span>
    <span className={`text-sm font-bold tabular-nums ${isRed ? 'text-rose-400' : 'text-white'}`}>{value}</span>
  </div>
)

const QuickBtn = ({ label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200
      ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
        : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
      }`}
  >
    {label}
  </button>
)

export default ProfitLoss