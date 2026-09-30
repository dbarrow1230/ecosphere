// src/components/dashboard/ExpiringItemsPanel.jsx
import {Clock3} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function ExpiringItemsPanel({expiringItems=[],className=""}){
 return(
  <DashboardSection className={className} kicker="Time Sensitive" title="Upcoming Garden Tasks" linkTo="/tasks" linkLabel="View all">
   <ul className="dashboard-list">
    {expiringItems?.length?expiringItems.map(item=>(
     <li key={item._id||item.id||item.name||item.title} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Garden task"}</span>
       <span className="dashboard-item-meta">Due {item.dueDate||item.taskDate||item.expirationDate||item.expiryDate||"soon"} · {item.garden||item.location||item.section||item.category||"Garden"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No upcoming garden tasks right now."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default ExpiringItemsPanel;
