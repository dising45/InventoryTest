export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock_quantity: number; // For products without variants
  has_variants: boolean;
  supplier_id?: string;
  created_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_adjustment: number;
  stock_quantity: number;
  created_at: string;
}

// Derived type for UI convenience
export interface ProductWithVariants extends Product {
  variants?: Variant[];
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface SalesOrder {
  id: string;
  customer_id: string;
  status: SaleStatus;
  total_amount: number;
  sale_date: string;
  created_at: string;
  customer?: Customer; // Joined
}

export interface SalesItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string; // Joined or derived
  variant_name?: string; // Joined or derived
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  supplier_id?: string;
  created_at: string;
  supplier?: Supplier; // Joined
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  lowStockCount: number;
  totalOrders: number;
}
