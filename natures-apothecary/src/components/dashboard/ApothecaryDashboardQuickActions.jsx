import {Link} from "react-router-dom";
import {useState} from "react";
import {FaBoxOpen,FaCalendarAlt,FaFlask,FaLeaf,FaSearch,FaTimes,FaTruck,FaUsers} from "react-icons/fa";

function ApothecaryDashboardQuickActions(){
 const [open,setOpen]=useState(false);

 return(
  <aside className={open?"dashboard-actions-wrap is-open":"dashboard-actions-wrap"} aria-label="Quick Actions">
   <button
    type="button"
    className="dashboard-actions-tab"
    onClick={()=>setOpen(prev=>!prev)}
    aria-expanded={open}
    aria-controls="dashboard-quick-actions"
   >
    Quick Actions
   </button>

   {open&&(
    <button
     type="button"
     className="dashboard-actions-scrim"
     onClick={()=>setOpen(false)}
     aria-label="Close quick actions"
    />
   )}

   <section className="dashboard-actions" id="dashboard-quick-actions">
    <div className="dashboard-actions-head">
     <div>
      <p className="dashboard-section-kicker">Quick Actions</p>
      <h2 className="dashboard-section-title">Shortcuts</h2>
     </div>

     <button type="button" className="dashboard-actions-close" onClick={()=>setOpen(false)} aria-label="Close quick actions">
      <FaTimes size={18}/>
     </button>
    </div>

    <div className="dashboard-actions-grid">
     <Link to="/products" className="dashboard-action dashboard-action-primary">
      <span className="dashboard-action-icon"><FaLeaf size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Products</span>
       <span className="dashboard-action-text">Review apothecary products, stock, prices, labels, and product details</span>
      </span>
     </Link>

     <Link to="/clients" className="dashboard-action">
      <span className="dashboard-action-icon"><FaUsers size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Clients</span>
       <span className="dashboard-action-text">Open client records, contact details, addresses, and notes</span>
      </span>
     </Link>

     <Link to="/admin/allergens" className="dashboard-action">
      <span className="dashboard-action-icon"><FaFlask size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Allergens</span>
       <span className="dashboard-action-text">Maintain allergen references used by formulas, products, and labels</span>
      </span>
     </Link>

     <Link to="/admin/vendors" className="dashboard-action">
      <span className="dashboard-action-icon"><FaTruck size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Vendors</span>
       <span className="dashboard-action-text">Manage herb, bottle, label, packaging, and supply vendors</span>
      </span>
     </Link>

     <Link to="/admin/seasons" className="dashboard-action">
      <span className="dashboard-action-icon"><FaCalendarAlt size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Seasons</span>
       <span className="dashboard-action-text">Manage seasonal collections, availability windows, and references</span>
      </span>
     </Link>

     <Link to="/admin/orders" className="dashboard-action">
      <span className="dashboard-action-icon"><FaBoxOpen size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Orders</span>
       <span className="dashboard-action-text">Create, review, and track orders connected to clients and events</span>
      </span>
     </Link>

     <Link to="/admin/business-roles-permissions" className="dashboard-action">
      <span className="dashboard-action-icon"><FaSearch size={18}/></span>
      <span className="dashboard-action-copy">
       <span className="dashboard-action-label">Permissions</span>
       <span className="dashboard-action-text">Review staff roles, departments, permission modules, and overrides</span>
      </span>
     </Link>
    </div>
   </section>
  </aside>
 );
}

export default ApothecaryDashboardQuickActions;
