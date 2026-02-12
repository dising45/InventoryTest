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
  Check,
  Download
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

  // Initial Load
  useEffect(() => {
    setFrom(startOfMonth())
    setTo(today())
  }, [])

  useEffect(() => {
    if (from && to) load()
  }, [from, to])

  const load = async () => {
    setLoading(true)
    try {
      const res = await profitLossService.getSummary(from || undefined, to || undefined)
      setTotalSales(res.totalSales || 0)
      setTotalExpenses(res.totalExpenses || 0)
      setProfit((res.totalSales || 0) - (res.totalExpenses || 0))
      setExpenses(res.expenses || [])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFilter = (type: string) => {
    setActiveFilter(type)
    if (type === 'today') {
      setFrom(today())
      setTo(today())
    } else if (type === 'this_month') {
      setFrom(startOfMonth())
      setTo(today())
    } else if (type === 'last_month') {
      setFrom(startOfLastMonth())
      setTo(endOfLastMonth())
    }
  }

  /* ---------- DATA PROCESSING ---------- */
  const expenseByCategory = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, e) => {
      const amt = Number(e.amount || 0)
      if (amt > 0) {
        acc[e.category] = (acc[e.category] || 0) + amt
      }
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20 md:pb-0">
      
      {/* FILTER CONTROL BAR */}
      <div className="bg-white p-2 md:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 sticky top-0 z-10 md:static">
        
        {/* Mobile Horizontal Scroll Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full">
          <div className="bg-gray-100 p-2 rounded-lg text-gray-500 mr-1 hidden md:block">
            <Filter className="w-4 h-4" />
          </div>
          <QuickBtn 
            active={activeFilter === 'today'} 
            onClick={() => handleQuickFilter('today')}
            label="Today"
          />
          <QuickBtn 
            active={activeFilter === 'this_month'} 
            onClick={() => handleQuickFilter('this_month')}
            label="This Month"
          />
          <QuickBtn 
            active={activeFilter === 'last_month'} 
            onClick={() => handleQuickFilter('last_month')}
            label="Last Month"
          />
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setActiveFilter('custom'); }}
              className="w-full pl-2 pr-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <div className="relative flex-1">
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setActiveFilter('custom'); }}
              className="w-full pl-2 pr-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-gray-500 text-sm font-medium">Crunching numbers...</p>
        </div>
      ) : (
        <>
          {/* FINANCIAL SUMMARY CARDS (2x2 Grid on Mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <MetricCard
              label="Revenue"
              value={formatCurrency(totalSales)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <MetricCard
              label="Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<TrendingDown className="w-5 h-5" />}
              color="rose"
            />
            <MetricCard
              label="Net Profit"
              value={formatCurrency(profit)}
              icon={<Wallet className="w-5 h-5" />}
              color={profit >= 0 ? 'indigo' : 'orange'}
            />
            
            {/* Net Margin Card */}
            <div className={`rounded-2xl p-4 md:p-6 border shadow-sm flex flex-col justify-between ${profit >= 0 ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">Net Margin</p>
                  <h3 className={`text-xl md:text-2xl font-black mt-1 ${profit >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                    {totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : '0'}%
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                  profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profit >= 0 ? 'Profitable' : 'Loss Making'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* EXPENSE BREAKDOWN CHART */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Expense Analysis</h3>
              </div>

              {sortedExpenses.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center border-2 border-dashed border-gray-100 rounded-xl">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium">No expenses found</p>
                  <p className="text-gray-500 text-xs mt-1">Try changing the date range</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {sortedExpenses.map(([cat, amt]) => {
                    const percentage = maxExpense > 0 ? (amt / maxExpense) * 100 : 0
                    const totalPercentage = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : '0'
                    
                    return (
                      <div key={cat} className="group">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-gray-700">{cat}</span>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{formatCurrency(amt)}</span>
                            <span className="text-xs text-gray-400 ml-1.5 font-medium">{totalPercentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-700 group-hover:bg-indigo-600 shadow-sm"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* AI INSIGHT / SUMMARY CARD */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-tr-full blur-xl" />

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-4 text-indigo-300">
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Financial Health</span>
                </div>
                
                <h4 className="text-2xl font-bold mb-1">
                  {profit >= 0 ? 'Great Job!' : 'Review Needed'}
                </h4>
                <p className="text-gray-400 text-sm mb-6">
                  {profit >= 0 
                    ? "Your business is generating positive cash flow." 
                    : "Expenses are exceeding revenue for this period."}
                </p>
                
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Revenue</span>
                    <span className="font-bold">{formatCurrency(totalSales)}</span>
                  </div>
                  <div className="w-full bg-gray-700 h-px" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cost</span>
                    <span className="font-bold text-red-300">-{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="w-full bg-gray-700 h-px" />
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-300 font-bold">Net</span>
                    <span className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="mt-6 w-full py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------- UI HELPERS ---------- */

const MetricCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'emerald' | 'rose' | 'indigo' | 'orange'
}) => {
  const styles = {
    emerald: { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    rose: { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    orange: { bg: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
  }
  const s = styles[color]

  return (
    <div className={`bg-white rounded-2xl p-4 md:p-6 border shadow-sm transition-all ${s.border}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight mt-0.5">{value}</h3>
      </div>
    </div>
  )
}

const QuickBtn = ({ label, onClick, active }: { label: string, onClick: () => void, active: boolean }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
      ${active 
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`}
  >
    {label}
  </button>
)

export default ProfitLoss