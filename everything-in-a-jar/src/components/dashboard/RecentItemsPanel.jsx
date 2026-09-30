// src/components/dashboard/RecentItemsPanel.jsx
import {Package2} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function RecentItemsPanel({recentItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Recently Added</p>
     <h2 className="dashboard-section-title">New Products & Batches</h2>
    </div>
   </div>

   <ul className="dashboard-list">
    {recentItems?.length?recentItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><Package2 size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.category||"Small-Batch Product"} · {item.location||item.room||"Production"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No new preserves, ferments, freeze-dried goods, or production batches added yet."/>
    )}
   </ul>
  </section>
 );
}

export default RecentItemsPanel;