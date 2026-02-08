// Toggle this to false if you connect real Supabase
export const USE_MOCK_DATA = true;

export const APP_NAME = "InventoryPro";
export const CURRENCY = "$";
export const LOW_STOCK_THRESHOLD = 5;

// Initial Mock Data (used if USE_MOCK_DATA is true)
export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', created_at: new Date().toISOString() },
  { id: 'c2', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0900', created_at: new Date().toISOString() },
];

export const MOCK_SUPPLIERS = [
  { id: 's1', name: 'Global Tech Supplies', contact_person: 'Alice Smith', email: 'alice@globaltech.com', created_at: new Date().toISOString() },
  { id: 's2', name: 'Fabrics Unlimited', contact_person: 'Bob Jones', email: 'bob@fabrics.com', created_at: new Date().toISOString() },
];

export const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Ergo Chair', sku: 'CHR-001', price: 250, stock_quantity: 10, has_variants: false, supplier_id: 's1', created_at: new Date().toISOString() },
  { id: 'p2', name: 'T-Shirt Basic', sku: 'TSH-001', price: 20, stock_quantity: 0, has_variants: true, supplier_id: 's2', created_at: new Date().toISOString() },
];

export const MOCK_VARIANTS = [
  { id: 'v1', product_id: 'p2', name: 'Size: S, Color: Black', sku: 'TSH-001-S-BLK', price_adjustment: 0, stock_quantity: 50, created_at: new Date().toISOString() },
  { id: 'v2', product_id: 'p2', name: 'Size: M, Color: Black', sku: 'TSH-001-M-BLK', price_adjustment: 2, stock_quantity: 30, created_at: new Date().toISOString() },
];

export const MOCK_EXPENSES = [
  { id: 'e1', description: 'Office Rent', amount: 1200, category: 'Rent', date: new Date().toISOString(), created_at: new Date().toISOString() },
];

export const MOCK_SALES_ORDERS = [];
export const MOCK_SALES_ITEMS = [];
