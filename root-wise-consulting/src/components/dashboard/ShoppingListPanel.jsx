// src/components/dashboard/ShoppingListPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,ListChecks} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ShoppingListPanel({missingItems=[]}){

 return(
  <section className="dashboard-section">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Follow Up</p>
     <h2 className="dashboard-section-title">Writing Tasks</h2>
    </div>

    <Link to="/reminders" className="dashboard-section-link">
     Open list
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list dashboard-list-two-column">
    {missingItems?.length?missingItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-warning"><ListChecks size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Writing Task"}</span>
       <span className="dashboard-item-meta">
        {item.category||item.type||"Poetry Workflow"} · {item.status||"Open"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" className="dashboard-empty-wide" message="No open writing tasks right now."/>
    )}
   </ul>
  </section>
 );
}

export default ShoppingListPanel;
