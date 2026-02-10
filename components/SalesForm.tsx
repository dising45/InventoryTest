import React, { useState, useEffect } from 'react'
import { Customer, Product, SalesItem, SalesOrder, Variant } from '../types'
import { ArrowLeft, Save, Plus, Trash2, ShoppingBag, Zap } from 'lucide-react'

interface SalesFormProps {
  customers: Customer[]
  products: Product[]
  initialData?: SalesOrder
  mode?: 'normal' | 'quick' // 🔥 NEW
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

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>()
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

    // 🔥 QUICK SALE DEFAULT CUSTOMER
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

    if (selectedProduct.has_variants && selectedVariant) {
      setUnitPrice(
        selectedProduct.sell_price + (selectedVariant.price_modifier || 0)
      )
    } else {
      setUnitPrice(selectedProduct.sell_price)
    }
  }, [selectedProduct, selectedVariant])

  /* -------------------- STOCK HELPERS -------------------- */
  const getAvailableStock = (item: SalesItem) => {
    const product = products.find(p => p.id === item.product_id)
    if (!product) return 0

    let currentStock = 0

    if (item.variant_id && product.has_variants) {
      const variant = product.variants.find(v => v.id === item.variant_id)
      currentStock = variant?.stock ?? 0
    } else {
      currentStock = product.stock
    }

    const originalQty =
      initialData?.items?.find(
        i =>
          i.product_id === item.product_id &&
          i.variant_id === item.variant_id
      )?.quantity ?? 0

    return currentStock + originalQty
  }

  const updateItem = (
    index: number,
    field: 'quantity' | 'unit_price',
    value: number
  ) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item

        if (field === 'quantity') {
          const maxStock = getAvailableStock(item)
          return {
            ...item,
            quantity: Math.max(1, Math.min(value, maxStock)),
          }
        }

        return { ...item, unit_price: Math.max(0, value) }
      })
    )
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <h2 className="text-xl font-bold flex items-center gap-2">
          {isQuick && <Zap className="w-5 h-5 text-indigo-600" />}
          {initialData ? 'Edit Sale' : isQuick ? 'Quick Sale' : 'New Sale'}
        </h2>
      </div>

      {/* CUSTOMER (hidden in quick mode) */}
      {!isQuick && (
        <div className="bg-white p-4 rounded border mb-4">
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full border rounded px-3 py-2"
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

      {/* ADD ITEM */}
      <div className="bg-white p-4 rounded border mb-4">
        <select
          value={selectedProduct?.id || ''}
          onChange={e => {
            const p = products.find(x => x.id === e.target.value)
            setSelectedProduct(p)
            setSelectedVariant(undefined)
          }}
          className="w-full mb-3 border rounded px-3 py-2"
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
            className="w-full mb-3 border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            step="0.01"
            value={unitPrice}
            onChange={e => setUnitPrice(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={addItem}
          className="mt-3 w-full bg-indigo-600 text-white py-2 rounded"
        >
          <Plus className="inline w-4 h-4 mr-1" /> Add Item
        </button>
      </div>

      {/* SUMMARY */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold mb-3 flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2" /> Summary
        </h3>

        {items.map((item, index) => (
          <div key={index} className="mb-2 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{item.product_name}</p>
              {item.variant_name && (
                <p className="text-xs text-gray-500">{item.variant_name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {item.quantity} × ₹{item.unit_price}
              </span>
              <button onClick={() => removeItem(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-3 font-bold text-right">
          Total: ₹{totalAmount.toFixed(2)}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          <Save className="inline w-4 h-4 mr-2" />
          {loading ? 'Saving…' : 'Complete Sale'}
        </button>
      </div>
    </div>
  )
}

export default SalesForm
