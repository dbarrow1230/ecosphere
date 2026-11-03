// src/pages/staff/Scheduler.jsx
import {useEffect,useMemo,useState,useCallback} from "react";
import {Alert,Container,Row,Col,Button,Modal,Form,Tabs,Tab} from "react-bootstrap";
import {Calendar,momentLocalizer,Views} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../../styles/staff-scheduler.css";

const localizer=momentLocalizer(moment);
const DnDCalendar=withDragAndDrop(Calendar);

function Scheduler({events,staff}){

 const [view,setView]=useState(Views.WEEK);
 const [date,setDate]=useState(new Date());
 const [selectedEvent,setSelectedEvent]=useState(null);
 const [showModal,setShowModal]=useState(false);
 const [loadedStaff,setLoadedStaff]=useState([]);
 const [message,setMessage]=useState("");
 const [publishing,setPublishing]=useState(false);

 const staffMembers=useMemo(()=>staff?.length?staff:loadedStaff,[staff,loadedStaff]);

 const [calendarEvents,setCalendarEvents]=useState(()=>{
  if(events?.length){
   return events.map((event)=>({
    ...event,
    id:event.id||event._id||crypto.randomUUID(),
    title:event.title||`${event.staffName||"Staff"} Shift`,
    start:new Date(event.start),
    end:new Date(event.end),
    area:event.area||"boh",
    status:event.status||"Scheduled",
    staffId:event.staffId||"",
    staffName:event.staffName||""
   }));
  }

  return[
   {
    id:"e1",
    title:"Darrell Barrow • Executive Chef",
    staffId:"s1",
    staffName:"Darrell Barrow",
    role:"Executive Chef",
    area:"boh",
    status:"Scheduled",
    start:new Date(2026,2,31,8,0),
    end:new Date(2026,2,31,16,0)
   },
   {
    id:"e2",
    title:"Nia Clarke • Prep Cook",
    staffId:"s2",
    staffName:"Nia Clarke",
    role:"Prep Cook",
    area:"boh",
    status:"Scheduled",
    start:new Date(2026,2,31,7,0),
    end:new Date(2026,2,31,15,0)
   },
   {
    id:"e3",
    title:"Ava Jordan • Expeditor",
    staffId:"s4",
    staffName:"Ava Jordan",
    role:"Expeditor",
    area:"foh",
    status:"Scheduled",
    start:new Date(2026,2,31,10,0),
    end:new Date(2026,2,31,18,0)
   },
   {
    id:"e4",
    title:"Micah Fields • Order Support",
    staffId:"s5",
    staffName:"Micah Fields",
    role:"Order Support",
    area:"foh",
    status:"Scheduled",
    start:new Date(2026,3,1,11,0),
    end:new Date(2026,3,1,19,0)
   }
  ];
 });

 useEffect(()=>{
  if(events?.length)return;
  let active=true;
  Promise.all([fetch("/api/staff"),fetch("/api/shifts")])
   .then(async responses=>{
    const [staffResponse,shiftResponse]=responses;
    const [staffData,shiftData]=await Promise.all([staffResponse.json().catch(()=>({})),shiftResponse.json().catch(()=>({}))]);
    if(!staffResponse.ok||!shiftResponse.ok)throw new Error(staffData?.message||shiftData?.message||"Schedule data is unavailable");
    if(!active)return;
    setLoadedStaff(Array.isArray(staffData?.staff)?staffData.staff:[]);
    setCalendarEvents((shiftData?.shifts||[]).map(event=>({...event,id:event._id,start:new Date(event.start),end:new Date(event.end),staffId:event.staff?._id||event.staff,staffName:event.staff?.name||""})));
   })
   .catch(error=>{if(active)setMessage(error.message);});
  return()=>{active=false;};
 },[events]);

 const bohEvents=useMemo(()=>calendarEvents.filter((event)=>event.area==="boh"),[calendarEvents]);
 const fohEvents=useMemo(()=>calendarEvents.filter((event)=>event.area==="foh"),[calendarEvents]);

 const onEventDrop=useCallback(async({event,start,end})=>{
  setCalendarEvents((prev)=>prev.map((item)=>item.id===event.id?{...item,start,end}:item));
  if(event._id)await fetch(`/api/shifts/${event._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({start,end})});
 },[]);

 const onEventResize=useCallback(async({event,start,end})=>{
  setCalendarEvents((prev)=>prev.map((item)=>item.id===event.id?{...item,start,end}:item));
  if(event._id)await fetch(`/api/shifts/${event._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({start,end})});
 },[]);

 const onSelectEvent=useCallback((event)=>{
  setSelectedEvent(event);
  setShowModal(true);
 },[]);

 const onSelectSlot=useCallback(({start,end})=>{
  const fallbackStaff=staffMembers[0];
  if(!fallbackStaff){setMessage("Add a staff member before creating a shift.");return;}
  const newEvent={
   id:crypto.randomUUID(),
   title:`${fallbackStaff.name} • ${fallbackStaff.role}`,
   staffId:fallbackStaff._id,
   staffName:fallbackStaff.name,
   role:fallbackStaff.role,
   area:fallbackStaff.area,
   status:"Scheduled",
   start,
   end
  };
  setSelectedEvent(newEvent);
  setShowModal(true);
 },[staffMembers]);

 const updateSelectedEvent=(field,value)=>{
  setSelectedEvent((prev)=>{
   if(!prev)return prev;
   const next={...prev,[field]:value};
   if(field==="staffId"){
    const member=staffMembers.find((item)=>item._id===value);
    if(member){
     next.staffId=member._id;
     next.staffName=member.name;
     next.role=member.role;
     next.area=member.area;
     next.title=`${member.name} • ${member.role}`;
    }
   }
   return next;
  });
 };

 const saveSelectedEvent=async()=>{
  if(!selectedEvent)return;
  try{
   const response=await fetch(selectedEvent._id?`/api/shifts/${selectedEvent._id}`:"/api/shifts",{method:selectedEvent._id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({staff:selectedEvent.staffId,title:selectedEvent.title,role:selectedEvent.role,area:selectedEvent.area,status:selectedEvent.status,start:selectedEvent.start,end:selectedEvent.end,published:selectedEvent.published||false})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data?.message||"Shift could not be saved");
   const saved={...data.shift,id:data.shift._id,start:new Date(data.shift.start),end:new Date(data.shift.end),staffId:data.shift.staff?._id||data.shift.staff,staffName:data.shift.staff?.name||selectedEvent.staffName};
   setCalendarEvents(prev=>selectedEvent._id?prev.map(item=>item.id===selectedEvent.id?saved:item):[...prev,saved]);
   setShowModal(false);
  }catch(error){setMessage(error.message);}
 };

 const deleteSelectedEvent=async()=>{
  if(!selectedEvent)return;
  if(selectedEvent._id){const response=await fetch(`/api/shifts/${selectedEvent._id}`,{method:"DELETE"});if(!response.ok){const data=await response.json().catch(()=>({}));setMessage(data?.message||"Shift could not be deleted");return;}}
  setCalendarEvents((prev)=>prev.filter((item)=>item.id!==selectedEvent.id));
  setShowModal(false);
 };

 const publishSchedule=async()=>{
  setPublishing(true);setMessage("");
  try{const response=await fetch("/api/shifts/publish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:calendarEvents.map(item=>item._id).filter(Boolean)})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||"Schedule could not be published");setCalendarEvents(prev=>prev.map(item=>({...item,published:true})));setMessage(data.message);}catch(error){setMessage(error.message);}finally{setPublishing(false);}
 };

 const eventStyleGetter=(event)=>{
  let className="staff-scheduler-event";
  if(event.area==="boh")className+=" staff-scheduler-event-boh";
  if(event.area==="foh")className+=" staff-scheduler-event-foh";
  return{className};
 };

 const renderCalendar=(list)=>(
  <div className="staff-scheduler-panel">
   <DnDCalendar
    localizer={localizer}
    events={list}
    startAccessor="start"
    endAccessor="end"
    view={view}
    date={date}
    onView={setView}
    onNavigate={setDate}
    onEventDrop={onEventDrop}
    onEventResize={onEventResize}
    onSelectEvent={onSelectEvent}
    onSelectSlot={onSelectSlot}
    selectable
    resizable
    popup
    step={30}
    timeslots={2}
    views={[Views.MONTH,Views.WEEK,Views.DAY,Views.AGENDA]}
    defaultView={Views.WEEK}
    min={new Date(2026,0,1,6,0)}
    max={new Date(2026,0,1,23,0)}
    style={{height:720}}
    eventPropGetter={eventStyleGetter}
   />
  </div>
 );

 return(
  <Container className="staff-scheduler-page">
   {message&&<Alert variant={message.includes("success")?"success":"info"} dismissible onClose={()=>setMessage("")}>{message}</Alert>}
   <Row className="align-items-end mb-4">
    <Col md={8}>
     <p className="staff-scheduler-eyebrow">Staff Scheduling</p>
     <h1 className="staff-scheduler-title">Scheduler</h1>
     <p className="staff-scheduler-text">
      Drag, drop, and resize shifts for front and back of house coverage.
     </p>
    </Col>

    <Col md={4} className="text-md-end">
     <div className="staff-scheduler-actions">
      <Button className="staff-scheduler-action" onClick={publishSchedule} disabled={publishing||calendarEvents.length===0}>{publishing?"Publishing...":"Publish Schedule"}</Button>
     </div>
    </Col>
   </Row>

   <Row className="g-3 mb-4">
    <Col md={4}>
     <div className="staff-scheduler-stat">
      <span>Total Shifts</span>
      <strong>{calendarEvents.length}</strong>
     </div>
    </Col>

    <Col md={4}>
     <div className="staff-scheduler-stat">
      <span>BOH Shifts</span>
      <strong>{bohEvents.length}</strong>
     </div>
    </Col>

    <Col md={4}>
     <div className="staff-scheduler-stat">
      <span>FOH Shifts</span>
      <strong>{fohEvents.length}</strong>
     </div>
    </Col>
   </Row>

   <Row>
    <Col>
     <div className="staff-scheduler-tabs-wrap">
      <Tabs defaultActiveKey="boh" id="staff-scheduler-tabs" className="staff-scheduler-tabs" fill>
       <Tab eventKey="boh" title={`BOH (${bohEvents.length})`}>
        <div className="staff-scheduler-tab-body">
         {renderCalendar(bohEvents)}
        </div>
       </Tab>

       <Tab eventKey="foh" title={`FOH (${fohEvents.length})`}>
        <div className="staff-scheduler-tab-body">
         {renderCalendar(fohEvents)}
        </div>
       </Tab>

       <Tab eventKey="all" title={`All (${calendarEvents.length})`}>
        <div className="staff-scheduler-tab-body">
         {renderCalendar(calendarEvents)}
        </div>
       </Tab>
      </Tabs>
     </div>
    </Col>
   </Row>

   <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Edit Shift</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Form>
      <Form.Group className="mb-3">
       <Form.Label>Staff Member</Form.Label>
       <Form.Select value={selectedEvent?.staffId||""} onChange={(e)=>updateSelectedEvent("staffId",e.target.value)}>
        {staffMembers.map((member)=>(
         <option key={member._id} value={member._id}>
          {member.name} • {member.role}
         </option>
        ))}
       </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Status</Form.Label>
       <Form.Select value={selectedEvent?.status||"Scheduled"} onChange={(e)=>updateSelectedEvent("status",e.target.value)}>
        <option value="Scheduled">Scheduled</option>
        <option value="Confirmed">Confirmed</option>
        <option value="On Call">On Call</option>
       </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Area</Form.Label>
       <Form.Control value={selectedEvent?.area?.toUpperCase()||""} readOnly />
      </Form.Group>

      <Form.Group className="mb-0">
       <Form.Label>Shift</Form.Label>
       <Form.Control
        value={selectedEvent?.start&&selectedEvent?.end?`${moment(selectedEvent.start).format("MMM D, h:mm A")} — ${moment(selectedEvent.end).format("h:mm A")}`:""}
        readOnly
       />
      </Form.Group>
     </Form>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="outline-danger" onClick={deleteSelectedEvent}>Delete</Button>
     <Button variant="secondary" onClick={()=>setShowModal(false)}>Close</Button>
     <Button className="staff-scheduler-action" onClick={saveSelectedEvent}>Save</Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default Scheduler;
