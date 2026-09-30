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
     <h2 className="dashboard-section-title">Travel Shortcuts</h2>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/trips/new" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">New Trip</span>
       <span className="dashboard-action-text">Create a new travel log entry</span>
      </span>
     </Link>

     <Link to="/itinerary" className="dashboard-action">
      <span className="dashboard-action-icon"><ListChecks size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Itinerary</span>
       <span className="dashboard-action-text">Manage trip plans and activities</span>
      </span>
     </Link>

     <Link to="/documents" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Documents</span>
       <span className="dashboard-action-text">Store passports, tickets, and files</span>
      </span>
     </Link>

     <Link to="/alerts" className="dashboard-action">
      <span className="dashboard-action-icon"><TriangleAlert size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Alerts</span>
       <span className="dashboard-action-text">Review travel warnings and updates</span>
      </span>
     </Link>

     <Link to="/goals" className="dashboard-action">
      <span className="dashboard-action-icon"><Target size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Travel Goals</span>
       <span className="dashboard-action-text">Plan destinations and milestones</span>
      </span>
     </Link>

     {showHabitProgress&&(
      <>
       <Link to="/bookings" className="dashboard-action">
        <span className="dashboard-action-icon"><CalendarCheck size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Bookings</span>
         <span className="dashboard-action-text">Manage flights, hotels, and reservations</span>
        </span>
       </Link>

       <Link to="/transportation" className="dashboard-action">
        <span className="dashboard-action-icon"><Repeat size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Transport</span>
         <span className="dashboard-action-text">Track travel routes and transfers</span>
        </span>
       </Link>
      </>
     )}

     <Link to="/health" className="dashboard-action">
      <span className="dashboard-action-icon"><HeartPulse size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Health</span>
       <span className="dashboard-action-text">Track wellness and travel safety</span>
      </span>
     </Link>

     <Link to="/notes" className="dashboard-action">
      <span className="dashboard-action-icon"><NotebookText size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Travel Notes</span>
       <span className="dashboard-action-text">Record memories and trip details</span>
      </span>
     </Link>

     <Link to="/calendar" className="dashboard-action">
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Calendar</span>
       <span className="dashboard-action-text">View trips and travel schedule</span>
      </span>
     </Link>

     {showUpcomingReminders&&(
      <Link to="/reminders" className="dashboard-action">
       <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Reminders</span>
        <span className="dashboard-action-text">Manage travel alerts and deadlines</span>
       </span>
      </Link>
     )}

     {showTimelinePreview&&(
      <Link to="/history" className="dashboard-action">
       <span className="dashboard-action-icon"><Clock3 size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Travel Timeline</span>
        <span className="dashboard-action-text">Review past trips and journeys</span>
       </span>
      </Link>
     )}

     <Link to="/categories" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Travel Categories</span>
       <span className="dashboard-action-text">Organize destinations and travel types</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;