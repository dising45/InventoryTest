import { Product } from '../../types';

const STORAGE_KEY = 'inventory_pro_data';

// Helper to generate UUIDs
const generateId = () => {
  return crypto.randomUUID();
};

// Initial dummy data
const initialData: Product[] = [
  {
    id: generateId(),
    name: 'Classic White T-Shirt',
    description: '100% Cotton basic tee',
    buy_price: 5.00,
    sell_price: 15.00,
    stock: 50,
    has_variants: true,
    variants: [
      { id: generateId(), name: 'S', sku: 'TS-WHT-S', stock: 10, price_modifier: 0 },
      { id: generateId(), name: 'M', sku: 'TS-WHT-M', stock: 25, price_modifier: 0 },
      { id: generateId(), name: 'L', sku: 'TS-WHT-L', stock: 15, price_modifier: 0 },
    ],
    updated_at: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Denim Jeans',
    description: 'Slim fit blue jeans',
    buy_price: 20.00,
    sell_price: 45.00,
    stock: 12,
    has_variants: false,
    variants: [],
    updated_at: new Date().toISOString(),
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  private getStoredData(): Product[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
  }

  private setStoredData(data: Product[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getProducts(): Promise<Product[]> {
    await delay(300); // Simulate network
    return this.getStoredData();
  }

  async getProductById(id: string): Promise<Product | undefined> {
    await delay(200);
    const products = this.getStoredData();
    return products.find(p => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id' | 'updated_at'>): Promise<Product> {
    await delay(400);
    const products = this.getStoredData();
    
    // Calculate total stock if variants exist
    let calculatedStock = product.stock;
    if (product.has_variants && product.variants.length > 0) {
      calculatedStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    }

    const newProduct: Product = {
      ...product,
      id: generateId(),
      stock: calculatedStock,
      updated_at: new Date().toISOString(),
    };

    this.setStoredData([newProduct, ...products]);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(400);
    const products = this.getStoredData();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");

    const existing = products[index];
    const updatedProduct = { ...existing, ...updates, updated_at: new Date().toISOString() };
    
    // Recalculate stock if variants changed
    if (updatedProduct.has_variants && updatedProduct.variants) {
      updatedProduct.stock = updatedProduct.variants.reduce((acc, v) => acc + v.stock, 0);
    }

    products[index] = updatedProduct;
    this.setStoredData(products);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const products = this.getStoredData();
    const filtered = products.filter(p => p.id !== id);
    this.setStoredData(filtered);
  }
}

export const inventoryService = new InventoryService();
