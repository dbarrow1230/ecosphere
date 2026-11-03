import {FaLeaf} from "react-icons/fa";

function DashboardHeader({
 kicker="Herbs & Spices Dashboard",
 title="Blending Workspace",
 text="Manage your original blends, ingredients, production, finished stock, and customer orders.",
 panelLabel="Overview",
 panelTitle="Your current blending workflow.",
 panelText="Use the dashboard to move between blend recipes, ingredient stock, production batches, customer orders, and business settings."
}){
 return(
  <header className="dashboard-header">
   <div className="dashboard-header-copy">
    <p className="dashboard-eyebrow">{kicker}</p>
    <h1 className="dashboard-title">{title}</h1>
    <p className="dashboard-text">{text}</p>
   </div>

   <div className="dashboard-header-panel">
    <div className="dashboard-header-panel-icon">
     <FaLeaf size={26}/>
    </div>

    <div className="dashboard-header-panel-copy">
     <p className="dashboard-header-panel-label">{panelLabel}</p>
     <h3 className="dashboard-header-panel-title">{panelTitle}</h3>
     <p className="dashboard-header-panel-text">{panelText}</p>
    </div>
   </div>
  </header>
 );
}

export default DashboardHeader;
