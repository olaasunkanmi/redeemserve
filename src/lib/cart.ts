import { useEffect, useState, useCallback } from "react";

export type CartItem = { name: string; unit_price_naira: number; quantity: number };
export type Cart = { vendor_id: string; vendor_name: string; items: CartItem[] };

const KEY = "rs.cart.v1";

function read(): Cart | null {
  if (typeof window === "undefined") return null;
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function write(c: Cart | null) {
  if (typeof window === "undefined") return;
  if (!c || !c.items.length) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent("rs:cart"));
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  useEffect(() => {
    setCart(read());
    const h = () => setCart(read());
    window.addEventListener("rs:cart", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("rs:cart", h); window.removeEventListener("storage", h); };
  }, []);
  const add = useCallback((vendor_id: string, vendor_name: string, item: CartItem) => {
    const cur = read();
    if (cur && cur.vendor_id !== vendor_id) {
      if (!confirm(`Your cart has items from ${cur.vendor_name}. Clear it and add from ${vendor_name}?`)) return;
    }
    const base: Cart = cur && cur.vendor_id === vendor_id ? cur : { vendor_id, vendor_name, items: [] };
    const ex = base.items.find((i) => i.name === item.name);
    if (ex) ex.quantity += item.quantity; else base.items.push(item);
    write(base);
  }, []);
  const setQty = useCallback((name: string, qty: number) => {
    const cur = read(); if (!cur) return;
    cur.items = cur.items.map((i) => i.name === name ? { ...i, quantity: qty } : i).filter((i) => i.quantity > 0);
    write(cur.items.length ? cur : null);
  }, []);
  const clear = useCallback(() => write(null), []);
  const total = cart?.items.reduce((s, i) => s + i.unit_price_naira * i.quantity, 0) ?? 0;
  const count = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  return { cart, add, setQty, clear, total, count };
}
