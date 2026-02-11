import { supabase } from './supabaseClient'

const BUCKET = 'product-images'

export const imageService = {
  async uploadProductImage(file: File) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('UPLOAD ERROR', error)
      throw error
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    return data.publicUrl
  }
}
