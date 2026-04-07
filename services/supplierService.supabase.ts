import { supabase } from './supabaseClient'
import { Supplier } from '../types'

class SupplierServiceSupabase {
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET SUPPLIERS ERROR', error)
      throw error
    }

    return data as Supplier[]
  }

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single()

    if (error) {
      console.error('ADD SUPPLIER ERROR', error)
      throw error
    }

    return data as Supplier
  }

  async updateSupplier(id: string, supplier: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE SUPPLIER ERROR', error)
      throw error
    }

    return data as Supplier
  }

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE SUPPLIER ERROR', error)
      throw error
    }
  }
}
// Test Commit form Dev to Main - Test change

export const supplierService = new SupplierServiceSupabase()
