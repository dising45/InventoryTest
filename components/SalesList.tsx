import React from 'react'
import { SalesOrder } from '../types'
import {
  ShoppingCart,
  Calendar,
  User,
  Edit2,
  Trash2,
} from 'lucide-react'

interface SalesListProps {
  sales: SalesOrder[]
  onEdit?: (sale: SalesOrder) => void
  onDelete?: (id: string) => void
}

const SalesList: React.FC<SalesListProps> = ({ sales, onEdit, onDelete }) => {
  const showActions = !!onEdit || !!onDelete

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <ShoppingCart className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-gray-900">
          No sales yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first sale to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ===================== DESKTOP TABLE ===================== */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

          <tbody className="bg-white divide-y divide-gray-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(sale.created_at).toLocaleDateString()}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {sale.customer?.name || 'Walk-in Customer'}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {sale.items?.reduce((a, i) => a + i.quantity, 0) || 0} items
                </td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {sale.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  ₹{sale.total_amount.toFixed(2)}
                </td>

                {showActions && (
                  <td className="px-6 py-4 text-right">
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

      {/* ===================== MOBILE CARDS ===================== */}
      <div className="md:hidden space-y-3">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{sale.total_amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(sale.created_at).toLocaleDateString()}
                </p>
              </div>

              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {sale.status}
              </span>
            </div>

            <p className="text-sm text-gray-700 flex items-center mb-2">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              {sale.customer?.name || 'Walk-in Customer'}
            </p>

            <p className="text-xs text-gray-500 mb-3">
              {(sale.items?.reduce((a, i) => a + i.quantity, 0) || 0)} items
            </p>

            {showActions && (
              <div className="flex justify-end space-x-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(sale)}
                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(sale.id)}
                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SalesList
