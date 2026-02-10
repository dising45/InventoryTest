import React from 'react'
import { Expense } from '../types'
import {
  Wallet,
  Calendar,
  Tag,
  Trash2,
} from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Wallet className="mx-auto h-10 w-10 mb-2 text-gray-400" />
            No expenses recorded yet
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    {onDelete && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(e.expense_date).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        <span className="px-2 py-1 text-xs rounded bg-indigo-50 text-indigo-600">
                          {e.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {e.description || '-'}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold">
                        ₹{e.amount.toFixed(2)}
                      </td>

                      {onDelete && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onDelete(e.id)}
                            className="text-red-600 hover:text-red-800"
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

            {/* Mobile */}
            <div className="md:hidden divide-y">
              {expenses.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(e.expense_date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      ₹{e.amount.toFixed(2)}
                    </span>
                  </div>

                  <p className="font-medium mt-1">
                    {e.category}
                  </p>

                  <p className="text-sm text-gray-500">
                    {e.description || '-'}
                  </p>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(e.id)}
                      className="mt-2 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ExpenseList
