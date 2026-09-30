// src/components/dashboard/DashboardQuickActions.jsx
import {Link} from "react-router-dom";
import {Plus,ListChecks,Archive,TriangleAlert,Target,CalendarCheck,Repeat,HeartPulse,NotebookText,CalendarDays,Bell,Clock3} from "lucide-react";

function DashboardQuickActions({
 showHabitProgress=true,
 showUpcomingReminders=true,
 showTimelinePreview=true
}){

 return(
  <aside className="dashboard-sidebar">
   <section className="dashboard-actions">
    <div className="dashboard-actions-head">
     <p className="dashboard-section-kicker">Quick Actions</p>
     <h2 className="dashboard-section-title">Shop Shortcuts</h2>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/menu/new" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">New Doughnut</span>
       <span className="dashboard-action-text">Create a new doughnut flavor or menu item</span>
      </span>
     </Link>

     <Link to="/orders" className="dashboard-action">
      <span className="dashboard-action-icon"><ListChecks size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Orders</span>
       <span className="dashboard-action-text">Manage customer orders and requests</span>
      </span>
     </Link>

     <Link to="/inventory" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Inventory</span>
       <span className="dashboard-action-text">Track ingredients and stock levels</span>
      </span>
     </Link>

     <Link to="/low-stock" className="dashboard-action">
      <span className="dashboard-action-icon"><TriangleAlert size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Low Stock</span>
       <span className="dashboard-action-text">Review ingredients that need restocking</span>
      </span>
     </Link>

     <Link to="/production" className="dashboard-action">
      <span className="dashboard-action-icon"><Target size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Production</span>
       <span className="dashboard-action-text">Plan doughnut batches and daily output</span>
      </span>
     </Link>

     {showHabitProgress&&(
      <>
       <Link to="/suppliers" className="dashboard-action">
        <span className="dashboard-action-icon"><CalendarCheck size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Suppliers</span>
         <span className="dashboard-action-text">Manage ingredient vendors and sourcing</span>
        </span>
       </Link>

       <Link to="/deliveries" className="dashboard-action">
        <span className="dashboard-action-icon"><Repeat size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Deliveries</span>
         <span className="dashboard-action-text">Track incoming shipments and restocks</span>
        </span>
       </Link>
      </>
     )}

     <Link to="/staff" className="dashboard-action">
      <span className="dashboard-action-icon"><HeartPulse size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Staff</span>
       <span className="dashboard-action-text">Manage team and scheduling</span>
      </span>
     </Link>

     <Link to="/notes" className="dashboard-action">
      <span className="dashboard-action-icon"><NotebookText size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Shop Notes</span>
       <span className="dashboard-action-text">Record recipes, ideas, and updates</span>
      </span>
     </Link>

     <Link to="/calendar" className="dashboard-action">
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Calendar</span>
       <span className="dashboard-action-text">View production schedules and events</span>
      </span>
     </Link>

     {showUpcomingReminders&&(
      <Link to="/reminders" className="dashboard-action">
       <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Reminders</span>
        <span className="dashboard-action-text">Manage alerts for orders and tasks</span>
       </span>
      </Link>
     )}

     {showTimelinePreview&&(
      <Link to="/sales" className="dashboard-action">
       <span className="dashboard-action-icon"><Clock3 size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Sales Timeline</span>
        <span className="dashboard-action-text">Review sales and order history</span>
       </span>
      </Link>
     )}

     <Link to="/categories" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Shop Categories</span>
       <span className="dashboard-action-text">Organize doughnuts, ingredients, and items</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;