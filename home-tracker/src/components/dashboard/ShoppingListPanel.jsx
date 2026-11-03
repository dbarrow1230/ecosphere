// src/components/dashboard/ShoppingListPanel.jsx
import {Link} from "react-router-dom";
import {ArrowRight,ShoppingCart} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";

function ShoppingListPanel({missingItems=[]}){

 return(
  <section className="dashboard-section dashboard-section-wide">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Restock & Buy</p>
     <h2 className="dashboard-section-title">Shopping List</h2>
    </div>

    <Link to="/shopping-list" className="dashboard-section-link">
     Open list
     <ArrowRight size={16} strokeWidth={2.1}/>
    </Link>
   </div>

   <ul className="dashboard-list dashboard-list-two-column">
    {missingItems?.length?missingItems.map((item)=>(
     <li key={item._id||item.id||item.name} className="dashboard-list-item">
      <span className="dashboard-list-icon dashboard-list-icon-warning"><ShoppingCart size={17} strokeWidth={2.2}/></span>

      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.name}</span>
       <span className="dashboard-item-meta">
        {item.category||"General Grocery"} · {item.location||item.room||"Shopping List"}
       </span>
      </div>
     </li>
    )):(
     <DashboardEmpty as="li" className="dashboard-empty-wide" message="No restock or shopping list items right now."/>
    )}
   </ul>
  </section>
 );
}

export default ShoppingListPanel;