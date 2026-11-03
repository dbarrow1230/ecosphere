// src/components/dashboard/ExpiringItemsPanel.jsx
import {localEventDate} from "../../utils/calendarDate.js";
import {Link} from "react-router-dom";
import {ArrowRight,Clock3} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ExpiringItemsPanel({expiringItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Time Sensitive</p>
     <h2 className="dashboard-section-title">Upcoming Events</h2>
    </div>

    <Link to="/events" className="dashboard-section-link">
     View events
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {expiringItems?.length?expiringItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.eventName||item.name||"Event"}</span>
       <span className="dashboard-item-meta">
        {item.eventDate?localEventDate(item.eventDate).toLocaleDateString():item.expirationDate||item.expiryDate||"Soon"} · {item.location||item.room||item.category||"Catering"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No upcoming catering events in this alert window."/>
    )}
   </ul>
  </section>
 );
}

export default ExpiringItemsPanel;
