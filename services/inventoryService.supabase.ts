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
     ADD PRODUCT (SAFE)
     =============================== */
  async addProduct(product: any) {
    // 🔒 Validate stock
    if (product.has_variants) {
      for (const v of product.variants ?? []) {
        if (Number(v.stock) < 0) {
          throw new Error(`Variant "${v.name}" stock cannot be negative`)
        }
      }
    } else if (Number(product.stock) < 0) {
      throw new Error('Product stock cannot be negative')
    }

    // Calculate stock
    const calculatedStock =
      product.has_variants && product.variants?.length
        ? product.variants.reduce(
            (sum: number, v: any) => sum + Number(v.stock || 0),
            0
          )
        : Number(product.stock || 0)

    const { data: productRow, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description ?? null,
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

    // Insert variants
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
     UPDATE PRODUCT (SAFE + NON-NEGATIVE)
     =============================== */
  async updateProduct(product: any) {
    // 🔒 Validate stock before touching DB
    if (product.has_variants) {
      for (const v of product.variants ?? []) {
        if (Number(v.stock) < 0) {
          throw new Error(`Variant "${v.name}" stock cannot be negative`)
        }
      }
    } else if (Number(product.stock) < 0) {
      throw new Error('Product stock cannot be negative')
    }

    // Recalculate stock
    const calculatedStock =
      product.has_variants && product.variants?.length
        ? product.variants.reduce(
            (sum: number, v: any) => sum + Number(v.stock || 0),
            0
          )
        : Number(product.stock || 0)

    if (calculatedStock < 0) {
      throw new Error('Total stock cannot be negative')
    }

    // Update product
    const { error: productError } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description ?? null,
        cost_price: Number(product.cost_price ?? 0),
        sell_price: Number(product.sell_price ?? 0),
        stock: calculatedStock,
        has_variants: !!product.has_variants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)

    if (productError) {
      console.error('PRODUCT UPDATE FAILED', productError)
      throw productError
    }

    /* ===============================
       VARIANTS: SAFE UPSERT + CLEANUP
       =============================== */
    if (product.has_variants) {
      const variantsPayload = (product.variants ?? []).map((v: any) => ({
        id: v.id ?? undefined, // IMPORTANT for upsert
        product_id: product.id,
        name: v.name,
        sku: v.sku ?? null,
        stock: Number(v.stock || 0),
        price_modifier: Number(v.price_modifier || 0),
      }))

      if (variantsPayload.length > 0) {
        const { error: upsertError } = await supabase
          .from('variants')
          .upsert(variantsPayload, { onConflict: 'id' })

        if (upsertError) {
          console.error('VARIANT UPSERT FAILED', upsertError)
          throw upsertError
        }
      }

      // Remove deleted variants
      const keptIds = variantsPayload
        .map(v => v.id)
        .filter(Boolean)

      if (keptIds.length > 0) {
        await supabase
          .from('variants')
          .delete()
          .eq('product_id', product.id)
          .not('id', 'in', `(${keptIds.join(',')})`)
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
