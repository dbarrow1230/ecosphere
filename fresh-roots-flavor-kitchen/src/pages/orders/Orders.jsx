import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Row,Tab,Tabs} from "react-bootstrap";
import {Link,useLocation,useNavigate} from "react-router-dom";
import "../../styles/orders.css";

const emptyForm={client:"",event:"",orderNumber:"",status:"draft",serviceType:"delivery",subtotal:"",tax:"",discount:"",total:"",notes:""};

function Orders({orders}){
 const location=useLocation();
 const navigate=useNavigate();
 const [loadedOrders,setLoadedOrders]=useState(null);
 const [clients,setClients]=useState([]);
 const [events,setEvents]=useState([]);
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [tab,setTab]=useState("active");
 const isNew=location.pathname.endsWith("/new");

 useEffect(()=>{
  let active=true;
  const load=async()=>{
   try{
    const [ordersResponse,clientsResponse,eventsResponse]=await Promise.all([fetch("/api/orders"),fetch("/api/clients"),fetch("/api/events")]);
    const [ordersData,clientsData,eventsData]=await Promise.all([ordersResponse.json().catch(()=>({})),clientsResponse.json().catch(()=>({})),eventsResponse.json().catch(()=>({}))]);
    if(!ordersResponse.ok)throw new Error(ordersData?.message||"Orders are unavailable");
    if(!active)return;
    setLoadedOrders(Array.isArray(ordersData?.orders)?ordersData.orders:[]);
    setClients(clientsResponse.ok&&Array.isArray(clientsData?.clients)?clientsData.clients:[]);
    setEvents(eventsResponse.ok&&Array.isArray(eventsData?.events)?eventsData.events:[]);
   }catch(error){
    if(active){setLoadedOrders([]);setMessage(error.message);}
   }
  };
  load();
  return()=>{active=false;};
 },[]);

 const orderItems=useMemo(()=>Array.isArray(orders)?orders:(loadedOrders||[]),[loadedOrders,orders]);
 const activeOrders=orderItems.filter(order=>!["completed","cancelled"].includes(String(order.status||"").toLowerCase()));
 const historyOrders=orderItems.filter(order=>["completed","cancelled"].includes(String(order.status||"").toLowerCase()));

 const statusLabel=status=>{
  const value=String(status||"").toLowerCase();
  if(value==="in-prep")return "Preparing";
  if(value==="confirmed")return "Ready";
  if(value==="pending")return "Pending";
  if(value==="completed")return "Completed";
  if(value==="cancelled")return "Cancelled";
  return "Draft";
 };

 const getStatusClass=status=>{
  const value=statusLabel(status).toLowerCase();
  if(value.includes("prepar"))return "orders-status-preparing";
  if(value.includes("ready"))return "orders-status-ready";
  if(value.includes("pending"))return "orders-status-delivery";
  if(value.includes("complete"))return "orders-status-completed";
  if(value.includes("cancel"))return "orders-status-cancelled";
  return "orders-status-default";
 };

 const money=value=>{
  const number=typeof value==="object"?Number(value?.$numberDecimal||0):Number(String(value||0).replace("$",""));
  return number.toLocaleString(undefined,{style:"currency",currency:"USD"});
 };

 const renderRows=list=>list.length?(
  <div className="orders-list">
   {list.map(order=>{
    const client=typeof order.client==="object"?order.client:null;
    return(
     <div key={order._id} className="orders-row">
      <div className="orders-row-main">
       <div className="orders-row-top"><span className="orders-number">{order.orderNumber||"Order"}</span><span className="orders-channel">{order.channel||order.serviceType||"Service"}</span></div>
       <span className="orders-customer">{order.customerName||client?.name||client?.company||"Client"}</span>
       <span className="orders-items">{order.items||order.notes||"Order details"}</span>
      </div>
      <div className="orders-row-total">{money(order.total)}</div>
      <div className={`orders-status ${getStatusClass(order.status)}`}>{statusLabel(order.status)}</div>
     </div>
    );
   })}
  </div>
 ):(<p className="orders-empty">No orders in this section.</p>);

 const handleChange=event=>setFormData(current=>({...current,[event.target.name]:event.target.value}));

 const handleSubmit=async event=>{
  event.preventDefault();
  setSaving(true);
  setMessage("");
  try{
   const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,subtotal:Number(formData.subtotal||0),tax:Number(formData.tax||0),discount:Number(formData.discount||0),total:Number(formData.total||0)})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data?.message||"Order could not be saved");
   setLoadedOrders(current=>[data.order,...(current||[])]);
   setFormData(emptyForm);
   navigate("/orders",{replace:true});
  }catch(error){setMessage(error.message);}finally{setSaving(false);}
 };

 return(
  <Container className="orders-page">
   <Row className="align-items-end mb-4">
    <Col md={8}><p className="orders-eyebrow">Service Flow</p><h1 className="orders-title">Orders</h1><p className="orders-text">Track live service, completed tickets, and order flow across pickup and delivery.</p></Col>
    <Col md={4} className="text-md-end"><div className="orders-actions"><Link to="/orders/new" className="orders-action">New Order</Link><Link to="/orders/history" className="orders-action-light">Order History</Link></div></Col>
   </Row>

   {message&&<Alert variant="warning" dismissible onClose={()=>setMessage("")}>{message}</Alert>}

   {isNew&&(
    <Card className="mb-4"><Card.Body>
     <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h4 mb-0">Create Order</h2><Button variant="outline-secondary" size="sm" onClick={()=>navigate("/orders")}>Cancel</Button></div>
     <Form onSubmit={handleSubmit}><Row className="g-3">
      <Col md={6}><Form.Group controlId="publicOrderClient"><Form.Label>Client</Form.Label><Form.Select name="client" value={formData.client} onChange={handleChange} required><option value="">Select client</option>{clients.map(client=><option key={client._id} value={client._id}>{client.name}</option>)}</Form.Select></Form.Group></Col>
      <Col md={6}><Form.Group controlId="publicOrderEvent"><Form.Label>Event</Form.Label><Form.Select name="event" value={formData.event} onChange={handleChange} required><option value="">Select event</option>{events.map(item=><option key={item._id} value={item._id}>{item.eventName}</option>)}</Form.Select></Form.Group></Col>
      <Col md={4}><Form.Group controlId="publicOrderNumber"><Form.Label>Order #</Form.Label><Form.Control name="orderNumber" value={formData.orderNumber} onChange={handleChange} required/></Form.Group></Col>
      <Col md={4}><Form.Group controlId="publicOrderStatus"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status} onChange={handleChange}><option value="draft">Draft</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in-prep">In Prep</option><option value="completed">Completed</option></Form.Select></Form.Group></Col>
      <Col md={4}><Form.Group controlId="publicOrderService"><Form.Label>Service</Form.Label><Form.Select name="serviceType" value={formData.serviceType} onChange={handleChange}><option value="pickup">Pickup</option><option value="delivery">Delivery</option><option value="full-service">Full Service</option></Form.Select></Form.Group></Col>
      <Col md={3}><Form.Group controlId="publicOrderSubtotal"><Form.Label>Subtotal</Form.Label><Form.Control type="number" min="0" step="0.01" name="subtotal" value={formData.subtotal} onChange={handleChange}/></Form.Group></Col>
      <Col md={3}><Form.Group controlId="publicOrderTax"><Form.Label>Tax</Form.Label><Form.Control type="number" min="0" step="0.01" name="tax" value={formData.tax} onChange={handleChange}/></Form.Group></Col>
      <Col md={3}><Form.Group controlId="publicOrderDiscount"><Form.Label>Discount</Form.Label><Form.Control type="number" min="0" step="0.01" name="discount" value={formData.discount} onChange={handleChange}/></Form.Group></Col>
      <Col md={3}><Form.Group controlId="publicOrderTotal"><Form.Label>Total</Form.Label><Form.Control type="number" min="0" step="0.01" name="total" value={formData.total} onChange={handleChange} required/></Form.Group></Col>
      <Col xs={12}><Form.Group controlId="publicOrderNotes"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/></Form.Group></Col>
      <Col xs={12}><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Order"}</Button></Col>
     </Row></Form>
    </Card.Body></Card>
   )}

   <Row className="g-3 mb-4"><Col md={4}><div className="orders-stat"><span>All Orders</span><strong>{orderItems.length}</strong></div></Col><Col md={4}><div className="orders-stat"><span>Active</span><strong>{activeOrders.length}</strong></div></Col><Col md={4}><div className="orders-stat"><span>Completed</span><strong>{historyOrders.length}</strong></div></Col></Row>
   <Row><Col><div className="orders-panel"><Tabs activeKey={location.pathname.endsWith("/history")?"history":tab} onSelect={key=>setTab(key||"active")} id="orders-tabs" className="orders-tabs" fill><Tab eventKey="active" title={`Active (${activeOrders.length})`}><div className="orders-tab-body">{renderRows(activeOrders)}</div></Tab><Tab eventKey="history" title={`History (${historyOrders.length})`}><div className="orders-tab-body">{renderRows(historyOrders)}</div></Tab></Tabs></div></Col></Row>
  </Container>
 );
}

export default Orders;
