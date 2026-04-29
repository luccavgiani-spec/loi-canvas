// v2 - schema corrigido
import { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';
import type { Product, Review, ShippingQuote, Order, KPIs, SalesTimeseriesPoint, TopProduct, Customer, NewsletterSubscriber, Coupon, CouponValidation, CartItem, Collection, Collab } from '@/types';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { mockProducts, mockReviews, mockOrders, mockCustomers, mockKPIs, mockSalesTimeseries, mockTopProducts, mockNewsletterSubs, mockCoupons, mockCollections } from '@/lib/mocks';
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
    stock_quantity: row.stock_quantity ?? 0,
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
      .order('sort_order', { ascending: true })
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
    .order('bestseller_sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbProduct);
};

// Admin — atualiza bestseller_sort_order de N produtos em batch
// (usado pela sub-aba "Ordem dos Bestsellers" em ProductsTab).
export const updateBestsellerSortOrder = async (
  ordered: { id: string; bestseller_sort_order: number }[],
): Promise<void> => {
  const results = await Promise.all(
    ordered.map(({ id, bestseller_sort_order }) =>
      supabase.from('products').update({ bestseller_sort_order }).eq('id', id),
    ),
  );
  const firstError = results.find(r => r.error)?.error;
  if (firstError) throw firstError;
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

// Admin — reviews. RLS gated por admin_users (já existente).
export type AdminReview = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  author_name: string;
  rating: number;
  body: string | null;
  photo_url: string | null;
  approved: boolean | null;
  created_at: string | null;
};

export const getAdminReviews = async (filter: 'pending' | 'approved'): Promise<AdminReview[]> => {
  const wantApproved = filter === 'approved';
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name)')
    .eq('approved', wantApproved)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.products?.name ?? null,
    author_name: row.author_name,
    rating: row.rating,
    body: row.body,
    photo_url: row.photo_url,
    approved: row.approved,
    created_at: row.created_at,
  }));
};

export const approveAdminReview = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);
  if (error) throw error;
};

export const unpublishAdminReview = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id);
  if (error) throw error;
};

// Reprovar = DELETE (schema atual não tem coluna is_rejected; manter pendente
// indefinidamente polui a fila de moderação). Decisão registrada com Lucca.
export const deleteAdminReview = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
};

// Admin cria avaliação fake — entra direto como aprovada (decisão de produto
// com Lucca/André). Permitido pela policy "admin updates reviews" + insert
// padrão (admin é authenticated; default da tabela é approved=true).
export const createAdminReview = async (input: {
  product_id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at?: string;
}): Promise<void> => {
  const payload: TablesInsert<'reviews'> = {
    product_id: input.product_id,
    author_name: input.author_name,
    rating: input.rating,
    body: input.body,
    approved: true,
  };
  if (input.created_at) payload.created_at = input.created_at;
  const { error } = await supabase.from('reviews').insert(payload);
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
export const createOrder = (data: {
  items: { product_id: string; quantity: number; price: number }[];
  customer: { name: string; email: string; phone: string };
  is_pickup?: boolean;
  coupon_code?: string;
}) =>
  callEdgeFunction<{ order_id: string; total: number; discount?: number }>('create-order', data);

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

// Public confirmation page payload (sem PII / sem product_id).
// Pesa numa edge function `get-order-public` para que orders/order_items
// possam ter RLS hardened sem quebrar /pedido-confirmado.
export type PublicOrderConfirmation = {
  id: string;
  status: string;
  total: number;
  shipping_cost: number;
  is_pickup: boolean;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
  pickup_address: string | null;
};

export const getPublicOrderConfirmation = async (
  orderId: string,
): Promise<PublicOrderConfirmation> => {
  const { data, error } = await supabase.functions.invoke<PublicOrderConfirmation>(
    'get-order-public',
    { body: { order_id: orderId } },
  );
  if (error) throw error;
  if (!data) throw new Error('Pedido não encontrado');
  return data;
};

// Order by ID (admin / fallback). Public confirmation page deve usar
// getPublicOrderConfirmation acima.
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
      .select('id, name, sku, price, slug, collection_id, collections(name, slug), product_images(filename, sort_order)')
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

// Admin — detalhe completo do pedido para o modal "Ver pedido".
// Retorna order + items enriquecidos com produto + capa (primeira imagem
// por sort_order). Funciona com a RLS de admin existente em orders/order_items.
export type AdminOrderDetail = {
  id: string;
  status: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  total: number;
  is_pickup: boolean;
  tracking_code: string | null;
  tracking_email_sent_at: string | null;
  mp_payment_id: string | null;
  created_at: string | null;
  items: {
    id: string;
    qty: number;
    unit_price: number;
    product_id: string | null;
    product_name: string;
    product_sku: string | null;
    product_slug: string | null;
    image_url: string | null;
  }[];
};

export const getAdminOrderDetail = async (orderId: string): Promise<AdminOrderDetail> => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  if (error) throw error;

  const items = (order as any).order_items || [];
  const productIds = [...new Set(items.map((i: any) => i.product_id).filter(Boolean))] as string[];

  let productsMap: Record<string, any> = {};
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, slug, product_images(filename, sort_order)')
      .in('id', productIds);
    if (products) {
      productsMap = Object.fromEntries(products.map((p: any) => [p.id, p]));
    }
  }

  return {
    id: order.id,
    status: order.status,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    subtotal: Number(order.subtotal),
    shipping_cost: order.shipping_cost !== null ? Number(order.shipping_cost) : null,
    discount: order.discount !== null ? Number(order.discount) : null,
    total: Number(order.total),
    is_pickup: order.is_pickup,
    tracking_code: order.tracking_code,
    tracking_email_sent_at: order.tracking_email_sent_at,
    mp_payment_id: order.mp_payment_id,
    created_at: order.created_at,
    items: items.map((it: any) => {
      const prod = productsMap[it.product_id];
      const cover = prod?.product_images?.length
        ? prod.product_images.slice().sort((a: any, b: any) => a.sort_order - b.sort_order)[0]
        : null;
      return {
        id: it.id,
        qty: it.qty,
        unit_price: Number(it.unit_price),
        product_id: it.product_id,
        product_name: prod?.name ?? '(produto removido)',
        product_sku: prod?.sku ?? null,
        product_slug: prod?.slug ?? null,
        image_url: cover ? productImagePublicUrl(cover.filename) : null,
      };
    }),
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

// Admin — produtos de uma coleção, ordenados por sort_order para o drag-and-drop
export const getAdminProductsByCollection = async (
  collectionId: string,
): Promise<AdminProductRow[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), collections(id, name, slug)')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProductRow[];
};

// Persiste a ordem dos produtos em uma coleção. Best-effort: cada update
// roda em paralelo; se algum falhar, o caller decide como reagir.
export const updateProductsSortOrder = async (
  ordered: { id: string; sort_order: number }[],
): Promise<void> => {
  const results = await Promise.all(
    ordered.map(({ id, sort_order }) =>
      supabase.from('products').update({ sort_order }).eq('id', id),
    ),
  );
  const firstError = results.find(r => r.error)?.error;
  if (firstError) throw firstError;
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

function mapDbCoupon(row: Tables<'coupons'>): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: (row.type as 'percent' | 'fixed'),
    value: Number(row.value),
    is_active: row.is_active ?? true,
    current_uses: row.current_uses ?? 0,
    max_uses: row.max_uses,
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    min_order_value: row.min_order_value !== null ? Number(row.min_order_value) : null,
    collection_id: row.collection_id,
    created_at: row.created_at ?? '',
  };
}

export const getAdminCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbCoupon);
};

export const updateOrderTracking = (order_id: string, tracking_code: string) =>
  supabase.from('orders').update({ tracking_code } as any).eq('id', order_id);

export const sendTrackingEmail = (order_id: string, tracking_code: string) =>
  callEdgeFunction<{ sent_at: string }>('send-tracking-email', { order_id, tracking_code });

export const sendCampaign = (subject: string, html_content: string) =>
  callEdgeFunction<{ count: number }>('send-campaign', { subject, html_content });

// Coupons — admin CRUD via Supabase (RLS-gated, admin_users only).
export const createAdminCoupon = async (input: TablesInsert<'coupons'>): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return mapDbCoupon(data);
};

export const updateAdminCoupon = async (
  id: string,
  input: TablesUpdate<'coupons'>,
): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapDbCoupon(data);
};

export const deleteAdminCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) throw error;
};

// Public — valida cupom digitado pelo cliente no checkout.
// Lê via anon key; RLS já filtra cupons inativos / fora de janela.
// Para cupom restrito a coleção, desconto incide só sobre subtotal dos
// itens elegíveis (regra C definida com Lucca).
export const validateCoupon = async (
  code: string,
  cartItems: CartItem[],
  subtotal: number,
): Promise<CouponValidation> => {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, reason: 'Código vazio' };

  const { data, error } = await supabase
    .from('coupons')
    .select('*, collections(name)')
    .eq('code', trimmed)
    .maybeSingle();

  if (error) return { valid: false, reason: 'Erro ao validar cupom' };
  if (!data) return { valid: false, reason: 'Cupom inválido ou expirado' };

  const coupon = mapDbCoupon(data);
  const collectionName = (data as { collections?: { name: string } | null }).collections?.name;

  if (coupon.min_order_value !== null && subtotal < coupon.min_order_value) {
    return {
      valid: false,
      reason: `Pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)} para usar este cupom`,
    };
  }

  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, reason: 'Cupom esgotado' };
  }

  // Base sobre a qual o desconto incide. Se cupom for restrito a coleção,
  // soma apenas itens daquela coleção.
  let eligibleBase = subtotal;
  if (coupon.collection_id) {
    eligibleBase = cartItems.reduce((sum, item) => {
      if (item.product.collection_id === coupon.collection_id) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);
    if (eligibleBase <= 0) {
      return {
        valid: false,
        reason: collectionName
          ? `Cupom válido apenas para a coleção ${collectionName}`
          : 'Cupom válido apenas para uma coleção específica',
      };
    }
  }

  const discount = coupon.type === 'percent'
    ? Math.min(eligibleBase, eligibleBase * (coupon.value / 100))
    : Math.min(eligibleBase, coupon.value);

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    coupon,
  };
};

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
function mapDbCollab(row: Tables<'collabs'>): Collab {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    caption: row.caption ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    year: row.year ?? undefined,
    images: row.images ?? [],
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
  };
}

function collabToDbInsert(data: Partial<Collab>): TablesInsert<'collabs'> {
  if (!data.slug) throw new Error('slug is required');
  if (!data.name) throw new Error('name is required');
  return {
    slug: data.slug,
    name: data.name,
    caption: data.caption ?? null,
    description: data.description ?? null,
    category: data.category ?? null,
    year: data.year ?? null,
    images: data.images ?? [],
    is_active: data.is_active ?? true,
    sort_order: data.sort_order ?? 0,
  };
}

function collabToDbUpdate(data: Partial<Collab>): TablesUpdate<'collabs'> {
  const out: TablesUpdate<'collabs'> = {};
  if (data.slug !== undefined) out.slug = data.slug;
  if (data.name !== undefined) out.name = data.name;
  if (data.caption !== undefined) out.caption = data.caption || null;
  if (data.description !== undefined) out.description = data.description || null;
  if (data.category !== undefined) out.category = data.category || null;
  if (data.year !== undefined) out.year = data.year || null;
  if (data.images !== undefined) out.images = data.images;
  if (data.is_active !== undefined) out.is_active = data.is_active;
  if (data.sort_order !== undefined) out.sort_order = data.sort_order;
  return out;
}

// Public — only active collabs, ordered by sort_order
export const getCollabs = async (): Promise<Collab[]> => {
  const { data, error } = await supabase
    .from('collabs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDbCollab);
};

// Admin — returns all collabs
export const getAdminCollabs = async (): Promise<Collab[]> => {
  const { data, error } = await supabase
    .from('collabs')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapDbCollab);
};

export const createAdminCollab = async (data: Partial<Collab>): Promise<Collab> => {
  const { data: row, error } = await supabase
    .from('collabs')
    .insert(collabToDbInsert(data))
    .select()
    .single();
  if (error) throw error;
  return mapDbCollab(row);
};

export const updateAdminCollab = async (id: string, data: Partial<Collab>): Promise<Collab> => {
  const { data: row, error } = await supabase
    .from('collabs')
    .update(collabToDbUpdate(data))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapDbCollab(row);
};

export const deleteAdminCollab = async (id: string): Promise<void> => {
  const { error } = await supabase.from('collabs').delete().eq('id', id);
  if (error) throw error;
};

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
