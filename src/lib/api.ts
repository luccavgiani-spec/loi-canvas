// v2 - schema corrigido
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';
import type { Product, Review, ShippingQuote, Order, KPIs, SalesTimeseriesPoint, TopProduct, Customer, NewsletterSubscriber, Coupon, Collection, Collab } from '@/types';
import { mockProducts, mockReviews, mockOrders, mockCustomers, mockKPIs, mockSalesTimeseries, mockTopProducts, mockNewsletterSubs, mockCoupons, mockCollections, mockCollabs } from '@/lib/mocks';
import { supabase } from '@/integrations/supabase/client';

async function fetchApi<T>(path: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error(`Failed to fetch ${path}`);
  }
}

async function callEdgeFunction<T>(fnName: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Edge function error: ${res.status}` }));
    throw new Error(err.error || `Edge function ${fnName} failed`);
  }
  return res.json();
}

/** Build image URLs from asset_folder in Supabase Storage */
function buildImageUrls(assetFolder: string | null | undefined): string[] {
  if (!assetFolder) return [];
  const storageBase = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/produtos`;
  return [
    `${storageBase}/${assetFolder}/principal.JPG`,
    `${storageBase}/${assetFolder}/imagem_2.JPG`,
  ];
}

/** Map Supabase row to Product type */
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || '',
    details: row.suggested_use || undefined,
    price: Number(row.price),
    compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    images: buildImageUrls(row.asset_folder || row.slug),
    collection: row.collections?.name || row.collection || row.collection_id || '',
    tags: [],
    rating_avg: 0,
    rating_count: 0,
    is_bestseller: row.is_bestseller ?? false,
    created_at: row.created_at || '',
  };
}

// Products (query Supabase directly, mock fallback)
export const getProducts = async (params?: { collection?: string; tag?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<Product[]> => {
  try {
    let query = supabase.from('products').select('*, collections(name, slug)');

    if (params?.minPrice) query = query.gte('price', params.minPrice);
    if (params?.maxPrice) query = query.lte('price', params.maxPrice);

    const sortCol = params?.sort === 'price_asc' || params?.sort === 'price_desc' ? 'price' : 'created_at';
    const ascending = params?.sort === 'price_asc';
    query = query.order(sortCol, { ascending });

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No products returned from Supabase');

    let products = data.map(mapDbProduct);

    // Filter by collection name after fetch
    if (params?.collection) {
      products = products.filter(p => p.collection === params.collection);
    }

    return products;
  } catch (err) {
    console.warn('[getProducts] Supabase query failed, using mock fallback:', err);
    let fallback = mockProducts;
    if (params?.collection) fallback = fallback.filter(p => p.collection === params.collection);
    if (params?.tag) fallback = fallback.filter(p => p.tags.includes(params.tag!));
    return fallback;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, collections(name, slug)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return mapDbProduct(data);
  } catch (err) {
    console.warn(`[getProductBySlug] Supabase query failed for "${slug}", using mock fallback:`, err);
    return mockProducts.find(p => p.slug === slug) || mockProducts[0];
  }
};

export const getRelatedProducts = async (id: string): Promise<Product[]> => {
  try {
    const { data: current } = await supabase
      .from('products')
      .select('collection_id')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('products')
      .select('*, collections(name, slug)')
      .eq('collection_id', current?.collection_id || '')
      .neq('id', id)
      .limit(4);

    if (error) throw error;
    return (data || []).map(mapDbProduct);
  } catch {
    return mockProducts.filter(p => p.id !== id).slice(0, 4);
  }
};

// Collections (query Supabase directly, mock fallback)
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No collections returned from Supabase');
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || undefined,
      cover_image: row.cover_image || undefined,
      numeral: row.numeral || undefined,
      detail: row.detail || undefined,
      story: row.story || undefined,
      price_label: row.price_label || undefined,
      is_active: row.is_active,
      sort_order: row.sort_order,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.warn('[getCollections] Supabase query failed, using mock fallback:', err);
    return mockCollections;
  }
};

// Reviews
export const getReviews = (productId: string) =>
  fetchApi<Review[]>(`/reviews?productId=${productId}`, undefined, mockReviews.filter(r => r.product_id === productId));

export const createReview = (data: { product_id: string; author: string; rating: number; title: string; body: string }) =>
  fetchApi<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });

// Shipping
export const quoteShipping = (data: { items: { product_id: string; quantity: number }[] }) =>
  fetchApi<ShippingQuote>('/cart/quote-shipping', { method: 'POST', body: JSON.stringify(data) }, { shipping_cost: 19.9, free_shipping_threshold: 299, is_free: false });

// Orders (via Supabase Edge Function)
export const createOrder = (data: { items: { product_id: string; quantity: number; price: number }[]; customer: { name: string; email: string; phone: string } }) =>
  callEdgeFunction<{ order_id: string; total: number }>('create-order', data);

// Mercado Pago (via Supabase Edge Function)
export const createPaymentPreference = (data: { order_id: string }) =>
  callEdgeFunction<{ preference_id: string; init_point: string; sandbox_init_point: string }>('mp-create-preference', data);

export const processPayment = (data: {
  order_id: string;
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  transaction_amount: number;
  payer: { email: string; identification?: { type: string; number: string } };
}) =>
  callEdgeFunction<{
    status: string;
    mp_status: string;
    mp_status_detail: string;
    mp_payment_id: string;
  }>('mp-process-payment', data);

// Newsletter
export const subscribeNewsletter = (email: string) =>
  fetchApi<{ coupon_code: string }>('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }, { coupon_code: `LOIE15-${Math.random().toString(36).substring(2, 6).toUpperCase()}` });

// Admin
export const getAdminKPIs = (range?: string) =>
  fetchApi<KPIs>(`/admin/kpis${range ? `?range=${range}` : ''}`, undefined, mockKPIs);

export const getAdminSalesTimeseries = (range?: string) =>
  fetchApi<SalesTimeseriesPoint[]>(`/admin/sales-timeseries${range ? `?range=${range}` : ''}`, undefined, mockSalesTimeseries);

export const getAdminTopProducts = (range?: string) =>
  fetchApi<TopProduct[]>(`/admin/top-products${range ? `?range=${range}` : ''}`, undefined, mockTopProducts);

export const getAdminOrders = (params?: { status?: string; range?: string }) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.range) query.set('range', params.range);
  const qs = query.toString();
  return fetchApi<Order[]>(`/admin/orders${qs ? `?${qs}` : ''}`, undefined, mockOrders);
};

export const getAdminCustomers = (range?: string) =>
  fetchApi<Customer[]>(`/admin/customers${range ? `?range=${range}` : ''}`, undefined, mockCustomers);

export const createAdminProduct = (data: Partial<Product>) =>
  fetchApi<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminProduct = (id: string, data: Partial<Product>) =>
  fetchApi<Product>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminProduct = (id: string) =>
  fetchApi<void>(`/admin/products/${id}`, { method: 'DELETE' });

export const getAdminNewsletter = () =>
  fetchApi<NewsletterSubscriber[]>('/admin/newsletter', undefined, mockNewsletterSubs);

export const getAdminCoupons = () =>
  fetchApi<Coupon[]>('/admin/coupons', undefined, mockCoupons);

// Coupons
export const createAdminCoupon = (data: Partial<Coupon>) =>
  fetchApi<Coupon>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminCoupon = (id: string, data: Partial<Coupon>) =>
  fetchApi<Coupon>(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminCoupon = (id: string) =>
  fetchApi<void>(`/admin/coupons/${id}`, { method: 'DELETE' });

// Collections Admin
export const getAdminCollections = () =>
  fetchApi<Collection[]>('/admin/collections', undefined, mockCollections);

export const createAdminCollection = (data: Partial<Collection>) =>
  fetchApi<Collection>('/admin/collections', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminCollection = (id: string, data: Partial<Collection>) =>
  fetchApi<Collection>(`/admin/collections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminCollection = (id: string) =>
  fetchApi<void>(`/admin/collections/${id}`, { method: 'DELETE' });

// Collabs
export const getAdminCollabs = () =>
  fetchApi<Collab[]>('/admin/collabs', undefined, mockCollabs);

export const createAdminCollab = (data: Partial<Collab>) =>
  fetchApi<Collab>('/admin/collabs', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminCollab = (id: string, data: Partial<Collab>) =>
  fetchApi<Collab>(`/admin/collabs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminCollab = (id: string) =>
  fetchApi<void>(`/admin/collabs/${id}`, { method: 'DELETE' });
