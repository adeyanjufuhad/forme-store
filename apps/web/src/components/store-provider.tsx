"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BagItem, Currency, Product } from "@/lib/types";

type Store = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  items: BagItem[];
  ready: boolean;
  add: (product: Product, size: string) => void;
  update: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [items, setItems] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("forme-currency");
      if (savedCurrency === "NGN" || savedCurrency === "USD")
        setCurrency(savedCurrency);
      const saved = JSON.parse(localStorage.getItem("forme-bag") || "[]");
      if (Array.isArray(saved))
        setItems(
          saved
            .filter(
              (item): item is BagItem =>
                item &&
                typeof item.productId === "string" &&
                typeof item.size === "string" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0 &&
                item.quantity <= 10,
            )
            .slice(0, 30),
        );
    } catch {
      /* A blocked or full storage device must not prevent shopping. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("forme-bag", JSON.stringify(items));
      localStorage.setItem("forme-currency", currency);
    } catch {
      /* The current session still works. */
    }
  }, [items, currency, ready]);
  const add = (product: Product, size: string) =>
    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && item.size === size,
      );
      if (existing)
        return current.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, 10, product.stock),
              }
            : item,
        );
      return [...current, { productId: product.id, size, quantity: 1 }];
    });
  const update = (productId: string, size: string, quantity: number) =>
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: Math.min(10, Math.max(0, quantity)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  return (
    <Context.Provider
      value={{
        currency,
        setCurrency,
        items,
        ready,
        add,
        update,
        clear: () => setItems([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("Store provider missing");
  return store;
}
