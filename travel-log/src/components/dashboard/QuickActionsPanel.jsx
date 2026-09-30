// src/components/dashboard/QuickActionsPanel.jsx
import {Link} from "react-router-dom";
import {Plus,Box,ShoppingCart,Archive,PackageCheck,Receipt,RotateCcw,Heart,Wallet,CirclePercent,Store,Tags,BadgeInfo,Bell} from "lucide-react";

function QuickActionsPanel(){

 return(
  <section className="dashboard-actions">
   <div className="dashboard-actions-head">
    <p className="dashboard-section-kicker">Quick Actions</p>
    <h2 className="dashboard-section-title">Travel Shortcuts</h2>
   </div>

   <div className="dashboard-actions-grid">
    <Link to="/trips/add" className="dashboard-action dashboard-action-primary">
     <span className="dashboard-action-icon"><Plus size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Add Trip</span>
      <span className="dashboard-action-text">Create a new journey or travel log entry</span>
     </span>
    </Link>

    <Link to="/inventory" className="dashboard-action">
     <span className="dashboard-action-icon"><Box size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">View Packing List</span>
      <span className="dashboard-action-text">Browse travel items and essentials</span>
     </span>
    </Link>

    <Link to="/shopping-lists" className="dashboard-action">
     <span className="dashboard-action-icon"><ShoppingCart size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Travel Checklist</span>
      <span className="dashboard-action-text">Plan items to pack or buy</span>
     </span>
    </Link>

    <Link to="/categories" className="dashboard-action">
     <span className="dashboard-action-icon"><Archive size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Categories</span>
      <span className="dashboard-action-text">Organize trips, notes, and expenses</span>
     </span>
    </Link>

    <Link to="/orders" className="dashboard-action">
     <span className="dashboard-action-icon"><PackageCheck size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reservations</span>
      <span className="dashboard-action-text">Track bookings and confirmations</span>
     </span>
    </Link>

    <Link to="/purchases" className="dashboard-action">
     <span className="dashboard-action-icon"><Receipt size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Expenses</span>
      <span className="dashboard-action-text">Review travel purchases and costs</span>
     </span>
    </Link>

    <Link to="/returns" className="dashboard-action">
     <span className="dashboard-action-icon"><RotateCcw size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Changes</span>
      <span className="dashboard-action-text">Manage cancellations and refunds</span>
     </span>
    </Link>

    <Link to="/wishlist" className="dashboard-action">
     <span className="dashboard-action-icon"><Heart size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Dream Trips</span>
      <span className="dashboard-action-text">Save destinations and travel ideas</span>
     </span>
    </Link>

    <Link to="/budgets" className="dashboard-action">
     <span className="dashboard-action-icon"><Wallet size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Budgets</span>
      <span className="dashboard-action-text">Track travel spending</span>
     </span>
    </Link>

    <Link to="/coupons" className="dashboard-action">
     <span className="dashboard-action-icon"><CirclePercent size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Deals</span>
      <span className="dashboard-action-text">Manage discounts and travel savings</span>
     </span>
    </Link>

    <Link to="/stores" className="dashboard-action">
     <span className="dashboard-action-icon"><Store size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Providers</span>
      <span className="dashboard-action-text">Manage airlines, hotels, and vendors</span>
     </span>
    </Link>

    <Link to="/brands" className="dashboard-action">
     <span className="dashboard-action-icon"><Tags size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Tags</span>
      <span className="dashboard-action-text">Track trip labels and travel types</span>
     </span>
    </Link>

    <Link to="/units" className="dashboard-action">
     <span className="dashboard-action-icon"><BadgeInfo size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Details</span>
      <span className="dashboard-action-text">Manage travel units and references</span>
     </span>
    </Link>

    <Link to="/reminders" className="dashboard-action">
     <span className="dashboard-action-icon"><Bell size={18} strokeWidth={2.2}/></span>
     <span className="dashboard-action-copy">
      <span className="dashboard-action-label">Reminders</span>
      <span className="dashboard-action-text">View trip alerts and travel deadlines</span>
     </span>
    </Link>
   </div>
  </section>
 );
}

export default QuickActionsPanel;