import React from 'react'
import { Expense } from '../types'
import { Trash2 } from 'lucide-react'

interface Props {
  expenses: Expense[]
  onDelete: (id: string) => void
}

const ExpenseList: React.FC<Props> = ({ expenses, onDelete }) => {
  if (!expenses.length) {
    return <p className="text-gray-500">No expenses recorded.</p>
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id} className="border-t">
              <td className="px-4 py-2">
                {new Date(e.expense_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{e.category}</td>
              <td className="px-4 py-2">{e.description || '-'}</td>
              <td className="px-4 py-2 text-right font-medium">
                ₹{e.amount.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onDelete(e.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseList
