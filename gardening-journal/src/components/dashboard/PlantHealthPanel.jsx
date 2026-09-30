// src/components/dashboard/PlantHealthPanel.jsx
import {TriangleAlert} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function PlantHealthPanel({items=[],className=""}){
 return(
  <DashboardSection className={`dashboard-section-priority ${className}`.trim()} kicker="Attention Needed" title="Plant Health & Issues" linkTo="/issues" linkLabel="View all">
   <ul className="dashboard-list">
    {items?.length?items.map(item=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name||item.plantName||item.issue||"Garden issue"}</span>
       <span className="dashboard-item-meta">{item.issue||item.status||item.severity||"Needs review"} · {item.location||item.garden||item.section||item.category||"Garden"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No open pest or disease issues need attention right now."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default PlantHealthPanel;
