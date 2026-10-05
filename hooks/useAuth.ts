import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore any persisted session on launch (PWA stays logged in).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Keep in sync with sign-in / sign-out / token refresh.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Update business profile (name/logo) in user_metadata. The resulting
  // USER_UPDATED event flows through onAuthStateChange above, so the new
  // session (and businessName/logo below) refresh everywhere automatically.
  const updateBusiness = async (fields: { business_name?: string; business_logo_url?: string }) => {
    const { error } = await supabase.auth.updateUser({ data: fields })
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const user: User | null = session?.user ?? null
  // Business name set in the owner account's user_metadata (plan Part 2).
  const businessName: string =
    (user?.user_metadata?.business_name as string | undefined) ?? 'My Business'
  const businessLogoUrl: string | null =
    (user?.user_metadata?.business_logo_url as string | undefined) ?? null

  return {
    session,
    user,
    businessName,
    businessLogoUrl,
    loading,
    signIn,
    signOut,
    updateBusiness,
    updatePassword,
  }
}
