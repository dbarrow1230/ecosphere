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
 const events=[
  deadline?.deadlineDate?{
   title:deadline.title||"Book Deadline",
   start:new Date(deadline.deadlineDate),
   end:new Date(deadline.deadlineDate),
   allDay:true
  }:null,
  goal?.dueDate?{
   title:goal.title||"Writing Goal Due",
   start:new Date(goal.dueDate),
   end:new Date(goal.dueDate),
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
     defaultView="month"
     views={["month","agenda"]}
     popup
     style={{height:360}}
    />
   </div>

   {!book?(
    <p className="book-dashboard-small">Select a book to show its dates.</p>
   ):null}
  </article>
 );
}

export default BookDashboardCalendar;