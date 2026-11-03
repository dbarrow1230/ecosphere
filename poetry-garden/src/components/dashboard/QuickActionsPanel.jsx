// src/components/dashboard/QuickActionsPanel.jsx
import {Link} from "react-router-dom";
import {
 Plus,
 BookOpen,
 Users,
 Building2,
 Bell,
} from "lucide-react";

function QuickActionsPanel(){

 return(
  <section className="dashboard-actions">
   <div className="dashboard-actions-head">
    <p className="dashboard-section-kicker">Quick Actions</p>
    <h2 className="dashboard-section-title">Poetry Shortcuts</h2>
   </div>

   <div className="dashboard-actions-grid">
    <Link to="/poems?modal=new" className="dashboard-action dashboard-action-primary">
     <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Add Poem</span>
      <span className="dashboard-action-text">Create a new poetry entry</span>
     </span>
    </Link>

    <Link to="/poems" className="dashboard-action">
     <span className="dashboard-action-icon"><BookOpen size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Poem Archive</span>
      <span className="dashboard-action-text">Browse poems and featured work</span>
     </span>
    </Link>

    <Link to="/authors" className="dashboard-action">
     <span className="dashboard-action-icon"><Users size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Authors</span>
      <span className="dashboard-action-text">Manage poet and author records</span>
     </span>
    </Link>

    <Link to="/publishers" className="dashboard-action">
     <span className="dashboard-action-icon"><Building2 size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Publishers</span>
      <span className="dashboard-action-text">Manage publishers and imprints</span>
     </span>
    </Link>

    <Link to="/reminders" className="dashboard-action">
     <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reminders</span>
      <span className="dashboard-action-text">View writing follow-ups</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;
