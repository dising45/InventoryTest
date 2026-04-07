import { useState, useEffect, useCallback } from 'react'
import { Product } from '../types'
import { inventoryService } from '../services/inventoryService.supabase'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await inventoryService.getProducts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveProduct = async (data: Omit<Product, 'id' | 'created_at'> & { id?: string }) => {
    if (data.id) {
      await inventoryService.updateProduct(data as Product)
    } else {
      await inventoryService.addProduct(data)
    }
    await load()
  }

  const deleteProduct = async (id: string) => {
    await inventoryService.deleteProduct(id)
    await load()
  }

  return { products, loading, reload: load, saveProduct, deleteProduct }
}