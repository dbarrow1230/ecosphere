// src/components/dashboard/QuickActionsPanel.jsx
import {Link} from "react-router-dom";
import {Inbox,BookOpenText,Users,NotebookPen,Link2,Network,FileOutput,ChevronLeft,ChevronRight} from "lucide-react";

function QuickActionsPanel({open=true,onToggle}){

 return(
  <section className={`dashboard-actions ${open?"is-open":"is-closed"}`.trim()}>
   {onToggle?(
    <button
     className="dashboard-actions-toggle"
     type="button"
     onClick={onToggle}
     aria-label={open?"Close quick actions":"Open quick actions"}
     aria-expanded={open}
    >
     {open?<ChevronRight size={18}/>:<ChevronLeft size={18}/>}
     <span className="dashboard-actions-toggle-text">Quick Actions</span>
    </button>
   ):null}

   <div className="dashboard-actions-head">
    <p className="dashboard-section-kicker">Quick Actions</p>
    <h2 className="dashboard-section-title">Shortcuts</h2>
   </div>

   <div className="dashboard-actions-grid">
    <Link to="/inbox" className="dashboard-action dashboard-action-primary">
     <span className="dashboard-action-icon"><Inbox size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">1. Fleeting Inbox</span>
      <span className="dashboard-action-text">Capture and process raw ideas</span>
     </span>
    </Link>

    <Link to="/references" className="dashboard-action">
     <span className="dashboard-action-icon"><BookOpenText size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">2. Sources</span>
      <span className="dashboard-action-text">Preserve source material</span>
     </span>
    </Link>

    <Link to="/entities" className="dashboard-action">
     <span className="dashboard-action-icon"><Users size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">3. Entities</span>
      <span className="dashboard-action-text">Manage people, concepts, and things</span>
     </span>
    </Link>

    <Link to="/notes" className="dashboard-action">
     <span className="dashboard-action-icon"><NotebookPen size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">4. Zettels</span>
      <span className="dashboard-action-text">Develop permanent atomic notes</span>
     </span>
    </Link>

    <Link to="/links" className="dashboard-action">
     <span className="dashboard-action-icon"><Link2 size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">5. Connections</span>
      <span className="dashboard-action-text">Connect records with meaning</span>
     </span>
    </Link>

    <Link to="/structures" className="dashboard-action">
     <span className="dashboard-action-icon"><Network size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">6. Structure Notes</span>
      <span className="dashboard-action-text">Organize zettels into arguments</span>
     </span>
    </Link>

    <Link to="/outputs" className="dashboard-action">
     <span className="dashboard-action-icon"><FileOutput size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">7. Outputs</span>
      <span className="dashboard-action-text">Turn knowledge into finished work</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;
