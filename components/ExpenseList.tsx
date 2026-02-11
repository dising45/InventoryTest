// ExpenseList.tsx
import React from 'react'
import { Expense } from '../types'
import {
  Wallet,
  Calendar,
  Tag,
  Trash2,
  Receipt,
  FileText,
  TrendingDown
} from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
}) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <Wallet className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            No expenses recorded
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Keep track of your spending by adding your first expense.
          </p>
        </div>
      ) : (
        <>
          {/* ===================== DESKTOP TABLE ===================== */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  {onDelete && (
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {expenses.map((e) => (
                  <tr key={e.id} className="group hover:bg-gray-50/80 transition-colors duration-200">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2.5 text-gray-400" />
                        {formatDate(e.expense_date)}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Tag className="w-3 h-3 mr-1.5" />
                        {e.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {e.description ? (
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          {e.description}
                        </span>
                      ) : (
                        <span className="text-gray-300 italic">No description</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 tabular-nums">
                      {formatCurrency(e.amount)}
                    </td>

                    {/* Actions */}
                    {onDelete && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onDelete(e.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===================== MOBILE CARDS ===================== */}
          <div className="md:hidden space-y-4 pb-20">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {e.category}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(e.expense_date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-gray-900">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-500 line-clamp-1 flex-1 mr-4">
                    {e.description || 'No description provided'}
                  </p>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(e.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ExpenseList