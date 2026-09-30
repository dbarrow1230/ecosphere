import {useState} from "react";
import {Calendar,dateFnsLocalizer} from "react-big-calendar";
import {format,parse,startOfWeek,getDay} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales={
 "en-US":enUS
};

const localizer=dateFnsLocalizer({
 format,
 parse,
 startOfWeek,
 getDay,
 locales
});

function BookDashboardCalendar({book=null,deadline=null,goal=null}){
 const [view,setView]=useState("month");
 const [date,setDate]=useState(new Date());
 const toLocalDate=value=>{
  if(!value)return null;
  const text=String(value).slice(0,10);
  const [year,month,day]=text.split("-").map(Number);
  return year&&month&&day?new Date(year,month-1,day):new Date(value);
 };

 const events=[
  deadline?.deadlineDate?{
   title:deadline.title||"Book Deadline",
   start:toLocalDate(deadline.deadlineDate),
   end:toLocalDate(deadline.deadlineDate),
   allDay:true
  }:null,
  goal?.dueDate?{
   title:goal.title||"Writing Goal Due",
   start:toLocalDate(goal.dueDate),
   end:toLocalDate(goal.dueDate),
   allDay:true
  }:null,
  book?.deadline?{
   title:`${book.title||"Book"} deadline`,
   start:toLocalDate(book.deadline),
   end:toLocalDate(book.deadline),
   allDay:true
  }:null
 ].filter(Boolean);

 return(
  <article className="book-dashboard-card book-dashboard-calendar-card">
   <div className="book-dashboard-card-header">
    <p className="book-dashboard-card-kicker">Calendar</p>
    <h2 className="book-dashboard-card-title">Book Schedule</h2>
   </div>

   <div className="book-dashboard-calendar-wrap">
    <Calendar
     localizer={localizer}
     events={events}
     startAccessor="start"
     endAccessor="end"
     titleAccessor="title"
     view={view}
     date={date}
     onNavigate={nextDate=>setDate(nextDate)}
     onView={nextView=>setView(nextView)}
     defaultView="month"
     views={["month","agenda"]}
     popup
     tooltipAccessor={event=>event.title}
    />
   </div>

   {!book?(
    <p className="book-dashboard-small">Select a book to show its dates.</p>
   ):null}
  </article>
 );
}

export default BookDashboardCalendar;
