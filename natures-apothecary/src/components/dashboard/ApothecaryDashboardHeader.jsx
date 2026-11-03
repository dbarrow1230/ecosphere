import {FaLeaf} from "react-icons/fa";

function ApothecaryDashboardHeader({
 kicker="Nature's Apothecary Dashboard",
 title="Apothecary Workspace",
 text="Track products, clients, vendors, allergens, seasonal references, orders, users, and permissions from one place.",
 panelLabel="Overview",
 panelTitle="Your current apothecary workflow.",
 panelText="Use the dashboard to move between product records, client care, reference data, staffing, and app configuration."
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
     <FaLeaf size={26}/>
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

export default ApothecaryDashboardHeader;
