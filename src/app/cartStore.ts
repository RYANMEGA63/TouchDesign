// ── Cart Store ────────────────────────────────────────────────────
// Panier global partagé entre Header, Catalogue et CheckoutDialog.
// Persisté en sessionStorage (disparaît à la fermeture du navigateur).

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, createElement } from "react";

export interface CartItem {
  id: string;          // unique item id (productId + color + size)
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
  // Pour les articles sur mesure uniquement
  customDetails?: {
    placement: string;
    notes?: string;
    customerName?: string;
    phone?: string;
    address?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const SESSION_KEY = "flocage_cart";

function loadCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]): void {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => { saveCart(items); }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}_${item.color}_${item.size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => { setItems([]); }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return createElement(CartContext.Provider, {
    value: { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }
  }, children);
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
