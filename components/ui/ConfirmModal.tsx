import React, { useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  // Prevents a slow async confirm (e.g. delete + stock rollback) from being
  // fired twice by a double-click, which would double-delete / double-adjust.
  const [busy, setBusy] = useState(false)

  // Reset when the modal is (re)opened or closed by the parent.
  useEffect(() => {
    if (!open) setBusy(false)
  }, [open])

  if (!open) return null

  const handleConfirm = async () => {
    if (busy) return
    setBusy(true)
    try {
      await onConfirm()
    } catch {
      // If the confirm handler throws, re-enable so the user can retry.
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            danger ? 'bg-red-50' : 'bg-amber-50'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-gray-900 text-center">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-80 ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal