// src/components/dashboard/DashboardQuickActions.jsx
import {Link} from "react-router-dom";
import {Plus,PenLine,Bell,Building2} from "lucide-react";

function DashboardQuickActions(){

 return(
  <aside className="dashboard-sidebar">
   <section className="dashboard-actions">
    <div className="dashboard-actions-head">
     <p className="dashboard-section-kicker">Quick Actions</p>
     <h2 className="dashboard-section-title">Poetry Shortcuts</h2>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/poems?modal=new" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">New Poem</span>
       <span className="dashboard-action-text">Create a new poetry entry</span>
      </span>
     </Link>

     <Link to="/authors?modal=new" className="dashboard-action">
      <span className="dashboard-action-icon"><PenLine size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Author Form</span>
       <span className="dashboard-action-text">Open the author entry form</span>
      </span>
     </Link>

     <Link to="/publishers?modal=new" className="dashboard-action">
      <span className="dashboard-action-icon"><Building2 size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Publisher Form</span>
       <span className="dashboard-action-text">Open the publisher entry form</span>
      </span>
     </Link>

     <Link to="/reminders" className="dashboard-action">
      <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Reminders</span>
       <span className="dashboard-action-text">Manage alerts for poems and tasks</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
