import React, { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'

interface Props {
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

const ExpenseForm: React.FC<Props> = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    amount: '',
    payment_mode: '',
    vendor: '',
    reference: '',
  })

  const submit = async () => {
    if (!form.category || !form.amount) return
    await onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="max-w-lg bg-white p-6 rounded-lg border">
      <button
        onClick={onCancel}
        className="flex items-center text-sm text-gray-600 mb-4"
      >
        <ArrowLeft className="mr-2" size={16} /> Back
      </button>

      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

      <div className="space-y-3">
        <input
          type="date"
          value={form.expense_date}
          onChange={e => setForm({ ...form, expense_date: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Category (Rent, Salary, Internet...)"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Description (optional)"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Payment Mode (Cash, UPI, Bank)"
          value={form.payment_mode}
          onChange={e => setForm({ ...form, payment_mode: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Vendor (optional)"
          value={form.vendor}
          onChange={e => setForm({ ...form, vendor: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={submit}
        className="mt-6 flex items-center bg-indigo-600 text-white px-4 py-2 rounded"
      >
        <Save className="mr-2" size={16} /> Save Expense
      </button>
    </div>
  )
}

export default ExpenseForm
