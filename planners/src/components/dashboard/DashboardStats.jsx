// src/components/dashboard/DashboardStats.jsx
import {Package2,TriangleAlert,Clock3,ChartColumnStacked} from "lucide-react";

function DashboardStats({stats=[]}){

 const statIcons={
  "Total Items":<Package2 size={18} strokeWidth={2.2}/>,
  "Low Stock":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Expiring Soon":<Clock3 size={18} strokeWidth={2.2}/>,
  "Categories":<ChartColumnStacked size={18} strokeWidth={2.2}/>
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
    </article>
   ))}
  </section>
 );
}

export default DashboardStats;