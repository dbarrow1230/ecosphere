// src/components/dashboard/ShoppingListPanel.jsx
import {ShoppingCart} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function ShoppingListPanel({missingItems=[],className=""}){
 const sectionClassName=className||"dashboard-section-wide";

 return(
  <DashboardSection className={sectionClassName} kicker="Restock & Prepare" title="Needed Garden Supplies" linkTo="/supplies" linkLabel="Open supplies">
   <ul className="dashboard-list dashboard-list-two-column">
    {missingItems?.length?missingItems.map(item=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-warning"><ShoppingCart size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name||"Garden supply"}</span>
       <span className="dashboard-item-meta">{item.category||"Garden Supply"} · {item.location||item.vendor||item.garden||"Garden"}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" className="dashboard-empty-wide" message="No missing or needed garden supplies right now."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default ShoppingListPanel;
