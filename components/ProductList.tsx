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
  Filter
} from 'lucide-react'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

const LOW_STOCK_THRESHOLD = 10

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return products.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    )
  }, [products, searchTerm])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* SEARCH BAR (Sticky on Mobile) */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm pb-2 pt-1 md:static md:bg-transparent md:p-0">
        <div className="relative group max-w-md mx-auto md:mx-0 shadow-sm md:shadow-none">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm shadow-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {/* Optional Filter Icon for Mobile */}
          <button className="md:hidden absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
             <Filter className="w-5 h-5" />
          </button>
        </div>
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