import {BookOpen} from "lucide-react";

function DashboardHeader({
 kicker="Publishing Dashboard",
 title="Publishing Workspace",
 text="Track publication work across departments, workflows, records, approvals, and reporting.",
 panelLabel="Overview",
 panelTitle="Your current publication work.",
 panelText="The dashboard should summarize the operation while each department owns its own workflow pages and data."
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
