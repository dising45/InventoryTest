import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { USE_MOCK_DATA, MOCK_CUSTOMERS } from '../constants';

let mockCustomers: Customer[] = [...MOCK_CUSTOMERS];

export const getCustomers = async (): Promise<Customer[]> => {
  if (USE_MOCK_DATA) return mockCustomers;
  const { data, error } = await supabase.from('customers').select('*');
  if (error) throw error;
  return data || [];
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
  if (USE_MOCK_DATA) {
    const newC = { ...customer, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    mockCustomers.push(newC);
    return newC;
  }
  const { data, error } = await supabase.from('customers').insert(customer).select().single();
  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string) => {
  if (USE_MOCK_DATA) {
    mockCustomers = mockCustomers.filter(c => c.id !== id);
    return;
  }
  await supabase.from('customers').delete().eq('id', id);
};