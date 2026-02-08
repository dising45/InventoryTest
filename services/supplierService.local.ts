import { Supplier } from '../types';

const STORAGE_KEY = 'inventory_pro_suppliers';

// Helper to generate UUIDs
const generateId = () => {
  return crypto.randomUUID();
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SupplierService {
  private getStoredData(): Supplier[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  }

  private setStoredData(data: Supplier[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getSuppliers(): Promise<Supplier[]> {
    await delay(300);
    return this.getStoredData();
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    await delay(200);
    const suppliers = this.getStoredData();
    return suppliers.find(s => s.id === id);
  }

  async addSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    await delay(400);
    const suppliers = this.getStoredData();
    
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    this.setStoredData([newSupplier, ...suppliers]);
    return newSupplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    await delay(400);
    const suppliers = this.getStoredData();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Supplier not found");

    const existing = suppliers[index];
    const updatedSupplier = { ...existing, ...updates };
    
    suppliers[index] = updatedSupplier;
    this.setStoredData(suppliers);
    return updatedSupplier;
  }

  async deleteSupplier(id: string): Promise<void> {
    await delay(300);
    const suppliers = this.getStoredData();
    const filtered = suppliers.filter(s => s.id !== id);
    this.setStoredData(filtered);
  }
}

export const supplierService = new SupplierService();
