import { API_BASE_URL } from '@/config';
import type { Product, Review, ShippingQuote, Order, KPIs, SalesTimeseriesPoint, TopProduct, Customer, NewsletterSubscriber, Coupon, Collection, Collab } from '@/types';
import { mockProducts, mockReviews, mockOrders, mockCustomers, mockKPIs, mockSalesTimeseries, mockTopProducts, mockNewsletterSubs, mockCoupons, mockCollections, mockCollabs } from '@/lib/mocks';

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

// Products
export const getProducts = (params?: { collection?: string; tag?: string; minPrice?: number; maxPrice?: number; sort?: string }) => {
  const query = new URLSearchParams();
  if (params?.collection) query.set('collection', params.collection);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.minPrice) query.set('minPrice', String(params.minPrice));
  if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
  if (params?.sort) query.set('sort', params.sort);
  const qs = query.toString();
  let fallback = mockProducts;
  if (params?.collection) fallback = fallback.filter(p => p.collection === params.collection);
  if (params?.tag) fallback = fallback.filter(p => p.tags.includes(params.tag!));
  return fetchApi<Product[]>(`/products${qs ? `?${qs}` : ''}`, undefined, fallback);
};

export const getProductBySlug = (slug: string) =>
  fetchApi<Product>(`/products/${slug}`, undefined, mockProducts.find(p => p.slug === slug) || mockProducts[0]);

export const getRelatedProducts = (id: string) =>
  fetchApi<Product[]>(`/products/${id}/related`, undefined, mockProducts.filter(p => p.id !== id).slice(0, 4));

// Reviews
export const getReviews = (productId: string) =>
  fetchApi<Review[]>(`/reviews?productId=${productId}`, undefined, mockReviews.filter(r => r.product_id === productId));

export const createReview = (data: { product_id: string; author: string; rating: number; title: string; body: string }) =>
  fetchApi<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) });

// Shipping
export const quoteShipping = (data: { items: { product_id: string; quantity: number }[] }) =>
  fetchApi<ShippingQuote>('/cart/quote-shipping', { method: 'POST', body: JSON.stringify(data) }, { shipping_cost: 19.9, free_shipping_threshold: 299, is_free: false });

// Orders
export const createOrder = (data: { items: { product_id: string; quantity: number; price: number }[]; customer: { name: string; email: string; phone: string } }) =>
  fetchApi<{ order_id: string }>('/orders/create', { method: 'POST', body: JSON.stringify(data) });

// Mercado Pago
export const createPaymentIntent = (data: { order_id: string; amount: number }) =>
  fetchApi<{ preference_id: string; init_point: string }>('/mp/create-intent', { method: 'POST', body: JSON.stringify(data) });

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

// Collections
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
