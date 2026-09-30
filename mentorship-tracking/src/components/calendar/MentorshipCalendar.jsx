import {useMemo} from "react";
import {Calendar,dateFnsLocalizer} from "react-big-calendar";
import {format,parse,startOfWeek,getDay} from "date-fns";
import {enUS} from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer=dateFnsLocalizer({
 format,
 parse,
 startOfWeek:date=>startOfWeek(date,{weekStartsOn:0}),
 getDay,
 locales:{"en-US":enUS}
});

function CalendarEvent({event}){
 return(
  <div className="calendar-event-inner">
   <div className="calendar-event-name">{event.resource?.menteeName||event.title}</div>
   <div className="calendar-event-time">{event.resource?.timeLabel||""}</div>
  </div>
 );
}

function MentorshipCalendar({
 events,
 date,
 view,
 onNavigate,
 onView,
 onSelectEvent,
 onSelectSlot,
 views=["month","week","day","agenda"],
 toolbar=true,
 className=""
}){
 const components=useMemo(()=>({event:CalendarEvent}),[]);
 const eventPropGetter=event=>({
  className:`calendar-rbc-event calendar-rbc-event-${event?.resource?.status||"active"}`
 });
 const handleNavigate=(nextDate,nextView,action)=>{
  if(action==="TODAY"){
   onNavigate?.(new Date(),"day",action);
   if(views.includes("day"))onView?.("day");
   return;
  }
  onNavigate?.(nextDate,nextView,action);
 };

 return(
  <Calendar
   localizer={localizer}
   events={events}
   startAccessor="start"
   endAccessor="end"
   titleAccessor="title"
   date={date}
   view={view}
   onNavigate={handleNavigate}
   onView={onView}
   onSelectEvent={onSelectEvent}
   onSelectSlot={onSelectSlot}
   selectable={Boolean(onSelectSlot)}
   views={views}
   toolbar={toolbar}
   popup
   showAllEvents
   step={15}
   timeslots={2}
   eventPropGetter={eventPropGetter}
   components={components}
   className={`calendar-rbc ${className}`.trim()}
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
    event:"Mentee"
   }}
  />
 );
}

export default MentorshipCalendar;
