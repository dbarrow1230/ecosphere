import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from "../ShopContext.jsx";
import { money, uid } from "../../utils/api.js";
import { Availability } from "../Commerce.jsx";
export default function Basket() {
  const {
      cart,
      setCart,
      products,
      loading,
      error
    } = useShop(),
    [customer, setCustomer] = useState({
      name: '',
      email: '',
      phone: ''
    }),
    [notes, setNotes] = useState(''),
    [pending, setPending] = useState(false),
    [result, setResult] = useState(null),
    [requestId, setRequestId] = useState(uid());
  const rows = cart.map(item => ({
      ...item,
      product: products.find(row => row.id === item.id)
    })),
    valid = rows.every(row => row.product && row.quantity <= row.product.stock);
  const update = (id, quantity) => {
    setCart(items => items.map(row => row.id === id ? {
      ...row,
      quantity
    } : row).filter(row => row.quantity > 0));
    setRequestId(uid());
  };
  const submit = async event => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch('/api/public-site/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          customer,
          notes,
          items: cart.map(row => ({
            productId: row.id,
            quantity: row.quantity
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.message || 'Please try again.');
      setResult({
        ok: true,
        ...data
      });
      setCart([]);
      setRequestId(uid());
    } catch (e) {
      setResult({
        ok: false,
        message: e.message
      });
    } finally {
      setPending(false);
    }
  };
  return <section className="page"><p className="eyebrow">SOMETHING GOOD IS COOKING</p><h1>Your basket.</h1>{result && <div className="order-result" role={result.ok ? 'status' : 'alert'}>{result.reference && <h2>Request {result.reference}</h2>}<p>{result.message}</p></div>}<Availability>{cart.length ? <div className="checkout"><section>{rows.map(row => <article className="basket-row" key={row.id}><div><h2>{row.product?.name || 'Unavailable blend'}</h2><p>{row.product ? `${row.product.packGrams} g · ${money(row.product.price)}` : 'This product is no longer available. Please remove it.'}</p>{row.product && row.quantity > row.product.stock && <p role="alert">Only {row.product.stock} packs are currently available.</p>}</div><label>Quantity<input type="number" min={1} max={99} value={row.quantity} disabled={pending} onChange={e => update(row.id, Math.max(1, Math.min(99, Number(e.target.value) || 1)))} /></label><button disabled={pending} onClick={() => update(row.id, 0)} aria-label={`Remove ${row.product?.name || 'unavailable blend'}`}>Remove</button></article>)}<p className="subtotal">Items subtotal <strong>{money(rows.reduce((sum, row) => sum + (row.product?.price || 0) * row.quantity, 0))}</strong></p><p className="fine-print">Shipping, tax, and any other charges will be confirmed before payment.</p></section><form onSubmit={submit}><h2>Send your order request</h2>{[['name', 'Your name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone (optional)', 'tel']].map(([key, label, type]) => <label key={key}>{label}<input type={type} required={key !== 'phone'} disabled={pending} maxLength={key === 'name' ? 120 : key === 'email' ? 254 : 50} autoComplete={key === 'phone' ? 'tel' : key} value={customer[key]} onChange={e => setCustomer({
              ...customer,
              [key]: e.target.value
            })} /></label>)}<label>Order notes / fulfillment preferences<textarea maxLength={2000} disabled={pending} value={notes} onChange={e => setNotes(e.target.value)} /></label><p className="fine-print">No payment is taken here. Availability, final price, fulfillment, and payment will be confirmed by email. Your contact details are used to handle this request.</p><button className="solid-link" disabled={pending || !valid || loading || !!error}>{pending ? 'Sending…' : 'Send order request ↗'}</button></form></div> : <div className="coming-soon"><h2>{result?.ok ? 'Thank you for your request.' : 'Your next blend is waiting.'}</h2><Link className="solid-link" to="/shop">Explore the collection ↗</Link></div>}</Availability></section>;
}
