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
  daily:"Today’s doughnut production, ingredient needs, low-stock items, orders, prep tasks, reminders, and shop priorities.",
  weekly:"This week’s doughnut batches, menu planning, vendor needs, inventory checks, order volume, reminders, and production goals.",
  monthly:"This month’s shop costs, sales patterns, ingredient usage, menu performance, inventory trends, reminders, and planning notes.",
  yearly:"This year’s doughnut shop growth, seasonal planning, major goals, budget progress, vendor performance, and business milestones."
 };

 const panelText={
  daily:"Production, orders, ingredients, inventory, prep tasks, reminders, and shop notes organized for today.",
  weekly:"Production, orders, ingredients, inventory, prep tasks, reminders, and shop notes organized for this week.",
  monthly:"Costs, sales, ingredients, inventory, menu items, reminders, and shop notes organized for this month.",
  yearly:"Shop goals, seasonal planning, costs, inventory trends, menu performance, and milestones organized for this year."
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
    <p className="dashboard-eyebrow">Crazy Cravings Alchemy Delight Doughnuts</p>

    <h1 className="dashboard-view-title">{viewLabels[activeView]||"Daily"} Doughnut Shop Dashboard</h1>

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
      {viewLabels[activeView]||"Daily"} Shop Board
     </h3>

     <p className="dashboard-header-panel-text">
      {rangeLabel}
     </p>

     <p className="dashboard-header-panel-text">
      {panelText[activeView]||"Production, orders, ingredients, inventory, reminders, and shop notes organized by time."}
     </p>
    </div>
   </div>

  </header>
 );
}

export default DashboardHeader;