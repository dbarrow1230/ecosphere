import {Calculator} from "lucide-react";

function DashboardHeader({
 kicker="Accounting & Tax Services",
 title="Practice dashboard",
 text="Manage client work, deadlines, and follow-up.",
 panelLabel="Overview",
 panelTitle="Client services",
 panelText="Accounting, bookkeeping, tax, and notary work."
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
     <Calculator size={26} strokeWidth={2.1}/>
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
