// Settings.tsx — per-business account controls (Part 4).
// Everything here is scoped to the signed-in business: profile name + logo
// (user_metadata), change password, full data export (RLS auto-scopes every
// query to the current owner), and sign out.
import React, { useState, useRef } from 'react'
import {
  Building2, Image as ImageIcon, Lock, Download, LogOut,
  Loader2, Check, Upload,
} from 'lucide-react'
import { useToast } from './ui'
import { imageService } from '../services/imageService.supabase'
import { supabase } from '../services/supabaseClient'

interface SettingsProps {
  businessName: string
  businessLogoUrl: string | null
  userEmail: string
  onUpdateBusiness: (fields: { business_name?: string; business_logo_url?: string }) => Promise<void>
  onUpdatePassword: (newPassword: string) => Promise<void>
  onSignOut: () => void
}

// Every table that belongs to a business — mirrors the migration's table list.
// RLS means each query returns only this business's rows.
const EXPORT_TABLES = [
  'products', 'variants', 'customers', 'suppliers', 'sales_orders',
  'sales_items', 'purchase_orders', 'purchase_items', 'purchase_charges', 'expenses',
]

const cardClass = 'bg-white rounded-3xl border border-gray-200 shadow-sm p-6'
const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'
const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none'

const Settings: React.FC<SettingsProps> = ({
  businessName, businessLogoUrl, userEmail,
  onUpdateBusiness, onUpdatePassword, onSignOut,
}) => {
  const toast = useToast()

  // --- Business profile ---
  const [name, setName] = useState(businessName === 'My Business' ? '' : businessName)
  const [savingName, setSavingName] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // --- Password ---
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  // --- Export ---
  const [exporting, setExporting] = useState(false)

  const handleSaveName = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Business name cannot be empty')
      return
    }
    setSavingName(true)
    try {
      await onUpdateBusiness({ business_name: trimmed })
      toast.success('Business name updated')
    } catch {
      toast.error('Could not update business name')
    } finally {
      setSavingName(false)
    }
  }

  const handleLogoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    setLogoUploading(true)
    try {
      // Lands under <uid>/... which satisfies the per-owner storage policy.
      const url = await imageService.uploadProductImage(file)
      await onUpdateBusiness({ business_logo_url: url })
      toast.success('Logo updated')
    } catch {
      toast.error('Could not upload logo')
    } finally {
      setLogoUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    setLogoUploading(true)
    try {
      await onUpdateBusiness({ business_logo_url: '' })
      toast.success('Logo removed')
    } catch {
      toast.error('Could not remove logo')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleChangePassword = async () => {
    if (pw.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (pw !== pw2) {
      toast.error('Passwords do not match')
      return
    }
    setSavingPw(true)
    try {
      await onUpdatePassword(pw)
      setPw('')
      setPw2('')
      toast.success('Password changed')
    } catch (err: any) {
      toast.error(err?.message || 'Could not change password')
    } finally {
      setSavingPw(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const bundle: Record<string, any> = {
        business: businessName,
        exported_at: new Date().toISOString(),
        tables: {},
      }
      for (const table of EXPORT_TABLES) {
        const { data, error } = await supabase.from(table).select('*')
        if (error) throw error
        bundle.tables[table] = data ?? []
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const safeName = businessName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      link.href = url
      link.download = `${safeName}-backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Backup downloaded')
    } catch {
      toast.error('Could not export data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* BUSINESS PROFILE */}
      <section className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Business profile</h2>
        </div>

        {/* Logo */}
        <label className={labelClass}>Logo</label>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {businessLogoUrl
              ? <img src={businessLogoUrl} alt="Logo" className="w-full h-full object-contain" />
              : <ImageIcon className="w-7 h-7 text-gray-300" />}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoPick} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={logoUploading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors disabled:opacity-60"
            >
              {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {businessLogoUrl ? 'Replace logo' : 'Upload logo'}
            </button>
            {businessLogoUrl && (
              <button
                onClick={handleRemoveLogo}
                disabled={logoUploading}
                className="text-xs font-semibold text-gray-400 hover:text-rose-600 text-left transition-colors disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <label className={labelClass}>Business name</label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Naitree"
            className={inputClass}
          />
          <button
            onClick={handleSaveName}
            disabled={savingName}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shrink-0 transition-colors"
          >
            {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Shown in the sidebar and on your invoices.</p>
      </section>

      {/* CHANGE PASSWORD */}
      <section className={cardClass}>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Change password</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPw}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {savingPw && <Loader2 className="w-4 h-4 animate-spin" />}
            Update password
          </button>
        </div>
      </section>

      {/* DATA EXPORT */}
      <section className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">Back up my data</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Download everything — products, sales, customers, suppliers, vendor bills and expenses — as a single JSON file you can keep safe.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Preparing…' : 'Download backup'}
        </button>
      </section>

      {/* ACCOUNT / SIGN OUT */}
      <section className={cardClass}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{businessName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl shrink-0 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  )
}

export default Settings
