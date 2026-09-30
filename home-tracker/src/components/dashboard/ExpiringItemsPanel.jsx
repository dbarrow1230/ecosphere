// src/components/dashboard/ExpiringItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,Clock3} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ExpiringItemsPanel({expiringItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Time Sensitive</p>
     <h2 className="dashboard-section-title">Expiring Soon</h2>
    </div>

    <Link to="/expiring" className="dashboard-section-link">
     View all
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {expiringItems?.length?expiringItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        Expires {item.expirationDate||item.expiryDate||"Soon"} · {item.location||item.room||item.category||"Grocery Inventory"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No grocery items nearing expiration right now."/>
    )}
   </ul>
  </section>
 );
}

export default ExpiringItemsPanel;