import {useEffect,useMemo,useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Alert,Card,Col,Container,Form,InputGroup,Row,Spinner} from "react-bootstrap";
import {addDays,addWeeks,endOfDay,startOfDay} from "date-fns";
import MentorshipCalendar from "../components/calendar/MentorshipCalendar";
import "../styles/CalendarPage.css";

const filterOptions=[
 {key:"all",label:"All"},
 {key:"active",label:"Active"}
];

const weekdayMap={
 sunday:0,
 monday:1,
 tuesday:2,
 wednesday:3,
 thursday:4,
 friday:5,
 saturday:6
};

function CalendarPage(){
 const navigate=useNavigate();
 const [mentees,setMentees]=useState([]);
 const [statuses,setStatuses]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [scheduleFilter,setScheduleFilter]=useState("all");
 const [view,setView]=useState("month");
 const [date,setDate]=useState(new Date());

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");
   const [menteesRes,statusesRes]=await Promise.all([
    axios.get("/api/mentees/list"),
    axios.get("/api/statuses/list")
   ]);
   setMentees(Array.isArray(menteesRes.data)?menteesRes.data:menteesRes.data?.mentees||[]);
   setStatuses(Array.isArray(statusesRes.data)?statusesRes.data:statusesRes.data?.statuses||[]);
  }catch(err){
   setError(err.response?.data?.message||"Failed to load calendar data.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchData();
 },[]);

 const getStatusCode=item=>{
  if(item?.isFlagged)return"flagged";
  if(typeof item?.status==="string"){
   const matchedStatus=statuses.find(status=>String(status?._id||"")===String(item.status||""));
   if(matchedStatus?.code)return String(matchedStatus.code).toLowerCase();
   if(matchedStatus?.name)return String(matchedStatus.name).toLowerCase().replace(/\s+/g,"-");
   return String(item.status||"").toLowerCase();
  }
  if(item?.status?.code)return String(item.status.code).toLowerCase();
  if(item?.status?.name)return String(item.status.name).toLowerCase().replace(/\s+/g,"-");
  return"unknown";
 };

 const getFullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim()||"Unnamed Mentee";

 const activeMentees=useMemo(()=>{
  return mentees.filter(mentee=>getStatusCode(mentee)==="active");
 },[mentees,statuses]);

 const incomingMentees=useMemo(()=>{
  return mentees.filter(mentee=>getStatusCode(mentee)==="incoming");
 },[mentees,statuses]);

 const activeEvents=useMemo(()=>{
  return activeMentees.flatMap(mentee=>buildActiveEvents(mentee,getFullName));
 },[activeMentees]);

 const allEvents=useMemo(()=>{
  return [...activeEvents].sort((a,b)=>new Date(a.start)-new Date(b.start));
 },[activeEvents]);

 const filteredEvents=useMemo(()=>{
  const term=search.trim().toLowerCase();
  return allEvents.filter(event=>{
   const statusMatch=scheduleFilter==="all"||event.resource.status===scheduleFilter;
   if(!statusMatch)return false;
   if(!term)return true;
   return[
    event.title,
    event.resource.menteeName,
    event.resource.businessName,
    event.resource.status,
    event.resource.frequencyLabel,
    event.resource.dayLabel,
    event.resource.timeLabel
   ].join(" ").toLowerCase().includes(term);
  });
 },[allEvents,search,scheduleFilter]);

 const stats=useMemo(()=>{
  return{
   active:activeMentees.length,
   incoming:incomingMentees.length,
   blocks:filteredEvents.length
  };
 },[activeMentees,incomingMentees,filteredEvents]);

 if(loading){
  return(
   <section className="calendar-page">
    <div className="calendar-page-loading">
     <Spinner animation="border"/>
    </div>
   </section>
  );
 }

 if(error){
  return(
   <section className="calendar-page">
    <Alert variant="danger" className="mb-0">{error}</Alert>
   </section>
  );
 }

 return(
  <section className="calendar-page">
   <header className="calendar-page-header">
    <div className="calendar-page-header-copy">
     <p className="calendar-page-eyebrow">Schedule</p>
     <h1 className="calendar-page-title">Mentorship Calendar</h1>
     <p className="calendar-page-text">
      Only active mentees with a start date and meeting schedule appear here. Incoming dates remain part of the intake process and do not create calendar meetings.
     </p>
    </div>

    <div className="calendar-page-stats">
     <article className="calendar-stat">
      <span className="calendar-stat-label">Active Mentees</span>
      <strong className="calendar-stat-value">{stats.active}</strong>
     </article>

     <article className="calendar-stat">
      <span className="calendar-stat-label">Incoming Mentees</span>
      <strong className="calendar-stat-value">{stats.incoming}</strong>
     </article>

     <article className="calendar-stat">
      <span className="calendar-stat-label">Scheduled Blocks</span>
      <strong className="calendar-stat-value">{stats.blocks}</strong>
     </article>
    </div>
   </header>

   <Card className="calendar-toolbar-card">
    <Card.Body>
     <Row className="g-3 align-items-end">
      <Col lg={3}>
       <Form.Group>
        <Form.Label>Show</Form.Label>
        <Form.Select value={scheduleFilter} onChange={e=>setScheduleFilter(e.target.value)}>
         {filterOptions.map(option=>(
          <option key={option.key} value={option.key}>{option.label}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col lg={9}>
       <Form.Group>
        <Form.Label>Search</Form.Label>
        <InputGroup>
         <Form.Control
          type="text"
          value={search}
          placeholder="Search mentee, business, day, time..."
          onChange={e=>setSearch(e.target.value)}
         />
        </InputGroup>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Card className="calendar-shell-card">
    <Card.Body>
     <Container fluid className="p-0">
      <MentorshipCalendar
       events={filteredEvents}
       date={date}
       view={view}
       onNavigate={setDate}
       onView={setView}
       onSelectEvent={event=>{
        const menteeId=event?.resource?.menteeId;
        if(menteeId)navigate(`/mentees/${menteeId}/sessions`);
       }}
      />
     </Container>
    </Card.Body>
   </Card>
  </section>
 );
}

export function buildActiveEvents(mentee,getFullName){
 const startDate=parseDateValue(mentee?.externshipStartDate);
 if(!startDate)return[];

 const preferredDay=String(mentee?.preferredMeetingDay||"").toLowerCase();
 const preferredDayIndex=weekdayMap[preferredDay];
 if(preferredDayIndex===undefined)return[];

 const timeParts=parseTimeParts(mentee?.preferredMeetingTime);
 if(!timeParts)return[];
 const duration=Number(mentee?.meetingDuration)||45;
 const frequencyLabel=String(mentee?.meetingFrequency||"Weekly");
 const stepWeeks=frequencyLabel.toLowerCase()==="bi-weekly"?2:1;
 const firstMeetingStart=getFirstOccurrenceOnOrAfter(startDate,preferredDayIndex,timeParts.hours,timeParts.minutes);
 const minimumEndDate=endOfDay(addWeeks(startOfDay(startDate),6));
 const actualEndDate=parseDateValue(mentee?.externshipEndDate);
 const scheduleEnd=actualEndDate?endOfDay(actualEndDate):minimumEndDate;
 const events=[];

 for(let current=new Date(firstMeetingStart);current<=scheduleEnd;current=addWeeks(current,stepWeeks)){
  const end=addMinutes(current,duration);
  events.push({
   id:`active-${mentee._id}-${current.toISOString()}`,
   title:getFullName(mentee),
   start:new Date(current),
   end:new Date(end),
   allDay:false,
   resource:{
    menteeId:String(mentee?._id||""),
    menteeName:getFullName(mentee),
    businessName:mentee?.businessName||"",
    status:"active",
    duration,
    frequencyLabel,
    dayLabel:String(mentee?.preferredMeetingDay||""),
    timeLabel:formatTime(current),
    weekNumber:getWeekNumberFromStart(startDate,current)
   }
  });
 }

 return events;
}

function parseDateValue(value){
 if(!value)return null;
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return null;
 return date;
}

function parseTimeParts(value){
 const raw=String(value||"").trim();
 if(!raw)return null;
 const normalized=raw.toLowerCase().replace(/\s+/g," ").trim();
 const match12=normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
 if(match12){
  let hours=Number(match12[1])||0;
  const minutes=Number(match12[2]||0);
  const meridiem=match12[3];
  if(meridiem==="pm"&&hours<12)hours+=12;
  if(meridiem==="am"&&hours===12)hours=0;
  return{hours,minutes};
 }
 const match24=normalized.match(/^(\d{1,2})(?::(\d{2}))$/);
 if(match24){
  return{
   hours:Number(match24[1])||0,
   minutes:Number(match24[2])||0
  };
 }
 return null;
}

function getFirstOccurrenceOnOrAfter(startDate,dayIndex,hours,minutes){
 const base=startOfDay(startDate);
 const diff=(dayIndex-base.getDay()+7)%7;
 const next=addDays(base,diff);
 next.setHours(hours,minutes,0,0);
 if(next<startDate){
  next.setDate(next.getDate()+7);
 }
 return next;
}

function getWeekNumberFromStart(startDate,currentDate){
 const start=startOfDay(startDate);
 const current=startOfDay(currentDate);
 const diff=Math.floor((current-start)/86400000);
 return Math.floor(diff/7)+1;
}

function addMinutes(value,minutes){
 const date=new Date(value);
 date.setMinutes(date.getMinutes()+minutes);
 return date;
}

function formatTime(value){
 return new Date(value).toLocaleTimeString(undefined,{
  hour:"numeric",
  minute:"2-digit"
 });
}


export default CalendarPage;
