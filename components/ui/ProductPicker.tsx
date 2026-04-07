// ProductPicker.tsx — Searchable product selector for POS
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Product, Variant } from '../../types'
import { Search, Package, X, ChevronRight, Layers } from 'lucide-react'

interface ProductPickerProps {
  products: Product[]
  onSelect: (product: Product, variant?: Variant) => void
  placeholder?: string
}

const ProductPicker: React.FC<ProductPickerProps> = ({
  products,
  onSelect,
  placeholder = 'Search products...',
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter products by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    )
  }, [products, query])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (product: Product, variant?: Variant) => {
    onSelect(product, variant)
    setQuery('')
    setIsOpen(false)
    setExpandedProduct(null)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div ref={containerRef} className="relative">
      {/* SEARCH INPUT */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setIsOpen(true)
            setExpandedProduct(null)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-2xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No products found</p>
            </div>
          ) : (
            filtered.map(product => {
              const isExpanded = expandedProduct === product.id
              const stock = product.stock ?? 0
              const isOutOfStock = stock === 0

              return (
                <div key={product.id}>
                  <button
                    onClick={() => {
                      if (product.has_variants && product.variants?.length > 0) {
                        setExpandedProduct(isExpanded ? null : product.id)
                      } else if (!isOutOfStock) {
                        handleSelect(product)
                      }
                    }}
                    disabled={isOutOfStock && !product.has_variants}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isOutOfStock && !product.has_variants
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-indigo-50/50 active:bg-indigo-50'
                    } ${isExpanded ? 'bg-gray-50' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-500 font-bold bg-indigo-50">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-indigo-600">
                          {formatCurrency(product.sell_price)}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-red-50 text-red-600'
                            : stock <= 10
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {stock} in stock
                        </span>
                      </div>
                    </div>

                    {/* Variant indicator */}
                    {product.has_variants && product.variants?.length > 0 ? (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Layers className="w-3.5 h-3.5" />
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    )}
                  </button>

                  {/* VARIANT SUB-LIST */}
                  {isExpanded && product.variants?.map(variant => {
                    const vStock = variant.stock ?? 0
                    const vOutOfStock = vStock === 0
                    const price = product.sell_price + (variant.price_modifier || 0)

                    return (
                      <button
                        key={variant.id}
                        onClick={() => !vOutOfStock && handleSelect(product, variant)}
                        disabled={vOutOfStock}
                        className={`w-full flex items-center gap-3 pl-14 pr-4 py-2.5 text-left border-t border-gray-50 transition-colors ${
                          vOutOfStock
                            ? 'opacity-40 cursor-not-allowed bg-gray-50/50'
                            : 'hover:bg-indigo-50/50 active:bg-indigo-50'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{variant.name}</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 shrink-0">
                          {formatCurrency(price)}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          vOutOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {vStock}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default ProductPicker