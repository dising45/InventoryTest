import { supabase } from './supabaseClient'

const BUCKET = 'product-images'

async function uploadToStorage(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) {
    console.error('UPLOAD ERROR', error)
    throw error
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export const imageService = {
  async uploadProductImage(file: File) {
    // Scope uploads to the signed-in business's own folder so the
    // per-owner storage policy accepts the write (and files can't
    // collide across businesses).
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')

    const fileExt = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    return uploadToStorage(file, path)
  },

  async uploadBillPhoto(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')

    const fileExt = file.name.split('.').pop()
    const path = `${user.id}/bills/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    return uploadToStorage(file, path)
  },
}
