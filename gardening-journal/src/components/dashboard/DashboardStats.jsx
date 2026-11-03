// src/components/dashboard/DashboardStats.jsx
import {ChartColumnStacked,Clock3,Flower2,Leaf,Sprout,TriangleAlert,Wheat} from "lucide-react";

function DashboardStats({stats=[]}){
 const statIcons={
  "Plant Records":<Sprout size={18} strokeWidth={2.2}/>,
  "Growing Spaces":<Flower2 size={18} strokeWidth={2.2}/>,
  "Open Tasks":<Clock3 size={18} strokeWidth={2.2}/>,
  "Harvests This Month":<Wheat size={18} strokeWidth={2.2}/>,
  "Harvests":<Wheat size={18} strokeWidth={2.2}/>,
  "Issues":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Plant Deaths":<TriangleAlert size={18} strokeWidth={2.2}/>,
  "Seed Records":<Leaf size={18} strokeWidth={2.2}/>,
  "Categories":<ChartColumnStacked size={18} strokeWidth={2.2}/>
 };

 return(
  <section className="dashboard-cards-compact">
   {stats?.map(item=>(
    <article key={item.label} className="dashboard-card dashboard-card-compact">
     <div className="dashboard-stat-top">
      <span className="dashboard-card-icon-compact">{statIcons[item.label]||<Leaf size={18} strokeWidth={2.2}/>}</span>
      <p className="dashboard-stat-name">{item.label}</p>
      <p className="dashboard-stat-total">{item.value}</p>
     </div>

     {Array.isArray(item.breakdown)&&item.breakdown.length>0&&(
      <div className="dashboard-stat-badges">
       {item.breakdown.slice(0,5).map(detail=>(
        <div key={`${item.label}-${detail.label}`} className={`dashboard-stat-badge-row${detail.variant?` dashboard-stat-badge-${detail.variant}`:""}`}>
         <span>{detail.label}</span>
         <strong>{detail.value}</strong>
        </div>
       ))}
      </div>
     )}
    </article>
   ))}
  </section>
 );
}

export default DashboardStats;
