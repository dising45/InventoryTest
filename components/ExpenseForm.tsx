import React, { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'

interface ExpenseFormProps {
  onSave: (data: {
    expense_date: string
    category: string
    description?: string
    amount: number
    payment_mode?: string
    reference?: string
    vendor?: string
  }) => Promise<void>
  onCancel: () => void
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    amount: 0,
    payment_mode: '',
    reference: '',
    vendor: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'amount' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border shadow-sm p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h2 className="font-semibold text-lg">
          Add Expense
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="expense_date"
          value={form.expense_date}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          name="category"
          placeholder="Category (Rent, Salary, Travel)"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          name="vendor"
          placeholder="Vendor (optional)"
          value={form.vendor}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="number"
          name="amount"
          min={0}
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          name="payment_mode"
          placeholder="Payment Mode (Cash / UPI / Bank)"
          value={form.payment_mode}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="reference"
          placeholder="Reference / Notes"
          value={form.reference}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          <Save className="inline w-4 h-4 mr-2" />
          {loading ? 'Saving…' : 'Save Expense'}
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm
