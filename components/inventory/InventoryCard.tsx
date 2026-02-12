// InventoryCard.tsx
import React from 'react'
import { Product } from '../../types'
import { 
  Edit3, 
  Layers, 
  Package, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react'

interface Props {
  product: Product
  onEdit: (p: Product) => void
}

export default function InventoryCard({ product, onEdit }: Props) {
  
  // Currency Formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate Margin
  const margin = product.sell_price - product.cost_price
  const marginPct = product.sell_price > 0 
    ? ((margin / product.sell_price) * 100).toFixed(0) 
    : '0'

  // Stock Status Logic
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 10

  return (
    <div 
      onClick={() => onEdit(product)}
      className="group bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 p-4 flex gap-4 transition-all duration-200 hover:shadow-md hover:border-indigo-100 cursor-pointer active:scale-[0.98]"
    >
      {/* 1. PRODUCT IMAGE / ICON */}
      <div className="shrink-0">
        <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-indigo-500 font-bold text-xl">
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Variant Indicator on Image */}
          {product.has_variants && (
            <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-[2px] p-1 rounded-tl-lg border-t border-l border-gray-100">
              <Layers className="w-3 h-3 text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        
        {/* Header: Name & Edit */}
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 truncate pr-2 text-sm md:text-base leading-tight">
            {product.name}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1 -mr-2 -mt-2"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing & Margin */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-gray-900 text-sm">
            {formatCurrency(product.sell_price)}
          </span>
          <div className="flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {marginPct}%
          </div>
        </div>

        {/* Footer: Stock Status */}
        <div className="flex items-center justify-between mt-2.5">
          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
            isOutOfStock 
              ? 'bg-red-50 text-red-700 border-red-100'
              : isLowStock
              ? 'bg-amber-50 text-amber-700 border-amber-100'
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            {isOutOfStock ? (
              <>
                <AlertCircle className="w-3 h-3 mr-1" /> Out of Stock
              </>
            ) : (
              <>
                <Package className="w-3 h-3 mr-1" /> 
                {product.stock} Units
              </>
            )}
          </div>

          {/* Optional: Cost Price Label (Subtle) */}
          <span className="text-[10px] text-gray-400">
            CP: {formatCurrency(product.cost_price)}
          </span>
        </div>
      </div>
    </div>
  )
}