// Shared app-wide constants.

// A product/variant at or below this unit count is considered "low stock".
// Single source of truth — imported by the dashboard, inventory list, the
// dashboard KPI service, and the variant sheet so every surface agrees.
export const LOW_STOCK_THRESHOLD = 10
