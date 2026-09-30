// src/components/dashboard/ExpiringItemsPanel.jsx
import {Clock3} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ExpiringItemsPanel({expiringItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Vendor Control</p>
     <h2 className="dashboard-section-title">Compliance Review</h2>
    </div>
   </div>

   <ul className="dashboard-list">
    {expiringItems?.length?expiringItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        Review by {item.expirationDate||item.expiryDate||"Soon"} · {item.location||item.room||item.category||"Vendor compliance"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No vendor compliance review dates are currently due."/>
    )}
   </ul>
  </section>
 );
}

export default ExpiringItemsPanel;
