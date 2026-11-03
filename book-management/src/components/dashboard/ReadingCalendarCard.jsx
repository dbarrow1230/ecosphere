import {Calendar,momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer=momentLocalizer(moment);

function ReadingCalendarCard({events,view,date,onViewChange,onDateChange}) {
 const handleView=nextView=>{
  if(onViewChange)onViewChange(nextView);
 };

 const handleNavigate=nextDate=>{
  if(onDateChange)onDateChange(nextDate);
 };

 return(
  <section className="dashboard-section dashboard-reading-calendar">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Calendar</p>
     <h2 className="dashboard-section-title">Reading Calendar</h2>
    </div>
   </div>

   <div className="dashboard-rbc-shell">
    <Calendar
     localizer={localizer}
     events={events}
     startAccessor="start"
     endAccessor="end"
     view={view}
     date={date}
     onView={handleView}
     onNavigate={handleNavigate}
     views={["month","week","day","agenda"]}
     popup
     style={{height:420}}
    />
   </div>
  </section>
 );
}

export default ReadingCalendarCard;
