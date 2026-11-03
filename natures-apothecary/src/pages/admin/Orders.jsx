// src/pages/Orders.jsx
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Badge} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";
import "../../styles/orders.css";

function Orders(){

 const initialFormData={
  client:"",
  event:"",
  orderNumber:"",
  status:"draft",
  serviceType:"delivery",
  subtotal:"",
  tax:"",
  discount:"",
  total:"",
  notes:""
 };

 const [orders,setOrders]=useState([]);
 const [clients,setClients]=useState([]);
 const [events,setEvents]=useState([]);
 const [formData,setFormData]=useState(initialFormData);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [selectedOrder,setSelectedOrder]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  if(status==="pending") return "pending";
  if(status==="confirmed") return "confirmed";
  if(status==="in-prep") return "in-prep";
  if(status==="completed") return "completed";
  if(status==="cancelled") return "cancelled";
  return "draft";
 };

 const normalizeServiceType=value=>{
  const serviceType=String(value||"").trim().toLowerCase();
  if(serviceType==="pickup") return "pickup";
  if(serviceType==="full-service") return "full-service";
  return "delivery";
 };

 const statusLabel=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="in-prep") return "In Prep";
  if(normalized==="confirmed") return "Confirmed";
  if(normalized==="pending") return "Pending";
  if(normalized==="completed") return "Completed";
  if(normalized==="cancelled") return "Cancelled";
  return "Draft";
 };

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="confirmed") return "success";
  if(normalized==="in-prep") return "warning";
  if(normalized==="completed") return "primary";
  if(normalized==="cancelled") return "danger";
  if(normalized==="pending") return "secondary";
  return "dark";
 };

 const toNumberString=value=>{
  if(value===null||value===undefined||value==="") return "";
  if(typeof value==="object"&&value.$numberDecimal!==undefined) return value.$numberDecimal;
  return String(value);
 };

 const formatMoney=value=>{
  const num=Number(toNumberString(value)||0);
  if(Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
 };

 const getClientName=client=>{
  if(!client) return "-";
  if(typeof client==="object") return client.name||client.company||client.email||"-";
  const found=clients.find(item=>item._id===client);
  return found?.name||found?.company||found?.email||"-";
 };

 const getEventName=event=>{
  if(!event) return "-";
  if(typeof event==="object") return event.eventName||"-";
  const found=events.find(item=>item._id===event);
  return found?.eventName||"-";
 };

 const getEventDate=event=>{
  const source=typeof event==="object"?event:events.find(item=>item._id===event);
  if(!source?.eventDate) return "-";
  const date=new Date(source.eventDate);
  if(Number.isNaN(date.getTime())) return "-";
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,"0");
  const day=String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
 };

 useEffect(()=>{
  const loadOrders=async()=>{
   try{
    setLoading(true);
    const res=await fetch("/api/orders");
    const data=await res.json();
    const orderList=Array.isArray(data?.orders)?data.orders:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setOrders(orderList);
   }catch(err){
    console.error("Error loading orders:",err);
    setOrders([]);
    setAlert({show:true,variant:"danger",message:"Failed to load orders."});
   }finally{
    setLoading(false);
   }
  };

  const loadClients=async()=>{
   try{
    const res=await fetch("/api/clients");
    const data=await res.json();
    const clientList=Array.isArray(data?.clients)?data.clients:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setClients(clientList);
   }catch(err){
    console.error("Error loading clients:",err);
    setClients([]);
   }
  };

  const loadEvents=async()=>{
   try{
    const res=await fetch("/api/events");
    const data=await res.json();
    const eventList=Array.isArray(data?.events)?data.events:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setEvents(eventList);
   }catch(err){
    console.error("Error loading events:",err);
    setEvents([]);
   }
  };

  loadOrders();
  loadClients();
  loadEvents();
 },[]);

 const handleChange=e=>{
  const {name,value}=e.target;
  if(name==="status"){
   setFormData(prev=>({...prev,status:normalizeStatus(value)}));
   return;
  }
  if(name==="serviceType"){
   setFormData(prev=>({...prev,serviceType:normalizeServiceType(value)}));
   return;
  }
  setFormData(prev=>({...prev,[name]:value}));
 };

 const resetForm=()=>{
  setFormData(initialFormData);
  setSelectedOrder(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleAddOrder=()=>{
  setFormData(initialFormData);
  setSelectedOrder(null);
  setIsEditing(false);
  setIsAdding(true);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleViewOrder=order=>{
  setSelectedOrder(order);
  setIsEditing(false);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleEditOrder=order=>{
  setSelectedOrder(order);
  setFormData({
   client:order.client?._id||order.client||"",
   event:order.event?._id||order.event||"",
   orderNumber:order.orderNumber||"",
   status:normalizeStatus(order.status),
   serviceType:normalizeServiceType(order.serviceType),
   subtotal:toNumberString(order.subtotal),
   tax:toNumberString(order.tax),
   discount:toNumberString(order.discount),
   total:toNumberString(order.total),
   notes:order.notes||""
  });
  setIsEditing(true);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleDeleteOrder=async orderId=>{
  try{
   const confirmed=window.confirm("Are you sure you want to delete this order?");
   if(!confirmed) return;

   closeAlert();

   const res=await fetch(`/api/orders/${orderId}`,{
    method:"DELETE"
   });

   const data=await res.json().catch(()=>null);

   if(res.ok){
    setOrders(prev=>prev.filter(order=>order._id!==orderId));
    if(selectedOrder?._id===orderId){
     resetForm();
    }
    setAlert({show:true,variant:"success",message:"Order deleted successfully."});
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to delete order."});
   }
  }catch(err){
   console.error("Error deleting order:",err);
   setAlert({show:true,variant:"danger",message:"Error deleting order."});
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   closeAlert();

   const payload={
    client:formData.client,
    event:formData.event,
    orderNumber:formData.orderNumber,
    status:normalizeStatus(formData.status),
    serviceType:normalizeServiceType(formData.serviceType),
    subtotal:formData.subtotal||"0",
    tax:formData.tax||"0",
    discount:formData.discount||"0",
    total:formData.total||"0",
    notes:formData.notes
   };

   const url=isEditing&&selectedOrder?`/api/orders/${selectedOrder._id}`:"/api/orders";
   const method=isEditing&&selectedOrder?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedOrder=data?.order||data?.data;

   if(res.ok&&savedOrder){
    if(isEditing&&selectedOrder){
     setOrders(prev=>prev.map(order=>order._id===savedOrder._id?savedOrder:order));
     setSelectedOrder(savedOrder);
     setIsEditing(false);
     setAlert({show:true,variant:"success",message:"Order updated successfully."});
    }else{
     setOrders(prev=>[savedOrder,...prev]);
     resetForm();
     setAlert({show:true,variant:"success",message:"Order saved successfully."});
    }
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to save order."});
   }
  }catch(err){
   console.error("Error saving order:",err);
   setAlert({show:true,variant:"danger",message:"Error saving order."});
  }finally{
   setSaving(false);
  }
 };

 const metrics=useMemo(()=>{
  return{
   total:orders.length,
   drafts:orders.filter(order=>normalizeStatus(order.status)==="draft").length,
   pending:orders.filter(order=>normalizeStatus(order.status)==="pending").length,
   inPrep:orders.filter(order=>normalizeStatus(order.status)==="in-prep").length,
   confirmed:orders.filter(order=>normalizeStatus(order.status)==="confirmed").length,
   completed:orders.filter(order=>normalizeStatus(order.status)==="completed").length
  };
 },[orders]);

 return(
  <section className="orders-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Order Management</p>
       <h1 className="mb-2">Orders</h1>
       <p className="text-muted mb-0">Create, review, and track catering orders connected to clients and events.</p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="metrics-card h-100">
 <Card.Body>
  <div className="metrics-grid">

   <div className="metric-item">
    <div className="metric-label">Total</div>
    <div className="metric-value">{metrics.total}</div>
   </div>

   <div className="metric-item metric-info">
    <div className="metric-label">Drafts</div>
    <div className="metric-value">{metrics.drafts}</div>
   </div>

   <div className="metric-item metric-warning">
    <div className="metric-label">Pending</div>
    <div className="metric-value">{metrics.pending}</div>
   </div>

   <div className="metric-item metric-warning">
    <div className="metric-label">In Prep</div>
    <div className="metric-value">{metrics.inPrep}</div>
   </div>

   <div className="metric-item metric-success">
    <div className="metric-label">Confirmed</div>
    <div className="metric-value">{metrics.confirmed}</div>
   </div>

   <div className="metric-item metric-success">
    <div className="metric-label">Completed</div>
    <div className="metric-value">{metrics.completed}</div>
   </div>

  </div>
 </Card.Body>
</Card>
     </Col>
    </Row>

    {alert.show&&(
     <Row className="mb-4">
      <Col lg={12}>
       <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-0">
        {alert.message}
       </Alert>
      </Col>
     </Row>
    )}

    <Row className="g-4">
     <Col lg={4}>
      <Card>
       <Card.Body>

        {!selectedOrder&&!isEditing&&!isAdding&&(
         <>
          <h2 className="h4 mb-3">Order Form</h2>

          <Form>
           <Form.Group className="mb-3" controlId="orderClient">
            <Form.Label>Client</Form.Label>
            <Form.Control type="text" value="" placeholder="Client" disabled/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="orderEvent">
            <Form.Label>Event</Form.Label>
            <Form.Control type="text" value="" placeholder="Associated event" disabled/>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="orderNumber">
              <Form.Label>Order #</Form.Label>
              <Form.Control type="text" value="" placeholder="ORD-1001" disabled/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="orderStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control type="text" value="" placeholder="Status" disabled/>
             </Form.Group>
            </Col>
           </Row>

           <div className="d-grid">
            <Button type="button" variant="primary" onClick={handleAddOrder}>Add Order</Button>
           </div>
          </Form>
         </>
        )}

        {isAdding&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Create Order</h2>
           <Button variant="outline-secondary" size="sm" onClick={resetForm}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>
           <Form.Group className="mb-3" controlId="orderClient">
            <Form.Label>Client</Form.Label>
            <Form.Select name="client" value={formData.client} onChange={handleChange} required>
             <option value="">Select client</option>
             {clients.map(client=>(
              <option key={client._id} value={client._id}>{client.name}</option>
             ))}
            </Form.Select>
           </Form.Group>

           <Form.Group className="mb-3" controlId="orderEvent">
            <Form.Label>Event</Form.Label>
            <Form.Select name="event" value={formData.event} onChange={handleChange} required>
             <option value="">Select event</option>
             {events.map(event=>(
              <option key={event._id} value={event._id}>{event.eventName}</option>
             ))}
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="orderNumberField">
              <Form.Label>Order #</Form.Label>
              <Form.Control type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} placeholder="ORD-1001" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="orderStatusField">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="draft">Draft</option>
               <option value="pending">Pending</option>
               <option value="confirmed">Confirmed</option>
               <option value="in-prep">In Prep</option>
               <option value="completed">Completed</option>
               <option value="cancelled">Cancelled</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="serviceType">
              <Form.Label>Service Type</Form.Label>
              <Form.Select name="serviceType" value={formData.serviceType} onChange={handleChange}>
               <option value="pickup">Pickup</option>
               <option value="delivery">Delivery</option>
               <option value="full-service">Full Service</option>
              </Form.Select>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="orderTotalField">
              <Form.Label>Total</Form.Label>
              <Form.Control type="number" step="0.01" name="total" value={formData.total} onChange={handleChange} placeholder="0.00" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={4}>
             <Form.Group controlId="subtotal">
              <Form.Label>Subtotal</Form.Label>
              <Form.Control type="number" step="0.01" name="subtotal" value={formData.subtotal} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>

            <Col md={4}>
             <Form.Group controlId="tax">
              <Form.Label>Tax</Form.Label>
              <Form.Control type="number" step="0.01" name="tax" value={formData.tax} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>

            <Col md={4}>
             <Form.Group controlId="discount">
              <Form.Label>Discount</Form.Label>
              <Form.Control type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-4" controlId="orderNotes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Add preparation notes, delivery details, or special instructions"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Save Order"}</Button>
           </div>
          </Form>
         </>
        )}

        {selectedOrder&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">View Order</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>Close</Button>
            <Button variant="primary" size="sm" onClick={()=>handleEditOrder(selectedOrder)}>Edit Order</Button>
            <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteOrder(selectedOrder._id)}>Delete</Button>
           </div>
          </div>

          <div className="mb-3">
           <strong>Order #</strong>
           <div>{selectedOrder.orderNumber||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Client</strong>
           <div>{getClientName(selectedOrder.client)}</div>
          </div>

          <div className="mb-3">
           <strong>Event</strong>
           <div>{getEventName(selectedOrder.event)}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div><Badge bg={statusVariant(selectedOrder.status)}>{statusLabel(selectedOrder.status)}</Badge></div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Service Type</strong>
             <div>{selectedOrder.serviceType||"-"}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Subtotal</strong>
             <div>{formatMoney(selectedOrder.subtotal)}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Tax</strong>
             <div>{formatMoney(selectedOrder.tax)}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Discount</strong>
             <div>{formatMoney(selectedOrder.discount)}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Total</strong>
             <div>{formatMoney(selectedOrder.total)}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{selectedOrder.notes||"-"}</div>
          </div>
         </>
        )}

        {isEditing&&selectedOrder&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Edit Order</h2>
           <Button variant="outline-secondary" size="sm" onClick={()=>setIsEditing(false)}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>
           <Form.Group className="mb-3" controlId="editOrderClient">
            <Form.Label>Client</Form.Label>
            <Form.Select name="client" value={formData.client} onChange={handleChange} required>
             <option value="">Select client</option>
             {clients.map(client=>(
              <option key={client._id} value={client._id}>{client.name}</option>
             ))}
            </Form.Select>
           </Form.Group>

           <Form.Group className="mb-3" controlId="editOrderEvent">
            <Form.Label>Event</Form.Label>
            <Form.Select name="event" value={formData.event} onChange={handleChange} required>
             <option value="">Select event</option>
             {events.map(event=>(
              <option key={event._id} value={event._id}>{event.eventName}</option>
             ))}
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="editOrderNumber">
              <Form.Label>Order #</Form.Label>
              <Form.Control type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} placeholder="ORD-1001" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="editOrderStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="draft">Draft</option>
               <option value="pending">Pending</option>
               <option value="confirmed">Confirmed</option>
               <option value="in-prep">In Prep</option>
               <option value="completed">Completed</option>
               <option value="cancelled">Cancelled</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="editServiceType">
              <Form.Label>Service Type</Form.Label>
              <Form.Select name="serviceType" value={formData.serviceType} onChange={handleChange}>
               <option value="pickup">Pickup</option>
               <option value="delivery">Delivery</option>
               <option value="full-service">Full Service</option>
              </Form.Select>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="editOrderTotal">
              <Form.Label>Total</Form.Label>
              <Form.Control type="number" step="0.01" name="total" value={formData.total} onChange={handleChange} placeholder="0.00" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={4}>
             <Form.Group controlId="editSubtotal">
              <Form.Label>Subtotal</Form.Label>
              <Form.Control type="number" step="0.01" name="subtotal" value={formData.subtotal} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>

            <Col md={4}>
             <Form.Group controlId="editTax">
              <Form.Label>Tax</Form.Label>
              <Form.Control type="number" step="0.01" name="tax" value={formData.tax} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>

            <Col md={4}>
             <Form.Group controlId="editDiscount">
              <Form.Label>Discount</Form.Label>
              <Form.Control type="number" step="0.01" name="discount" value={formData.discount} onChange={handleChange} placeholder="0.00"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-4" controlId="editOrderNotes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Add preparation notes, delivery details, or special instructions"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Update Order"}</Button>
           </div>
          </Form>
         </>
        )}

       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
         <div>
          <h2 className="h4 mb-1">Order List</h2>
          <p className="text-muted mb-0">Track order status, event assignments, and billing totals.</p>
         </div>
        </div>

        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Order #</th>
            <th>Client</th>
            <th>Event</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="6" className="text-center text-muted py-4">Loading orders...</td>
            </tr>
           )}

           {!loading&&orders.length===0&&(
            <tr>
             <td colSpan="6" className="text-center text-muted py-4">No orders found.</td>
            </tr>
           )}

           {!loading&&orders.map(order=>(
            <tr key={order._id} onClick={()=>handleViewOrder(order)} style={{cursor:"pointer"}} className={selectedOrder?._id===order._id?"table-active":""}>
             <td>{order.orderNumber}</td>
             <td>{getClientName(order.client)}</td>
             <td>{getEventName(order.event)}</td>
             <td>{getEventDate(order.event)}</td>
             <td>{formatMoney(order.total)}</td>
             <td><Badge bg={statusVariant(order.status)}>{statusLabel(order.status)}</Badge></td>
            </tr>
           ))}
          </tbody>
         </Table>
        </div>
       </Card.Body>
      </Card>
     </Col>
    </Row>

   </Container>
  </section>
 );
}

export default Orders;