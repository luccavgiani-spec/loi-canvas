export interface Product {
  id: string;
  collection_id?: string;
  collection_slug?: string;
  slug: string;
  name: string;
  sku?: string;
  description: string;
  details?: string;
  how_to_use?: string;
  care_instructions?: string;
  suggested_use?: string;
  composition?: string;
  notes?: string;
  ritual?: string;
  price: number;
  compare_at_price?: number;
  weight_g?: number | null;
  burn_hours?: number | null;
  accord?: string;
  images: string[];
  collection: string;
  tags: string[];
  badge?: 'sale' | 'new' | 'limited';
  rating_avg: number;
  rating_count: number;
  is_bestseller?: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Review {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

export interface Order {
  id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  tracking_code?: string;
  tracking_email_sent_at?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  orders_count?: number;
  total_spent?: number;
  created_at?: string;
}

export interface ShippingQuote {
  shipping_cost: number;
  free_shipping_threshold: number;
  is_free: boolean;
}

export interface KPIs {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  new_customers: number;
  conversion_rate: number;
}

export interface SalesTimeseriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  coupon_code: string;
  subscribed_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  uses: number;
  max_uses?: number;
  created_at: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover_image?: string;
  numeral?: string;
  detail?: string;
  story?: string;
  price_label?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Collab {
  id: string;
  slug: string;
  name: string;
  caption?: string;
  description?: string;
  images: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}
