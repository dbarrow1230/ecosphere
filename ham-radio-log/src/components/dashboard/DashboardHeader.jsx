import {RadioTower} from "lucide-react";
import {Link} from "react-router-dom";

function DashboardHeader({title="Ham Radio Station Dashboard",description="A live summary of your saved QSO records.",operatorCallSign=""}){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Ham Radio Logger</p>
    <h1 className="dashboard-view-title">{title}</h1>
    <p className="dashboard-text">{description}</p>
    <Link to="/logbook" className="dashboard-chart-current-button">Open QSO Logbook</Link>
   </div>
   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon"><RadioTower size={26} strokeWidth={2.1}/></div>
    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">Current operator</p>
     <h2 className="dashboard-header-panel-title">{operatorCallSign||"Call sign not configured"}</h2>
     <p className="dashboard-header-panel-text">Contacts, bands, modes, and QSL status from the station logbook.</p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHeader;
