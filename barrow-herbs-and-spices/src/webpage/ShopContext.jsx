import { createContext, useContext, useEffect, useState } from 'react';
import usePublicBusiness from "../../../shared/public/usePublicBusiness.js";
const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);
export function ShopProvider({
  children
}) {
  const brand = usePublicBusiness('barrow-herbs-and-spices'),
    name = brand.business?.legalName || 'Herbs & Spices';
  const [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [cart, setCart] = useState(() => {
      try {
        const rows = JSON.parse(localStorage.getItem('herbs-spices:basket') || '[]');
        return Array.isArray(rows) ? rows.filter(row => typeof row.id === 'string' && Number.isInteger(row.quantity) && row.quantity > 0 && row.quantity <= 99) : [];
      } catch {
        return [];
      }
    }),
    [notice, setNotice] = useState('');
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public-site/products');
      if (!response.ok) throw Error('The shop is temporarily unavailable. Please try again.');
      setProducts(await response.json());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('herbs-spices:basket', JSON.stringify(cart));
    } catch {/* Basket remains usable for this visit. */}
  }, [cart]);
  const add = product => {
    setCart(rows => {
      const old = rows.find(row => row.id === product.id);
      return old ? rows.map(row => row.id === product.id ? {
        ...row,
        quantity: Math.min(row.quantity + 1, product.stock, 99)
      } : row) : [...rows, {
        id: product.id,
        quantity: 1
      }];
    });
    setNotice(`${product.name} added to your basket.`);
  };
  const count = cart.reduce((sum, row) => sum + row.quantity, 0);
  return <ShopContext.Provider value={{
    products,
    loading,
    error,
    cart,
    setCart,
    add,
    brand,
    name,
    load,
    count,
    notice
  }}>{children}</ShopContext.Provider>;
}
