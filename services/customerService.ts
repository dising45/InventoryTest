import { Customer } from '../types';

const STORAGE_KEY = 'inventory_pro_customers';

// Helper to generate UUIDs
const generateId = () => {
  return crypto.randomUUID();
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class CustomerService {
  private getStoredData(): Customer[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  }

  private setStoredData(data: Customer[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getCustomers(): Promise<Customer[]> {
    await delay(300);
    return this.getStoredData();
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    await delay(200);
    const customers = this.getStoredData();
    return customers.find(c => c.id === id);
  }

  async addCustomer(customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    await delay(400);
    const customers = this.getStoredData();
    
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    this.setStoredData([newCustomer, ...customers]);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    await delay(400);
    const customers = this.getStoredData();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Customer not found");

    const existing = customers[index];
    const updatedCustomer = { ...existing, ...updates };
    
    customers[index] = updatedCustomer;
    this.setStoredData(customers);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await delay(300);
    const customers = this.getStoredData();
    const filtered = customers.filter(c => c.id !== id);
    this.setStoredData(filtered);
  }
}

export const customerService = new CustomerService();
