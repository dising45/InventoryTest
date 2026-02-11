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
  Filter
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
  const [activeFilter, setActiveFilter] = useState<string>('all')

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
    // Default to this month
    setFrom(startOfMonth())
    setTo(today())
    setActiveFilter('this_month')
  }, [])

  useEffect(() => {
    if (from) load()
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

  // Sort expenses by amount desc
  const sortedExpenses = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a)
  
  // Calculate percentages for bars
  const maxExpense = sortedExpenses.length > 0 ? sortedExpenses[0][1] : 0

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(val)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Quick Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <QuickBtn 
            active={activeFilter === 'today'} 
            onClick={() => handleQuickFilter('today')}
          >
            Today
          </QuickBtn>
          <QuickBtn 
            active={activeFilter === 'this_month'} 
            onClick={() => handleQuickFilter('this_month')}
          >
            This Month
          </QuickBtn>
          <QuickBtn 
            active={activeFilter === 'last_month'} 
            onClick={() => handleQuickFilter('last_month')}
          >
            Last Month
          </QuickBtn>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setActiveFilter('custom'); }}
              className="pl-9 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="relative">
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setActiveFilter('custom'); }}
              className="pl-3 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-gray-500 text-sm font-medium">Calculating financial data...</p>
        </div>
      ) : (
        <>
          {/* METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(totalSales)}
              icon={<TrendingUp className="w-6 h-6" />}
              color="emerald"
              subtext="Income from sales"
            />
            <MetricCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<TrendingDown className="w-6 h-6" />}
              color="rose"
              subtext="Operational costs"
            />
            <MetricCard
              label="Net Profit"
              value={formatCurrency(profit)}
              icon={<Wallet className="w-6 h-6" />}
              color={profit >= 0 ? 'indigo' : 'orange'}
              subtext="Revenue - Expenses"
            />
            <div className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between ${profit >= 0 ? 'border-indigo-100 bg-indigo-50/30' : 'border-red-100 bg-red-50/30'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Margin</p>
                  <h3 className={`text-2xl font-bold mt-1 tracking-tight ${profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : '0'}%
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${profit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  profit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profit >= 0 ? 'Profitable' : 'Loss Making'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* EXPENSE BREAKDOWN */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Expense Breakdown</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {sortedExpenses.length} Categories
                </span>
              </div>

              {sortedExpenses.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No expenses recorded for this period.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {sortedExpenses.map(([cat, amt]) => {
                    const percentage = maxExpense > 0 ? (amt / maxExpense) * 100 : 0
                    const totalPercentage = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : '0'
                    
                    return (
                      <div key={cat} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-700">{cat}</span>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{formatCurrency(amt)}</span>
                            <span className="text-xs text-gray-400 ml-2">({totalPercentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SUMMARY TEXT WIDGET */}
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl" />

              <div className="relative z-10">
                <h4 className="text-indigo-200 font-medium mb-1">Financial Health</h4>
                <p className="text-2xl font-bold mb-6">
                  {profit >= 0 ? 'Excellent Performance' : 'Attention Needed'}
                </p>
                
                <div className="space-y-4 text-indigo-100 text-sm">
                  <p>
                    You have generated <span className="text-white font-bold">{formatCurrency(totalSales)}</span> in revenue 
                    {activeFilter === 'today' ? ' today' : activeFilter === 'this_month' ? ' this month' : ' in this period'}.
                  </p>
                  <p>
                    Operational costs account for <span className="text-white font-bold">{totalSales > 0 ? ((totalExpenses/totalSales)*100).toFixed(0) : 0}%</span> of your revenue.
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-6 border-t border-indigo-700/50">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-indigo-300">Generated on {new Date().toLocaleDateString()}</span>
                   <Wallet className="w-5 h-5 text-indigo-300" />
                </div>
              </div>
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
  subtext,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'emerald' | 'rose' | 'indigo' | 'orange'
  subtext: string
}) => {
  const styles = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  }

  const s = styles[color]

  return (
    <div className={`bg-white rounded-2xl p-6 border shadow-sm transition-all hover:shadow-md ${s.border}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${s.bg} ${s.text}`}>
          {icon}
        </div>
        {/* Optional sparkline placeholder could go here */}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  )
}

const QuickBtn = ({
  children,
  onClick,
  active
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
      ${active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
  >
    {children}
  </button>
)

export default ProfitLoss