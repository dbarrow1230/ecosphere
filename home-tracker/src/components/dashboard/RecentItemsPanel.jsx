// src/components/dashboard/RecentItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,Package2} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function RecentItemsPanel({recentItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Recently Added</p>
     <h2 className="dashboard-section-title">New Grocery Items</h2>
    </div>

    <Link to="/items" className="dashboard-section-link">
     Browse inventory
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {recentItems?.length?recentItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><Package2 size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.category||"General Grocery"} · {item.location||item.room||"Store Shelf"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No new grocery items added yet."/>
    )}
   </ul>
  </section>
 );
}

export default RecentItemsPanel;