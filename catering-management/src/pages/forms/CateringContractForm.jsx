import React,{useEffect,useState} from "react";
import {Row,Col,Card,Form,Button,InputGroup,Tabs,Tab,Alert} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import {FileText,User,CalendarDays,MapPin,Users,Utensils,DollarSign,CreditCard,ClipboardCheck,PenLine,Save} from "lucide-react";

function CateringContractForm({readOnly=false}){
 const {id}=useParams();
 const navigate=useNavigate();
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});
 const [formData,setFormData]=useState({
  contractNumber:"",
  contractDate:"",
  clientName:"",
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
  serviceType:"",
  menuDescription:"",
  servicesDescription:"",
  specialRequests:"",
  contractTotal:"",
  depositRequired:"",
  depositPaid:"",
  depositDueDate:"",
  balanceDueDate:"",
  paymentMethod:"",
  finalGuestCountDueDate:"",
  finalMenuChangesDueDate:"",
  cancellationDeadline:"",
  cancellationTerms:"A deposit is required to reserve the event date. Deposits and payments may be subject to the cancellation terms stated in this agreement.",
  guestCountTerms:"The final guaranteed guest count must be provided by the required deadline. Charges will be based on the final guaranteed guest count or the actual number served, whichever is greater.",
  menuChangeTerms:"Menu selections and special requests must be finalized by the stated deadline. Changes requested after the deadline may be subject to availability and additional charges.",
  paymentTerms:"All required deposits and final payments must be received by the dates stated in this agreement. Services may be suspended or cancelled if required payments are not received.",
  foodSafetyTerms:"Fresh Roots Flavor Kitchen will prepare, transport and serve food using appropriate food-safety practices. The client is responsible for informing Fresh Roots Flavor Kitchen of known food allergies and dietary restrictions before the event.",
  allergyTerms:"Fresh Roots Flavor Kitchen will make reasonable efforts to accommodate disclosed food allergies and dietary restrictions but cannot guarantee an allergen-free environment where cross-contact may occur.",
  leftoversTerms:"Once food has been released to the client after service, Fresh Roots Flavor Kitchen is not responsible for the safety, storage, handling or consumption of leftovers.",
  venueTerms:"The client is responsible for providing accurate venue information and ensuring Fresh Roots Flavor Kitchen has reasonable access to the venue for delivery, setup, service and breakdown.",
  equipmentTerms:"The client is responsible for loss or damage to rented or provided equipment caused by the client, guests or venue personnel beyond normal wear and tear.",
  forceMajeureTerms:"Neither party will be responsible for failure to perform obligations caused by circumstances beyond reasonable control, including severe weather, natural disasters, government restrictions, emergencies or other unavoidable events.",
  additionalTerms:"",
  clientAccepted:false,
  clientPrintedName:"",
  clientSignature:"",
  clientSignatureDate:"",
  representativeName:"",
  representativeSignature:"",
  representativeSignatureDate:"",
 });

 const dateValue=value=>value?String(value).slice(0,10):"";
 useEffect(()=>{
  if(!id)return;let ignore=false;
  fetch(`/api/catering-contracts/${id}`).then(async res=>{const data=await res.json();if(!res.ok)throw new Error(data.message||"Contract could not be loaded.");const contract=data.data;for(const field of ["contractDate","eventDate","depositDueDate","balanceDueDate","finalGuestCountDueDate","finalMenuChangesDueDate","cancellationDeadline","clientSignatureDate","representativeSignatureDate"])contract[field]=dateValue(contract[field]);if(!ignore)setFormData(current=>({...current,...contract}));}).catch(error=>!ignore&&setMessage({type:"danger",text:error.message}));
  return()=>{ignore=true;};
 },[id]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData({...formData,[name]:type==="checkbox"?checked:value});
 };

 const total=parseFloat(formData.contractTotal)||0;
 const deposit=parseFloat(formData.depositPaid)||0;
 const balance=Math.max(total-deposit,0);

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   setMessage({type:"",text:""});
   const res=await fetch(id?`/api/catering-contracts/${id}`:"/api/catering-contracts",{
    method:id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,balance})
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to save catering contract.");
   navigate("/contracts");
  }catch(error){setMessage({type:"danger",text:error.message});}
  finally{setSaving(false);}
 };

 return(
  <section className="operation-form-page">
   <Form onSubmit={handleSubmit}>
    {message.text&&<Alert variant={message.type}>{message.text}</Alert>}
    <header className="operation-form-header"><div><p>Contract Operations</p><h1>{readOnly?"Contract Details":id?"Edit Catering Contract":"Create Catering Contract"}</h1><span>Scope, pricing, deadlines, terms, acceptance, and signatures.</span></div><Button type="button" variant="outline-secondary" onClick={()=>navigate("/contracts")}>Back to Contracts</Button></header>
    <fieldset disabled={readOnly}>
    <Tabs defaultActiveKey="contract" className="mb-4">
     <Tab eventKey="contract" title={<><FileText size={16} className="me-2"/>Contract</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={6}>
          <Form.Group>
           <Form.Label>Contract Number</Form.Label>
           <Form.Control type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} required/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Contract Date</Form.Label>
           <Form.Control type="date" name="contractDate" value={formData.contractDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="client" title={<><User size={16} className="me-2"/>Client</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={6}>
          <Form.Group>
           <Form.Label>Client Name</Form.Label>
           <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} required/>
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
           <Form.Label>Phone Number</Form.Label>
           <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Email Address</Form.Label>
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
           <Form.Label>Event Start Time</Form.Label>
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
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="menu" title={<><Utensils size={16} className="me-2"/>Menu & Services</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Menu Description</Form.Label>
           <Form.Control as="textarea" rows={5} name="menuDescription" value={formData.menuDescription} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Services Included</Form.Label>
           <Form.Control as="textarea" rows={5} name="servicesDescription" value={formData.servicesDescription} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Special Requests</Form.Label>
           <Form.Control as="textarea" rows={4} name="specialRequests" value={formData.specialRequests} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="pricing" title={<><DollarSign size={16} className="me-2"/>Pricing</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={4}>
          <Form.Group>
           <Form.Label>Contract Total</Form.Label>
           <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" min="0" step="0.01" name="contractTotal" value={formData.contractTotal} onChange={handleChange}/>
           </InputGroup>
          </Form.Group>
         </Col>
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
            <Form.Control type="text" value={balance.toFixed(2)} readOnly/>
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
           <Form.Label>Balance Due Date</Form.Label>
           <Form.Control type="date" name="balanceDueDate" value={formData.balanceDueDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label className="d-flex align-items-center gap-1"><CreditCard size={16}/>Payment Method</Form.Label>
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
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="deadlines" title={<><ClipboardCheck size={16} className="me-2"/>Deadlines</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col md={4}>
          <Form.Group>
           <Form.Label>Final Guest Count Due</Form.Label>
           <Form.Control type="date" name="finalGuestCountDueDate" value={formData.finalGuestCountDueDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Final Menu Changes Due</Form.Label>
           <Form.Control type="date" name="finalMenuChangesDueDate" value={formData.finalMenuChangesDueDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={4}>
          <Form.Group>
           <Form.Label>Cancellation Deadline</Form.Label>
           <Form.Control type="date" name="cancellationDeadline" value={formData.cancellationDeadline} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="terms" title={<><FileText size={16} className="me-2"/>Terms</>}>
      <Card>
       <Card.Body>
        <Row className="g-3">
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Payment Terms</Form.Label>
           <Form.Control as="textarea" rows={3} name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Cancellation Terms</Form.Label>
           <Form.Control as="textarea" rows={3} name="cancellationTerms" value={formData.cancellationTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Guest Count Terms</Form.Label>
           <Form.Control as="textarea" rows={3} name="guestCountTerms" value={formData.guestCountTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Menu Change Terms</Form.Label>
           <Form.Control as="textarea" rows={3} name="menuChangeTerms" value={formData.menuChangeTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Food Safety</Form.Label>
           <Form.Control as="textarea" rows={3} name="foodSafetyTerms" value={formData.foodSafetyTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Food Allergies & Dietary Restrictions</Form.Label>
           <Form.Control as="textarea" rows={3} name="allergyTerms" value={formData.allergyTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Leftovers</Form.Label>
           <Form.Control as="textarea" rows={3} name="leftoversTerms" value={formData.leftoversTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Venue Access & Responsibilities</Form.Label>
           <Form.Control as="textarea" rows={3} name="venueTerms" value={formData.venueTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Equipment Loss or Damage</Form.Label>
           <Form.Control as="textarea" rows={3} name="equipmentTerms" value={formData.equipmentTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Force Majeure</Form.Label>
           <Form.Control as="textarea" rows={3} name="forceMajeureTerms" value={formData.forceMajeureTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col xs={12}>
          <Form.Group>
           <Form.Label>Additional Terms</Form.Label>
           <Form.Control as="textarea" rows={4} name="additionalTerms" value={formData.additionalTerms} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
     <Tab eventKey="signatures" title={<><PenLine size={16} className="me-2"/>Signatures</>}>
      <Card>
       <Card.Body>
        <Form.Check type="checkbox" name="clientAccepted" checked={formData.clientAccepted} onChange={handleChange} label="I have reviewed and agree to the services, pricing, payment requirements and terms contained in this catering contract." className="mb-4" required/>
        <Row className="g-3">
         <Col md={6}>
          <Form.Group>
           <Form.Label>Client Printed Name</Form.Label>
           <Form.Control type="text" name="clientPrintedName" value={formData.clientPrintedName} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Client Signature</Form.Label>
           <Form.Control type="text" name="clientSignature" value={formData.clientSignature} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Client Signature Date</Form.Label>
           <Form.Control type="date" name="clientSignatureDate" value={formData.clientSignatureDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Fresh Roots Flavor Kitchen Representative</Form.Label>
           <Form.Control type="text" name="representativeName" value={formData.representativeName} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Representative Signature</Form.Label>
           <Form.Control type="text" name="representativeSignature" value={formData.representativeSignature} onChange={handleChange}/>
          </Form.Group>
         </Col>
         <Col md={6}>
          <Form.Group>
           <Form.Label>Representative Signature Date</Form.Label>
           <Form.Control type="date" name="representativeSignatureDate" value={formData.representativeSignatureDate} onChange={handleChange}/>
          </Form.Group>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Tab>
    </Tabs></fieldset>
    <div className="d-flex justify-content-end mt-4">
     {readOnly?<Button type="button" onClick={()=>navigate(`/contracts/${id}/edit`)}>Edit Contract</Button>:<Button type="submit" variant="primary" className="d-flex align-items-center gap-2" disabled={saving}><Save size={18}/>{saving?"Saving...":id?"Update Contract":"Save Contract"}</Button>}
    </div>
   </Form>
  </section>
 );
}

export default CateringContractForm;
