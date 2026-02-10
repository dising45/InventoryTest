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

  /* -------- Discount / Tax (UI only) -------- */
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat')
  const [discountValue, setDiscountValue] = useState(0)

  const [taxType, setTaxType] = useState<'flat' | 'percent'>('percent')
  const [taxValue, setTaxValue] = useState(0)

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customer_id)

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

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!customerId || items.length === 0) return

    setLoading(true)
    try {
      await onSave({
        customer_id: customerId,
        items,
        total_amount: finalTotal,
      })
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="pb-28">
      {/* HEADER */}
      <div className="sticky top-0 bg-green-600 text-white px-4 py-4 flex items-center z-20">
        <button onClick={onCancel}>
          <ArrowLeft className="w-5 h-5 mr-3" />
        </button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {isQuick && <Zap className="w-4 h-4" />}
          {initialData ? 'Edit Sale' : isQuick ? 'Quick Sale' : 'New Sale'}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* CUSTOMER */}
        {!isQuick && (
          <Card>
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
          </Card>
        )}

        {/* ADD PRODUCT */}
        <Card>
          <h3 className="font-semibold mb-2">Add Product</h3>

          <select
            value={selectedProduct?.id || ''}
            onChange={e => {
              const p = products.find(x => x.id === e.target.value)
              setSelectedProduct(p)
              setSelectedVariant(undefined)
            }}
            className="w-full border rounded-lg px-3 py-2 mb-2"
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
              className="w-full border rounded-lg px-3 py-2 mb-2"
            >
              <option value="">Select Variant</option>
              {selectedProduct.variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} (Stock {v.stock})
                </option>
              ))}
            </select>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(+e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              value={unitPrice}
              onChange={e => setUnitPrice(+e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addItem}
            className="mt-3 w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            <Plus className="inline w-4 h-4 mr-1" /> Add Product
          </button>
        </Card>

        {/* ORDER ITEMS */}
        <Card>
          <h3 className="font-semibold mb-2 flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" /> Order Summary
          </h3>

          {items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × ₹{item.unit_price}
                </p>
              </div>
              <button onClick={() => removeItem(i)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </Card>

        {/* BILL BREAKDOWN */}
        <Card>
          <h3 className="font-semibold mb-3 flex items-center">
            <IndianRupee className="w-4 h-4 mr-2" /> Bill Details
          </h3>

          <Row label="Subtotal" value={subTotal} />

          <AdjustRow
            label="Discount"
            type={discountType}
            setType={setDiscountType}
            value={discountValue}
            setValue={setDiscountValue}
          />

          <AdjustRow
            label="Tax"
            type={taxType}
            setType={setTaxType}
            value={taxValue}
            setValue={setTaxValue}
          />

          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
          </div>
        </Card>
      </div>

      {/* CTA */}
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

/* ---------------- UI Helpers ---------------- */

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-xl p-4 shadow">{children}</div>
)

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between text-sm mb-1">
    <span>{label}</span>
    <span>₹{value.toFixed(2)}</span>
  </div>
)

const AdjustRow = ({
  label,
  type,
  setType,
  value,
  setValue,
}: any) => (
  <div className="flex justify-between items-center text-sm mb-2">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="border rounded px-1 py-0.5 text-xs"
      >
        <option value="flat">₹</option>
        <option value="percent">%</option>
      </select>
      <input
        type="number"
        value={value}
        onChange={e => setValue(+e.target.value)}
        className="border rounded px-2 py-1 w-20 text-right"
      />
    </div>
  </div>
)

export default SalesForm
