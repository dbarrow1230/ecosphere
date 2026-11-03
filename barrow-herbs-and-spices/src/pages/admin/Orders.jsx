import { api, money } from "../../utils/api.js";
import { useStudio } from "../../utils/studioContext.jsx";
export default function OrderPage() {
  const {
    data,
    run,
    busy
  } = useStudio();
  return <><h1>Orders</h1><><p>Requests begin as pending. Confirming reserves finished stock; cancelling a confirmed order returns it. Payment is arranged separately.</p>{!data.orders.length && <p className="empty">No order requests yet.</p>}{data.orders.map(row => <article className="order" key={row._id}><div><h2>{row.reference}</h2><span className="badge">{row.status}</span><p>{row.customer.name} · <a href={`mailto:${row.customer.email}`}>{row.customer.email}</a> · {row.customer.phone}</p><small>{new Date(row.createdAt).toLocaleString()}</small></div>{row.items.map(item => <p key={item.productId}>{item.quantity} × {item.name} ({item.packGrams} g) <strong>{money(item.unitPrice * item.quantity)}</strong></p>)}<p>Items subtotal: <strong>{money(row.subtotal)}</strong></p><p>{row.notes}</p><div className="actions">{(row.status === 'processing' ? [row.transition.to] : row.status === 'pending' ? ['confirmed', 'cancelled'] : row.status === 'confirmed' ? ['completed', 'cancelled'] : []).map(status => <button key={status} disabled={busy} onClick={() => run(() => api(`/api/studio/orders/${row._id}`, {
            status
          }, 'PATCH').then(() => `Order ${status}.`))}>{row.status === 'processing' ? 'Retry ' : ''}{{
              confirmed: 'Confirm order',
              cancelled: 'Cancel order',
              completed: 'Mark fulfilled'
            }[status]}</button>)}</div></article>)}</></>;
}
