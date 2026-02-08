import { supabase } from './supabaseClient'
import { Customer } from '../types'

class CustomerServiceSupabase {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET CUSTOMERS ERROR', error)
      throw error
    }

    return data as Customer[]
  }

  async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()

    if (error) {
      console.error('ADD CUSTOMER ERROR', error)
      throw error
    }

    return data as Customer
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE CUSTOMER ERROR', error)
      throw error
    }
  }
}

export const customerService = new CustomerServiceSupabase()
