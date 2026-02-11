// Dashboard.tsx
import React from 'react'
import { Product } from '../types'
import {
  Package,
  AlertTriangle,
  Layers,
  IndianRupee,
  CheckCircle2,
  TrendingUp
} from 'lucide-react'

interface DashboardProps {
  products: Product[]
}

const LOW_STOCK_THRESHOLD = 10

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  /* ================= CALCULATIONS ================= */

  const totalProducts = products.length

  const totalStock = products.reduce(
    (sum, p) => sum + (p.stock ?? 0),
    0
  )

  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.stock ?? 0) * (p.cost_price ?? 0),
    0
  )

  const lowStockProducts = products.filter(
    p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD
  )

  // Format currency for premium feel
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
      
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Products"
          value={totalProducts}
          icon={Layers}
          color="indigo"
          trend="Items in catalog"
        />
        <KpiCard
          title="Total Stock Units"
          value={totalStock}
          icon={Package}
          color="blue"
          trend="Across all variants"
        />
        <KpiCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={IndianRupee}
          color="emerald"
          trend="Total cost price"
        />
        <KpiCard
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="amber" // Changed to Amber for better warning visual
          trend={lowStockProducts.length > 0 ? "Action needed" : "Healthy status"}
          alert={lowStockProducts.length > 0}
        />
      </div>

      {/* ================= LOW STOCK WIDGET ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Stock Alerts
              {lowStockProducts.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {lowStockProducts.length} Critical
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Products with stock level at or below {LOW_STOCK_THRESHOLD} units
            </p>
          </div>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-gray-900 font-medium text-lg">Inventory Healthy</h4>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Great job! All tracked products are sufficiently stocked above the threshold.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {lowStockProducts.map((p) => {
              // Calculate severity for color coding
              const stock = p.stock ?? 0
              const isCritical = stock === 0
              
              return (
                <div
                  key={p.id}
                  className="group px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-2 h-2 rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.has_variants
                          ? `${p.variants?.length ?? 0} variants configured`
                          : 'Single SKU product'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      isCritical 
                        ? 'bg-red-50 text-red-700 border-red-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {stock} units left
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= KPI CARD COMPONENT ================= */

interface KpiCardProps {
  title: string
  value: number | string
  icon: any
  color: 'indigo' | 'green' | 'blue' | 'red' | 'emerald' | 'amber'
  trend?: string
  alert?: boolean
}

const KpiCard = ({ title, value, icon: Icon, color, trend, alert }: KpiCardProps) => {
  const colorStyles: Record<string, { bg: string, text: string, ring: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'group-hover:ring-indigo-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:ring-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:ring-emerald-100' }, // Replaced green with emerald
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-100' }, // Replaced red with amber/orange
  }

  const style = colorStyles[color] || colorStyles.indigo

  return (
    <div className={`group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${alert ? 'ring-2 ring-red-100 border-red-200' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.text} transition-colors duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        {alert && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        {trend && (
          <div className="flex items-center mt-2 text-xs font-medium text-gray-400">
             {trend}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard