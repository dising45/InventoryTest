// SalesForm.tsx
import React, { useState, useEffect } from 'react'
import { Customer, Product, SalesItem, SalesOrder, Variant } from '../types'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ShoppingBag,
  Zap,
  IndianRupee,
  User,
  Package,
  ChevronDown,
  Calculator,
  Tag,
  Percent,
  Receipt,
  Loader2
} from 'lucide-react'

interface SalesFormProps {
  customers: Customer[]
  products: Product[]
  initialData?: SalesOrder
  mode?: 'normal' | 'quick'
  onSave: (saleData: {
    customer_id: string
    items: SalesItem[]
    total_amount: number
    order_date: string
  }) => Promise<void>
  onCancel: () => void
}

const WALK_IN_NAME = 'Walk-in Customer'


/* ================= UI HELPERS ================= */
const SelectWrapper = ({ icon: Icon, children }: any) => (
  <div className="relative">
    {Icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
    )}
    {children}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
)

const SegmentedControl = ({ value, onChange, options }: any) => (
  <div className="flex bg-gray-100 p-1 rounded-lg">
    {options.map((opt: any) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all ${value === opt.value
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

/* ================= MAIN COMPONENT ================= */

const SalesForm: React.FC<SalesFormProps> = ({
  customers,
  products,
  initialData,
  mode = 'normal',
  onSave,
  onCancel,
}) => {
  const isQuick = mode === 'quick'

  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<SalesItem[]>([])

  const [selectedProduct, setSelectedProduct] = useState<Product>()
  const [selectedVariant, setSelectedVariant] = useState<Variant>()
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  /* -------- Discount / Tax -------- */
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat')
  const [discountValue, setDiscountValue] = useState(0)

  const [taxType, setTaxType] = useState<'flat' | 'percent'>('percent')
  const [taxValue, setTaxValue] = useState(0)

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customer_id)
      setOrderDate(
        initialData.order_date ??
        initialData.created_at?.split('T')[0]
      )
      const mapped = (initialData.items || []).map(item => {
        const product = products.find(p => p.id === item.product_id)
        const variant = product?.variants.find(v => v.id === item.variant_id)

        return {
          ...item,
          product_name: product?.name || 'Unknown Product',
          variant_name: variant?.name,
        }
      })

      setItems(mapped)
      return
    }

    if (isQuick) {
      const walkIn = customers.find(c => c.name === WALK_IN_NAME)
      if (walkIn) setCustomerId(walkIn.id)
    }
  }, [initialData, products, customers, isQuick])

  /* ---------------- PRICE AUTO ---------------- */
  useEffect(() => {
    if (!selectedProduct) {
      setUnitPrice(0)
      return
    }

    setUnitPrice(
      selectedProduct.sell_price +
      (selectedVariant?.price_modifier || 0)
    )
  }, [selectedProduct, selectedVariant])

  /* ---------------- EDIT ITEM ---------------- */
  const updateItem = (
    index: number,
    field: 'quantity' | 'unit_price',
    value: number
  ) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item

        if (field === 'quantity') {
          const product = products.find(p => p.id === item.product_id)
          let maxStock = product?.stock ?? 0

          if (item.variant_id && product?.has_variants) {
            maxStock =
              product.variants.find(v => v.id === item.variant_id)?.stock ??
              0
          }

          return {
            ...item,
            quantity: Math.max(1, Math.min(value, maxStock)),
          }
        }

        return {
          ...item,
          unit_price: Math.max(0, value),
        }
      })
    )
  }

  /* ---------------- ADD ITEM ---------------- */
  const addItem = () => {
    if (!selectedProduct) return
    if (selectedProduct.has_variants && !selectedVariant) return

    const maxStock = selectedVariant
      ? selectedVariant.stock
      : selectedProduct.stock

    if (quantity > maxStock) {
      alert(`Only ${maxStock} items available`)
      return
    }

    setItems(prev => [
      ...prev,
      {
        product_id: selectedProduct.id,
        variant_id: selectedVariant?.id,
        quantity,
        unit_price: unitPrice,
        product_name: selectedProduct.name,
        variant_name: selectedVariant?.name,
      },
    ])

    setSelectedProduct(undefined)
    setSelectedVariant(undefined)
    setQuantity(1)
    setUnitPrice(0)
  }

  const removeItem = (i: number) =>
    setItems(prev => prev.filter((_, idx) => idx !== i))

  /* ---------------- TOTALS ---------------- */
  const subTotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  )

  const discountAmount =
    discountType === 'percent'
      ? (subTotal * discountValue) / 100
      : discountValue

  const taxAmount =
    taxType === 'percent'
      ? ((subTotal - discountAmount) * taxValue) / 100
      : taxValue

  const finalTotal = Math.max(
    0,
    subTotal - discountAmount + taxAmount
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

  // const handleSubmit = async () => {
  //   if (!customerId || items.length === 0) return
  //   setLoading(true)
  //   try {
  //     await onSave({
  //       customer_id: customerId,
  //       items,
  //       total_amount: finalTotal,
  //       order_date: orderDate,   // 🔥 add this
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const handleSubmit = async () => {
    if (!customerId || items.length === 0) {
      console.log("Blocked: missing customer or items")
      return
    }

    console.log("Submitting order:", {
      customer_id: customerId,
      items,
      total_amount: finalTotal,
      order_date: orderDate
    })

    setLoading(true)

    try {
      await onSave({
        customer_id: customerId,
        items,
        total_amount: finalTotal,
        order_date: orderDate,
      })
    } catch (err) {
      console.error("SAVE FAILED:", err)
    } finally {
      setLoading(false)
    }
  }


  /* ---------------- RENDER ---------------- */
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24 md:pb-0">

      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {isQuick && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
              {initialData ? 'Edit Order' : isQuick ? 'Quick Sale' : 'New Sales Order'}
            </h2>
          </div>
        </div>

        {/* Desktop Save Button */}
        <div className="hidden md:block">
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Complete Order
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-6">

          {/* CUSTOMER SELECTION */}
          {/* CUSTOMER + ORDER DATE */}
          {!isQuick && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <label className="text-sm font-semibold text-gray-700 block">
                Customer Details
              </label>

              {/* Customer Select */}
              <SelectWrapper icon={User}>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </SelectWrapper>

              {/* Order Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block ml-1">
                  Order Date
                </label>

                <div className="relative">
                  <input
                    type="date"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}


          {/* PRODUCT ENTRY CARD */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-indigo-600" />
              Add Items
            </h3>

            <div className="space-y-4">
              {/* Product Select */}
              <SelectWrapper icon={ShoppingBag}>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={e => {
                    const p = products.find(x => x.id === e.target.value)
                    setSelectedProduct(p)
                    setSelectedVariant(undefined)
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                >
                  <option value="">Search or Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </SelectWrapper>

              {/* Variant Select */}
              {selectedProduct?.has_variants && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <SelectWrapper icon={Tag}>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={e =>
                        setSelectedVariant(
                          selectedProduct.variants.find(v => v.id === e.target.value)
                        )
                      }
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all"
                    >
                      <option value="">Select Variant / Option</option>
                      {selectedProduct.variants.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} (Available: {v.stock})
                        </option>
                      ))}
                    </select>
                  </SelectWrapper>
                </div>
              )}

              {/* Qty & Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block ml-1">Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(+e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block ml-1">Unit Price</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={e => setUnitPrice(+e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addItem}
                disabled={!selectedProduct || (selectedProduct.has_variants && !selectedVariant)}
                className="w-full mt-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-gray-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Order
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[500px]">

            {/* Receipt Header */}
            <div className="bg-gray-50/80 p-5 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-indigo-600" />
                Order Summary
              </h3>
              <span className="bg-white border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {items.length} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
                  <div className="p-4 bg-gray-50 rounded-full">
                    <ShoppingBag className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm">Cart is empty. Add items from the left.</p>
                </div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="group relative bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-6">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.variant_name || 'Standard'}</p>
                      </div>
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg">
                      <div className="flex items-center bg-white border border-gray-200 rounded-md">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', +e.target.value)}
                          className="w-12 text-center text-xs font-bold py-1 outline-none border-none bg-transparent"
                        />
                      </div>
                      <span className="text-xs text-gray-400">×</span>
                      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-md px-2">
                        <span className="text-xs text-gray-400 mr-1">₹</span>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => updateItem(i, 'unit_price', +e.target.value)}
                          className="w-full text-xs font-bold py-1 outline-none border-none bg-transparent"
                        />
                      </div>
                      <div className="text-sm font-bold text-gray-900 tabular-nums text-right min-w-[60px]">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Footer */}
            <div className="bg-gray-50 p-5 border-t border-gray-100 space-y-4">

              {/* Subtotal */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subTotal)}</span>
              </div>

              {/* Discount Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Discount</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-24">
                    <SegmentedControl
                      value={discountType}
                      onChange={setDiscountType}
                      options={[{ label: '₹', value: 'flat' }, { label: '%', value: 'percent' }]}
                    />
                  </div>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(+e.target.value)}
                    className="w-20 text-right text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tax Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Tax</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-24">
                    <SegmentedControl
                      value={taxType}
                      onChange={setTaxType}
                      options={[{ label: '₹', value: 'flat' }, { label: '%', value: 'percent' }]}
                    />
                  </div>
                  <input
                    type="number"
                    value={taxValue}
                    onChange={e => setTaxValue(+e.target.value)}
                    className="w-20 text-right text-sm border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-bold text-2xl text-indigo-600 tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <button
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? 'Processing...' : `Pay ${formatCurrency(finalTotal)}`}
        </button>
      </div>
    </div>
  )
}

export default SalesForm