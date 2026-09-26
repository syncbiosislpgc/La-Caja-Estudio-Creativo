"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProduct, type Product } from "@/data/products";

export type CartItem = {
  key: string;
  productSlug: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (input: {
    product: Product;
    variantId: string;
    quantity?: number;
  }) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, quantity: number) => void;
  clear: () => void;
  justAdded: boolean;
  clearJustAdded: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "la-caja-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    ({
      product,
      variantId,
      quantity = 1,
    }: {
      product: Product;
      variantId: string;
      quantity?: number;
    }) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant || variant.stock <= 0) return;
      const key = `${product.slug}:${variantId}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(i.quantity + quantity, variant.stock) }
              : i,
          );
        }
        return [
          ...prev,
          {
            key,
            productSlug: product.slug,
            variantId,
            name: product.name,
            price: product.price,
            image: product.images[0],
            size: variant.size,
            color: variant.color,
            quantity,
          },
        ];
      });
      setJustAdded(true);
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateQty = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const clearJustAdded = useCallback(() => setJustAdded(false), []);

  const count = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      clear,
      justAdded,
      clearJustAdded,
    }),
    [
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      clear,
      justAdded,
      clearJustAdded,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCartProduct(slug: string) {
  return getProduct(slug);
}
