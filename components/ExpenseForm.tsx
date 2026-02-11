// ExpenseForm.tsx
import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Tag, 
  Store, 
  IndianRupee, 
  CreditCard, 
  FileText, 
  Loader2 
} from 'lucide-react'

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

/* ================= UI HELPER COMPONENT ================= */
const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
      />
    </div>
  </div>
)

/* ================= MAIN COMPONENT ================= */
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
      [name]: name === 'amount' ? Number(value) : value,
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
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </button>
        <h2 className="font-bold text-xl text-gray-900 tracking-tight">
          Record New Expense
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* PROGRESS BAR (DECORATIVE) */}
        <div className="h-1.5 w-full bg-gray-50">
          <div className="h-full bg-indigo-600 w-1/3" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* SECTION: MAIN DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Date"
                type="date"
                name="expense_date"
                icon={Calendar}
                value={form.expense_date}
                onChange={handleChange}
                required
              />
              <InputField
                label="Amount"
                type="number"
                name="amount"
                min={0}
                step="0.01"
                icon={IndianRupee}
                placeholder="0.00"
                value={form.amount || ''}
                onChange={handleChange}
                required
              />
            </div>

            <InputField
              label="Category"
              name="category"
              icon={Tag}
              placeholder="e.g. Rent, Salary, Utilities"
              value={form.category}
              onChange={handleChange}
              required
            />

            <InputField
              label="Vendor / Store"
              name="vendor"
              icon={Store}
              placeholder="Who did you pay?"
              value={form.vendor}
              onChange={handleChange}
            />
          </div>

          <hr className="border-gray-100" />

          {/* SECTION: PAYMENT DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900">Payment Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Payment Mode"
                name="payment_mode"
                icon={CreditCard}
                placeholder="Cash, UPI, Card"
                value={form.payment_mode}
                onChange={handleChange}
              />
              <InputField
                label="Reference"
                name="reference"
                icon={FileText}
                placeholder="Ref No. or Notes"
                value={form.reference}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Add any additional notes about this expense..."
                value={form.description}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Save Expense Record
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
              Information is synced securely to your cloud inventory
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm