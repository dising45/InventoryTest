// SalesList.tsx
import React, { useState, useMemo } from 'react'
import { SalesOrder } from '../types'
import {
  Calendar,
  User,
  Edit2,
  Trash2,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ChevronDown,
  Download,
  Search,
  X,
  Filter,
} from 'lucide-react'
import { exportCSV } from '../utils/exportCSV'

interface SalesListProps {
  sales: SalesOrder[]
  onEdit?: (sale: SalesOrder) => void
  onDelete?: (id: string) => void
  onAddSale?: () => void
  onStatusChange?: (id: string, status: string) => void
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  onEdit,
  onDelete,
  onAddSale,
  onStatusChange,
}) => {
  const showActions = !!onEdit || !!onDelete

  /* ================= FILTER STATE ================= */
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search by customer name or order ID
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = sale.customer?.name?.toLowerCase().includes(q)
        const matchId = sale.id.toLowerCase().includes(q)
        if (!matchName && !matchId) return false
      }
      // Date range
      const saleDate = sale.order_date || sale.created_at?.split('T')[0]
      if (dateFrom && saleDate < dateFrom) return false
      if (dateTo && saleDate > dateTo) return false
      // Status
      if (statusFilter && sale.status.toLowerCase() !== statusFilter.toLowerCase()) return false
      return true
    })
  }, [sales, searchQuery, dateFrom, dateTo, statusFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
  }

  const STATUS_OPTIONS = [
    'Pending',
    'Confirmed',
    'Shipped',
    'Completed',
    'Awaiting Payment',
    'Cancelled'
  ]

  // Helper for currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Helper for date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Helper for status styling
  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'paid' || s === 'shipped')
      return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
    if (s === 'pending' || s === 'awaiting payment')
      return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
    if (s === 'cancelled')
      return 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
    return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'paid' || s === 'shipped') return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
    if (s === 'pending' || s === 'awaiting payment') return <Clock className="w-3.5 h-3.5 mr-1.5" />
    if (s === 'cancelled') return <XCircle className="w-3.5 h-3.5 mr-1.5" />
    return null
  }
  /* ================= SALES KPIs ================= */

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  )

  const totalOrders = sales.length

  const totalQuantitySold = sales.reduce((sum, sale) => {
    const qty =
      sale.items?.reduce(
        (itemSum: number, item: any) =>
          itemSum + Number(item.quantity || 0),
        0
      ) ?? 0
    return sum + qty
  }, 0)

  const totalCOGS = sales.reduce((sum, sale) => {
    const cogs =
      sale.items?.reduce(
        (itemSum: number, item: any) =>
          itemSum +
          Number(item.quantity || 0) *
          Number(item.cost_price || 0),
        0
      ) ?? 0
    return sum + cogs
  }, 0)

  const totalProfit = totalRevenue - totalCOGS

  // const formatCurrency = (val: number) =>
  //   new Intl.NumberFormat('en-IN', {
  //     style: 'currency',
  //     currency: 'INR',
  //     maximumFractionDigits: 0
  //   }).format(val)

  return (
    <>
      {/* ================= DOWNLOAD BUTTON ================= */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            exportCSV({
              filename: 'Sales_Report',
              headers: [
                { key: 'date', label: 'Date' },
                { key: 'order_id', label: 'Order ID' },
                { key: 'customer', label: 'Customer' },
                { key: 'items_count', label: 'Items' },
                { key: 'status', label: 'Status' },
                { key: 'total_amount', label: 'Amount (₹)' },
              ],
              data: sales.map(s => ({
                date: s.order_date || s.created_at,
                order_id: s.id.slice(0, 8).toUpperCase(),
                customer: s.customer?.name || 'Unknown',
                items_count: s.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
                status: s.status,
                total_amount: Number(s.total_amount || 0).toFixed(2),
              })),
            })
          }}
          className="inline-flex items-center px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download CSV
        </button>
      </div>

      {/* ================= SALES SUMMARY ================= */}

      {/* Desktop KPI Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          color="emerald"
        />
        <KpiCard
          label="Items Sold"
          value={totalQuantitySold}
          color="indigo"
        />
        <KpiCard
          label="Total Orders"
          value={totalOrders}
          color="gray"
        />
        <KpiCard
          label="Profit"
          value={formatCurrency(totalProfit)}
          color={totalProfit >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Mobile Summary Card */}
      <div className="md:hidden mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl">

          <p className="text-[11px] uppercase tracking-widest opacity-70 font-bold">
            Sales Overview
          </p>

          <div className="mt-3">
            <h2 className="text-3xl font-black tabular-nums">
              {formatCurrency(totalRevenue)}
            </h2>
            <p className="text-indigo-100 text-xs mt-1">
              Total Revenue
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs opacity-70">Orders</p>
              <p className="text-lg font-bold tabular-nums">
                {totalOrders}
              </p>
            </div>

            <div>
              <p className="text-xs opacity-70">Items Sold</p>
              <p className="text-lg font-bold tabular-nums">
                {totalQuantitySold}
              </p>
            </div>

            <div>
              <p className="text-xs opacity-70">Profit</p>
              <p className={`text-lg font-bold tabular-nums ${totalProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= SEARCH & FILTERS ================= */}
      <div className="mb-4 space-y-3">
        {/* Search + Filter Toggle Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer or order ID..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>
        </div>

        {/* Expanded Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Active filter count */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Showing {filteredSales.length} of {sales.length} orders
            </span>
            <button onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ================= SALES TABLE / LIST ================= */}

      <div className="relative space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">

        {filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center">
            <div className="p-4 bg-indigo-50 rounded-full mb-4">
              <Receipt className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {hasActiveFilters ? 'No matching orders' : 'No sales records yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your filters or search term.'
                : 'Start tracking your business revenue by recording your first sale.'}
            </p>
            {onAddSale && (
              <button
                onClick={onAddSale}
                className="mt-6 inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Sale
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ===================== DESKTOP TABLE ===================== */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Order Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Amount
                    </th>
                    {showActions && (
                      <th scope="col" className="relative px-6 py-4">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="group hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {formatDate(sale.order_date || sale.created_at)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                            #{sale.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {sale.customer?.name ? sale.customer.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-gray-900">
                              {sale.customer?.name || 'Unknown Customer'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status (Interactive Pill) */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-block relative">
                          {onStatusChange ? (
                            <div className={`flex items-center px-3 py-1 rounded-full border cursor-pointer transition-all ${getStatusStyle(sale.status)}`}>
                              {getStatusIcon(sale.status)}
                              <select
                                value={sale.status}
                                onChange={(e) => onStatusChange(sale.id, e.target.value)}
                                className="appearance-none bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer pr-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(sale.status)}`}>
                              {getStatusIcon(sale.status)}
                              {sale.status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                          <Package className="w-3 h-3 mr-1.5 opacity-60" />
                          {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900 tabular-nums">
                        {formatCurrency(sale.total_amount)}
                      </td>

                      {/* Actions */}
                      {showActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(sale)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Edit Sale"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(sale.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Sale"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===================== MOBILE CARDS ===================== */}
            <div className="md:hidden space-y-4">
              {filteredSales.map((sale) => {
                const itemCount = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

                return (
                  <div
                    key={sale.id}
                    onClick={() => onEdit?.(sale)}
                    className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {sale.customer?.name || 'Unknown Customer'}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(sale.order_date || sale.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-base font-black text-indigo-600">
                          {formatCurrency(sale.total_amount)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          #{sale.id.slice(0, 6)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">

                      {/* Status Dropdown (Mobile) */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        {onStatusChange ? (
                          <div className={`flex items-center px-2 py-1 rounded-lg border ${getStatusStyle(sale.status)}`}>
                            <select
                              value={sale.status}
                              onChange={(e) => onStatusChange(sale.id, e.target.value)}
                              className="appearance-none bg-transparent border-none text-[10px] font-bold focus:ring-0 w-full pr-4"
                            >
                              {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 w-3 h-3 opacity-50 pointer-events-none" />
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${getStatusStyle(sale.status)}`}>
                            {sale.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-medium">
                          {itemCount} Items
                        </span>
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(sale.id)
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-lg active:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </>
  )
}

/* ================= KPI CARD COMPONENT ================= */

const KpiCard = ({
  label,
  value,
  color
}: {
  label: string
  value: string | number
  color: 'emerald' | 'indigo' | 'gray' | 'green' | 'red'
}) => {

  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    green: "bg-green-50 border-green-100 text-green-700",
    red: "bg-rose-50 border-rose-100 text-rose-700"
  }

  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${styles[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
        {label}
      </p>
      <h3 className="text-2xl font-black mt-2 tabular-nums">
        {value}
      </h3>
    </div>
  )
}

export default SalesList