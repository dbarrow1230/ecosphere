import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer=momentLocalizer(moment);

function DashboardCalendarCard({events=[],className=""}){
 const today=new Date();

 const eventStyleGetter=event=>{
  const colorMap={
   task:"#b45309",
   harvest:"#15803d",
   journal:"#0f766e",
   health:"#dc2626",
   lifecycle:"#6b7280"
  };

  return {
   className:`dashboard-calendar-event dashboard-calendar-event-${event.resource?.type||"default"}`,
   style:{
    backgroundColor:colorMap[event.resource?.type]||"#0f5132",
    borderColor:colorMap[event.resource?.type]||"#0f5132"
   }
  };
 };

 return(
  <section className={`dashboard-section dashboard-calendar-card ${className}`.trim()}>
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Planning Calendar</p>
     <h2 className="dashboard-section-title">Garden schedule</h2>
    </div>
   </div>

   <div className="dashboard-big-calendar">
    <Calendar
     localizer={localizer}
     events={events}
     startAccessor="start"
     endAccessor="end"
     defaultDate={today}
     defaultView="month"
     views={["month","week","agenda"]}
     popup
     eventPropGetter={eventStyleGetter}
     style={{height:390}}
    />
   </div>
  </section>
 );
}

export default DashboardCalendarCard;
