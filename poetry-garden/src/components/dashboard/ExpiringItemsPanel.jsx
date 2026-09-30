// src/components/dashboard/ExpiringItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,CalendarClock} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ExpiringItemsPanel({expiringItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Calendar Check</p>
     <h2 className="dashboard-section-title">Upcoming Poetry Dates</h2>
    </div>

    <Link to="/reminders" className="dashboard-section-link">
     View all
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {expiringItems?.length?expiringItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-accent"><CalendarClock size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Poetry Reminder"}</span>
       <span className="dashboard-item-meta">
        Due {item.dueDate||item.publishDate||item.publicationDate||item.date||"soon"} · {item.type||item.status||"Writing follow-up"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No upcoming poetry dates right now."/>
    )}
   </ul>
  </section>
 );
}

export default ExpiringItemsPanel;
