import {useEffect,useState} from "react";
import {api,money} from "../utils/api.js";

function Orders(){
 const [orders,setOrders]=useState([]);const [error,setError]=useState("");
 const load=()=>api("/api/orders").then(setOrders).catch(error=>setError(error.message));
 useEffect(()=>{
  load();
 },[]);
 const setStatus=async(order,status)=>{try{await api(`/api/orders/${order._id}`,{method:"PUT",body:JSON.stringify({status,quantity:order.quantity,unitPrice:order.unitPrice})});load();}catch(error){setError(error.message);}};
 return <section className="page-stack"><div className="page-heading"><p className="app-eyebrow">Sales Workflow</p><h2>Orders</h2><p>Track quotes, production, quality checks, fulfillment, and completed sets.</p></div>{error&&<p className="error-banner">{error}</p>}
  <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Tier</th><th>Knives</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map(order=><tr key={order._id}><td>{order.orderNumber}</td><td>{order.customer.firstName} {order.customer.lastName}<small>{order.customer.email}</small></td><td>{order.tierRef?.name}</td><td>{order.selectedKnives?.reduce((sum,item)=>sum+item.quantity,0)}</td><td>{money(order.total)}</td><td><select value={order.status} onChange={event=>setStatus(order,event.target.value)}>{["quote","pending","confirmed","in-production","quality-check","ready","shipped","completed","cancelled"].map(status=><option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>
 </section>;
}

export default Orders;
