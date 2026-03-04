import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CartItem, Product } from '@/types';
import { getCart, addToCart as addToCartLib, removeFromCart as removeFromCartLib, updateCartQuantity as updateQtyLib, clearCart as clearCartLib, getCartSubtotal } from '@/lib/cart';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(getCart);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems(addToCartLib(product, qty));
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(removeFromCartLib(productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems(updateQtyLib(productId, qty));
  }, []);

  const clear = useCallback(() => {
    setItems(clearCartLib());
  }, []);

  const subtotal = getCartSubtotal(items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
};
