// src/components/dashboard/RecentItemsPanel.jsx
import {NotebookPen} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";

function RecentItemsPanel({journalEntries=[],className=""}){
 const getLinkedTargets=item=>{
  const targets=[
   item.plant&&`Instance: ${item.plant}`,
   item.seed&&`Seed: ${item.seed}`,
   item.plantRecord&&`Plant: ${item.plantRecord}`,
   item.hydroSystem&&`Hydro: ${item.hydroSystem}`,
   item.equipment&&`Equipment: ${item.equipment}`,
   item.garden&&`Garden: ${item.garden}`,
   item.gardenSection&&`Section: ${item.gardenSection}`
  ].filter(Boolean);

  return targets.length?targets.join(" • "):"General journal entry";
 };

 return(
  <DashboardSection className={className} kicker="Recently Added" title="Recent Journal Entries" linkTo="/journal" linkLabel="Open journal">
   <ul className="dashboard-list">
    {journalEntries?.length?journalEntries.map(item=>(
     <li key={item._id||item.id||item.title||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-soft"><NotebookPen size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Journal entry"}</span>
       <span className="dashboard-item-meta">{item.entryDate||item.date||item.createdAt||"Recent"} · {item.entryType||item.category||"Journal"}{item.outcome?` · ${item.outcome}`:""}</span>
       <span className="dashboard-item-meta">{getLinkedTargets(item)}</span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No recent journal entries yet."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default RecentItemsPanel;
