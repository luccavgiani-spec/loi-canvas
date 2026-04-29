// v2 - schema corrigido
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';
import type { Product, Review, ShippingQuote, Order, KPIs, SalesTimeseriesPoint, TopProduct, Customer, NewsletterSubscriber, Coupon, Collection, Collab } from '@/types';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { mockProducts, mockReviews, mockOrders, mockCustomers, mockKPIs, mockSalesTimeseries, mockTopProducts, mockNewsletterSubs, mockCoupons, mockCollections, mockCollabs } from '@/lib/mocks';
import { supabase } from '@/integrations/supabase/client';

export type AdminProductRow = Tables<'products'> & {
  product_images: Tables<'product_images'>[];
  collections: Pick<Tables<'collections'>, 'id' | 'name' | 'slug'> | null;
};

export type AdminCollectionRow = Tables<'collections'>;

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

/** Build a public URL for a file in the "produtos" bucket */
const SUPABASE_STORAGE_URL =
  'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos';

function fileToUrl(filename: string): string {
  return `${SUPABASE_STORAGE_URL}/${encodeURIComponent(filename)}`;
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
    details: row.details ?? '',
    suggested_use: row.suggested_use ?? '',
    composition: row.composition ?? '',
    notes: row.notes ?? '',
    ritual: row.ritual ?? '',
    is_bestseller: row.is_bestseller ?? false,
    images: (row.product_images as { filename: string; sort_order: number }[] | null | undefined ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => fileToUrl(img.filename)),
    tags: [],
    rating_avg: 0,
    rating_count: 0,
    created_at: row.created_at || '',
  };
}

// Products (query Supabase directly, mock fallback)
export const getProducts = async (params?: { collection?: string; tag?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<Product[]> => {
  try {
    let query = supabase.from('products').select('*, collections(name, slug), product_images(filename, sort_order)');

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
      .select('*, collections(name, slug), product_images(filename, sort_order)')
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
      .select('*, collections(name, slug), product_images(filename, sort_order)')
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
      .select('*, collections(name, slug), product_images(filename, sort_order)')
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

// Bestsellers — products flagged is_bestseller=true and visible=true.
// Errors propagate so the section can decide to silently hide.
export const getBestsellerProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, collections(name, slug), product_images(filename, sort_order)')
    .eq('is_bestseller', true)
    .eq('visible', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbProduct);
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

export const getAdminOrders = async (params?: { status?: string }): Promise<Order[]> => {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (params?.status) query = query.eq('status', params.status);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      status: row.status,
      customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone || '' },
      items: [],
      subtotal: Number(row.subtotal),
      shipping_cost: Number(row.shipping_cost ?? 0),
      total: Number(row.total),
      created_at: row.created_at,
      tracking_code: row.tracking_code ?? undefined,
      tracking_email_sent_at: row.tracking_email_sent_at ?? undefined,
    }));
  } catch (err) {
    console.warn('[getAdminOrders] Supabase query failed, using mock fallback:', err);
    return mockOrders;
  }
};

export const getAdminCustomers = async (): Promise<Customer[]> => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const { data: orderStats } = await supabase
      .from('orders')
      .select('customer_email, total')
      .neq('status', 'cancelled');
    const statsMap: Record<string, { count: number; total: number }> = {};
    for (const o of orderStats || []) {
      if (!statsMap[o.customer_email]) statsMap[o.customer_email] = { count: 0, total: 0 };
      statsMap[o.customer_email].count += 1;
      statsMap[o.customer_email].total += Number(o.total);
    }
    return (customers || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      orders_count: statsMap[c.email]?.count ?? 0,
      total_spent: statsMap[c.email]?.total ?? 0,
      created_at: c.created_at,
    }));
  } catch (err) {
    console.warn('[getAdminCustomers] Supabase query failed, using mock fallback:', err);
    return mockCustomers;
  }
};

export const getAdminProducts = async (): Promise<AdminProductRow[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), collections(id, name, slug)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProductRow[];
};

export const createAdminProduct = async (
  input: TablesInsert<'products'>,
): Promise<Tables<'products'>> => {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAdminProduct = async (
  id: string,
  input: TablesUpdate<'products'>,
): Promise<Tables<'products'>> => {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

const PRODUCT_IMAGE_BUCKET = 'produtos';
// Public URL for files in the produtos bucket (matches mapDbProduct/fileToUrl).
export const productImagePublicUrl = (filename: string): string =>
  `${SUPABASE_STORAGE_URL}/${encodeURIComponent(filename)}`;

export const uploadProductImage = async (
  productId: string,
  file: File,
): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const filename = `${productId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return filename;
};

export const insertProductImage = async (
  product_id: string,
  filename: string,
  sort_order: number,
): Promise<Tables<'product_images'>> => {
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id, filename, sort_order })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProductImage = async (
  imageId: string,
  filename: string,
): Promise<void> => {
  const { error: storageErr } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([filename]);
  if (storageErr) throw storageErr;
  const { error: dbErr } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);
  if (dbErr) throw dbErr;
};

export const getAdminNewsletter = async (): Promise<NewsletterSubscriber[]> => {
  try {
    const { data, error } = await supabase
      .from('newsletter')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      coupon_code: row.coupon_code || '',
      subscribed_at: row.created_at,
    }));
  } catch (err) {
    console.warn('[getAdminNewsletter] Supabase query failed, using mock fallback:', err);
    return mockNewsletterSubs;
  }
};

export const getAdminCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      discount_percent: row.type === 'percent' ? Number(row.value) : 0,
      is_active: row.is_active ?? true,
      uses: 0,
      max_uses: undefined,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.warn('[getAdminCoupons] Supabase query failed, using mock fallback:', err);
    return mockCoupons;
  }
};

export const updateOrderTracking = (order_id: string, tracking_code: string) =>
  supabase.from('orders').update({ tracking_code } as any).eq('id', order_id);

export const sendTrackingEmail = (order_id: string, tracking_code: string) =>
  callEdgeFunction<{ sent_at: string }>('send-tracking-email', { order_id, tracking_code });

export const sendCampaign = (subject: string, html_content: string) =>
  callEdgeFunction<{ count: number }>('send-campaign', { subject, html_content });

// Coupons
export const createAdminCoupon = (data: Partial<Coupon>) =>
  fetchApi<Coupon>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) });

export const updateAdminCoupon = (id: string, data: Partial<Coupon>) =>
  fetchApi<Coupon>(`/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteAdminCoupon = (id: string) =>
  fetchApi<void>(`/admin/coupons/${id}`, { method: 'DELETE' });

// Collections Admin — Supabase direct (admin sees all, including is_active=false)
export const getAdminCollections = async (): Promise<AdminCollectionRow[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const createAdminCollection = async (
  input: TablesInsert<'collections'>,
): Promise<AdminCollectionRow> => {
  const { data, error } = await supabase
    .from('collections')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAdminCollection = async (
  id: string,
  input: TablesUpdate<'collections'>,
): Promise<AdminCollectionRow> => {
  const { data, error } = await supabase
    .from('collections')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdminCollection = async (id: string): Promise<void> => {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) throw error;
};

// Collection cover_image lives in the same 'produtos' bucket under a 'collections/' prefix.
export const uploadCollectionCover = async (file: File): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const filename = `collections/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return productImagePublicUrl(filename);
};

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

// Admin — get internal messages (mensagens)
export const getAdminMensagens = async (): Promise<{ id: string; nome: string; assunto: string | null; mensagem: string; created_at: string }[]> => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};
