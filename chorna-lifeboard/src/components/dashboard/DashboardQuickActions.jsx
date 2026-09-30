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
     <h2 className="dashboard-section-title">Shortcuts</h2>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/journal/daily/new" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Daily Journal</span>
       <span className="dashboard-action-text">Record today’s activity</span>
      </span>
     </Link>

     <Link to="/tasks" className="dashboard-action">
      <span className="dashboard-action-icon"><ListChecks size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Tasks</span>
       <span className="dashboard-action-text">Manage daily, weekly, monthly, and yearly tasks</span>
      </span>
     </Link>

     <Link to="/life-areas" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Life Areas</span>
       <span className="dashboard-action-text">Organize health, career, family, creativity, finance, and other life areas</span>
      </span>
     </Link>

     <Link to="/priorities" className="dashboard-action">
      <span className="dashboard-action-icon"><TriangleAlert size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Priorities</span>
       <span className="dashboard-action-text">Review what needs attention</span>
      </span>
     </Link>

     <Link to="/goals" className="dashboard-action">
      <span className="dashboard-action-icon"><Target size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Goals</span>
       <span className="dashboard-action-text">Track progress and milestones</span>
      </span>
     </Link>

     {showHabitProgress&&(
      <>
       <Link to="/habits" className="dashboard-action">
        <span className="dashboard-action-icon"><CalendarCheck size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Habits</span>
         <span className="dashboard-action-text">Review habit consistency</span>
        </span>
       </Link>

       <Link to="/routines" className="dashboard-action">
        <span className="dashboard-action-icon"><Repeat size={18} strokeWidth={2.2}/></span>
        <span className="dashboard-action-copy">
         <span className="dashboard-action-label">Routines</span>
         <span className="dashboard-action-text">Track grouped routines</span>
        </span>
       </Link>
      </>
     )}

     <Link to="/mindfulness" className="dashboard-action">
      <span className="dashboard-action-icon"><HeartPulse size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Mindfulness</span>
       <span className="dashboard-action-text">Log mood, energy, and stress</span>
      </span>
     </Link>

     <Link to="/notes" className="dashboard-action">
      <span className="dashboard-action-icon"><NotebookText size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Notes</span>
       <span className="dashboard-action-text">Open notes and brain dumps</span>
      </span>
     </Link>

     <Link to="/calendar" className="dashboard-action">
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Calendar</span>
       <span className="dashboard-action-text">View events and important dates</span>
      </span>
     </Link>

     {showUpcomingReminders&&(
      <Link to="/reminders" className="dashboard-action">
       <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Reminders</span>
        <span className="dashboard-action-text">Manage alerts and notifications</span>
       </span>
      </Link>
     )}

     {showTimelinePreview&&(
      <Link to="/timeline" className="dashboard-action">
       <span className="dashboard-action-icon"><Clock3 size={18} strokeWidth={2.2}/></span>
       <span className="dashboard-action-copy">
        <span className="dashboard-action-label">Timeline</span>
        <span className="dashboard-action-text">Review chronological life entries</span>
       </span>
      </Link>
     )}

     <Link to="/categories" className="dashboard-action">
      <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Manage Categories</span>
       <span className="dashboard-action-text">Organize life areas and item types</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default DashboardQuickActions;