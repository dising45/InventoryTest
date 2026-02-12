// Dashboard.tsx
import React from 'react'
import { Product } from '../types'
import {
  Package,
  AlertTriangle,
  Layers,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

interface DashboardProps {
  products: Product[]
}

const LOW_STOCK_THRESHOLD = 10

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  /* ================= CALCULATIONS ================= */
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0)
  const inventoryValue = products.reduce((sum, p) => sum + (p.stock ?? 0) * (p.cost_price ?? 0), 0)
  const lowStockProducts = products.filter(p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)

  // Format currency for Desktop
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Compact currency for Mobile (e.g. 1.2L)
  const formatCompact = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-500">
      
      {/* ================= KPI CARDS (2x2 Mobile, 1x4 Desktop) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 shrink-0">
        <KpiCard
          title="Total Products"
          value={totalProducts}
          icon={Layers}
          color="indigo"
          trend="In Catalog"
        />
        <KpiCard
          title="Total Stock"
          value={totalStock}
          icon={Package}
          color="blue"
          trend="Units Available"
        />
        <KpiCard
          title="Inventory Value"
          value={formatCompact(inventoryValue)}
          desktopValue={formatCurrency(inventoryValue)}
          icon={IndianRupee}
          color="emerald"
          trend="Total Cost Price"
        />
        <KpiCard
          title="Low Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="amber"
          trend="Action Needed"
          alert={lowStockProducts.length > 0}
        />
      </div>

      {/* ================= STOCK ALERTS WIDGET (Fills remaining height) ================= */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden min-h-0 relative">
        
        {/* Widget Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Stock Alerts
              {lowStockProducts.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse">
                  {lowStockProducts.length} Critical
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2">
             <span className="hidden md:inline text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
               Threshold: ≤ {LOW_STOCK_THRESHOLD}
             </span>
          </div>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {lowStockProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-gray-900 font-bold text-lg">Inventory Healthy</h4>
              <p className="text-gray-500 text-sm mt-1 max-w-xs leading-relaxed">
                Great job! All tracked products are stocked above the threshold level.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStockProducts.map((p) => {
                const stock = p.stock ?? 0
                const isCritical = stock === 0
                
                return (
                  <div
                    key={p.id}
                    className="group px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Status Dot */}
                      <div className={`shrink-0 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                      
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-[11px] md:text-xs text-gray-400 truncate font-medium mt-0.5">
                          {p.has_variants ? `${p.variants?.length} Variants Configured` : 'Standard SKU'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right pl-3">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] md:text-xs font-bold border ${
                        isCritical 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {stock} Units Left
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Spacer for bottom nav on mobile if needed */}
              <div className="h-4 md:h-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================= KPI CARD COMPONENT ================= */

interface KpiCardProps {
  title: string
  value: number | string
  desktopValue?: string
  icon: any
  color: 'indigo' | 'emerald' | 'blue' | 'amber'
  trend?: string
  alert?: boolean
}

const KpiCard = ({ title, value, desktopValue, icon: Icon, color, trend, alert }: KpiCardProps) => {
  const colorStyles: Record<string, { bg: string, text: string, iconBg: string }> = {
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600', iconBg: 'bg-indigo-100 text-indigo-600' },
    blue: { bg: 'bg-blue-50/50', text: 'text-blue-600', iconBg: 'bg-blue-100 text-blue-600' },
    emerald: { bg: 'bg-emerald-50/50', text: 'text-emerald-600', iconBg: 'bg-emerald-100 text-emerald-600' },
    amber: { bg: 'bg-amber-50/50', text: 'text-amber-600', iconBg: 'bg-amber-100 text-amber-600' },
  }

  const style = colorStyles[color] || colorStyles.indigo

  return (
    <div className={`relative group bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${alert ? 'ring-2 ring-red-100 border-red-200 bg-red-50/5' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${style.iconBg} shadow-sm`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        {alert && (
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>
      
      <div>
        <p className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1 mt-0.5">
           <h3 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
            <span className="md:hidden">{value}</span>
            <span className="hidden md:inline">{desktopValue || value}</span>
          </h3>
        </div>
        {trend && (
          <p className="hidden md:flex items-center text-[11px] font-bold text-gray-400 mt-2">
            {trend}
            <ArrowRight className="w-3 h-3 ml-1 opacity-50" />
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard