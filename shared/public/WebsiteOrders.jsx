import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ShoppingBag} from "lucide-react";
import {canManagePublicWebsites,storedSession,sessionToken} from "./websiteAccess.js";

export function WebsiteOrdersLink({user}){return canManagePublicWebsites(user||storedSession())?<Link to="/website-orders" className="nav-link app-nav-link"><ShoppingBag size={16} aria-hidden="true"/> Website orders</Link>:null;}
export default function WebsiteOrders(){
 const [orders,setOrders]=useState([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const allowed=canManagePublicWebsites(storedSession());
 useEffect(()=>{if(!allowed){setLoading(false);return;}const controller=new AbortController();fetch('/api/public-site/orders',{headers:{Authorization:`Bearer ${sessionToken()}`},signal:controller.signal}).then(async response=>{if(!response.ok)throw Error(response.status===403?"Owner or administrator access is required.":"Website orders could not be loaded.");return response.json();}).then(setOrders).catch(problem=>{if(problem.name!=="AbortError")setError(problem.message);}).finally(()=>setLoading(false));return()=>controller.abort();},[allowed]);
 if(!allowed)return <section className="container py-4"><h1>Access restricted</h1><p>Owner or administrator access is required.</p></section>;
 return <section className="container py-4"><h1>Website order requests</h1><p>Requests awaiting availability, final pricing, and payment confirmation.</p>{loading&&<p role="status">Loading requests…</p>}{error&&<p role="alert">{error}</p>}{!loading&&!error&&!orders.length&&<p>No website order requests yet.</p>}{orders.map(order=><article className="card mb-3" key={order._id}><div className="card-body"><h2 className="h4">{order.reference} · {order.status}</h2><p>{new Date(order.createdAt).toLocaleString()}</p><p>{order.customer.name} · <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>{order.customer.phone&&` · ${order.customer.phone}`}</p><ul>{order.items.map(item=><li key={item.productId}>{item.quantity} × {item.name}{item.configuration&&<p>{item.configuration}</p>}</li>)}</ul>{order.subtotal!==null&&<p>Items subtotal: ${order.subtotal.toFixed(2)}</p>}{order.notes&&<p>{order.notes}</p>}<p>No payment was collected by this request.</p></div></article>)}</section>;
}
