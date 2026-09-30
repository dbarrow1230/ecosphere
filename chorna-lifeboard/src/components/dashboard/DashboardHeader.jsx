// src/components/dashboard/DashboardHeader.jsx
import {LayoutDashboard} from "lucide-react";

function DashboardHeader({
 summary={},
 dashboard={},
 settings={},
 activeView="daily",
 preferredView="daily",
 viewOverridden=false,
 rangeLabel="",
 onViewChange,
 onResetDefault
}){

 const viewLabels={
  daily:"Daily",
  weekly:"Weekly",
  monthly:"Monthly",
  yearly:"Yearly"
 };

 const viewDescriptions={
  daily:"Today’s tasks, priorities, journal entries, habits, mindfulness check-ins, reminders, and calendar items.",
  weekly:"This week’s priorities, goals, habits, routines, reviews, events, reminders, and progress.",
  monthly:"This month’s goals, milestones, category progress, mood patterns, notes, reminders, and reviews.",
  yearly:"This year’s vision boards, life themes, major goals, milestones, reviews, and chronological progress."
 };

 const panelText={
  daily:"Tasks, goals, habits, journals, notes, reminders, events, memories, and reviews organized for today.",
  weekly:"Tasks, goals, habits, journals, notes, reminders, events, memories, and reviews organized for this week.",
  monthly:"Tasks, goals, habits, journals, notes, reminders, events, memories, and reviews organized for this month.",
  yearly:"Tasks, goals, habits, journals, notes, reminders, events, memories, and reviews organized for this year."
 };

 const views=[
  {value:"daily",label:"Daily"},
  {value:"weekly",label:"Weekly"},
  {value:"monthly",label:"Monthly"},
  {value:"yearly",label:"Yearly"}
 ];

 return(
  <header className="dashboard-header">

   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">Chorna Lifeboard</p>

    <h1 className="dashboard-view-title">{viewLabels[activeView]||"Daily"} Dashboard</h1>

    <p className="dashboard-text">
     {viewDescriptions[activeView]||viewDescriptions.daily}
    </p>

    <div className="dashboard-view-meta">
     <span>Viewing: {rangeLabel}</span>
     <span>Preferred default: {viewLabels[preferredView]||"Daily"}</span>
     {viewOverridden&&<span>Temporary override active</span>}
    </div>

    <div className="dashboard-view-switcher">
     {views.map(view=>(
      <button
       key={view.value}
       type="button"
       className={activeView===view.value?"dashboard-view-button active":"dashboard-view-button"}
       onClick={()=>onViewChange(view.value)}
      >
       {view.label}
      </button>
     ))}

     {viewOverridden&&(
      <button type="button" className="dashboard-view-reset" onClick={onResetDefault}>
       Reset to default
      </button>
     )}
    </div>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <LayoutDashboard size={26} strokeWidth={2.1}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">{summary?.period||dashboard?.range?.period||activeView}</p>

     <h3 className="dashboard-header-panel-title">
      {viewLabels[activeView]||"Daily"} Life Board
     </h3>

     <p className="dashboard-header-panel-text">
      {rangeLabel}
     </p>

     <p className="dashboard-header-panel-text">
      {panelText[activeView]||"Tasks, goals, habits, journals, notes, reminders, events, memories, and reviews organized by time."}
     </p>
    </div>
   </div>

  </header>
 );
}

export default DashboardHeader;