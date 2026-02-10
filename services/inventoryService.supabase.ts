import { supabase } from './supabaseClient'
import { Product } from '../types'

class InventoryServiceSupabase {
  /* ===============================
     GET PRODUCTS
     =============================== */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants (
          id,
          name,
          sku,
          stock,
          price_modifier
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('GET PRODUCTS ERROR', error)
      throw error
    }

    return (data ?? []).map(p => ({
      ...p,
      variants: p.variants ?? [],
    })) as Product[]
  }

  /* ===============================
     ADD PRODUCT
     =============================== */
  async addProduct(product: any) {
    // 1️⃣ Calculate stock
    const calculatedStock =
      product.has_variants && product.variants?.length
        ? product.variants.reduce(
            (sum: number, v: any) => sum + Number(v.stock || 0),
            0
          )
        : Number(product.stock || 0)

    // 2️⃣ Insert product (NO variants)
    const { data: productRow, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description ?? null,

        // ✅ CORRECT COLUMN NAME
        cost_price: Number(product.cost_price ?? 0),
        sell_price: Number(product.sell_price ?? 0),

        stock: calculatedStock,
        has_variants: !!product.has_variants,
      })
      .select()
      .single()

    if (error) {
      console.error('PRODUCT INSERT FAILED', error)
      throw error
    }

    // 3️⃣ Insert variants (if any)
    if (product.has_variants && product.variants?.length > 0) {
      const variantsPayload = product.variants.map((v: any) => ({
        product_id: productRow.id,
        name: v.name,
        sku: v.sku ?? null,
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

  /* ===============================
     UPDATE PRODUCT
     =============================== */
  async updateProduct(product: any) {
    // 1️⃣ Recalculate stock
    const calculatedStock =
      product.has_variants && product.variants?.length
        ? product.variants.reduce(
            (sum: number, v: any) => sum + Number(v.stock || 0),
            0
          )
        : Number(product.stock || 0)

    // 2️⃣ Update product
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description ?? null,

        // ✅ CORRECT COLUMN NAME
        cost_price: Number(product.cost_price ?? 0),
        sell_price: Number(product.sell_price ?? 0),

        stock: calculatedStock,
        has_variants: !!product.has_variants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)

    if (error) {
      console.error('PRODUCT UPDATE FAILED', error)
      throw error
    }

    // 3️⃣ Replace variants safely
    await supabase.from('variants').delete().eq('product_id', product.id)

    if (product.has_variants && product.variants?.length > 0) {
      const variantsPayload = product.variants.map((v: any) => ({
        product_id: product.id,
        name: v.name,
        sku: v.sku ?? null,
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

  /* ===============================
     DELETE PRODUCT
     =============================== */
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const inventoryService = new InventoryServiceSupabase()
