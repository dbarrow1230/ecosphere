import {useState} from "react";
import {Modal} from "react-bootstrap";
import {CalendarDays,CalendarPlus} from "lucide-react";
import MentorshipCalendar from "../calendar/MentorshipCalendar";
import ScheduleMeetingForm from "../calendar/ScheduleMeetingForm";

function DashboardCalendar({events,mentees,user,onChanged}){
 const[date,setDate]=useState(new Date());
 const[view,setView]=useState("month");
 const[showForm,setShowForm]=useState(false);
 const[selectedEvent,setSelectedEvent]=useState(null);
 const[showDetails,setShowDetails]=useState(false);
 const[deleting,setDeleting]=useState(false);
 const[actionError,setActionError]=useState("");
 const isManagedCalendarEvent=!selectedEvent?.resource?.sourceType;

 const closeForm=()=>{
  setShowForm(false);
  setSelectedEvent(null);
 };
 const deleteEvent=async()=>{
  if(!selectedEvent?.id)return;
  try{
   setDeleting(true);
   setActionError("");
   const response=await fetch(`/api/calendar-events/${selectedEvent.id}`,{method:"DELETE",credentials:"include"});
   if(!response.ok){
    const result=await response.json().catch(()=>null);
    throw new Error(result?.message||"Failed to delete meeting.");
   }
   setShowDetails(false);
   setSelectedEvent(null);
   await onChanged?.();
  }catch(error){
   setActionError(error.message||"Failed to delete meeting.");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <>
   <section className="mentor-dashboard-calendar" id="mentorship-calendar">
    <header>
     <CalendarDays size={18}/>
     <h2>Mentorship Calendar</h2>
     <button type="button" className="mentor-schedule-button" onClick={()=>{setSelectedEvent(null);setShowForm(true);}}><CalendarPlus size={16}/>Schedule Event</button>
    </header>
    <MentorshipCalendar
     events={events}
     date={date}
     view={view}
     onNavigate={setDate}
     onView={setView}
     views={["month","day","agenda"]}
     onSelectEvent={event=>{setSelectedEvent(event);setShowDetails(true);}}
     onSelectSlot={slot=>{setSelectedEvent({start:slot.start,end:new Date(new Date(slot.start).getTime()+30*60000),resource:{}});setShowForm(true);}}
     className="dashboard-rbc"
    />
   </section>

   <Modal show={showForm} onHide={closeForm} centered backdrop="static" keyboard={false} size="xl" dialogClassName="schedule-meeting-modal">
    <Modal.Header closeButton><Modal.Title>{selectedEvent?.id?"Edit Scheduled Event":"Schedule Event"}</Modal.Title></Modal.Header>
    <Modal.Body><ScheduleMeetingForm event={selectedEvent} mentees={mentees} user={user} onCancel={closeForm} onSaved={async()=>{closeForm();await onChanged?.();}}/></Modal.Body>
   </Modal>

   <Modal show={showDetails} onHide={()=>{setShowDetails(false);setSelectedEvent(null);setActionError("");}} centered>
    <Modal.Header closeButton><Modal.Title>Scheduled Event</Modal.Title></Modal.Header>
    <Modal.Body>
     <div className="mentor-readonly-details">
      {selectedEvent?.resource?.eventType!=="task"?<div><strong>Mentee:</strong><span>{selectedEvent?.resource?.menteeName||selectedEvent?.title||"—"}</span></div>:null}
      <div><strong>Type:</strong><span>{selectedEvent?.resource?.eventType||"Session"}</span></div>
      <div><strong>Starts:</strong><span>{selectedEvent?.start?new Date(selectedEvent.start).toLocaleString():"—"}</span></div>
      <div><strong>Ends:</strong><span>{selectedEvent?.end?new Date(selectedEvent.end).toLocaleString():"—"}</span></div>
      <div className="mentor-readonly-wide"><strong>Notes:</strong><span>{selectedEvent?.resource?.notes?.length?selectedEvent.resource.notes.join(" • "):"—"}</span></div>
     </div>
     {actionError?<p className="schedule-form-error">{actionError}</p>:null}
    </Modal.Body>
    <Modal.Footer>
     <button type="button" className="btn-secondary" onClick={()=>{setShowDetails(false);setSelectedEvent(null);setActionError("");}}>Close</button>
     {isManagedCalendarEvent?<button type="button" onClick={()=>{setShowDetails(false);setShowForm(true);}}>Edit</button>:null}
     {isManagedCalendarEvent?<button type="button" className="mentor-delete-schedule" onClick={deleteEvent} disabled={deleting}>{deleting?"Deleting…":"Delete"}</button>:null}
    </Modal.Footer>
   </Modal>
  </>
 );
}

export default DashboardCalendar;
