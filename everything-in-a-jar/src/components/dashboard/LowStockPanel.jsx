// src/components/dashboard/LowStockPanel.jsx
import {TriangleAlert} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function LowStockPanel({lowStockItems=[]}){

 return(
  <section className="dashboard-section dashboard-section-priority">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Recipe Setup</p>
     <h2 className="dashboard-section-title">Needs Costing</h2>
    </div>
   </div>

   <ul className="dashboard-list">
    {lowStockItems?.length?lowStockItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.quantity} {item.unit||""} · {item.location||item.room||item.category||"Production Supply"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="Every active recipe has costing data."/>
    )}
   </ul>
  </section>
 );
}

export default LowStockPanel;
