import {useMemo,useState} from "react";
import {Calendar,momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer=momentLocalizer(moment);

function DashboardCalendarCard({year,month,events=[]}){
 const [calendarDate,setCalendarDate]=useState(()=>new Date(year,month,1));
 const [calendarView,setCalendarView]=useState("month");

 const calendarEvents=useMemo(()=>{
  return (events||[]).map(event=>{
   const start=new Date(event.start||event.date||event.createdAt||event.updatedAt);
   const end=new Date(event.end||event.start||event.date||event.createdAt||event.updatedAt);

   if(Number.isNaN(start.getTime()))return null;

   return{
    ...event,
    title:event.title||event.name||"Business item",
    start,
    end:Number.isNaN(end.getTime())?start:end,
    allDay:event.allDay!==false
   };
  }).filter(Boolean);
 },[events]);

 const monthLabel=calendarDate.toLocaleString("en-US",{month:"long",year:"numeric"});
 const today=new Date();

 return(
  <section className="dashboard-section dashboard-calendar-card dashboard-calendar-card-large">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Production Calendar</p>
     <h2 className="dashboard-section-title">{monthLabel}</h2>
    </div>
   </div>

   <div className="dashboard-calendar dashboard-big-calendar">
    <Calendar
     localizer={localizer}
     events={calendarEvents}
     startAccessor="start"
     endAccessor="end"
     date={calendarDate}
     view={calendarView}
     onNavigate={setCalendarDate}
     onView={setCalendarView}
     getNow={()=>today}
     dayPropGetter={date=>{
      const isToday=date.toDateString()===today.toDateString();
      return isToday?{className:"dashboard-calendar-today"}:{};
     }}
     views={["month","week","day","agenda"]}
     popup
     style={{height:520}}
    />
   </div>
  </section>
 );
}

export default DashboardCalendarCard;
