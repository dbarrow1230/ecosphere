import {BookOpen,ChefHat,ClipboardList,Layers} from "lucide-react";
const icons=[BookOpen,ChefHat,ClipboardList,Layers];
// src/components/dashboard/DashboardStats.jsx
function DashboardStats({stats=[]}){
 return(
  <section className="dashboard-cards">
   {stats.map((stat,index)=>{const Icon=icons[index]||Layers;return(
    <article className="dashboard-card" key={stat.label}>
     <div className="dashboard-card-top">
      <div className="dashboard-card-icon"><Icon size={20}/></div>

      <div>
       <p className="dashboard-card-label">{stat.label}</p>
      </div>
     </div>

     <h3 className="dashboard-card-value">{stat.value}</h3>
    </article>
   );})}
  </section>
 );
}

export default DashboardStats;