// src/components/dashboard/DashboardHeader.jsx
import {LayoutDashboard} from "lucide-react";

function DashboardHeader({
 summary={},
 dashboard={},
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
  daily:"Today’s poems, drafts, writing tasks, reminders, reading notes, and poetry priorities.",
  weekly:"This week’s poems, revision planning, submission work, reminders, and writing goals.",
  monthly:"This month’s poetry activity, genre patterns, publication planning, reminders, and notes.",
  yearly:"This year’s poetry growth, major goals, publishing progress, writing milestones, and archive movement."
 };

 const panelText={
  daily:"Poems, drafts, writing tasks, reminders, and notes organized for today.",
  weekly:"Poems, revisions, submissions, reminders, and notes organized for this week.",
  monthly:"Poetry activity, publication planning, reminders, and notes organized for this month.",
  yearly:"Writing goals, archive progress, publishing movement, and milestones organized for this year."
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
    <p className="dashboard-eyebrow">Poetry Garden</p>

    <h1 className="dashboard-view-title">{viewLabels[activeView]||"Daily"} Poetry Dashboard</h1>

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
      {viewLabels[activeView]||"Daily"} Poetry Board
     </h3>

     <p className="dashboard-header-panel-text">
      {rangeLabel}
     </p>

     <p className="dashboard-header-panel-text">
      {panelText[activeView]||"Poems, drafts, reminders, and writing notes organized by time."}
     </p>
    </div>
   </div>

  </header>
 );
}

export default DashboardHeader;
