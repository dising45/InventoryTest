// Dashboard.tsx — Enhanced with sales KPIs, quick actions, recent orders
import React, { useState, useEffect } from 'react'
import type { Product, SalesOrder, ViewState } from '../types'
import { dashboardService } from '../services/dashboardService.supabase'
import {
  Package,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Plus,
  Users,
  Wallet,
  Calendar,
  ArrowRight,
  Loader2,
  BarChart3,
  Clock,
  Receipt,
  Eye,
  EyeOff,
} from 'lucide-react'

interface DashboardProps {
  products: Product[]
  setCurrentView?: (v: ViewState) => void
}

const LOW_STOCK_THRESHOLD = 10

const PRIVACY_KEY = 'naitree_privacy_mode'

const Dashboard: React.FC<DashboardProps> = ({ products, setCurrentView }) => {
  const [kpis, setKpis] = useState<any>(null)
  const [recentSales, setRecentSales] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [privacyMode, setPrivacyMode] = useState(() => {
    try { return localStorage.getItem(PRIVACY_KEY) === 'true' } catch { return false }
  })

  const togglePrivacy = () => {
    setPrivacyMode(prev => {
      const next = !prev
      try { localStorage.setItem(PRIVACY_KEY, String(next)) } catch {}
      return next
    })
  }

  const mask = (val: string | number) => privacyMode ? '••••••' : val

  useEffect(() => {
    const load = async () => {
      try {
        const kpiData = await dashboardService.getKPIs()
        setKpis(kpiData)
        setRecentSales(kpiData.recentOrders ?? [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ================= INVENTORY CALCULATIONS ================= */
  const lowStockProducts = products
    .filter(p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)

  // Compute inventory metrics from the same products state as ProductList
  // so dashboard and inventory always show the same numbers
  const totalUnitsInStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0)
  const inventoryValue = products.reduce((sum, p) => sum + (p.stock ?? 0) * Number(p.cost_price || 0), 0)
  const lowStockCount = lowStockProducts.length

  // Format currency
  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  // Compact currency for Mobile
  const fmtCompact = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${Math.round(amount)}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const nav = (view: ViewState) => setCurrentView?.(view)

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-500">

      {/* ================= PRIVACY TOGGLE ================= */}
      <div className="flex items-center justify-end -mb-2 md:-mb-3">
        <button
          onClick={togglePrivacy}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
            privacyMode
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-300'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={privacyMode ? 'Show values' : 'Hide values'}
        >
          {privacyMode ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{privacyMode ? 'Privacy On' : 'Privacy'}</span>
        </button>
      </div>

      {/* ================= BUSINESS KPI CARDS ================= */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <KpiCard
            title={kpis?.hasMTDData ? "Today's Sales" : "Total Revenue"}
            value={mask(fmtCompact(kpis?.hasMTDData ? (kpis?.salesToday ?? 0) : (kpis?.salesAllTime ?? 0)))}
            desktopValue={mask(fmt(kpis?.hasMTDData ? (kpis?.salesToday ?? 0) : (kpis?.salesAllTime ?? 0))) as string}
            icon={ShoppingCart}
            color="indigo"
            subtitle={kpis?.hasMTDData ? "Revenue today" : "All time"}
          />
          <KpiCard
            title={kpis?.hasMTDData ? "This Month" : "Total Sales"}
            value={mask(fmtCompact(kpis?.hasMTDData ? (kpis?.salesMTD ?? 0) : (kpis?.salesAllTime ?? 0)))}
            desktopValue={mask(fmt(kpis?.hasMTDData ? (kpis?.salesMTD ?? 0) : (kpis?.salesAllTime ?? 0))) as string}
            icon={TrendingUp}
            color="emerald"
            subtitle={kpis?.hasMTDData ? "MTD Revenue" : "All time revenue"}
          />
          <KpiCard
            title="Net Profit"
            value={mask(fmtCompact(kpis?.hasMTDData ? (kpis?.netProfitMTD ?? 0) : (kpis?.netProfitAllTime ?? 0)))}
            desktopValue={mask(fmt(kpis?.hasMTDData ? (kpis?.netProfitMTD ?? 0) : (kpis?.netProfitAllTime ?? 0))) as string}
            icon={BarChart3}
            color={privacyMode ? 'indigo' : ((kpis?.hasMTDData ? (kpis?.netProfitMTD ?? 0) : (kpis?.netProfitAllTime ?? 0)) >= 0 ? 'emerald' : 'red')}
            subtitle={privacyMode ? '••••••' : (kpis?.hasMTDData
              ? `${(kpis?.profitMargin ?? 0).toFixed(1)}% margin · MTD`
              : `${(kpis?.profitMarginAllTime ?? 0).toFixed(1)}% margin · All time`
            )}
          />
          <KpiCard
            title="Low Stock"
            value={lowStockProducts.length}
            icon={AlertTriangle}
            color="amber"
            subtitle="Action Needed"
            alert={lowStockProducts.length > 0}
          />
        </div>
      )}

      {/* ================= QUICK ACTIONS ================= */}
      {setCurrentView && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          <QuickAction icon={ShoppingCart} label="New Sale" color="indigo" onClick={() => nav('add-sale')} />
          <QuickAction icon={Package} label="Add Product" color="blue" onClick={() => nav('add-product')} />
          <QuickAction icon={Users} label="Add Customer" color="violet" onClick={() => nav('add-customer')} />
          <QuickAction icon={Wallet} label="Add Expense" color="amber" className="hidden md:flex" onClick={() => nav('add-expense')} />
        </div>
      )}

      {/* ================= TWO-COLUMN LAYOUT (Desktop) / STACKED (Mobile) ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-0">

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col min-h-[280px]">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-500" />
              Recent Orders
            </h3>
            {setCurrentView && (
              <button
                onClick={() => nav('sales')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : recentSales.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <ShoppingCart className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No sales yet</p>
                {setCurrentView && (
                  <button
                    onClick={() => nav('add-sale')}
                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Create your first sale →
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentSales.map(sale => (
                  <div
                    key={sale.id}
                    onClick={() => setCurrentView?.('sales')}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                      {sale.customer?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {sale.customer?.name || 'Walk-in'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatDate(sale.order_date || sale.created_at)}
                        </span>
                        <StatusDot status={sale.status} />
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 tabular-nums shrink-0">
                      {privacyMode ? '••••••' : fmt(sale.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INVENTORY HEALTH */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col min-h-[280px]">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" />
              Inventory Health
            </h3>
            {lowStockCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-full text-[11px] font-bold text-amber-700">
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount} low stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                All stocked
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex-1 p-5 space-y-4 animate-pulse">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-gray-100 rounded w-12 mb-2" />
                    <div className="h-6 bg-gray-100 rounded w-8" />
                  </div>
                ))}
              </div>
              <div className="h-3 bg-gray-100 rounded-full w-full mt-4" />
            </div>
          ) : (() => {
            const totalEver = totalUnitsInStock + (kpis?.unitsSold ?? 0)
            const soldPct = totalEver > 0 ? ((kpis?.unitsSold ?? 0) / totalEver) * 100 : 0

            return (
              <div className="flex-1 p-5 flex flex-col justify-between">
                {/* 3 stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Stocked</p>
                    <p className="text-2xl font-black text-gray-900 tabular-nums">{totalEver.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">units ever</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sold</p>
                    <p className="text-2xl font-black text-indigo-600 tabular-nums">{(kpis?.unitsSold ?? 0).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{soldPct.toFixed(0)}% of stock</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums">{totalUnitsInStock.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">in stock</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1.5">
                    <span>{soldPct.toFixed(0)}% sold</span>
                    <span>{(100 - soldPct).toFixed(0)}% remaining</span>
                  </div>
                </div>

                {/* Stock value */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Value</p>
                    <p className="text-base font-black text-gray-900 mt-0.5">{fmt(inventoryValue)}</p>
                  </div>
                  {setCurrentView && (
                    <button
                      onClick={() => nav('inventory')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                      View Inventory <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

/* ================= SUB-COMPONENTS ================= */

interface KpiCardProps {
  title: string
  value: number | string
  desktopValue?: string
  icon: any
  color: 'indigo' | 'emerald' | 'blue' | 'amber' | 'red'
  subtitle?: string
  alert?: boolean
}

const KpiCard = ({ title, value, desktopValue, icon: Icon, color, subtitle, alert }: KpiCardProps) => {
  const styles: Record<string, { iconBg: string }> = {
    indigo: { iconBg: 'bg-indigo-100 text-indigo-600' },
    blue: { iconBg: 'bg-blue-100 text-blue-600' },
    emerald: { iconBg: 'bg-emerald-100 text-emerald-600' },
    amber: { iconBg: 'bg-amber-100 text-amber-600' },
    red: { iconBg: 'bg-red-100 text-red-600' },
  }
  const s = styles[color] || styles.indigo

  return (
    <div className={`relative bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${alert ? 'ring-2 ring-red-100 border-red-200' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 md:p-2.5 rounded-xl ${s.iconBg} shadow-sm`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        {alert && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        )}
      </div>
      <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight leading-tight mt-0.5">
        <span className="md:hidden">{value}</span>
        <span className="hidden md:inline">{desktopValue || value}</span>
      </h3>
      {subtitle && (
        <p className="hidden md:block text-[11px] font-bold text-gray-400 mt-1.5">{subtitle}</p>
      )}
    </div>
  )
}

interface QuickActionProps {
  icon: any
  label: string
  color: string
  onClick: () => void
  className?: string
}

const QuickAction = ({ icon: Icon, label, color, onClick, className = '' }: QuickActionProps) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-200',
    amber: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-3 md:py-3.5 rounded-xl text-white text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 ${colorMap[color] || colorMap.indigo} ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ').pop()}</span>
    </button>
  )
}

const StatusDot = ({ status }: { status: string }) => {
  const s = status?.toLowerCase() || ''
  let cls = 'bg-gray-300'
  let label = status
  if (s === 'completed' || s === 'paid') { cls = 'bg-emerald-500'; label = 'Paid' }
  else if (s === 'pending') { cls = 'bg-amber-500'; label = 'Pending' }
  else if (s === 'cancelled') { cls = 'bg-red-500'; label = 'Cancelled' }

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${cls}`} />
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </span>
  )
}

export default Dashboard