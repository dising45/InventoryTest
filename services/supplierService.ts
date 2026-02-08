import { supabase } from '../lib/supabase';
import { Supplier } from '../types';
import { USE_MOCK_DATA, MOCK_SUPPLIERS } from '../constants';

let mockSuppliers: Supplier[] = [...MOCK_SUPPLIERS];

export const getSuppliers = async (): Promise<Supplier[]> => {
  if (USE_MOCK_DATA) return mockSuppliers;
  const { data, error } = await supabase.from('suppliers').select('*');
  if (error) throw error;
  return data || [];
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>) => {
  if (USE_MOCK_DATA) {
    const newS = { ...supplier, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    mockSuppliers.push(newS);
    return newS;
  }
  const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
  if (error) throw error;
  return data;
};

export const deleteSupplier = async (id: string) => {
  if (USE_MOCK_DATA) {
    mockSuppliers = mockSuppliers.filter(s => s.id !== id);
    return;
  }
  await supabase.from('suppliers').delete().eq('id', id);
};