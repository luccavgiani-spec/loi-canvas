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
const SUPABASE_STORAGE_URL =
  'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos';

const IMAGE_SUFFIXES = [
  '_principal.JPG',
  '_imagem.JPG',
  '_imagem_2.JPG',
  '_ultima.JPG',
  '_principal.jpg',
  '_imagem.jpg',
  '_ultima.jpg',
];

function buildImageUrls(assetFolder: string | null | undefined): string[] {
  if (!assetFolder || typeof assetFolder !== 'string') return [];
  return IMAGE_SUFFIXES.map(
    (suffix) => `${SUPABASE_STORAGE_URL}/${assetFolder}${suffix}`,
  );
}

/** Map Supabase row to Product type */
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    collection_id: row.collection_id,
    collection: row.collections?.name ?? '',
    collection_slug: row.collections?.slug ?? '',
    slug: row.slug,
    name: row.name,
    sku: row.sku ?? '',
    price: Number(row.price),
    weight_g: row.weight_g ?? null,
    burn_hours: row.burn_hours ?? null,
    accord: row.accord ?? '',
    description: row.description ?? '',
    suggested_use: row.suggested_use ?? '',
    composition: row.composition ?? '',
    notes: row.notes ?? '',
    ritual: row.ritual ?? '',
    is_bestseller: row.is_bestseller ?? false,
    images: buildImageUrls(row.asset_folder),
    tags: [],
    rating_avg: 0,
    rating_count: 0,
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
    console.log('[LOIÊ] products fetched:', data?.length, data?.[0]);
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

// Products by collection slug (single query, no race condition)
export const getProductsByCollectionSlug = async (collectionSlug: string): Promise<{ products: Product[]; collection: Collection | null }> => {
  try {
    // Get collection by slug
    const { data: colRow, error: colError } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', collectionSlug)
      .single();
    if (colError || !colRow) {
      console.log('[LOIÊ] collection query:', collectionSlug, 0, colError);
      return { products: [], collection: null };
    }

    // Get products for that collection
    const { data, error } = await supabase
      .from('products')
      .select('*, collections(name, slug)')
      .eq('collection_id', colRow.id)
      .order('created_at', { ascending: false });

    console.log('[LOIÊ] collection query:', collectionSlug, data?.length, error);
    if (error) throw error;

    const collection: Collection = {
      id: colRow.id,
      slug: colRow.slug,
      name: colRow.name,
      description: colRow.description || undefined,
      cover_image: colRow.cover_image || undefined,
      numeral: colRow.numeral || undefined,
      detail: colRow.detail || undefined,
      story: colRow.story || undefined,
      price_label: colRow.price_label || undefined,
      is_active: colRow.is_active,
      sort_order: colRow.sort_order,
      created_at: colRow.created_at,
    };

    return { products: (data || []).map(mapDbProduct), collection };
  } catch (err) {
    console.warn('[getProductsByCollectionSlug] failed:', err);
    return { products: [], collection: null };
  }
};

// Collections (query Supabase directly, mock fallback)
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await (supabase
      .from('collections')
      .select('*') as any)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No collections returned from Supabase');
    return (data as any[]).map((row: any) => ({
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
export const getReviews = async (productId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      product_id: row.product_id ?? '',
      author_name: row.author_name,
      rating: row.rating,
      title: row.title ?? null,
      body: row.body ?? null,
      photo_url: row.photo_url ?? null,
      approved: row.approved ?? null,
      created_at: row.created_at ?? null,
    }));
  } catch (err) {
    console.warn('[getReviews] Supabase query failed, using mock fallback:', err);
    return mockReviews.filter((r) => r.product_id === productId);
  }
};

export const submitReview = async (input: {
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  photo_url?: string | null;
}): Promise<void> => {
  const { error } = await supabase.from('reviews').insert({
    product_id: input.product_id,
    author_name: input.author_name,
    rating: input.rating,
    body: input.body,
    photo_url: input.photo_url ?? null,
    approved: false,
  });
  if (error) throw error;
};

export const uploadReviewPhoto = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('review-photos').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return supabase.storage.from('review-photos').getPublicUrl(fileName).data.publicUrl;
};

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

// Order by ID (for confirmation page)
export const getOrderById = async (orderId: string) => {
  // Fetch order + items (no FK from order_items.product_id → products)
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  if (error) throw error;

  // Enrich items with product data
  const items = order.order_items || [];
  const productIds = [...new Set(items.map((i: any) => i.product_id).filter(Boolean))];

  let productsMap: Record<string, any> = {};
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, asset_folder, slug, collection_id, collections(name, slug)')
      .in('id', productIds);
    if (products) {
      productsMap = Object.fromEntries(products.map((p: any) => [p.id, p]));
    }
  }

  return {
    ...order,
    order_items: items.map((item: any) => ({
      ...item,
      product: productsMap[item.product_id] || null,
    })),
  };
};

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

// Email — ship order and send tracking email
export const shipOrder = (orderId: string, trackingCode: string): Promise<{ ok: boolean }> =>
  callEdgeFunction('ship-order', { order_id: orderId, tracking_code: trackingCode });

// Email — send campaign to a single recipient
export const sendCampaignEmail = (subject: string, content: string, recipientEmail: string): Promise<{ ok: boolean }> =>
  callEdgeFunction('send-email', {
    type: 'campaign',
    payload: { subject, html_content: content, recipient_email: recipientEmail },
  });

// Admin — get newsletter subscriber emails
export const getAdminNewsletterEmails = async (): Promise<string[]> => {
  const { data, error } = await supabase.from('newsletter').select('email');
  if (error) throw error;
  return (data ?? []).map((row: { email: string }) => row.email);
};
