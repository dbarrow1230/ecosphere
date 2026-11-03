import {useMemo,useState} from "react";
import {useNavigate} from "react-router-dom";
import moment from "moment";
import {Calendar,momentLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

function DashboardCalendarCard({year,month,items=[],selectedDay="all",onDaySelect,onMonthSelect}){
 const localizer=momentLocalizer(moment);
 const navigate=useNavigate();
 const [calendarView,setCalendarView]=useState("month");

 const calendarDate=new Date(year,month,1);
 const selectedDate=selectedDay==="all"?null:new Date(year,month,Number(selectedDay));
 const events=useMemo(()=>items.map(item=>{
  const date=new Date(item.date);
  return{
   id:item.id,
   title:item.title,
   start:date,
   end:date,
   allDay:true
  };
 }).filter(event=>!Number.isNaN(event.start.getTime())),[items]);

 const dayPropGetter=date=>{
  const isSelected=selectedDate&&
   date.getFullYear()===selectedDate.getFullYear()&&
   date.getMonth()===selectedDate.getMonth()&&
   date.getDate()===selectedDate.getDate();

  return isSelected?{className:"dashboard-rbc-selected-day"}:{};
 };

 return(
  <section className="dashboard-section dashboard-calendar-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Calendar</p>
     <h2 className="dashboard-section-title">Knowledge Calendar</h2>
    </div>
   </div>

   <div className="dashboard-react-calendar">
    <Calendar
     localizer={localizer}
     date={calendarDate}
     view={calendarView}
     views={["month","week","day","agenda"]}
     toolbar
     events={events}
     popup
     selectable
     onSelectSlot={slot=>onDaySelect?.(String(slot.start.getDate()))}
     onSelectEvent={event=>navigate(`/notes/${event.id}?returnTo=/dashboard`)}
     onNavigate={date=>{
      onMonthSelect?.(date);
     }}
     onView={setCalendarView}
     dayPropGetter={dayPropGetter}
    />
   </div>
  </section>
 );
}

export default DashboardCalendarCard;
