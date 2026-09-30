import {Link} from "react-router-dom";
import {useState} from "react";
import {BookOpen,CalendarDays,ClipboardList,Layers,PenLine,Search,Users,X} from "lucide-react";

function DashboardQuickActions(){
 const [open,setOpen]=useState(false);

 return(
  <aside className={open?"dashboard-actions-wrap is-open":"dashboard-actions-wrap"} aria-label="Quick Actions">
   <button
    type="button"
    className="dashboard-actions-tab"
    onClick={()=>setOpen(prev=>!prev)}
    aria-expanded={open}
    aria-controls="dashboard-quick-actions"
   >
    Quick Actions
   </button>

   {open&&(
    <button
     type="button"
     className="dashboard-actions-scrim"
     onClick={()=>setOpen(false)}
     aria-label="Close quick actions"
    />
   )}

   <section className="dashboard-actions" id="dashboard-quick-actions">
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Shortcuts</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions">
      <X size={18} strokeWidth={2.2}/>
     </button>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/planner/project-overview" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><BookOpen size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Project Overview</span>
       <span className="dashboard-action-text">Start with title, genre, audience, theme, pitch, and timeline</span>
      </span>
     </Link>

     <Link to="/planner/characters" className="dashboard-action">
      <span className="dashboard-action-icon"><Users size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Characters</span>
       <span className="dashboard-action-text">Open cast, profile, arc, relationship, protagonist, and antagonist work</span>
      </span>
     </Link>

     <Link to="/planner/plot-structure" className="dashboard-action">
      <span className="dashboard-action-icon"><Layers size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Plot Structure</span>
       <span className="dashboard-action-text">Move through story arc, conflict, subplots, and act planning</span>
      </span>
     </Link>

     <Link to="/planner/chapters-scenes" className="dashboard-action">
      <span className="dashboard-action-icon"><ClipboardList size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Chapters & Scenes</span>
       <span className="dashboard-action-text">Use chapter list, chapter dashboard, summary, and scene dashboard</span>
      </span>
     </Link>

     <Link to="/planner/writing-progress" className="dashboard-action">
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Writing Progress</span>
       <span className="dashboard-action-text">Open goals, word count, planners, tasks, and project trackers</span>
      </span>
     </Link>

     <Link to="/planner/research-inspiration" className="dashboard-action">
      <span className="dashboard-action-icon"><Search size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Research</span>
       <span className="dashboard-action-text">Track sources, questions, notes, references, and inspiration</span>
      </span>
     </Link>

     <Link to="/planner/revision-editing" className="dashboard-action">
      <span className="dashboard-action-icon"><PenLine size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Revision</span>
       <span className="dashboard-action-text">Review revision notes, revision checklist, and authorial checklist</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
