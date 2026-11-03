// src/components/dashboard/RecentItemsPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,ClipboardList} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function RecentItemsPanel({recentItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Order Desk</p>
     <h2 className="dashboard-section-title">Recent Orders</h2>
    </div>

    <Link to="/orders" className="dashboard-section-link">
     View orders
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {recentItems?.length?recentItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><ClipboardList size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.orderNumber||item.name||"Order"}</span>
       <span className="dashboard-item-meta">
        {item.status||"Order"} · {item.serviceType||"Catering"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No recent catering orders yet."/>
    )}
   </ul>
  </section>
 );
}

export default RecentItemsPanel;
