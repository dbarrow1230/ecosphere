import {useMemo,useState} from "react";
import {useNavigate} from "react-router-dom";
import moment from "moment";
import {Calendar,momentLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {taskCompletedOnDate,taskOccurrenceDates} from "../../utils/dailyTaskRecurrence.js";

const localDate=value=>`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;

function DashboardCalendarCard({year,month,items=[],taskItems=[],selectedTaskDate,onTaskDateSelect,onTaskSelect,onDaySelect,onMonthSelect}){
 const localizer=momentLocalizer(moment);
 const navigate=useNavigate();
 const [calendarView,setCalendarView]=useState("month");

 const selectedDate=selectedTaskDate?new Date(`${selectedTaskDate}T12:00:00`):null;
 const calendarDate=selectedDate&&selectedDate.getFullYear()===year&&selectedDate.getMonth()===month?selectedDate:new Date(year,month,1);
 const calendarYear=calendarDate.getFullYear();
 const calendarMonth=calendarDate.getMonth();
 const events=useMemo(()=>[...items.map(item=>{
  const date=new Date(item.date);
  return{
   id:item.id,
   title:item.title,
   start:date,
   end:date,
   allDay:true,
   kind:"note"
  };
 }),...taskItems.flatMap(task=>taskOccurrenceDates(
  task,
  localDate(new Date(calendarYear,calendarMonth-1,1)),
  localDate(new Date(calendarYear,calendarMonth+2,0))
 ).map(occurrenceDate=>{
  const start=new Date(`${occurrenceDate}T${task.startTime||"12:00"}:00`);
  const end=new Date(start.getTime()+30*60*1000);
  const completed=taskCompletedOnDate(task,occurrenceDate);
  return{id:`${task._id}:${occurrenceDate}`,title:`${completed?"✓ ":""}${task.title}`,start,end,allDay:!task.startTime,kind:"task",task:{...task,occurrenceDate,completed}};
 }))].filter(event=>!Number.isNaN(event.start.getTime())),[items,taskItems,calendarYear,calendarMonth]);

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
     onSelectSlot={slot=>{onTaskDateSelect?.(localDate(slot.start));onDaySelect?.(String(slot.start.getDate()));}}
     onSelectEvent={event=>event.kind==="task"?onTaskSelect?.(event.task):navigate(`/notes/${event.id}?returnTo=/dashboard`)}
     eventPropGetter={event=>event.kind==="task"?{className:`dashboard-rbc-task-event${event.task.completed?" is-complete":""}`}:{}}
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
