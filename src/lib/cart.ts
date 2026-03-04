import type { CartItem, Product } from '@/types';

const CART_KEY = 'loie_cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const items = getCart();
  const existing = items.find(i => i.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }
  saveCart(items);
  return items;
}

export function removeFromCart(productId: string): CartItem[] {
  const items = getCart().filter(i => i.product.id !== productId);
  saveCart(items);
  return items;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  const items = getCart();
  const item = items.find(i => i.product.id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  saveCart(items);
  return items;
}

export function clearCart(): CartItem[] {
  saveCart([]);
  return [];
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}
