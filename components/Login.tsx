// Login.tsx — invite-only sign-in screen (no public registration).
import React, { useState } from 'react'
import { Box, Loader2, Mail, Lock, AlertCircle } from 'lucide-react'

interface LoginProps {
  onSignIn: (email: string, password: string) => Promise<void>
}

const Login: React.FC<LoginProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await onSignIn(email.trim(), password)
      // On success the auth listener swaps this screen out — no further action.
    } catch (err: any) {
      setError(err?.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : (err?.message || 'Unable to sign in. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <Box className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">InventoryPro</h1>
          <p className="mt-1 text-sm text-gray-400 font-medium">Sign in to your business</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="you@business.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.99]"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Accounts are created by the administrator.
        </p>
      </div>
    </div>
  )
}

export default Login
