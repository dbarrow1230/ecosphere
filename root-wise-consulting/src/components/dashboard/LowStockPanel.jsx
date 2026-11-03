// src/components/dashboard/LowStockPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,PenLine} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function LowStockPanel({lowStockItems=[]}){

 return(
  <section className="dashboard-section dashboard-section-priority">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Attention Needed</p>
     <h2 className="dashboard-section-title">Drafts Needing Work</h2>
    </div>

    <Link to="/poems" className="dashboard-section-link">
     View all
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {lowStockItems?.length?lowStockItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon"><PenLine size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Untitled Draft"}</span>
       <span className="dashboard-item-meta">
        {item.status||item.stage||"Draft"} · {item.genre?.name||item.genre||"Poetry"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No drafts need attention right now."/>
    )}
   </ul>
  </section>
 );
}

export default LowStockPanel;
