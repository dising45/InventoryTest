import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

/* ================= TYPES ================= */
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, opts?: { duration?: number; action?: { label: string; onClick: () => void } }) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

/* ================= CONTEXT ================= */
const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ================= PROVIDER ================= */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast: ToastContextType['showToast'] = useCallback((type, message, opts) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const toast: Toast = { id, type, message, duration: opts?.duration, action: opts?.action }
    setToasts(prev => [...prev, toast])

    const dur = opts?.duration ?? (type === 'error' ? 5000 : 3000)
    setTimeout(() => removeToast(id), dur)
  }, [removeToast])

  const ctx: ToastContextType = {
    showToast,
    success: (msg) => showToast('success', msg),
    error: (msg) => showToast('error', msg),
    warning: (msg) => showToast('warning', msg),
    info: (msg) => showToast('info', msg),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

/* ================= CONTAINER ================= */
const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

/* ================= SINGLE TOAST ================= */
const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styleMap = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-gray-800 text-white',
}

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false)
  const Icon = iconMap[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${styleMap[toast.type]}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-semibold flex-1">{toast.message}</p>
      {toast.action && (
        <button
          onClick={() => { toast.action!.onClick(); onDismiss() }}
          className="text-xs font-bold underline underline-offset-2 opacity-90 hover:opacity-100 shrink-0"
        >
          {toast.action.label}
        </button>
      )}
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}