import React from 'react'
import { Product } from '../types'
import {
  Package,
  AlertTriangle,
  Layers,
  IndianRupee,
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
    (p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD
  )

  /* ================= UI ================= */

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Products"
          value={totalProducts}
          icon={Layers}
          color="indigo"
        />
        <KpiCard
          title="Total Stock"
          value={totalStock}
          icon={Package}
          color="green"
        />
        <KpiCard
          title="Inventory Value"
          value={`₹${inventoryValue.toFixed(0)}`}
          icon={IndianRupee}
          color="blue"
        />
        <KpiCard
          title="Low Stock"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* LOW STOCK LIST */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Low Stock Alerts
          </h3>
          <span className="text-xs text-gray-500">
            ≤ {LOW_STOCK_THRESHOLD} units
          </span>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            🎉 All products are sufficiently stocked
          </div>
        ) : (
          <div className="divide-y">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.has_variants
                      ? `${p.variants?.length ?? 0} variants`
                      : 'Single product'}
                  </p>
                </div>

                <span className="text-sm font-semibold text-red-600">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= KPI CARD ================= */

const KpiCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number | string
  icon: any
  color: 'indigo' | 'green' | 'blue' | 'red'
}) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center">
      <div
        className={`p-3 rounded-lg ${colorMap[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-4">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  )
}

export default Dashboard
