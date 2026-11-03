import {Link} from "react-router-dom";
import {CalendarClock} from "lucide-react";

function DashboardUpcomingSchedule({events=[]}){
 return(
  <section className="mentor-upcoming-schedule" id="upcoming-schedule">
   <header>
    <CalendarClock size={18}/>
    <h2>Scheduled — Next 7 Days</h2>
   </header>
   {events.length?events.map(event=>{
    const content=(
     <>
      <strong>{event.resource?.menteeName||event.title}</strong>
      <span>{new Date(event.start).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span>
      <small>{new Date(event.start).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</small>
     </>
    );
    return event.resource?.menteeId?(
     <Link className="mentor-upcoming-row" key={event.id} to={`/mentees?focus=${event.resource.menteeId}&action=view`} state={{fromDashboard:true}}>{content}</Link>
    ):(
     <div className="mentor-upcoming-row" key={event.id}>{content}</div>
    );
   }):<p className="mentor-empty">No events scheduled in the next seven days.</p>}
  </section>
 );
}

export default DashboardUpcomingSchedule;
