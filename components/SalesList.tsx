import React from 'react'
import { SalesOrder } from '../types'
import {
  ShoppingCart,
  Calendar,
  User,
  Edit2,
  Trash2,
  Zap,
  Plus,
} from 'lucide-react'

interface SalesListProps {
  sales: SalesOrder[]
  onEdit?: (sale: SalesOrder) => void
  onDelete?: (id: string) => void
  onQuickSale?: () => void // 🔥 NEW
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  onEdit,
  onDelete,
  onQuickSale,
}) => {
  const showActions = !!onEdit || !!onDelete

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Sales
        </h2>

        <div className="flex gap-2">
          {onQuickSale && (
            <button
              onClick={onQuickSale}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              <Zap className="w-4 h-4" />
              Quick Sale
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No sales records found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Record a new sale to see it here.
            </p>

            {onQuickSale && (
              <button
                onClick={onQuickSale}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
              >
                <Plus className="w-4 h-4" />
                Start Quick Sale
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ===================== DESKTOP ===================== */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    {showActions && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(sale.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {sale.customer?.name || 'Unknown Customer'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.items?.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        ) || 0}{' '}
                        items
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {sale.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        ₹{sale.total_amount.toFixed(2)}
                      </td>

                      {showActions && (
                        <td className="px-6 py-4 text-right text-sm">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(sale)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(sale.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===================== MOBILE (TAP-FIRST) ===================== */}
            <div className="md:hidden divide-y">
              {sales.map((sale) => {
                const itemCount =
                  sale.items?.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                  ) || 0

                return (
                  <div
                    key={sale.id}
                    onClick={() => onEdit?.(sale)}
                    className="p-4 bg-white active:scale-[0.99] transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {sale.customer?.name || 'Unknown Customer'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(
                            sale.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-sm font-bold text-indigo-600">
                        ₹{sale.total_amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {itemCount} items • {sale.status}
                      </span>

                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(sale)
                            }}
                            className="px-3 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700"
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
                            className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-700"
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
      </div>
    </div>
  )
}

export default SalesList
