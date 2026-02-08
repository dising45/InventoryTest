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
  // 1️⃣ Calculate stock correctly
  const calculatedStock =
    product.has_variants && product.variants?.length
      ? product.variants.reduce(
          (sum: number, v: any) => sum + Number(v.stock || 0),
          0
        )
      : Number(product.stock || 0)

  // 2️⃣ Insert product (NO variants here)
  const { data: productRow, error: productError } = await supabase
    .from('products')
    .insert([
      {
        name: product.name,
        description: product.description,
        buy_price: Number(product.buy_price),
        sell_price: Number(product.sell_price),
        stock: calculatedStock,
        has_variants: !!product.has_variants,
      },
    ])
    .select()
    .single()

  if (productError) {
    console.error('PRODUCT INSERT FAILED', productError)
    throw productError
  }

  // 3️⃣ Insert variants (only if applicable)
  if (product.has_variants && product.variants?.length > 0) {
    const variantsPayload = product.variants.map((v: any) => ({
      product_id: productRow.id,
      name: v.name,
      sku: v.sku,
      stock: Number(v.stock || 0),
      price_modifier: Number(v.price_modifier || 0),
    }))

    const { error: variantError } = await supabase
      .from('variants')
      .insert(variantsPayload)

    if (variantError) {
      console.error('VARIANT INSERT FAILED', variantError)
      throw variantError
    }
  }

  return productRow
}

async updateProduct(product: any) {
  // 1️⃣ Recalculate stock
  const calculatedStock =
    product.has_variants && product.variants?.length
      ? product.variants.reduce(
          (sum: number, v: any) => sum + Number(v.stock || 0),
          0
        )
      : Number(product.stock || 0)

  // 2️⃣ Update product (NO variants here)
  const { error: productError } = await supabase
    .from('products')
    .update({
      name: product.name,
      description: product.description,
      buy_price: Number(product.buy_price),
      sell_price: Number(product.sell_price),
      stock: calculatedStock,
      has_variants: !!product.has_variants,
      updated_at: new Date().toISOString(),
    })
    .eq('id', product.id)

  if (productError) {
    console.error('PRODUCT UPDATE FAILED', productError)
    throw productError
  }

  // 3️⃣ Delete old variants
  const { error: deleteError } = await supabase
    .from('variants')
    .delete()
    .eq('product_id', product.id)

  if (deleteError) {
    console.error('VARIANT DELETE FAILED', deleteError)
    throw deleteError
  }

  // 4️⃣ Insert new variants (if any)
  if (product.has_variants && product.variants?.length > 0) {
    const variantsPayload = product.variants.map((v: any) => ({
      product_id: product.id,
      name: v.name,
      sku: v.sku,
      stock: Number(v.stock || 0),
      price_modifier: Number(v.price_modifier || 0),
    }))

    const { error: variantError } = await supabase
      .from('variants')
      .insert(variantsPayload)

    if (variantError) {
      console.error('VARIANT INSERT FAILED', variantError)
      throw variantError
    }
  }

  return true
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
