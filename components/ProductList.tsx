// ProductList.tsx
import React, { useState, useMemo } from 'react'
import { Product } from '../types'
import {
  Edit2,
  Trash2,
  Search,
  Layers,
  AlertCircle,
  TrendingUp,
  Package,
  MoreHorizontal,
  ImageOff,
  Filter,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

const LOW_STOCK_THRESHOLD = 10

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'newest' | 'oldest'

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Name A→Z',
  'name-desc': 'Name Z→A',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
  'stock-asc': 'Stock: Low → High',
  'stock-desc': 'Stock: High → Low',
  'newest': 'Newest First',
  'oldest': 'Oldest First',
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    let result = products.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    )

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'price-asc': return a.sell_price - b.sell_price
        case 'price-desc': return b.sell_price - a.sell_price
        case 'stock-asc': return (a.stock ?? 0) - (b.stock ?? 0)
        case 'stock-desc': return (b.stock ?? 0) - (a.stock ?? 0)
        case 'newest': return (b.created_at || '').localeCompare(a.created_at || '')
        case 'oldest': return (a.created_at || '').localeCompare(b.created_at || '')
        default: return 0
      }
    })

    return result
  }, [products, searchTerm, sortBy])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* SEARCH + SORT BAR */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm pb-2 pt-1 md:static md:bg-transparent md:p-0">
        <div className="flex gap-2 items-center">
          {/* Search Input */}
          <div className="relative group flex-1 max-w-md shadow-sm md:shadow-none">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
              focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm shadow-sm"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="appearance-none pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer transition-all shadow-sm hover:bg-gray-50"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map(key => (
                <option key={key} value={key}>{SORT_LABELS[key]}</option>
              ))}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Result count */}
        {(searchTerm || sortBy !== 'newest') && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <span className="text-xs text-gray-500">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            {(searchTerm || sortBy !== 'newest') && (
              <button
                onClick={() => { setSearchTerm(''); setSortBy('newest') }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-200 border-dashed text-center mx-4 md:mx-0">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <Layers className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            No products found
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            We couldn't find anything matching "{searchTerm}". Try a different keyword.
          </p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-6 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* ===================== DESKTOP TABLE ===================== */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProducts.map(product => {
                  const margin = product.sell_price - product.cost_price
                  const marginPct = product.sell_price > 0
                    ? ((margin / product.sell_price) * 100).toFixed(1)
                    : '0'
                  
                  const isLowStock = product.stock <= LOW_STOCK_THRESHOLD
                  const isOutOfStock = product.stock === 0

                  return (
                    <tr
                      key={product.id}
                      className="group hover:bg-gray-50/80 transition-colors duration-200"
                    >
                      {/* Product Name & Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-indigo-600 bg-indigo-50 font-bold text-lg">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5 font-medium">
                              {product.has_variants ? (
                                <>
                                  <Layers className="w-3 h-3 mr-1" />
                                  {product.variants?.length ?? 0} Variants
                                </>
                              ) : (
                                'Single SKU'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border
                          ${isOutOfStock 
                            ? 'bg-gray-100 text-gray-600 border-gray-200'
                            : isLowStock 
                              ? 'bg-amber-50 text-amber-700 border-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 
                            ${isOutOfStock ? 'bg-gray-400' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          />
                          {product.stock} Units
                        </div>
                      </td>

                      {/* Sell Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 tabular-nums">
                        {formatCurrency(product.sell_price)}
                      </td>

                      {/* Margin */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm tabular-nums">
                        <div className="flex flex-col items-end">
                          <span className="text-gray-900 font-bold">{formatCurrency(margin)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded mt-0.5">
                            {marginPct}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ===================== MOBILE CARDS (Touch Optimized) ===================== */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= LOW_STOCK_THRESHOLD
              
              return (
                <div
                  key={product.id}
                  onClick={() => onEdit(product)}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100 active:scale-[0.98] active:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex gap-4">
                    {/* Image Thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-indigo-500 font-bold text-xl bg-indigo-50">
                          {product.name.charAt(0)}
                        </div>
                      )}
                      {/* Stock Badge on Image */}
                      {isLowStock && (
                        <div className="absolute top-0 right-0 p-1">
                           <div className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="pr-2">
                           <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {product.has_variants ? `${product.variants?.length} Options` : 'Standard'}
                          </p>
                        </div>
                        <span className="text-sm font-black text-indigo-600 whitespace-nowrap">
                          {formatCurrency(product.sell_price)}
                        </span>
                      </div>
                      
                      {/* Bottom Row */}
                      <div className="flex items-end justify-between mt-2">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isLowStock 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {product.stock} in stock
                        </div>

                        {/* Quick Actions (Prevent bubbling) */}
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductList