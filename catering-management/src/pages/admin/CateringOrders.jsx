import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Form,Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {calendarDate} from "../../utils/calendarDate.js";
import "../../styles/operations.css";

const money=value=>`$${Number(value||0).toFixed(2)}`;

export default function CateringOrders(){
 const [orders,setOrders]=useState([]);
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let ignore=false;
  const load=async()=>{
   try{
    const response=await fetch("/api/catering-orders");
    const data=await response.json();
    if(!response.ok)throw new Error(data.message||"Catering orders could not be loaded.");
    if(!ignore)setOrders(Array.isArray(data.data)?data.data:[]);
   }catch(error){if(!ignore)setError(error.message);}
   finally{if(!ignore)setLoading(false);}
  };
  load();
  return()=>{ignore=true;};
 },[]);
 const rows=useMemo(()=>orders.filter(order=>[order.orderNumber,order.customerName,order.company,order.eventName].some(value=>String(value||"").toLowerCase().includes(search.toLowerCase()))),[orders,search]);
 return <section className="operations-page">
  <header className="operations-hero"><div><h1 className="h2 fw-bold mb-0">Catering Orders</h1></div><Button as={Link} to="/catering-orders/new">Add Catering Order</Button></header>
  {error&&<Alert variant="danger">{error}</Alert>}
  <Card className="operations-card">
   <Card.Header className="operations-toolbar"><Form.Control type="search" aria-label="Search catering orders" placeholder="Search catering orders…" value={search} onChange={event=>setSearch(event.target.value)}/><span>{rows.length} orders</span></Card.Header>
   <div className="table-responsive"><Table hover className="align-middle mb-0">
    <thead><tr><th>Order</th><th>Customer</th><th>Event</th><th>Event Date</th><th>Status</th><th>Total</th><th>Balance</th><th>Actions</th></tr></thead>
    <tbody>
     {loading&&<tr><td colSpan="8" className="text-center py-5">Loading…</td></tr>}
     {!loading&&!error&&!rows.length&&<tr><td colSpan="8" className="text-center py-5">No catering orders found.</td></tr>}
     {rows.map(order=><tr key={order._id}><td>{order.orderNumber}</td><td>{order.customerName}</td><td>{order.eventName||"—"}</td><td>{calendarDate(order.eventDate)||"—"}</td><td>{order.status}</td><td>{money(order.orderTotal)}</td><td>{money(order.remainingBalance)}</td><td className="operations-actions"><Button as={Link} size="sm" variant="outline-primary" to={`/catering-orders/${order._id}`}>View</Button><Button as={Link} size="sm" to={`/catering-orders/${order._id}/edit`}>Edit</Button></td></tr>)}
    </tbody>
   </Table></div>
  </Card>
 </section>;
}
