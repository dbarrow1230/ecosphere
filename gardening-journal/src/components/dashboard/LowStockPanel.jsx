// src/components/dashboard/LowStockPanel.jsx
import {TriangleAlert} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function LowStockPanel({lowStockItems=[],className=""}){
 return(
  <DashboardSection className={`dashboard-section-priority ${className}`.trim()} kicker="Attention Needed" title="Low Garden Supplies" linkTo="/supplies" linkLabel="Open supplies">
   <ul className="dashboard-list">
    {lowStockItems?.length?lowStockItems.map(item=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name||"Garden supply"}</span>
       <span className="dashboard-item-meta">{item.quantity} {item.unit||""} · {item.location||item.vendor||item.category||"Garden supply"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No low stock garden supplies right now."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default LowStockPanel;
