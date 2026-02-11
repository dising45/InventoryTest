// SalesList.tsx
import React from 'react'
import { SalesOrder } from '../types'
import {
  ShoppingCart,
  Calendar,
  User,
  Edit2,
  Trash2,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react'

interface SalesListProps {
  sales: SalesOrder[]
  onEdit?: (sale: SalesOrder) => void
  onDelete?: (id: string) => void
  onAddSale?: () => void
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  onEdit,
  onDelete,
  onAddSale,
}) => {
  const showActions = !!onEdit || !!onDelete

  // Helper for currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Helper for date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Helper for status badge style
  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-100'
    if (s === 'cancelled') return 'bg-red-50 text-red-700 border-red-100'
    return 'bg-gray-50 text-gray-700 border-gray-100'
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'paid') return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
    if (s === 'pending') return <Clock className="w-3.5 h-3.5 mr-1.5" />
    if (s === 'cancelled') return <XCircle className="w-3.5 h-3.5 mr-1.5" />
    return null
  }

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      
      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center">
          <div className="p-4 bg-indigo-50 rounded-full mb-4">
            <Receipt className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            No sales records yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Start tracking your business revenue by recording your first sale.
          </p>
          {onAddSale && (
            <button
              onClick={onAddSale}
              className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
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
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  {showActions && (
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="group hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 font-medium">
                        {formatDate(sale.created_at)}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        #{sale.id.slice(0, 8)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                          {sale.customer?.name ? sale.customer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {sale.customer?.name || 'Unknown Customer'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(sale.status)}`}>
                        {getStatusIcon(sale.status)}
                        {sale.status}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                        {sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 tabular-nums">
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
          <div className="md:hidden space-y-4 pb-20">
            {sales.map((sale) => {
              const itemCount = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

              return (
                <div
                  key={sale.id}
                  onClick={() => onEdit?.(sale)}
                  className="bg-white rounded-xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-[0.98] transition-transform duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {sale.customer?.name || 'Unknown Customer'}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(sale.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-gray-900">
                        {formatCurrency(sale.total_amount)}
                      </span>
                      <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusStyle(sale.status)}`}>
                        {sale.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </div>

                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(sale)
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 active:bg-indigo-100"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(sale.id)
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 active:bg-red-100"
                        >
                          Delete
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

      {/* ===================== FLOATING ACTION BUTTON (MOBILE) ===================== */}
      {onAddSale && (
        <button
          onClick={onAddSale}
          className="md:hidden fixed bottom-20 right-5 z-40 flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-90 transition-all duration-200 hover:shadow-indigo-500/30"
          aria-label="Add Sale"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  )
}

export default SalesList