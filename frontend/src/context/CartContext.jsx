import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'assetforge_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (bundle) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === bundle.id)) return prev;
      return [...prev, {
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        price: Number(bundle.price),
        thumbnail: bundle.thumbnail_url,
        asset_count: bundle.asset_count,
      }];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
