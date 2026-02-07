import { supabase } from './supabaseClient'
import { Product } from '../types'

class InventoryServiceSupabase {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  }

async addProduct(product: any) {
  // 1️⃣ Insert product (WITHOUT variants)
  const { data: productRow, error: productError } = await supabase
    .from('products')
    .insert([
      {
        name: product.name,
        description: product.description,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        has_variants: product.has_variants,
      },
    ])
    .select()
    .single()

  if (productError) {
    console.error('Product insert failed', productError)
    throw productError
  }

  // 2️⃣ Insert variants (ONLY if present)
  if (product.has_variants && product.variants?.length > 0) {
    const variantsPayload = product.variants.map((v: any) => ({
      product_id: productRow.id,
      name: v.name,
      sku: v.sku,
      stock: v.stock,
      price_modifier: v.price_modifier ?? 0,
    }))

    const { error: variantError } = await supabase
      .from('variants')
      .insert(variantsPayload)

    if (variantError) {
      console.error('Variant insert failed', variantError)
      throw variantError
    }
  }

  return productRow
}



  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const inventoryService = new InventoryServiceSupabase()
