import {Link} from "react-router-dom";
import {useState} from "react";
import {CalendarDays,ClipboardList,Library,Plus,X} from "lucide-react";

function DashboardQuickActions(){
 const [open,setOpen]=useState(false);

 return(
  <aside className={open?"dashboard-actions-drawer open":"dashboard-actions-drawer"} aria-label="Quick Actions">
   <button
    type="button"
    className="dashboard-actions-tab"
    onClick={()=>setOpen(prev=>!prev)}
    aria-expanded={open}
    aria-controls="dashboard-quick-actions"
   >
    Quick Actions
   </button>

   <section className="dashboard-actions">
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Shortcuts</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions">
      <X size={18} strokeWidth={2.2}/>
     </button>
    </div>

    <div id="dashboard-quick-actions" className="dashboard-actions-grid">
     <Link to="/forms/studies/study?mode=create&from=dashboard" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Create Bible Study</span>
       <span className="dashboard-action-text">Capture Scripture Explorer output and apply methods</span>
      </span>
     </Link>

     <Link to="/forms/studies/daily-note?from=dashboard" className="dashboard-action">
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Daily Notes</span>
       <span className="dashboard-action-text">Journal scriptures that stood out</span>
      </span>
     </Link>

     <Link to="/study-tasks?from=dashboard" className="dashboard-action">
      <span className="dashboard-action-icon"><ClipboardList size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Study Tasks</span>
       <span className="dashboard-action-text">Review open study work</span>
      </span>
     </Link>

     <Link to="/methods?from=dashboard" className="dashboard-action">
      <span className="dashboard-action-icon"><Library size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Study Methods</span>
       <span className="dashboard-action-text">Browse method templates</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
