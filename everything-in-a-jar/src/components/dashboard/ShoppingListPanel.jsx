// src/components/dashboard/ShoppingListPanel.jsx
import {ClipboardList} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ShoppingListPanel({missingItems=[]}){
 const queueItems=(missingItems||[]).filter((item)=>{
  const queueText=[
   item?.category,
   item?.location,
   item?.room,
   item?.source,
   item?.type,
   item?.reason,
   item?.note
  ].filter(Boolean).join(" ").toLowerCase();

  return !queueText.includes("allergen")&&!queueText.includes("labeling review");
 });

 return(
  <section className="dashboard-section dashboard-action-queue">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Setup & Follow-Up</p>
     <h2 className="dashboard-section-title">Action Queue</h2>
    </div>
   </div>

   <ul className="dashboard-list">
    {queueItems.length?queueItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-warning"><ClipboardList size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.category||"Production Supply"} · {item.location||item.room||"To Source"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No vendor, costing, or setup follow-up items right now."/>
    )}
   </ul>
  </section>
 );
}

export default ShoppingListPanel;
