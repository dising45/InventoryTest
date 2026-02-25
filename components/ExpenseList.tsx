// ExpenseList.tsx
import React, { useMemo, useState } from 'react'
import { Expense } from '../types'
import {
  Wallet,
  Calendar,
  Tag,
  Trash2,
  FileText,
  TrendingDown,
  Building2,
  Search
} from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDelete,
}) => {

  /* ================= STATE ================= */
  const [search, setSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<'expense_date' | 'amount'>('expense_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  /* ================= HELPERS ================= */

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

  /* ================= FILTERED + SORTED DATA ================= */

  const filteredExpenses = useMemo(() => {
    let data = [...expenses]

    if (search) {
      data = data.filter(e =>
        e.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (vendorFilter) {
      data = data.filter(e => e.vendor === vendorFilter)
    }

    if (categoryFilter) {
      data = data.filter(e => e.category === categoryFilter)
    }

    data.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount
      }

      // date sorting
      return sortOrder === 'asc'
        ? new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
        : new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    })

    return data
  }, [expenses, search, vendorFilter, categoryFilter, sortBy, sortOrder])

  const vendors = [...new Set(expenses.map(e => e.vendor).filter(Boolean))]
  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))]

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Vendor Filter */}
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="">All Vendors</option>
          {vendors.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="expense_date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center">
          <Wallet className="h-8 w-8 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">
            No expenses found
          </h3>
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  {onDelete && <th className="px-6 py-4" />}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="group hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(e.expense_date)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {e.vendor || '-'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {e.category}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {e.description || '-'}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold">
                      {formatCurrency(e.amount)}
                    </td>

                    {onDelete && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDelete(e.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4 pb-20">
            {filteredExpenses.map(e => (
              <div key={e.id} className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{e.category}</p>
                    <p className="text-xs text-gray-500">{formatDate(e.expense_date)}</p>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(e.amount)}</p>
                </div>

                <p className="text-xs text-gray-500">{e.vendor || '-'}</p>
                <p className="text-xs text-gray-400 mt-1">{e.description || '-'}</p>

                {onDelete && (
                  <button
                    onClick={() => onDelete(e.id)}
                    className="mt-3 text-red-500 text-xs"
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
  )
}

export default ExpenseList
