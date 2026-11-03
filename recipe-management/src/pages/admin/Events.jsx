import Alert from "../../components/AppAlert.jsx";
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Badge} from "react-bootstrap";

function Events(){

 const initialFormData={
  eventName:"",
  clientName:"",
  eventDate:"",
  eventTime:"",
  guestCount:"",
  status:"Pending",
  location:"",
  notes:""
 };

 const [events,setEvents]=useState([]);
 const [formData,setFormData]=useState(initialFormData);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [selectedEvent,setSelectedEvent]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});
 const [filters,setFilters]=useState({
  month:"",
  year:"",
  date:""
 });

 const normalizeStatus=value=>{
  const status=String(value||"").trim();
  if(status==="Confirmed") return "Confirmed";
  if(status==="Prep") return "Prep";
  if(status==="Completed") return "Completed";
  if(status==="Cancelled") return "Cancelled";
  return "Pending";
 };

 const normalizeTime=value=>{
  const time=String(value||"").trim().toUpperCase();
  const match=time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if(match){
   let hours=Number(match[1]);
   const minutes=match[2];
   const meridiem=match[3];
   if(hours<1||hours>12) return value;
   return `${hours}:${minutes} ${meridiem}`;
  }
  const match24=time.match(/^(\d{1,2}):(\d{2})$/);
  if(match24){
   let hours=Number(match24[1]);
   const minutes=match24[2];
   if(hours<0||hours>23) return value;
   const meridiem=hours>=12?"PM":"AM";
   hours=hours%12||12;
   return `${hours}:${minutes} ${meridiem}`;
  }
  return value;
 };

 const formatDateForInput=value=>{
  if(!value) return "";
  if(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return "";
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,"0");
  const day=String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
 };

 useEffect(()=>{
  const loadEvents=async()=>{
   try{
    setLoading(true);
    const res=await fetch("/api/events");
    const data=await res.json();
    const eventList=Array.isArray(data?.events)?data.events:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setEvents(eventList);
   }catch(err){
    console.error("Error loading events:",err);
    setEvents([]);
    setAlert({show:true,variant:"danger",message:"Failed to load events."});
   }finally{
    setLoading(false);
   }
  };

  loadEvents();
 },[]);

 const handleChange=e=>{
  const {name,value}=e.target;
  if(name==="status"){
   setFormData(prev=>({...prev,status:normalizeStatus(value)}));
   return;
  }
  if(name==="eventTime"){
   setFormData(prev=>({...prev,eventTime:value}));
   return;
  }
  setFormData(prev=>({...prev,[name]:value}));
 };

 const handleFilterChange=e=>{
  const {name,value}=e.target;
  setFilters(prev=>({...prev,[name]:value}));
 };

 const resetForm=()=>{
  setFormData(initialFormData);
  setSelectedEvent(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleAddEvent=()=>{
  setSelectedEvent(null);
  setIsEditing(false);
  setIsAdding(true);
  setFormData(initialFormData);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleViewEvent=event=>{
  setSelectedEvent(event);
  setIsEditing(false);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleEditEvent=event=>{
  setSelectedEvent(event);
  setFormData({
   eventName:event.eventName||"",
   clientName:event.clientName||"",
   eventDate:formatDateForInput(event.eventDate),
   eventTime:event.eventTime||"",
   guestCount:event.guestCount||"",
   status:normalizeStatus(event.status),
   location:event.location||"",
   notes:Array.isArray(event.notes)?event.notes.join("\n"):event.notes||""
  });
  setIsEditing(true);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleDeleteEvent=async eventId=>{
  try{
   const confirmed=window.confirm("Are you sure you want to delete this event?");
   if(!confirmed) return;

   closeAlert();

   const res=await fetch(`/api/events/${eventId}`,{
    method:"DELETE"
   });

   const data=await res.json().catch(()=>null);

   if(res.ok){
    setEvents(prev=>prev.filter(event=>event._id!==eventId));
    if(selectedEvent?._id===eventId){
     resetForm();
    }
    setAlert({show:true,variant:"success",message:"Event deleted successfully."});
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to delete event."});
   }
  }catch(err){
   console.error("Error deleting event:",err);
   setAlert({show:true,variant:"danger",message:"Error deleting event."});
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   closeAlert();

   const payload={
    ...formData,
    eventDate:formData.eventDate||null,
    eventTime:normalizeTime(formData.eventTime),
    guestCount:Number(formData.guestCount),
    status:normalizeStatus(formData.status),
    notes:formData.notes?formData.notes.split("\n").map(note=>note.trim()).filter(Boolean):[]
   };

   const url=isEditing&&selectedEvent?`/api/events/${selectedEvent._id}`:"/api/events";
   const method=isEditing&&selectedEvent?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedEvent=data?.event||data?.data;

   if(res.ok&&savedEvent){
    if(isEditing&&selectedEvent){
     setEvents(prev=>prev.map(event=>event._id===savedEvent._id?savedEvent:event));
     setSelectedEvent(savedEvent);
     setIsEditing(false);
     setAlert({show:true,variant:"success",message:"Event updated successfully."});
    }else{
     setEvents(prev=>[savedEvent,...prev]);
     resetForm();
     setAlert({show:true,variant:"success",message:"Event saved successfully."});
    }
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to save event."});
   }
  }catch(err){
   console.error("Error saving event:",err);
   setAlert({show:true,variant:"danger",message:"Error saving event."});
  }finally{
   setSaving(false);
  }
 };

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="Confirmed") return "success";
  if(normalized==="Prep") return "warning";
  if(normalized==="Completed") return "primary";
  if(normalized==="Cancelled") return "danger";
  return "secondary";
 };

 const filteredEvents=useMemo(()=>{
  return events.filter(event=>{
   const eventDate=formatDateForInput(event.eventDate);
   if(filters.date&&eventDate!==filters.date) return false;
   if(filters.month){
    const eventMonth=eventDate?eventDate.split("-")[1]:"";
    if(eventMonth!==filters.month) return false;
   }
   if(filters.year){
    const eventYear=eventDate?eventDate.split("-")[0]:"";
    if(eventYear!==filters.year) return false;
   }
   return true;
  });
 },[events,filters]);

 const metrics=useMemo(()=>{
  const now=new Date();
  const today=new Date();
  today.setHours(0,0,0,0);

  const futureEvents=events.filter(event=>{
   const eventDate=new Date(event.eventDate);
   return !Number.isNaN(eventDate.getTime())&&eventDate>=today;
  }).length;

  const thisWeek=events.filter(event=>{
   const start=new Date(today);
   const end=new Date(today);
   end.setDate(end.getDate()+7);
   const eventDate=new Date(event.eventDate);
   return !Number.isNaN(eventDate.getTime())&&eventDate>=start&&eventDate<end;
  }).length;

  const pending=events.filter(event=>normalizeStatus(event.status)==="Pending").length;

  const currentMonthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const previousMonthStart=new Date(now.getFullYear(),now.getMonth()-1,1);
  const previousMonthEnd=new Date(now.getFullYear(),now.getMonth(),0,23,59,59,999);

  const previousMonthEvents=events.filter(event=>{
   const eventDate=new Date(event.eventDate);
   return !Number.isNaN(eventDate.getTime())&&eventDate>=previousMonthStart&&eventDate<=previousMonthEnd;
  });

  const previousMonthCompleted=previousMonthEvents.filter(event=>{
   const status=normalizeStatus(event.status);
   return status==="Completed";
  }).length;

  const previousMonthCompletionRate=previousMonthEvents.length?Math.round((previousMonthCompleted/previousMonthEvents.length)*100):0;

  const yearOptions=[...new Set(events.map(event=>{
   const eventDate=formatDateForInput(event.eventDate);
   return eventDate?eventDate.split("-")[0]:"";
  }).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));

  return{
   total:events.length,
   thisWeek,
   pending,
   futureEvents,
   previousMonthCompletionRate,
   yearOptions,
   currentMonthStart
  };
 },[events]);

 return(
  <section className="events-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Event Management</p>
       <h1 className="mb-2">Events</h1>
       <p className="text-muted mb-0">
        Create bookings, track client details, and manage event schedules from one place.
       </p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <Row className="g-3 text-center">
         <Col xs={3}>
          <p className="text-muted mb-1">Total</p>
          <h3 className="mb-0">{metrics.total}</h3>
         </Col>
         <Col xs={3}>
          <p className="text-muted mb-1">This Week</p>
          <h3 className="mb-0">{metrics.thisWeek}</h3>
         </Col>
         <Col xs={3}>
          <p className="text-muted mb-1">Pending</p>
          <h3 className="mb-0">{metrics.pending}</h3>
         </Col>
         <Col xs={3}>
          <p className="text-muted mb-1">Future</p>
          <h3 className="mb-0">{metrics.futureEvents}</h3>
         </Col>
        </Row>
        <hr/>
        <div className="text-center">
         <p className="text-muted mb-1">Last Month % Jobs Done</p>
         <h3 className="mb-0">{metrics.previousMonthCompletionRate}%</h3>
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

        {!selectedEvent&&!isEditing&&!isAdding&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Event Form</h2>
          </div>

          <Form>

           <Form.Group className="mb-3" controlId="eventName">
            <Form.Label>Event Name</Form.Label>
            <Form.Control type="text" name="eventName" value="" placeholder="Enter event name" disabled/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="clientName">
            <Form.Label>Client Name</Form.Label>
            <Form.Control type="text" name="clientName" value="" placeholder="Enter client name" disabled/>
           </Form.Group>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="eventDate" value="" disabled/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventTime">
              <Form.Label>Time</Form.Label>
              <Form.Control type="text" name="eventTime" value="" placeholder="12:00 PM" disabled/>
             </Form.Group>
            </Col>
           </Row>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="guestCount">
              <Form.Label>Guest Count</Form.Label>
              <Form.Control type="number" name="guestCount" value="" placeholder="0" disabled/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value="" disabled>
               <option value="">Select status</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" name="location" value="" placeholder="Event location" disabled/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="notes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value="" placeholder="Add event notes, service details, or special requests" disabled/>
           </Form.Group>

           <div className="d-grid">
            <Button variant="primary" type="button" onClick={handleAddEvent}>
             Add Event
            </Button>
           </div>

          </Form>
         </>
        )}

        {isAdding&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Add Event</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>
             Cancel
            </Button>
           </div>
          </div>

          <Form onSubmit={handleSubmit}>

           <Form.Group className="mb-3" controlId="eventName">
            <Form.Label>Event Name</Form.Label>
            <Form.Control type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="Enter event name" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="clientName">
            <Form.Label>Client Name</Form.Label>
            <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Enter client name" required/>
           </Form.Group>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventTime">
              <Form.Label>Time</Form.Label>
              <Form.Control type="text" name="eventTime" value={formData.eventTime} onChange={handleChange} placeholder="12:00 PM" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="guestCount">
              <Form.Label>Guest Count</Form.Label>
              <Form.Control type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} min="1" placeholder="0" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={normalizeStatus(formData.status)} onChange={handleChange}>
               <option value="Pending">Pending</option>
               <option value="Confirmed">Confirmed</option>
               <option value="Prep">Prep</option>
               <option value="Completed">Completed</option>
               <option value="Cancelled">Cancelled</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Event location" required/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="notes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Add event notes, service details, or special requests"/>
           </Form.Group>

           <div className="d-grid">
            <Button variant="primary" type="submit" disabled={saving}>
             {saving?"Saving...":"Save Event"}
            </Button>
           </div>

          </Form>
         </>
        )}

        {selectedEvent&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">View Event</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>
             Close
            </Button>
            <Button variant="primary" size="sm" onClick={()=>handleEditEvent(selectedEvent)}>
             Edit Event
            </Button>
            <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteEvent(selectedEvent._id)}>
             Delete
            </Button>
           </div>
          </div>

          <div className="mb-3">
           <strong>Event Name</strong>
           <div>{selectedEvent.eventName||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Client Name</strong>
           <div>{selectedEvent.clientName||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Date</strong>
             <div>{formatDateForInput(selectedEvent.eventDate)||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Time</strong>
             <div>{selectedEvent.eventTime||"-"}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Guest Count</strong>
             <div>{selectedEvent.guestCount||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div>
              <Badge bg={statusVariant(selectedEvent.status)}>
               {normalizeStatus(selectedEvent.status)}
              </Badge>
             </div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Location</strong>
           <div>{selectedEvent.location||"-"}</div>
          </div>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{Array.isArray(selectedEvent.notes)?selectedEvent.notes.join(", "):selectedEvent.notes||"-"}</div>
          </div>
         </>
        )}

        {isEditing&&selectedEvent&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Edit Event</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={()=>setIsEditing(false)}>
             Cancel
            </Button>
           </div>
          </div>

          <Form onSubmit={handleSubmit}>

           <Form.Group className="mb-3" controlId="eventName">
            <Form.Label>Event Name</Form.Label>
            <Form.Control type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="Enter event name" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="clientName">
            <Form.Label>Client Name</Form.Label>
            <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Enter client name" required/>
           </Form.Group>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="eventTime">
              <Form.Label>Time</Form.Label>
              <Form.Control type="text" name="eventTime" value={formData.eventTime} onChange={handleChange} placeholder="12:00 PM" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="guestCount">
              <Form.Label>Guest Count</Form.Label>
              <Form.Control type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} min="1" placeholder="0" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={normalizeStatus(formData.status)} onChange={handleChange}>
               <option value="Pending">Pending</option>
               <option value="Confirmed">Confirmed</option>
               <option value="Prep">Prep</option>
               <option value="Completed">Completed</option>
               <option value="Cancelled">Cancelled</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Event location" required/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="notes">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Add event notes, service details, or special requests"/>
           </Form.Group>

           <div className="d-grid">
            <Button variant="primary" type="submit" disabled={saving}>
             {saving?"Saving...":"Update Event"}
            </Button>
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

        <div className="d-flex justify-content-between align-items-center mb-3">
         <div>
          <h2 className="h4 mb-1">Upcoming Events</h2>
          <p className="text-muted mb-0">
           Monitor scheduled events and current booking status.
          </p>
         </div>
        </div>

        <Row className="g-3 mb-3">
         <Col md={4}>
          <Form.Group controlId="filterMonth">
           <Form.Label>Month</Form.Label>
           <Form.Select name="month" value={filters.month} onChange={handleFilterChange}>
            <option value="">All Months</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
           </Form.Select>
          </Form.Group>
         </Col>

         <Col md={4}>
          <Form.Group controlId="filterYear">
           <Form.Label>Year</Form.Label>
           <Form.Select name="year" value={filters.year} onChange={handleFilterChange}>
            <option value="">All Years</option>
            {metrics.yearOptions.map(year=>(
             <option key={year} value={year}>{year}</option>
            ))}
           </Form.Select>
          </Form.Group>
         </Col>

         <Col md={4}>
          <Form.Group controlId="filterDate">
           <Form.Label>Date</Form.Label>
           <Form.Control type="date" name="date" value={filters.date} onChange={handleFilterChange}/>
          </Form.Group>
         </Col>
        </Row>

        <div className="mb-3">
         <Button variant="outline-secondary" size="sm" onClick={()=>setFilters({month:"",year:"",date:""})}>
          Clear Filters
         </Button>
        </div>

        <div className="table-responsive">

         <Table hover className="align-middle mb-0">

          <thead>
           <tr>
            <th>Event</th>
            <th>Client</th>
            <th>Date</th>
            <th>Time</th>
            <th>Guests</th>
            <th>Location</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="7" className="text-center text-muted py-4">Loading events...</td>
            </tr>
           )}

           {!loading&&filteredEvents.length===0&&(
            <tr>
             <td colSpan="7" className="text-center text-muted py-4">No events found.</td>
            </tr>
           )}

           {!loading&&filteredEvents.map(event=>(
            <tr key={event._id} onClick={()=>handleViewEvent(event)} style={{cursor:"pointer"}} className={selectedEvent?._id===event._id?"table-active":""}>
             <td>{event.eventName}</td>
             <td>{event.clientName}</td>
             <td>{formatDateForInput(event.eventDate)||"-"}</td>
             <td>{event.eventTime||"-"}</td>
             <td>{event.guestCount||"-"}</td>
             <td>{event.location||"-"}</td>
             <td>
              <Badge bg={statusVariant(event.status)}>
               {normalizeStatus(event.status)}
              </Badge>
             </td>
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

export default Events;