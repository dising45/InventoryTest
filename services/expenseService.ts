import { supabase } from '../lib/supabase';
import { Expense } from '../types';
import { USE_MOCK_DATA, MOCK_EXPENSES } from '../constants';

let mockExpenses = [...MOCK_EXPENSES];

export const getExpenses = async (): Promise<Expense[]> => {
  if (USE_MOCK_DATA) return mockExpenses;
  const { data, error } = await supabase.from('expenses').select(`*, supplier:suppliers(*)`);
  if (error) throw error;
  return data || [];
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
  if (USE_MOCK_DATA) {
    const newE = { ...expense, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    mockExpenses.push(newE);
    return newE;
  }
  const { data, error } = await supabase.from('expenses').insert(expense).select().single();
  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string) => {
  if (USE_MOCK_DATA) {
    mockExpenses = mockExpenses.filter(e => e.id !== id);
    return;
  }
  await supabase.from('expenses').delete().eq('id', id);
};
