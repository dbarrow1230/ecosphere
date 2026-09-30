import React,{useEffect,useState} from "react";
import {Row,Col,Card,Form,Button,Table,InputGroup,Tabs,Tab,Alert} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import {ClipboardList,User,CalendarDays,MapPin,Users,Utensils,Truck,Clock,Plus,Trash2,DollarSign,FileText,Phone,Mail,Save} from "lucide-react";

export default function CateringOrderForm({readOnly=false}){
 const {id}=useParams();
 const navigate=useNavigate();
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});
 const [formData,setFormData]=useState({
  orderNumber:"",
  orderDate:"",
  status:"Inquiry",
  customerName:"",
  company:"",
  phone:"",
  email:"",
  billingAddress:"",
  billingCity:"",
  billingState:"",
  billingZip:"",
  eventName:"",
  eventType:"",
  eventDate:"",
  eventLocation:"",
  eventCity:"",
  eventState:"",
  eventZip:"",
  guestCount:"",
  startTime:"",
  endTime:"",
  serviceTime:"",
  venueContact:"",
  venuePhone:"",
  serviceType:"",
  allergies:"",
  dietaryRequirements:[],
  specialInstructions:"",
  deliveryAddress:"",
  mileage:"",
  mileageRate:"",
  mileageCharge:"",
  tollsParking:"",
  deliveryFee:"",
  setupFee:"",
  additionalServices:"",
  staffingTotal:"",
  equipmentRental:"",
  otherCharges:"",
  discount:"",
  tax:"",
  depositRequired:"",
  depositDueDate:"",
  depositPaid:"",
  finalPaymentDueDate:"",
  paymentMethod:"",
  paymentReference:"",
 notes:""
 });

 const [menuItems,setMenuItems]=useState([{item:"",quantity:1,portion:"",unitPrice:""}]);

 const dateValue=value=>value?String(value).slice(0,10):"";
 useEffect(()=>{
  if(!id)return;
  let ignore=false;
  fetch(`/api/catering-orders/${id}`).then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.message||"Catering order could not be loaded.");const order=data.data;for(const field of ["orderDate","eventDate","depositDueDate","finalPaymentDueDate"])order[field]=dateValue(order[field]);if(!ignore){setFormData(current=>({...current,...order}));setMenuItems(order.menuItems?.length?order.menuItems:[{item:"",quantity:1,portion:"",unitPrice:""}]);}}).catch(error=>!ignore&&setMessage({type:"danger",text:error.message}));
  return()=>{ignore=true;};
 },[id]);

 const handleChange=e=>{
  const {name,value}=e.target;
  setFormData(prev=>({...prev,[name]:value}));
 };

 const handleDietaryChange=e=>{
  const {value,checked}=e.target;
  setFormData(prev=>({
   ...prev,
   dietaryRequirements:checked
    ? [...prev.dietaryRequirements,value]
    : prev.dietaryRequirements.filter(item=>item!==value)
  }));
 };

 const handleMenuChange=(index,e)=>{
  const {name,value}=e.target;
  const updated=[...menuItems];
  updated[index][name]=value;
  setMenuItems(updated);
 };

 const addMenuItem=()=>{
  setMenuItems(prev=>[
   ...prev,
   {item:"",quantity:1,portion:"",unitPrice:""}
  ]);
 };

 const removeMenuItem=index=>{
  if(menuItems.length===1)return;
  setMenuItems(prev=>prev.filter((_,i)=>i!==index));
 };

 const money=value=>{
  const number=parseFloat(value);
  return Number.isFinite(number)?number:0;
 };

 const menuSubtotal=menuItems.reduce((total,item)=>{
  return total+(money(item.quantity)*money(item.unitPrice));
 },0);

 const mileageTotal=formData.mileageCharge
  ? money(formData.mileageCharge)
  : money(formData.mileage)*money(formData.mileageRate);

 const subtotal=
  menuSubtotal+
  money(formData.additionalServices)+
  money(formData.staffingTotal)+
  mileageTotal+
  money(formData.tollsParking)+
  money(formData.deliveryFee)+
  money(formData.setupFee)+
  money(formData.equipmentRental)+
  money(formData.otherCharges);

 const orderTotal=
  subtotal-
  money(formData.discount)+
  money(formData.tax);

 const remainingBalance=
  orderTotal-
  money(formData.depositPaid);

 const handleSubmit=async e=>{
  e.preventDefault();
  const order={
   ...formData,
   menuItems,
   menuSubtotal,
   mileageTotal,
   subtotal,
   orderTotal,
   remainingBalance
  };
  try{
   setSaving(true);
   setMessage({type:"",text:""});
   const res=await fetch(id?`/api/catering-orders/${id}`:"/api/catering-orders",{
    method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to save catering order.");
   navigate("/orders");
  }catch(error){setMessage({type:"danger",text:error.message});}
  finally{setSaving(false);}
 };

 return(
  <section className="operation-form-page">
   <Form onSubmit={handleSubmit}>
    <header className="operation-form-header"><div><p>Order Operations</p><h1>{readOnly?"Catering Order Details":id?"Edit Catering Order":"Create Catering Order"}</h1><span>Customer, event, menu, dietary, delivery, service, and payment details.</span></div><Button type="button" variant="outline-secondary" onClick={()=>navigate("/orders")}>Back to Orders</Button></header>
    {message.text&&<Alert variant={message.type}>{message.text}</Alert>}
    <fieldset disabled={readOnly}>
    <Tabs defaultActiveKey="order" className="mb-4">
     <Tab eventKey="order" title={<><ClipboardList size={16} className="me-2"/>Order</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={4}>
          <Form.Group>
           <Form.Label>Order Number</Form.Label>
           <Form.Control type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} required/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Order Date</Form.Label>
           <Form.Control type="date" name="orderDate" value={formData.orderDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Order Status</Form.Label>
           <Form.Select name="status" value={formData.status} onChange={handleChange}>
            <option>Inquiry</option>
            <option>Quote</option>
            <option>Pending Deposit</option>
            <option>Confirmed</option>
            <option>Paid</option>
            <option>Completed</option>
            <option>Cancelled</option>
           </Form.Select>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="customer" title={<><User size={16} className="me-2"/>Customer</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={6}>
          <Form.Group>
           <Form.Label>Customer / Client Name</Form.Label>
           <Form.Control type="text" name="customerName" value={formData.customerName} onChange={handleChange} required/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Company / Organization</Form.Label>
           <Form.Control type="text" name="company" value={formData.company} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><Phone size={16}/>Phone Number</Form.Label>
           <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><Mail size={16}/>Email Address</Form.Label>
           <Form.Control type="email" name="email" value={formData.email} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Billing Address</Form.Label>
           <Form.Control type="text" name="billingAddress" value={formData.billingAddress} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>City</Form.Label>
           <Form.Control type="text" name="billingCity" value={formData.billingCity} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={3}>
          <Form.Group>
           <Form.Label>State</Form.Label>
           <Form.Control type="text" name="billingState" value={formData.billingState} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={3}>
          <Form.Group>
           <Form.Label>ZIP Code</Form.Label>
           <Form.Control type="text" name="billingZip" value={formData.billingZip} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="event" title={<><CalendarDays size={16} className="me-2"/>Event</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={6}>
          <Form.Group>
           <Form.Label>Event Name / Occasion</Form.Label>
           <Form.Control type="text" name="eventName" value={formData.eventName} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Event Type</Form.Label>
           <Form.Select name="eventType" value={formData.eventType} onChange={handleChange}>
            <option value="">Select Event Type</option>
            <option value="Wedding">Wedding</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Private Dinner">Private Dinner</option>
            <option value="Holiday Event">Holiday Event</option>
            <option value="Memorial / Repast">Memorial / Repast</option>
            <option value="Graduation">Graduation</option>
            <option value="Community Event">Community Event</option>
            <option value="Other">Other</option>
           </Form.Select>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Event Date</Form.Label>
           <Form.Control type="date" name="eventDate" value={formData.eventDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><Users size={16}/>Guest Count</Form.Label>
           <Form.Control type="number" min="1" name="guestCount" value={formData.guestCount} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Service Type</Form.Label>
           <Form.Select name="serviceType" value={formData.serviceType} onChange={handleChange}>
            <option value="">Select Service Type</option>
            <option value="Pickup">Pickup</option>
            <option value="Drop-Off Catering">Drop-Off Catering</option>
            <option value="Delivery & Setup">Delivery & Setup</option>
            <option value="Buffet Service">Buffet Service</option>
            <option value="Plated Service">Plated Service</option>
            <option value="Family-Style Service">Family-Style Service</option>
            <option value="Passed Hors d'Oeuvres">Passed Hors d'Oeuvres</option>
            <option value="Private Chef Service">Private Chef Service</option>
            <option value="Other">Other</option>
           </Form.Select>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><MapPin size={16}/>Event Location</Form.Label>
           <Form.Control type="text" name="eventLocation" value={formData.eventLocation} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>City</Form.Label>
           <Form.Control type="text" name="eventCity" value={formData.eventCity} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={3}>
          <Form.Group>
           <Form.Label>State</Form.Label>
           <Form.Control type="text" name="eventState" value={formData.eventState} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={3}>
          <Form.Group>
           <Form.Label>ZIP Code</Form.Label>
           <Form.Control type="text" name="eventZip" value={formData.eventZip} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><Clock size={16}/>Event Start Time</Form.Label>
           <Form.Control type="time" name="startTime" value={formData.startTime} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Event End Time</Form.Label>
           <Form.Control type="time" name="endTime" value={formData.endTime} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Food Service Time</Form.Label>
           <Form.Control type="time" name="serviceTime" value={formData.serviceTime} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Venue Contact Name</Form.Label>
           <Form.Control type="text" name="venueContact" value={formData.venueContact} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Venue Contact Phone</Form.Label>
           <Form.Control type="tel" name="venuePhone" value={formData.venuePhone} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="menu" title={<><Utensils size={16} className="me-2"/>Menu</>}>
      <Card>
       <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Menu Order</strong>
        <Button type="button" variant="outline-primary" size="sm" onClick={addMenuItem} className="d-flex align-items-center gap-1"><Plus size={16}/>Add Item</Button>
       </Card.Header>
       <Card.Body>
        <div className="table-responsive">
         <Table bordered align="middle" className="mb-0">
          <thead>
           <tr>
            <th>Menu Item</th>
            <th style={{width:"110px"}}>Qty</th>
            <th style={{width:"180px"}}>Portion / Size</th>
            <th style={{width:"160px"}}>Unit Price</th>
            <th style={{width:"140px"}}>Amount</th>
            <th style={{width:"70px"}}></th>
           </tr>
          </thead>
          <tbody>
           {menuItems.map((item,index)=>(
            <tr key={index}>
             <td><Form.Control type="text" name="item" value={item.item} onChange={e=>handleMenuChange(index,e)}/></td>
             <td><Form.Control type="number" min="1" name="quantity" value={item.quantity} onChange={e=>handleMenuChange(index,e)}/></td>
             <td><Form.Control type="text" name="portion" value={item.portion} onChange={e=>handleMenuChange(index,e)}/></td>
             <td>
              <InputGroup>
               <InputGroup.Text>$</InputGroup.Text>
               <Form.Control type="number" min="0" step="0.01" name="unitPrice" value={item.unitPrice} onChange={e=>handleMenuChange(index,e)}/>
              </InputGroup>
             </td>
             <td className="text-end">${(money(item.quantity)*money(item.unitPrice)).toFixed(2)}</td>
             <td className="text-center">
              <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeMenuItem(index)} disabled={menuItems.length===1}><Trash2 size={16}/></Button>
             </td>
            </tr>
           ))}
          </tbody>
          <tfoot>
           <tr>
            <th colSpan="4" className="text-end">Menu Subtotal</th>
            <th className="text-end">${menuSubtotal.toFixed(2)}</th>
            <th></th>
           </tr>
          </tfoot>
         </Table>
        </div>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="dietary" title={<><FileText size={16} className="me-2"/>Dietary</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Known Food Allergies</Form.Label>
           <Form.Control as="textarea" rows={3} name="allergies" value={formData.allergies} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Label>Dietary Requirements</Form.Label>
          <Row>
           {["Vegetarian","Vegan","Gluten-Free","Dairy-Free","Nut-Free","Low-Sodium","Other"].map(item=>(
            <Col sm={6} md={4} lg={3} key={item}>
             <Form.Check type="checkbox" label={item} value={item} checked={formData.dietaryRequirements.includes(item)} onChange={handleDietaryChange}/>
            </Col>
           ))}
          </Row>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Special Instructions</Form.Label>
           <Form.Control as="textarea" rows={3} name="specialInstructions" value={formData.specialInstructions} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="delivery" title={<><Truck size={16} className="me-2"/>Delivery</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Delivery Address</Form.Label>
           <Form.Control type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Mileage</Form.Label>
           <InputGroup>
            <Form.Control type="number" min="0" step="0.1" name="mileage" value={formData.mileage} onChange={handleChange}/>
            <InputGroup.Text>miles</InputGroup.Text>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Mileage Rate</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="mileageRate" value={formData.mileageRate} onChange={handleChange}/>
            <InputGroup.Text>/ mile</InputGroup.Text>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Mileage Charge</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="mileageCharge" value={formData.mileageCharge} onChange={handleChange} placeholder={mileageTotal.toFixed(2)}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Tolls / Parking</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="tollsParking" value={formData.tollsParking} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Delivery Fee</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="deliveryFee" value={formData.deliveryFee} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Setup Fee</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="setupFee" value={formData.setupFee} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="charges" title={<><DollarSign size={16} className="me-2"/>Charges</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Additional Services</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="additionalServices" value={formData.additionalServices} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Staffing</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="staffingTotal" value={formData.staffingTotal} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Equipment / Rentals</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="equipmentRental" value={formData.equipmentRental} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Other Charges</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="otherCharges" value={formData.otherCharges} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Discount</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="discount" value={formData.discount} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={6} lg={4}>
          <Form.Group>
           <Form.Label>Tax</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="tax" value={formData.tax} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
        </Row>
        <hr/>
        <Row className="justify-content-end">
         <Col md={6} lg={5}>
          <Table borderless className="mb-0">
           <tbody>
            <tr>
             <th>Menu Subtotal</th>
             <td className="text-end">${menuSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
             <th>Mileage / Travel</th>
             <td className="text-end">${mileageTotal.toFixed(2)}</td>
            </tr>
            <tr>
             <th>Subtotal</th>
             <td className="text-end">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
             <th>Discount</th>
             <td className="text-end">-${money(formData.discount).toFixed(2)}</td>
            </tr>
            <tr>
             <th>Tax</th>
             <td className="text-end">${money(formData.tax).toFixed(2)}</td>
            </tr>
            <tr className="fs-5">
             <th>Order Total</th>
             <th className="text-end">${orderTotal.toFixed(2)}</th>
            </tr>
           </tbody>
          </Table>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="payment" title={<><DollarSign size={16} className="me-2"/>Payment</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={4}>
          <Form.Group>
           <Form.Label>Deposit Required</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="depositRequired" value={formData.depositRequired} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Deposit Due Date</Form.Label>
           <Form.Control type="date" name="depositDueDate" value={formData.depositDueDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Deposit Paid</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="depositPaid" value={formData.depositPaid} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Remaining Balance</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="text" value={remainingBalance.toFixed(2)} readOnly/>
           </InputGroup>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Final Payment Due Date</Form.Label>
           <Form.Control type="date" name="finalPaymentDueDate" value={formData.finalPaymentDueDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Payment Method</Form.Label>
           <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Zelle">Zelle</option>
            <option value="Cash App">Cash App</option>
            <option value="Check">Check</option>
            <option value="Other">Other</option>
           </Form.Select>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Payment Reference / Confirmation Number</Form.Label>
           <Form.Control type="text" name="paymentReference" value={formData.paymentReference} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="notes" title={<><FileText size={16} className="me-2"/>Notes</>}>
      <Card>
       <Card.Body>
        <Form.Group>
         <Form.Label>Special Requests / Additional Notes</Form.Label>
         <Form.Control as="textarea" rows={5} name="notes" value={formData.notes} onChange={handleChange}/>
        </Form.Group>
       </Card.Body>
      </Card>
     </Tab>
    </Tabs></fieldset>
    <div className="d-flex justify-content-end">
     {readOnly?<Button type="button" onClick={()=>navigate(`/orders/${id}/edit`)}>Edit Catering Order</Button>:<Button type="submit" variant="primary" className="d-flex align-items-center gap-2" disabled={saving}><Save size={18}/>{saving?"Saving...":id?"Update Catering Order":"Save Catering Order"}</Button>}
    </div>
   </Form>
  </section>
 );
}
