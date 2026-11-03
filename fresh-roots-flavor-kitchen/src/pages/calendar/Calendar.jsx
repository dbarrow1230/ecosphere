// src/pages/calendar/Calendar.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Container,Row,Col,Button,Modal,Badge} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {Calendar as BigCalendar,momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar.css";

const localizer=momentLocalizer(moment);

function Calendar({events}){

 const navigate=useNavigate();
 const [selectedEvent,setSelectedEvent]=useState(null);
 const [loadedEvents,setLoadedEvents]=useState(null);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(Array.isArray(events))return;
  let active=true;
  fetch("/api/events")
   .then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||"Calendar events are unavailable");if(active)setLoadedEvents(Array.isArray(data?.events)?data.events:[]);})
   .catch(loadError=>{if(active){setLoadedEvents([]);setError(loadError.message);}});
  return()=>{active=false;};
 },[events]);

 const calendarEvents=useMemo(()=>{
  const source=Array.isArray(events)?events:loadedEvents;
  if(Array.isArray(source)){
   return source.map(event=>{
    const dateValue=moment(event.eventDate||event.start);
    const start=event.start?new Date(event.start):moment(`${dateValue.format("YYYY-MM-DD")} ${event.eventTime||"9:00 AM"}`,"YYYY-MM-DD h:mm A").toDate();
    return{
     ...event,
     id:event.id||event._id,
     title:event.title||event.eventName||"Untitled Event",
     start,
     end:event.end?new Date(event.end):moment(start).add(2,"hours").toDate(),
     type:event.type||"operations",
     description:Array.isArray(event.notes)?event.notes.join("; "):event.description||event.notes||""
    };
   });
  }

  return[
   {
    id:"c1",
    title:"Prep Session",
    start:new Date(2026,2,31,8,0),
    end:new Date(2026,2,31,10,0),
    type:"prep",
    location:"Kitchen",
    description:"Morning prep for sauces, proteins, and vegetable station."
   },
   {
    id:"c2",
    title:"Inventory Check",
    start:new Date(2026,2,31,11,0),
    end:new Date(2026,2,31,12,0),
    type:"inventory",
    location:"Storage",
    description:"Review low stock items and update reorder list."
   },
   {
    id:"c3",
    title:"Menu Testing",
    start:new Date(2026,3,1,14,0),
    end:new Date(2026,3,1,16,0),
    type:"menu",
    location:"Test Kitchen",
    description:"Trial plating and flavor balancing for seasonal dishes."
   },
   {
    id:"c4",
    title:"Staff Meeting",
    start:new Date(2026,3,2,9,30),
    end:new Date(2026,3,2,10,30),
    type:"staff",
    location:"Kitchen Office",
    description:"Weekly service review and upcoming scheduling."
   },
   {
    id:"c5",
    title:"Deep Clean",
    start:new Date(2026,3,3,18,0),
    end:new Date(2026,3,3,20,0),
    type:"operations",
    location:"Kitchen",
    description:"End-of-week kitchen reset and sanitation check."
   }
  ];
 },[events,loadedEvents]);

 const eventStyleGetter=(event)=>{
  let background="var(--surface-2)";
  let borderColor="var(--border)";
  let color="var(--text)";

  if(event.type==="prep"){
   background="color-mix(in srgb,var(--accent-2) 18%,var(--surface))";
   borderColor="color-mix(in srgb,var(--accent-2) 38%,var(--border))";
  }

  if(event.type==="inventory"){
   background="color-mix(in srgb,var(--accent) 18%,var(--surface))";
   borderColor="color-mix(in srgb,var(--accent) 38%,var(--border))";
  }

  if(event.type==="menu"){
   background="color-mix(in srgb,var(--primary) 14%,var(--surface))";
   borderColor="color-mix(in srgb,var(--primary) 32%,var(--border))";
   color="var(--text-inverse)";
  }

  if(event.type==="staff"){
   background="color-mix(in srgb,var(--success) 18%,var(--surface))";
   borderColor="color-mix(in srgb,var(--success) 38%,var(--border))";
  }

  if(event.type==="operations"){
   background="var(--bg-alt)";
   borderColor="var(--border)";
  }

  return{
   style:{
    background,
    border:`1px solid ${borderColor}`,
    color,
    borderRadius:"10px",
    boxShadow:"none",
    padding:"2px 6px"
   }
  };
 };

 const getEventBadgeClass=(type="")=>{
  if(type==="prep")return "calendar-badge calendar-badge-prep";
  if(type==="inventory")return "calendar-badge calendar-badge-inventory";
  if(type==="menu")return "calendar-badge calendar-badge-menu";
  if(type==="staff")return "calendar-badge calendar-badge-staff";
  return "calendar-badge";
 };

 return(
  <Container className="calendar-page">

   {error&&<Alert variant="warning" dismissible onClose={()=>setError("")}>{error}</Alert>}

   <Row className="align-items-end mb-4">
    <Col md={8}>
     <p className="calendar-eyebrow">Operations Schedule</p>
     <h1 className="calendar-title">Calendar</h1>
     <p className="calendar-text">
      Track prep, inventory, menu development, meetings, and day-to-day kitchen operations.
     </p>
    </Col>

    <Col md={4} className="text-md-end">
     <div className="calendar-actions">
      <Button className="calendar-action" onClick={()=>navigate("/admin/events")}>Add Event</Button>
     </div>
    </Col>
   </Row>

   <Row className="g-3 mb-4">
    <Col md={3}>
     <div className="calendar-stat">
      <span>Total Events</span>
      <strong>{calendarEvents.length}</strong>
     </div>
    </Col>

    <Col md={3}>
     <div className="calendar-stat">
      <span>Prep</span>
      <strong>{calendarEvents.filter((event)=>event.type==="prep").length}</strong>
     </div>
    </Col>

    <Col md={3}>
     <div className="calendar-stat">
      <span>Inventory</span>
      <strong>{calendarEvents.filter((event)=>event.type==="inventory").length}</strong>
     </div>
    </Col>

    <Col md={3}>
     <div className="calendar-stat">
      <span>Staff / Ops</span>
      <strong>{calendarEvents.filter((event)=>event.type==="staff"||event.type==="operations").length}</strong>
     </div>
    </Col>
   </Row>

   <Row>
    <Col>
     <div className="calendar-panel">
      <BigCalendar
       localizer={localizer}
       events={calendarEvents}
       startAccessor="start"
       endAccessor="end"
       popup
       selectable
       views={["month","week","day","agenda"]}
       defaultView="week"
       style={{height:"720px"}}
       eventPropGetter={eventStyleGetter}
       onSelectEvent={(event)=>setSelectedEvent(event)}
      />
     </div>
    </Col>
   </Row>

   <Modal show={!!selectedEvent} onHide={()=>setSelectedEvent(null)} centered>
    <Modal.Header closeButton>
     <Modal.Title>{selectedEvent?.title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {selectedEvent?.type&&(
      <div className="mb-3">
       <Badge className={getEventBadgeClass(selectedEvent.type)}>
        {selectedEvent.type}
       </Badge>
      </div>
     )}

     <p className="calendar-modal-row">
      <strong>Start:</strong> {selectedEvent?.start?moment(selectedEvent.start).format("MMMM D, YYYY h:mm A"):""}
     </p>

     <p className="calendar-modal-row">
      <strong>End:</strong> {selectedEvent?.end?moment(selectedEvent.end).format("MMMM D, YYYY h:mm A"):""}
     </p>

     {selectedEvent?.location&&(
      <p className="calendar-modal-row">
       <strong>Location:</strong> {selectedEvent.location}
      </p>
     )}

     {selectedEvent?.description&&(
      <p className="calendar-modal-row">
       <strong>Details:</strong> {selectedEvent.description}
      </p>
     )}
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default Calendar;
