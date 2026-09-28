import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download } from 'lucide-react'
import { Product } from '../types'

interface Props {
  product: Product
  onClose: () => void
}

const QRCodeModal: React.FC<Props> = ({ product, onClose }) => {
  const isVariant = product.has_variants && product.variants?.length > 0
  const items = isVariant
    ? product.variants.map(v => ({ label: `${product.name} — ${v.name}`, sku: v.sku, sub: v.sku }))
    : [{ label: product.name, sku: product.sku, sub: product.sku }]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isVariant ? `${items.length} variant codes` : 'Product QR code'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Codes */}
        <div className={`p-5 ${isVariant ? 'grid grid-cols-2 gap-4' : 'flex justify-center'}`}>
          {items.map(item => (
            item.sku ? (
              <div
                key={item.sku}
                className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50"
              >
                <QRCodeSVG
                  value={item.sku}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="M"
                />
                <p className="mt-3 text-xs font-bold text-gray-800 text-center line-clamp-2 leading-snug">
                  {item.label}
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-1">{item.sub}</p>
              </div>
            ) : (
              <div
                key={item.label}
                className="flex flex-col items-center p-4 border border-dashed border-gray-200 rounded-xl text-center"
              >
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  No SKU
                </div>
                <p className="mt-3 text-xs font-bold text-gray-500 text-center">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-1">Save product to generate</p>
              </div>
            )
          ))}
        </div>

        <div className="px-5 pb-5">
          <p className="text-[11px] text-gray-400 text-center">
            Screenshot or print these codes to label your products. Use the scan button in Sales to add items instantly.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
