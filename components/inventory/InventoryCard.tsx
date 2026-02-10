import { Product } from '../../types'
import { Edit3, Layers, Package } from 'lucide-react'

interface Props {
  product: Product
  onEdit: (p: Product) => void
}

export default function InventoryCard({ product, onEdit }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-xs text-gray-500">
            ₹{product.cost_price} → ₹{product.sell_price}
          </p>
        </div>

        <button
          onClick={() => onEdit(product)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Edit3 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Stock */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Package className="w-4 h-4" />
          Stock
        </div>
        <span
          className={`text-sm font-semibold ${
            product.stock <= 0
              ? 'text-red-600'
              : product.stock < 5
              ? 'text-amber-600'
              : 'text-emerald-600'
          }`}
        >
          {product.stock}
        </span>
      </div>

      {/* Variants */}
      {product.has_variants && product.variants?.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-indigo-600">
          <Layers className="w-3 h-3" />
          {product.variants.length} variants
        </div>
      )}
    </div>
  )
}
