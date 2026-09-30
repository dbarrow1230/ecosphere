import {BookOpen} from "lucide-react";

function DashboardHeader({
 kicker="Novel Planner Dashboard",
 title="Planning Workspace",
 text="Track the planner sections, fillable pages, writing trackers, character work, and build order from one place.",
 panelLabel="Overview",
 panelTitle="Your current novel planning work.",
 panelText="The numbers and lists below come from the planner source and stay separate from new models until each page is mapped."
}){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">{kicker}</p>
    <h1 className="dashboard-title">{title}</h1>
    <p className="dashboard-text">{text}</p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <BookOpen size={26} strokeWidth={2.1}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">{panelLabel}</p>
     <h3 className="dashboard-header-panel-title">{panelTitle}</h3>
     <p className="dashboard-header-panel-text">{panelText}</p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHeader;
