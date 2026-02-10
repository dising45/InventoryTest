import { Variant } from '../../types'
import { X } from 'lucide-react'

interface Props {
  variants: Variant[]
  onClose: () => void
}

export default function VariantSheet({ variants, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-end">
      <div className="bg-white w-full rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Variants</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {variants.map(v => (
          <div
            key={v.id}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span>{v.name}</span>
            <span className="font-semibold">{v.stock}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
