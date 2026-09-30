// src/components/dashboard/HarvestPanel.jsx
import {Wheat} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function HarvestPanel({items=[],className=""}){
 return(
  <DashboardSection className={className} kicker="Harvest Tracking" title="Recent Harvests" linkTo="/harvest" linkLabel="View harvests">
   <ul className="dashboard-list">
    {items?.length?items.map(item=>(
     <li key={item._id||item.id||item.name||item.crop} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><Wheat size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.crop||item.name||item.plantName||"Harvest"}</span>
       <span className="dashboard-item-meta">{item.quantity||item.amount||"Recorded"} {item.unit||""} · {item.harvestDate||item.date||item.garden||"Garden harvest"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No harvest records yet."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default HarvestPanel;
