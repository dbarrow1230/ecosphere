import {BadgeCheck,Radio,Signal,TowerControl} from "lucide-react";
import {Link} from "react-router-dom";
import "./DashboardStats.css";

const iconMap={qsos:Radio,callSigns:TowerControl,bands:Signal,confirmed:BadgeCheck};

function DashboardStats({stats=[]}){
 return(
  <section className="dashboard-cards dashboard-cards-compact">
   {stats.map(item=>{
    const Icon=iconMap[item.key]||Radio;
    const card=(
     <article className="dashboard-card dashboard-card-compact">
      <div className="dashboard-stat-top">
       <span className="dashboard-card-icon dashboard-card-icon-compact"><Icon size={20} strokeWidth={2.2}/></span>
       <span className="dashboard-stat-name">{item.label}</span>
       <strong className="dashboard-stat-total">{item.value??0}</strong>
      </div>
      {item.summary?<div className="dashboard-stat-summary">{item.summary}</div>:null}
     </article>
    );
    return item.to?<Link key={item.key} to={item.to} className="dashboard-stat-card-link">{card}</Link>:<div key={item.key}>{card}</div>;
   })}
  </section>
 );
}

export default DashboardStats;
