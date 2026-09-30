// src/components/dashboard/QuickActionsPanel.jsx
import {useState} from "react";
import {Link} from "react-router-dom";
import {Plus,PackagePlus,Boxes,TriangleAlert,Clock3,ShoppingCart,ClipboardList,Apple,Tags,Truck,CalendarDays,Bell,PackageCheck,PanelRightOpen,X} from "lucide-react";

function QuickActionsPanel(){
 const [isOpen,setIsOpen]=useState(false);

 return(
  <>
   <button
    type="button"
    className={`dashboard-actions-tab ${isOpen?"open":""}`}
    onClick={()=>setIsOpen(current=>!current)}
    aria-expanded={isOpen}
    aria-controls="dashboard-actions-drawer"
   >
    <PanelRightOpen size={17} strokeWidth={2.2}/>
    <span>Quick Actions</span>
   </button>

   {isOpen&&<div className="dashboard-actions-scrim" aria-hidden="true" onClick={()=>setIsOpen(false)}/>}

   <section id="dashboard-actions-drawer" className={`dashboard-actions ${isOpen?"open":""}`}>
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Production Workflow</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setIsOpen(false)} aria-label="Close quick actions">
      <X size={18} strokeWidth={2.2}/>
     </button>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/inventory/add" className="dashboard-action dashboard-action-primary" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Add Inventory Item</span>
       <span className="dashboard-action-text">Add ingredients, jars, lids, labels, or packaging</span>
      </span>
     </Link>

     <Link to="/batches/add" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><PackagePlus size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Start New Batch</span>
       <span className="dashboard-action-text">Create a preserve, ferment, chutney, jam, or freeze-dried batch</span>
      </span>
     </Link>

     <Link to="/inventory" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Boxes size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Inventory</span>
       <span className="dashboard-action-text">View ingredients, supplies, packaging, and finished goods</span>
      </span>
     </Link>

     <Link to="/stock" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><PackageCheck size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Finished Stock</span>
       <span className="dashboard-action-text">Track jars ready for sale, storage, market, or delivery</span>
      </span>
     </Link>

     <Link to="/low-stock" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><TriangleAlert size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Low Stock</span>
       <span className="dashboard-action-text">Check ingredients, jars, labels, lids, and packaging that need restock</span>
      </span>
     </Link>

     <Link to="/expiring" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Clock3 size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Use Soon</span>
       <span className="dashboard-action-text">Review ingredients and prepared items nearing expiration</span>
      </span>
     </Link>

     <Link to="/shopping-list" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><ShoppingCart size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Purchase List</span>
       <span className="dashboard-action-text">Plan restock needs for ingredients, jars, lids, and labels</span>
      </span>
     </Link>

     <Link to="/products" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Tags size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Products</span>
       <span className="dashboard-action-text">Manage preserves, pickles, ferments, jams, chutneys, and freeze-dried goods</span>
      </span>
     </Link>

     <Link to="/ingredients" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Apple size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Ingredients</span>
       <span className="dashboard-action-text">Track produce, spices, sugar, vinegar, dairy, herbs, and seasonal inputs</span>
      </span>
     </Link>

     <Link to="/production" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><ClipboardList size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Production Plan</span>
       <span className="dashboard-action-text">Review upcoming batches, prep work, and production priorities</span>
      </span>
     </Link>

     <Link to="/markets" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Truck size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Market Prep</span>
       <span className="dashboard-action-text">Prepare product counts, packaging, labels, and market inventory</span>
      </span>
     </Link>

     <Link to="/seasons" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><CalendarDays size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Seasonal Planning</span>
       <span className="dashboard-action-text">Plan seasonal flavors, produce windows, and limited-run products</span>
      </span>
     </Link>

     <Link to="/reminders" className="dashboard-action" onClick={()=>setIsOpen(false)}>
      <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Reminders</span>
       <span className="dashboard-action-text">View production, restock, market, and follow-up reminders</span>
      </span>
     </Link>
    </div>
   </section>
  </>
 );
}

export default QuickActionsPanel;
