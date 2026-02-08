import { supabase } from '../lib/supabase';
import { Product, ProductWithVariants, Variant } from '../types';
import { USE_MOCK_DATA, MOCK_PRODUCTS, MOCK_VARIANTS } from '../constants';

// In-memory mock store
let mockProducts: Product[] = [...MOCK_PRODUCTS];
let mockVariants: Variant[] = [...MOCK_VARIANTS];

export const getProducts = async (): Promise<ProductWithVariants[]> => {
  if (USE_MOCK_DATA) {
    return mockProducts.map(p => {
      const variants = mockVariants.filter(v => v.product_id === p.id);
      return { ...p, variants };
    });
  }

  const { data: products, error: pError } = await supabase.from('products').select('*');
  if (pError) throw pError;

  const { data: variants, error: vError } = await supabase.from('variants').select('*');
  if (vError) throw vError;

  return (products || []).map((p: Product) => ({
    ...p,
    variants: (variants || []).filter((v: Variant) => v.product_id === p.id)
  }));
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>, variants: Omit<Variant, 'id' | 'created_at' | 'product_id'>[]) => {
  if (USE_MOCK_DATA) {
    const newProduct = { ...product, id: crypto.randomUUID(), created_at: new Date().toISOString() } as Product;
    mockProducts.push(newProduct);
    
    if (product.has_variants && variants.length > 0) {
      const newVariants = variants.map(v => ({
        ...v,
        id: crypto.randomUUID(),
        product_id: newProduct.id,
        created_at: new Date().toISOString()
      } as Variant));
      mockVariants.push(...newVariants);
    }
    return newProduct;
  }

  // 1. Insert Product
  const { data: pData, error: pError } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  
  if (pError) throw pError;
  const newProduct = pData as Product;

  // 2. Insert Variants if any
  if (product.has_variants && variants.length > 0) {
    const variantsToInsert = variants.map(v => ({ ...v, product_id: newProduct.id }));
    const { error: vError } = await supabase.from('variants').insert(variantsToInsert);
    if (vError) throw vError; // Note: In real app, consider rollback or transaction
  }

  return newProduct;
};

export const updateProduct = async (
  productId: string, 
  updates: Partial<Product>, 
  variantUpdates: { created: any[], updated: any[], deletedIds: string[] }
) => {
  if (USE_MOCK_DATA) {
    // Mock Update Logic
    const idx = mockProducts.findIndex(p => p.id === productId);
    if (idx > -1) mockProducts[idx] = { ...mockProducts[idx], ...updates };

    // Handle Variants
    variantUpdates.created.forEach(v => {
      mockVariants.push({ ...v, id: crypto.randomUUID(), product_id: productId, created_at: new Date().toISOString() });
    });
    variantUpdates.updated.forEach(v => {
      const vIdx = mockVariants.findIndex(mv => mv.id === v.id);
      if (vIdx > -1) mockVariants[vIdx] = { ...mockVariants[vIdx], ...v };
    });
    mockVariants = mockVariants.filter(v => !variantUpdates.deletedIds.includes(v.id));
    return;
  }

  // 1. Update Product
  const { error: pError } = await supabase.from('products').update(updates).eq('id', productId);
  if (pError) throw pError;

  // 2. Handle Variants (Create, Update, Delete)
  // This logic must be explicit to avoid "duplicate variant" bugs
  if (variantUpdates.created.length > 0) {
    const toInsert = variantUpdates.created.map(v => ({ ...v, product_id: productId }));
    await supabase.from('variants').insert(toInsert);
  }
  
  for (const v of variantUpdates.updated) {
    const { id, ...rest } = v;
    await supabase.from('variants').update(rest).eq('id', id);
  }

  if (variantUpdates.deletedIds.length > 0) {
    await supabase.from('variants').delete().in('id', variantUpdates.deletedIds);
  }
};

export const deleteProduct = async (id: string) => {
  if (USE_MOCK_DATA) {
    mockProducts = mockProducts.filter(p => p.id !== id);
    mockVariants = mockVariants.filter(v => v.product_id !== id);
    return;
  }
  // ON DELETE CASCADE in SQL handles variants
  await supabase.from('products').delete().eq('id', id);
};