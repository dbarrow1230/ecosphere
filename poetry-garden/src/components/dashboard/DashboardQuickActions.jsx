// src/components/dashboard/DashboardQuickActions.jsx
import {useState} from "react";
import {Link} from "react-router-dom";
import {PanelRightClose,PanelRightOpen,Plus,PenLine,Bell,Building2} from "lucide-react";

function DashboardQuickActions(){
 const [isOpen,setIsOpen]=useState(false);

 return(
  <aside className={isOpen?"dashboard-actions-drawer is-open":"dashboard-actions-drawer"} aria-label="Poetry quick actions">
   <button
    type="button"
    className="dashboard-actions-tab"
    aria-expanded={isOpen}
    aria-controls="dashboard-actions-panel"
    onClick={()=>setIsOpen(open=>!open)}
   >
    <span className="dashboard-actions-tab-icon">
     {isOpen?<PanelRightClose size={18} strokeWidth={2.2}/>:<PanelRightOpen size={18} strokeWidth={2.2}/>}
    </span>
    <span className="dashboard-actions-tab-text">Poetry Actions</span>
   </button>

   <section id="dashboard-actions-panel" className="dashboard-actions">
    <div className="dashboard-actions-head">
     <p className="dashboard-section-kicker">Poetry Actions</p>
     <h2 className="dashboard-section-title">Writing Shortcuts</h2>
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
       <span className="dashboard-action-label">New Author</span>
       <span className="dashboard-action-text">Add a poetry author</span>
      </span>
     </Link>

     <Link to="/publishers?modal=new" className="dashboard-action">
      <span className="dashboard-action-icon"><Building2 size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">New Publisher</span>
       <span className="dashboard-action-text">Add publication details</span>
      </span>
     </Link>

     <Link to="/reminders" className="dashboard-action">
      <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Writing Reminders</span>
       <span className="dashboard-action-text">Manage alerts for poems and tasks</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
