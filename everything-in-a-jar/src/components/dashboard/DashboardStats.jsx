// src/components/dashboard/DashboardStats.jsx
import {Package2,ChartColumnStacked,Boxes,Factory,ShoppingBag} from "lucide-react";

function DashboardStats({stats=[]}){

 const statIcons={
  "Total Products":<Package2 size={18} strokeWidth={2.2}/>,
  "Products":<Package2 size={18} strokeWidth={2.2}/>,
  "Recipes":<Package2 size={18} strokeWidth={2.2}/>,
  "Active Batches":<Factory size={18} strokeWidth={2.2}/>,
  "Batches":<Factory size={18} strokeWidth={2.2}/>,
  "Inventory":<Boxes size={18} strokeWidth={2.2}/>,
  "Costing":<ChartColumnStacked size={18} strokeWidth={2.2}/>,
  "Vendors":<ShoppingBag size={18} strokeWidth={2.2}/>,
  "Pricing":<Boxes size={18} strokeWidth={2.2}/>,
  "Categories":<ChartColumnStacked size={18} strokeWidth={2.2}/>,
  "App Modules":<ChartColumnStacked size={18} strokeWidth={2.2}/>,
  "App Setup":<ChartColumnStacked size={18} strokeWidth={2.2}/>,
  "Ingredients":<Boxes size={18} strokeWidth={2.2}/>
 };

 return(
  <section className="dashboard-cards">
   {stats?.map((item)=>(
    <article key={item.label} className="dashboard-card">
     <div className="dashboard-card-top">
      <span className="dashboard-card-icon">{statIcons[item.label]||<Package2 size={18} strokeWidth={2.2}/>}</span>
      <p className="dashboard-card-label">{item.label}</p>
     </div>
     <p className="dashboard-card-value">{item.value}</p>
     {item.details?.length?(
      <div className="dashboard-card-breakdown">
       {item.details.map(detail=>(
        <div key={`${item.label}-${detail.label}`} className="dashboard-card-breakdown-row">
         <span>{detail.label}</span>
         <strong>{detail.value}</strong>
        </div>
       ))}
      </div>
     ):null}
    </article>
   ))}
  </section>
 );
}

export default DashboardStats;
