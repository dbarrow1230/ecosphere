import {Music2} from "lucide-react";

function DashboardHero({user}){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Music Builder</p>
    <p className="dashboard-text">
     Capture reusable chord ideas, progressions, lyrics, arrangements, notes, and the projects they may become part of.
    </p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <Music2 size={26} strokeWidth={2.1}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">Overview</p>
     <h3 className="dashboard-header-panel-title">{user?.firstName?`${user.firstName}'s music workspace`:"Your music workspace"}</h3>
     <p className="dashboard-header-panel-text">Keep independent musical ideas connected to projects and to one another without losing their reuse.</p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHero;
