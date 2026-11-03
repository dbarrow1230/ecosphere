// src/components/dashboard/QuickActionsPanel.jsx
import {FolderKanban,Music2,ListMusic,NotebookPen,LayoutList,FileText,ChevronLeft,ChevronRight} from "lucide-react";
import {Link} from "react-router-dom";

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
    <Link to="/music-projects" className="dashboard-action dashboard-action-primary" onClick={onToggle}>
     <span className="dashboard-action-icon"><FolderKanban size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Music Projects</span>
      <span className="dashboard-action-text">Title, description, status, notes, tags, and active state</span>
     </span>
    </Link>

    <Link to="/chord-ideas" className="dashboard-action" onClick={onToggle}>
     <span className="dashboard-action-icon"><Music2 size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Chord Ideas</span>
      <span className="dashboard-action-text">Chords, keys, voicings, inversions, and instruments</span>
     </span>
    </Link>

    <Link to="/chord-progressions" className="dashboard-action" onClick={onToggle}>
     <span className="dashboard-action-icon"><ListMusic size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Chord Progressions</span>
      <span className="dashboard-action-text">Chords, numerals, key, mode, meter, and tempo</span>
     </span>
    </Link>

    <Link to="/lyric-ideas" className="dashboard-action" onClick={onToggle}>
     <span className="dashboard-action-icon"><NotebookPen size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Lyric Ideas</span>
      <span className="dashboard-action-text">Lyric content, notes, projects, chords, and progressions</span>
     </span>
    </Link>

    <Link to="/arrangement-ideas" className="dashboard-action" onClick={onToggle}>
     <span className="dashboard-action-icon"><LayoutList size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Arrangement Ideas</span>
      <span className="dashboard-action-text">Arrangement content connected across music ideas</span>
     </span>
    </Link>

    <Link to="/music-notes" className="dashboard-action" onClick={onToggle}>
     <span className="dashboard-action-icon"><FileText size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Music Notes</span>
      <span className="dashboard-action-text">General notes connected to every music record type</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;
