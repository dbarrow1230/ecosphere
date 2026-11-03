import {Link} from "react-router-dom";
import {BookOpen,Plus,UserRound} from "lucide-react";

function DashboardQuickActions(){
 return(
  <aside className="dashboard-sidebar">
   <section className="dashboard-actions">
    <div className="dashboard-actions-head"><p className="dashboard-section-kicker">Quick Actions</p><h2 className="dashboard-section-title">Station Shortcuts</h2></div>
    <div className="dashboard-actions-grid">
     <Link to="/logbook?new=1" className="dashboard-action dashboard-action-primary"><span className="dashboard-action-icon"><Plus size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Log a QSO</span><span className="dashboard-action-text">Add a radio contact</span></span></Link>
     <Link to="/logbook" className="dashboard-action"><span className="dashboard-action-icon"><BookOpen size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">QSO Logbook</span><span className="dashboard-action-text">Review saved contacts</span></span></Link>
     <Link to="/profile" className="dashboard-action"><span className="dashboard-action-icon"><UserRound size={18}/></span><span className="dashboard-action-copy"><span className="dashboard-action-label">Operator Profile</span><span className="dashboard-action-text">View call sign and station details</span></span></Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;
