// src/components/dashboard/QuickActionsPanel.jsx
import {Link} from "react-router-dom";
import {Plus,CalendarDays,ClipboardList,Utensils,Bell,Users,ChartColumnStacked} from "lucide-react";

function QuickActionsPanel(){

 return(
  <section className="dashboard-actions">
   <div className="dashboard-actions-head">
    <p className="dashboard-section-kicker">Quick Actions</p>
    <h2 className="dashboard-section-title">Shortcuts</h2>
   </div>

   <div className="dashboard-actions-grid">
    <Link to="/inventory" className="dashboard-action dashboard-action-primary">
     <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Open Inventory</span>
      <span className="dashboard-action-text">Update kitchen stock and supplies</span>
     </span>
    </Link>

    <Link to="/events" className="dashboard-action">
     <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Events</span>
      <span className="dashboard-action-text">Review upcoming service dates</span>
     </span>
    </Link>

    <Link to="/orders" className="dashboard-action">
     <span className="dashboard-action-icon"><ClipboardList size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Orders</span>
      <span className="dashboard-action-text">Track order status and totals</span>
     </span>
    </Link>

    <Link to="/clients" className="dashboard-action">
     <span className="dashboard-action-icon"><Users size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Clients</span>
      <span className="dashboard-action-text">Manage customer records</span>
     </span>
    </Link>

    <Link to="/admin/menus" className="dashboard-action">
     <span className="dashboard-action-icon"><Utensils size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Menu Manager</span>
      <span className="dashboard-action-text">Maintain catering packages</span>
     </span>
    </Link>

    <Link to="/reports" className="dashboard-action">
     <span className="dashboard-action-icon"><ChartColumnStacked size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reports</span>
      <span className="dashboard-action-text">Review revenue and activity</span>
     </span>
    </Link>

    <Link to="/reminders" className="dashboard-action">
     <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reminders</span>
      <span className="dashboard-action-text">View alerts and scheduled reminders</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;
