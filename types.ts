export interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price_modifier?: number; // Added to base sell_price
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  buy_price: number;
  sell_price: number;
  stock: number; // Total stock if variants exist, or direct stock
  has_variants: boolean;
  variants: Variant[];
  updated_at: string;
}

export type ViewState = 'dashboard' | 'inventory' | 'add-product' | 'edit-product';

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}
