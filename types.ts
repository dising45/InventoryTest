export interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price_modifier?: number; // Added to base sell_price
  image_url?: string   // ✅ ADD THIS
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  cost_price: number;
  sell_price: number;
  stock: number; // Total stock if variants exist, or direct stock
  has_variants: boolean;
  variants: Variant[];
  updated_at: string;
  image_url?: string   // ✅ ADD THIS
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface SalesItem {
  id?: string;
  sales_order_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  cost_price?: number;
  line_total?: number;
  product_name?: string; // For display
  variant_name?: string; // For display
}

export interface SalesOrder {
  id: string;
  customer_id: string;
  subtotal?: number;
  total_amount: number;
  order_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items?: SalesItem[];
  customer?: Customer;
  discount?: number;
  discount_type?: 'flat' | 'percentage';
  tax?: number;
  tax_type?: 'flat' | 'percentage';
}

export type ViewState =
  | 'dashboard'
  | 'inventory' | 'add-product' | 'edit-product'
  | 'customers' | 'add-customer' | 'edit-customer'
  | 'suppliers' | 'add-supplier' | 'edit-supplier'
  | 'sales' | 'add-sale' | 'edit-sale'
  | 'expenses' | 'add-expense' | 'edit-expense'
  | 'purchase-orders' | 'add-po'
  | 'pl';

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}
export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier?: Supplier;
  po_number?: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id?: string;
  purchase_order_id?: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_cost: number;
  line_total?: number;
  product_name?: string;
  variant_name?: string;
}
export interface Expense {
  id: string
  expense_date: string
  category: string
  description?: string
  amount: number
  payment_mode?: string
  reference?: string
  vendor?: string
  created_at?: string
}
