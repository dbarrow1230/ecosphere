// src/components/dashboard/PlantLifecyclePanel.jsx
import {TriangleAlert} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function PlantLifecyclePanel({items=[],className=""}){
 return(
  <DashboardSection className={className} kicker="Lifecycle Records" title="Plant Deaths & Ended Starts" linkTo="/plantings" linkLabel="Open instances">
   <ul className="dashboard-list">
    {items?.length?items.map(item=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-warning"><TriangleAlert size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name||"Ended plant instance"}</span>
       <span className="dashboard-item-meta">Started {item.date||item.plantedDate||"Not listed"} · {item.reason||"No reason listed"} · {item.location||"Garden"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No dead or ended plant starts recorded."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default PlantLifecyclePanel;
