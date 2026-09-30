// src/pages/calendar/CalendarPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Card,Spinner,Alert,ButtonGroup,Button,Modal,Badge} from "react-bootstrap";
import {Calendar,dateFnsLocalizer,Views} from "react-big-calendar";
import {format,parse,startOfWeek,getDay} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales={"en-US":enUS};
const localizer=dateFnsLocalizer({format,parse,startOfWeek,getDay,locales});

export default function CalendarPage(){
 const [tasks,setTasks]=useState([]);
 const [studies,setStudies]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [view,setView]=useState(Views.MONTH);
 const [date,setDate]=useState(new Date());
 const [selectedEvent,setSelectedEvent]=useState(null);

 useEffect(()=>{
  let ignore=false;

  const loadCalendarData=async()=>{
   setLoading(true);
   setError("");
   try{
    const [tasksRes,studiesRes]=await Promise.all([
     fetch("/api/studies/tasks"),
     fetch("/api/studies")
    ]);

    const [tasksData,studiesData]=await Promise.all([
     tasksRes.json(),
     studiesRes.json()
    ]);

    if(ignore)return;

    if(!tasksRes.ok)throw new Error(tasksData?.message||tasksData?.error||"Failed to load study tasks");
    if(!studiesRes.ok)throw new Error(studiesData?.message||studiesData?.error||"Failed to load studies");

    setTasks(Array.isArray(tasksData?.data)?tasksData.data:[]);
    setStudies(Array.isArray(studiesData?.data)?studiesData.data:[]);
   }
   catch(err){
    if(ignore)return;
    setError(err.message||"Failed to load calendar data");
    setTasks([]);
    setStudies([]);
   }
   finally{
    if(!ignore)setLoading(false);
   }
  };

  loadCalendarData();

  return()=>{
   ignore=true;
  };
 },[]);

 const events=useMemo(()=>{
  const taskEvents=(Array.isArray(tasks)?tasks:[]).flatMap(task=>{
   const start=getTaskStart(task);
   const end=getTaskEnd(task,start);

   if(!start||Number.isNaN(start.getTime()))return [];
   if(!end||Number.isNaN(end.getTime()))return [];

   const safeEnd=end>start?end:new Date(start.getTime()+30*60*1000);
   const multiDay=isDifferentCalendarDay(start,safeEnd);

   return [{
    id:`task-${task._id||task.id}`,
    title:buildTaskTitle(task,start,safeEnd,view),
    start,
    end:safeEnd,
    allDay:view===Views.MONTH&&multiDay,
    resource:{
     sourceType:"task",
     raw:task
    }
   }];
  });

  const studyEvents=(Array.isArray(studies)?studies:[]).flatMap(study=>{
   const range=getStudyRange(study);
   if(!range.start||Number.isNaN(range.start.getTime()))return [];

   const safeEnd=range.end&&range.end>range.start?range.end:new Date(range.start.getTime()+60*60*1000);

   return [{
    id:`study-${study._id||study.id}`,
    title:study.title||study.name||"Untitled Study",
    start:range.start,
    end:safeEnd,
    allDay:view===Views.MONTH&&isDifferentCalendarDay(range.start,safeEnd),
    resource:{
     sourceType:"study",
     raw:study
    }
   }];
  });

  return [...taskEvents,...studyEvents].sort((a,b)=>a.start-b.start);
 },[tasks,studies,view]);

 const eventPropGetter=event=>{
  const sourceType=event?.resource?.sourceType;
  const item=event?.resource?.raw;

  if(sourceType==="task"){
   if(item?.completed){
    return {style:{backgroundColor:"#198754",borderColor:"#198754",color:"#fff"}};
   }
   if(item?.priority?.color==="red"){
    return {style:{backgroundColor:"#dc3545",borderColor:"#dc3545",color:"#fff"}};
   }
   if(item?.priority?.color==="orange"){
    return {style:{backgroundColor:"#fd7e14",borderColor:"#fd7e14",color:"#fff"}};
   }
   if(item?.priority?.color==="green"){
    return {style:{backgroundColor:"#198754",borderColor:"#198754",color:"#fff"}};
   }
   if(item?.status?.slug==="in-progress"){
    return {style:{backgroundColor:"#ffc107",borderColor:"#ffc107",color:"#212529"}};
   }
   if(item?.status?.slug==="open"){
    return {style:{backgroundColor:"#0d6efd",borderColor:"#0d6efd",color:"#fff"}};
   }
   if(item?.status?.slug==="archived"){
    return {style:{backgroundColor:"#6c757d",borderColor:"#6c757d",color:"#fff"}};
   }
   return {style:{backgroundColor:"#6f42c1",borderColor:"#6f42c1",color:"#fff"}};
  }

  if(sourceType==="study"){
   if(item?.completed){
    return {style:{backgroundColor:"#198754",borderColor:"#198754",color:"#fff"}};
   }
   return {style:{backgroundColor:"#0d6efd",borderColor:"#0d6efd",color:"#fff"}};
  }

  return {style:{backgroundColor:"#6f42c1",borderColor:"#6f42c1",color:"#fff"}};
 };

 const components={
  event:EventContent
 };

 return (
  <>
   <Card className="shadow-sm">
    <Card.Body>
     <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <div>
       <h4 className="mb-1">Calendar</h4>
       <div className="text-muted">Tasks, studies, and future in-progress items</div>
      </div>

      <ButtonGroup>
       <Button variant={view===Views.MONTH?"primary":"outline-primary"} onClick={()=>setView(Views.MONTH)}>Month</Button>
       <Button variant={view===Views.WEEK?"primary":"outline-primary"} onClick={()=>setView(Views.WEEK)}>Week</Button>
       <Button variant={view===Views.DAY?"primary":"outline-primary"} onClick={()=>setView(Views.DAY)}>Day</Button>
       <Button variant={view===Views.AGENDA?"primary":"outline-primary"} onClick={()=>setView(Views.AGENDA)}>Agenda</Button>
      </ButtonGroup>
     </div>

     {error?<Alert variant="danger">{error}</Alert>:null}

     {loading?(
      <div className="text-center py-5">
       <Spinner animation="border"/>
      </div>
     ):(
      <div style={{height:"75vh"}}>
       <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        views={[Views.MONTH,Views.WEEK,Views.DAY,Views.AGENDA]}
        onView={nextView=>setView(nextView)}
        onNavigate={nextDate=>setDate(nextDate)}
        onSelectEvent={event=>setSelectedEvent(event)}
        popup
        selectable
        toolbar={false}
        step={15}
        timeslots={4}
        showMultiDayTimes
        scrollToTime={new Date(1970,0,1,8,0,0)}
        eventPropGetter={eventPropGetter}
        components={components}
        messages={{
         today:"Today",
         previous:"Back",
         next:"Next",
         month:"Month",
         week:"Week",
         day:"Day",
         agenda:"Agenda",
         date:"Date",
         time:"Time",
         event:"Event",
         noEventsInRange:"No items in this range"
        }}
       />
      </div>
     )}
    </Card.Body>
   </Card>

   <Modal show={!!selectedEvent} onHide={()=>setSelectedEvent(null)} size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{selectedEvent?.resource?.raw?.title||selectedEvent?.title||"Calendar Item"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {selectedEvent?.resource?.sourceType==="task"&&(
      <>
       <div className="mb-3"><strong>Type:</strong> Task</div>
       <div className="mb-3"><strong>Study:</strong> {selectedEvent.resource.raw.study?.title||selectedEvent.resource.raw.study?.name||"No Study"}</div>
       <div className="mb-3"><strong>Description:</strong> {selectedEvent.resource.raw.description||"-"}</div>
       <div className="mb-3"><strong>Context:</strong> {selectedEvent.resource.raw.context||"-"}</div>
       <div className="mb-3"><strong>Due Label:</strong> {selectedEvent.resource.raw.dueLabel||"-"}</div>
       <div className="mb-3"><strong>Created:</strong> {selectedEvent.resource.raw.createdAt?formatDateTimeLong(new Date(selectedEvent.resource.raw.createdAt)):"-"}</div>
       <div className="mb-3"><strong>Due Date:</strong> {formatDueDateLabel(selectedEvent.resource.raw.dueDate)}</div>
       <div className="mb-3"><strong>Due Time:</strong> {formatTimeLabel(selectedEvent.resource.raw.dueTime)}</div>
       <div className="mb-3"><strong>Calendar Start:</strong> {selectedEvent.start?formatDateTimeLong(selectedEvent.start):"-"}</div>
       <div className="mb-3"><strong>Calendar End:</strong> {selectedEvent.end?formatDateTimeLong(selectedEvent.end):"-"}</div>
       <div className="mb-3">
        <strong>Priority:</strong>{" "}
        {selectedEvent.resource.raw.priority?(
         <Badge bg={getPriorityBadgeColor(selectedEvent.resource.raw.priority.color)}>
          {selectedEvent.resource.raw.priority.title||selectedEvent.resource.raw.priority.name}
         </Badge>
        ):"-"}
       </div>
       <div className="mb-3">
        <strong>Status:</strong>{" "}
        {selectedEvent.resource.raw.status?(
         <Badge bg={getStatusBadgeColor(selectedEvent.resource.raw.status.slug)}>
          {selectedEvent.resource.raw.status.title||selectedEvent.resource.raw.status.name}
         </Badge>
        ):"-"}
       </div>
       <div className="mb-3">
        <strong>Completed:</strong>{" "}
        {selectedEvent.resource.raw.completed?<Badge bg="success">Yes</Badge>:<Badge bg="danger">No</Badge>}
       </div>
       <div className="mb-3"><strong>Completed At:</strong> {selectedEvent.resource.raw.completedAt?formatDateTimeLong(new Date(selectedEvent.resource.raw.completedAt)):"-"}</div>
       <div className="mb-3"><strong>Reminder At:</strong> {selectedEvent.resource.raw.reminderAt?formatDateTimeLong(new Date(selectedEvent.resource.raw.reminderAt)):"-"}</div>
       <div className="mb-3"><strong>Tags:</strong> {Array.isArray(selectedEvent.resource.raw.tags)&&selectedEvent.resource.raw.tags.length?selectedEvent.resource.raw.tags.join(", "):"-"}</div>
      </>
     )}

     {selectedEvent?.resource?.sourceType==="study"&&(
      <>
       <div className="mb-3"><strong>Type:</strong> Study</div>
       <div className="mb-3"><strong>Title:</strong> {selectedEvent.resource.raw.title||selectedEvent.resource.raw.name||"-"}</div>
       <div className="mb-3"><strong>Description:</strong> {selectedEvent.resource.raw.description||"-"}</div>
       <div className="mb-3"><strong>Start:</strong> {selectedEvent.start?formatDateTimeLong(selectedEvent.start):"-"}</div>
       <div className="mb-3"><strong>End:</strong> {selectedEvent.end?formatDateTimeLong(selectedEvent.end):"-"}</div>
      </>
     )}
    </Modal.Body>
   </Modal>
  </>
 );
}

function EventContent({event}){
 return (
  <span title={`${event.title} | ${formatDateTimeLong(event.start)} - ${formatDateTimeLong(event.end)}`}>
   {event.title}
  </span>
 );
}

function getTaskStart(task){
 return toDate(task?.createdAt||task?.updatedAt||null);
}

function getTaskEnd(task,start){
 const dueDateTime=getDueDateTime(task?.dueDate,task?.dueTime);

 if(dueDateTime&&start&&dueDateTime>start){
  return dueDateTime;
 }

 if(dueDateTime){
  return dueDateTime;
 }

 if(start){
  return new Date(start.getTime()+30*60*1000);
 }

 return null;
}

function getDueDateTime(dueDateValue,dueTimeValue){
 if(!dueDateValue)return null;

 const dateOnly=parseCalendarDate(dueDateValue);
 if(!dateOnly)return null;

 const [hours,minutes]=String(dueTimeValue||extractTimeFromDate(dueDateValue)||"00:00").split(":");
 dateOnly.setHours(Number(hours)||0,Number(minutes)||0,0);

 return dateOnly;
}

function parseCalendarDate(value){
 if(!value)return null;

 const raw=String(value);

 if(raw.includes("T")){
  const datePart=raw.slice(0,10);
  const [year,month,day]=datePart.split("-").map(Number);
  if(!year||!month||!day)return null;
  return new Date(year,month-1,day);
 }

 const date=new Date(raw);
 if(Number.isNaN(date.getTime()))return null;
 return new Date(date.getFullYear(),date.getMonth(),date.getDate());
}

function extractTimeFromDate(value){
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 const hh=String(date.getHours()).padStart(2,"0");
 const mm=String(date.getMinutes()).padStart(2,"0");
 return `${hh}:${mm}`;
}

function getStudyRange(study){
 const start=toDate(
  study?.startDate||
  study?.scheduledFor||
  study?.date||
  study?.dueDate||
  study?.createdAt||
  null
 );
 const end=toDate(
  study?.endDate||
  study?.scheduledEnd||
  study?.updatedAt||
  null
 );

 if(!start)return {start:null,end:null,allDay:false};
 if(end&&end>start)return {start,end,allDay:false};

 return {
  start,
  end:new Date(start.getTime()+60*60*1000),
  allDay:false
 };
}

function toDate(value){
 if(!value)return null;
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
}

function isDifferentCalendarDay(start,end){
 return start.getFullYear()!==end.getFullYear()||start.getMonth()!==end.getMonth()||start.getDate()!==end.getDate();
}

function buildTaskTitle(task,start,end,currentView){
 const title=task.title||"Untitled Task";
 const startTime=formatTimeShort(start);
 const endTime=formatTimeShort(end);

 if(currentView===Views.MONTH){
  return isDifferentCalendarDay(start,end)?`${title} (${startTime} → ${endTime})`:`${title} (${startTime} - ${endTime})`;
 }

 return `${title} (${startTime} - ${endTime})`;
}

function formatTimeLabel(timeValue){
 if(!timeValue)return "-";
 const [hours,minutes]=String(timeValue).split(":");
 const date=new Date();
 date.setHours(Number(hours)||0,Number(minutes)||0,0,0);
 return date.toLocaleTimeString([],{"hour":"numeric","minute":"2-digit"});
}

function formatTimeShort(value){
 return value.toLocaleTimeString([],{
  hour:"numeric",
  minute:"2-digit"
 });
}

function formatDueDateLabel(value){
 const date=parseCalendarDate(value);
 return date?date.toLocaleDateString():"-";
}

function formatDateTimeLong(value){
 return value.toLocaleString([],{
  year:"numeric",
  month:"numeric",
  day:"numeric",
  hour:"numeric",
  minute:"2-digit"
 });
}

function getPriorityBadgeColor(color){
 if(color==="red")return "danger";
 if(color==="orange")return "warning";
 if(color==="green")return "success";
 return "secondary";
}

function getStatusBadgeColor(slug){
 if(slug==="completed")return "success";
 if(slug==="in-progress")return "warning";
 if(slug==="open")return "primary";
 if(slug==="archived")return "secondary";
 return "secondary";
}