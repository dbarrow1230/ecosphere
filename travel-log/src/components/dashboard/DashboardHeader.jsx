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
  daily:"Today’s travel notes, itinerary plans, reservations, reminders, packing needs, documents, and trip priorities.",
  weekly:"This week’s trips, itinerary stops, reservations, transportation plans, reminders, packing checks, and travel goals.",
  monthly:"This month’s destinations, travel costs, lodging plans, transportation details, memories, reminders, and planning notes.",
  yearly:"This year’s journeys, destination goals, travel budget progress, major memories, seasonal plans, and travel milestones."
 };

 const panelText={
  daily:"Itinerary, reservations, travel notes, reminders, packing needs, documents, and trip priorities organized for today.",
  weekly:"Trips, itinerary stops, reservations, transportation, reminders, packing checks, and notes organized for this week.",
  monthly:"Destinations, travel costs, lodging, transportation, memories, reminders, and planning notes organized for this month.",
  yearly:"Journey goals, seasonal plans, travel costs, destination progress, memories, and milestones organized for this year."
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
    <p className="dashboard-eyebrow">The Travelers Companion</p>

    <h1 className="dashboard-view-title">{viewLabels[activeView]||"Daily"} Travel Log Dashboard</h1>

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
      {viewLabels[activeView]||"Daily"} Travel Board
     </h3>

     <p className="dashboard-header-panel-text">
      {rangeLabel}
     </p>

     <p className="dashboard-header-panel-text">
      {panelText[activeView]||"Itinerary, reservations, travel notes, reminders, documents, and trip priorities organized by time."}
     </p>
    </div>
   </div>

  </header>
 );
}

export default DashboardHeader;