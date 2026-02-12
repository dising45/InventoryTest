// VariantSheet.tsx
import React from 'react'
import { Variant } from '../../types'
import { X, Layers, Package, AlertCircle } from 'lucide-react'

interface Props {
  variants: Variant[]
  onClose: () => void
}

export default function VariantSheet({ variants, onClose }: Props) {
  return (
    // Wrapper: Aligns to bottom on mobile, center on desktop
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
      
      {/* Backdrop (Click to close) */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal/Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[2rem] md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300 ease-out">
        
        {/* Mobile Handle (Visual cue) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-gray-300 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-4 md:py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Variants</h3>
              <p className="text-xs text-gray-500 font-medium">
                {variants.length} options configured
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {variants.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No variants found.</p>
            </div>
          ) : (
            variants.map((v) => {
              const stock = v.stock ?? 0
              const isLow = stock <= 5
              
              return (
                <div
                  key={v.id}
                  className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{v.name}</p>
                      {v.sku && (
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          SKU: {v.sku}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    stock === 0 
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : isLow
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-white text-gray-700 border-gray-200 group-hover:border-indigo-100'
                  }`}>
                    {stock === 0 ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Package className="w-3.5 h-3.5" />
                    )}
                    <span>{stock} in stock</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer (Optional, good for spacing on mobile) */}
        <div className="p-6 md:p-0" />
      </div>
    </div>
  )
}