// Dashboard.tsx
import React from 'react'
import { Product } from '../types'
import {
  Package,
  AlertTriangle,
  Layers,
  IndianRupee,
  CheckCircle2,
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Compact currency for small mobile cards
  const formatCompact = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-8 animate-in fade-in duration-500 overflow-hidden">
      
      {/* ================= KPI CARDS (2x2 on Mobile, 1x4 on Desktop) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 shrink-0">
        <KpiCard
          title="Products"
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
          trend="Units"
        />
        <KpiCard
          title="Inv. Value"
          value={formatCompact(inventoryValue)}
          desktopValue={formatCurrency(inventoryValue)}
          icon={IndianRupee}
          color="emerald"
          trend="Total Cost"
        />
        <KpiCard
          title="Low Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="amber"
          trend="Alerts"
          alert={lowStockProducts.length > 0}
        />
      </div>

      {/* ================= STOCK ALERTS WIDGET (Fixed Height/Scrollable on Mobile) ================= */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-0">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm md:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Stock Alerts
              {lowStockProducts.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                  {lowStockProducts.length} Critical
                </span>
              )}
            </h3>
          </div>
          <p className="hidden md:block text-xs text-gray-400 font-medium">
            Threshold: ≤ {LOW_STOCK_THRESHOLD} units
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {lowStockProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              </div>
              <h4 className="text-gray-900 font-bold text-sm md:text-lg">Inventory Healthy</h4>
              <p className="text-gray-500 text-[11px] md:text-sm mt-1 max-w-xs">
                All tracked products are sufficiently stocked.
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
                    className="group px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className={`shrink-0 w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 truncate">
                          {p.has_variants ? `${p.variants?.length} Variants` : 'Single SKU'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right ml-4">
                      <span className={`inline-flex items-center px-2 md:px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border ${
                        isCritical 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {stock} left
                      </span>
                    </div>
                  </div>
                )
              })}
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
  const colorStyles: Record<string, { bg: string, text: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  const style = colorStyles[color] || colorStyles.indigo

  return (
    <div className={`relative group bg-white rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm transition-all duration-300 ${alert ? 'ring-2 ring-red-100 border-red-200 bg-red-50/5' : ''}`}>
      <div className="flex items-center md:items-start justify-between mb-2 md:mb-4">
        <div className={`p-2 md:p-3 rounded-xl ${style.bg} ${style.text}`}>
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
        {alert && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      
      <div>
        <p className="text-[10px] md:text-sm font-medium text-gray-500 mb-0.5 md:mb-1">{title}</p>
        <h3 className="text-base md:text-2xl font-black text-gray-900 tracking-tight">
          <span className="md:hidden">{value}</span>
          <span className="hidden md:inline">{desktopValue || value}</span>
        </h3>
        {trend && (
          <p className="hidden md:block text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard