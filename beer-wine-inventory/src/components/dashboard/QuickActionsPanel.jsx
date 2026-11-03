// src/components/dashboard/QuickActionsPanel.jsx
import {Link} from "react-router-dom";
import {Plus,Box,ShoppingCart,Archive,PackageCheck,Receipt,RotateCcw,Heart,Wallet,CirclePercent,Store,Tags,BadgeInfo,Bell} from "lucide-react";

function QuickActionsPanel(){

 return(
  <section className="dashboard-actions">
   <div className="dashboard-actions-head">
    <p className="dashboard-section-kicker">Quick Actions</p>
    <h2 className="dashboard-section-title">Shop Shortcuts</h2>
   </div>

   <div className="dashboard-actions-grid">
    <Link to="/menu/add" className="dashboard-action dashboard-action-primary">
     <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Add Doughnut</span>
      <span className="dashboard-action-text">Create a new doughnut flavor or menu item</span>
     </span>
    </Link>

    <Link to="/inventory" className="dashboard-action">
     <span className="dashboard-action-icon"><Box size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">View Inventory</span>
      <span className="dashboard-action-text">Browse ingredients and stock</span>
     </span>
    </Link>

    <Link to="/shopping-lists" className="dashboard-action">
     <span className="dashboard-action-icon"><ShoppingCart size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Supply List</span>
      <span className="dashboard-action-text">Plan ingredient restocking</span>
     </span>
    </Link>

    <Link to="/categories" className="dashboard-action">
     <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Categories</span>
      <span className="dashboard-action-text">Organize doughnuts and ingredients</span>
     </span>
    </Link>

    <Link to="/orders" className="dashboard-action">
     <span className="dashboard-action-icon"><PackageCheck size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Orders</span>
      <span className="dashboard-action-text">Track customer orders</span>
     </span>
    </Link>

    <Link to="/purchases" className="dashboard-action">
     <span className="dashboard-action-icon"><Receipt size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Purchases</span>
      <span className="dashboard-action-text">Review ingredient purchases</span>
     </span>
    </Link>

    <Link to="/returns" className="dashboard-action">
     <span className="dashboard-action-icon"><RotateCcw size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Returns</span>
      <span className="dashboard-action-text">Manage refunds and supplier returns</span>
     </span>
    </Link>

    <Link to="/wishlist" className="dashboard-action">
     <span className="dashboard-action-icon"><Heart size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Ideas / Wishlist</span>
      <span className="dashboard-action-text">Save doughnut ideas or ingredients</span>
     </span>
    </Link>

    <Link to="/budgets" className="dashboard-action">
     <span className="dashboard-action-icon"><Wallet size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Budgets</span>
      <span className="dashboard-action-text">Track shop spending</span>
     </span>
    </Link>

    <Link to="/coupons" className="dashboard-action">
     <span className="dashboard-action-icon"><CirclePercent size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Discounts</span>
      <span className="dashboard-action-text">Manage deals and supplier discounts</span>
     </span>
    </Link>

    <Link to="/stores" className="dashboard-action">
     <span className="dashboard-action-icon"><Store size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Suppliers</span>
      <span className="dashboard-action-text">Manage vendors and sourcing</span>
     </span>
    </Link>

    <Link to="/brands" className="dashboard-action">
     <span className="dashboard-action-icon"><Tags size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Brands</span>
      <span className="dashboard-action-text">Track ingredient brands</span>
     </span>
    </Link>

    <Link to="/units" className="dashboard-action">
     <span className="dashboard-action-icon"><BadgeInfo size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Units</span>
      <span className="dashboard-action-text">Manage measurement units</span>
     </span>
    </Link>

    <Link to="/reminders" className="dashboard-action">
     <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reminders</span>
      <span className="dashboard-action-text">View production and order alerts</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;