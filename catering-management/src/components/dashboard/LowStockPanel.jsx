// src/components/dashboard/LowStockPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,TriangleAlert} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function LowStockPanel({lowStockItems=[]}){

 return(
  <section className="dashboard-section dashboard-section-priority">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Attention Needed</p>
     <h2 className="dashboard-section-title">Low Stock</h2>
    </div>

    <Link to="/inventory" className="dashboard-section-link">
     Open inventory
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list">
    {lowStockItems?.length?lowStockItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon"><TriangleAlert size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.quantityOnHand??item.quantity??0} {item.unit||""} · {item.category||"Kitchen Inventory"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" message="No low stock kitchen items right now."/>
    )}
   </ul>
  </section>
 );
}

export default LowStockPanel;
