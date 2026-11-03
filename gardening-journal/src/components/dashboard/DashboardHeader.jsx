// src/components/dashboard/DashboardHeader.jsx
import {Sprout} from "lucide-react";

function DashboardHeader(){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Track • Grow • Harvest</p>
    <p className="dashboard-text">
     Monitor garden beds, plants, journal entries, tasks, harvest records, supplies, pests, diseases, and seasonal growing activity from one organized dashboard.
    </p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <Sprout size={26} strokeWidth={2.1}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">Garden Overview</p>
     <h3 className="dashboard-header-panel-title">Your growing season at a glance.</h3>
     <p className="dashboard-header-panel-text">
      Track what is planted, what needs attention, what is ready to harvest, and what supplies need to be restocked.
     </p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHeader;
