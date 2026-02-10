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
  CheckCircle,
  Clock,
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
  }) => Promise<void>
  onCancel: () => void
}

const WALK_IN_NAME = 'Walk-in Customer'

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

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customer_id)

      const mappedItems = (initialData.items || []).map(item => {
        const product = products.find(p => p.id === item.product_id)
        const variant = product?.variants.find(v => v.id === item.variant_id)

        return {
          ...item,
          product_name: product?.name || 'Unknown Product',
          variant_name: variant?.name,
        }
      })

      setItems(mappedItems)
      return
    }

    if (isQuick) {
      const walkIn = customers.find(c => c.name === WALK_IN_NAME)
      if (walkIn) setCustomerId(walkIn.id)
    }
  }, [initialData, products, customers, isQuick])

  /* -------------------- PRICE AUTO -------------------- */
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

  /* -------------------- STOCK HELPERS -------------------- */
  const getAvailableStock = (item: SalesItem) => {
    const product = products.find(p => p.id === item.product_id)
    if (!product) return 0

    if (item.variant_id && product.has_variants) {
      return (
        product.variants.find(v => v.id === item.variant_id)?.stock ?? 0
      )
    }

    return product.stock
  }

  /* -------------------- ADD ITEM -------------------- */
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

    const newItem: SalesItem = {
      product_id: selectedProduct.id,
      variant_id: selectedVariant?.id,
      quantity,
      unit_price: unitPrice,
      product_name: selectedProduct.name,
      variant_name: selectedVariant?.name,
    }

    setItems(prev => [...prev, newItem])
    setSelectedProduct(undefined)
    setSelectedVariant(undefined)
    setQuantity(1)
    setUnitPrice(0)
  }

  const removeItem = (index: number) =>
    setItems(prev => prev.filter((_, i) => i !== index))

  /* -------------------- TOTAL -------------------- */
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!customerId || items.length === 0) return

    setLoading(true)
    try {
      await onSave({
        customer_id: customerId,
        items,
        total_amount: totalAmount,
      })
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="pb-28">
      {/* HEADER */}
      <div className="sticky top-0 bg-green-500 text-white px-4 py-4 flex items-center z-20">
        <button onClick={onCancel}>
          <ArrowLeft className="w-5 h-5 mr-3" />
        </button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {isQuick && <Zap className="w-4 h-4" />}
          {initialData ? 'Edit Sale' : isQuick ? 'Quick Sale' : 'New Sale'}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* CUSTOMER (hidden for quick sale) */}
        {!isQuick && (
          <div className="bg-white rounded-xl p-4 shadow">
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PAYMENT SUMMARY */}
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="text-sm text-gray-500">Payment Summary</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Total</span>
            </div>
            <span className="text-xl font-bold">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="Customer Paid"
              value={totalAmount}
              icon={CheckCircle}
              color="green"
            />
            <SummaryCard
              label="Due"
              value={0}
              icon={Clock}
              color="red"
            />
          </div>
        </div>

        {/* ADD PRODUCT */}
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <h3 className="font-semibold">Products</h3>

          <select
            value={selectedProduct?.id || ''}
            onChange={e => {
              const p = products.find(x => x.id === e.target.value)
              setSelectedProduct(p)
              setSelectedVariant(undefined)
            }}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedProduct?.has_variants && (
            <select
              value={selectedVariant?.id || ''}
              onChange={e =>
                setSelectedVariant(
                  selectedProduct.variants.find(v => v.id === e.target.value)
                )
              }
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Variant</option>
              {selectedProduct.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} (Stock: {v.stock})
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={e => setUnitPrice(Number(e.target.value))}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addItem}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            <Plus className="inline w-4 h-4 mr-1" /> Add Product
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-3 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" /> Order Summary
          </h3>

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <p className="text-sm font-medium">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-gray-500">
                    {item.variant_name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {item.quantity} × ₹{item.unit_price}
                </p>
              </div>
              <button onClick={() => removeItem(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4">
        <button
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          <Save className="inline w-4 h-4 mr-2" />
          {loading ? 'Saving…' : 'Complete Sale'}
        </button>
      </div>
    </div>
  )
}

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: any
  color: 'green' | 'red'
}) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Icon
        className={`w-4 h-4 ${
          color === 'green' ? 'text-green-500' : 'text-red-500'
        }`}
      />
      {label}
    </div>
    <div
      className={`mt-1 font-bold ${
        color === 'green' ? 'text-green-600' : 'text-red-600'
      }`}
    >
      ₹{value.toFixed(2)}
    </div>
  </div>
)

export default SalesForm
