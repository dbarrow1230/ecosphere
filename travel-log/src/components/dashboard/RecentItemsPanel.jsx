// src/components/dashboard/RecentItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,MapPin} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function RecentItemsPanel({recentItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Recently Added</p>
     <h2 className="dashboard-section-title">New Travel Entries</h2>
    </div>

    <Link to="/items" className="dashboard-section-link">
     Browse travel log
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {recentItems?.length?recentItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><MapPin size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.category||"Travel Entry"} · {item.location||item.room||"Travel Log"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No new travel entries added yet."/>
    )}
   </ul>
  </section>
 );
}

export default RecentItemsPanel;