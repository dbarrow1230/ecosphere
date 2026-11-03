import {Network} from "lucide-react";

function DashboardHero(){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Zettelkasten Dashboard</p>
    <p className="dashboard-text">
     Move knowledge from fleeting capture through preserved sources, entities, zettels, meaningful connections, structure notes, and finished outputs.
    </p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <Network size={26} strokeWidth={2.1}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">Overview</p>
     <h3 className="dashboard-header-panel-title">Your Antinet workflow, connected.</h3>
     <p className="dashboard-header-panel-text">Track every core record type and see how captured ideas develop into structured output.</p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHero;
