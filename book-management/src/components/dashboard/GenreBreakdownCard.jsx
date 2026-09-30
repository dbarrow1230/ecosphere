// src/components/dashboard/GenreBreakdownCard.jsx
import {Link} from "react-router-dom";
function GenreBreakdownCard({items}){

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-card-wide">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Collection Control</p>
     <h2 className="dashboard-section-title">Genre / Subject Breakdown</h2>
    </div>
   </div>

   {!items.length?(
    <div className="dashboard-empty">No genre or subject data found.</div>
   ):(
    <div className="dashboard-chart-body">
     {items.map(item=>(
      <Link key={item.label} to={item.to||"/collections"} className="dashboard-bar-row dashboard-bar-link">
       <div className="dashboard-bar-meta">
        <span className="dashboard-bar-label">{item.label}</span>
        <span className="dashboard-bar-value">{item.value}</span>
       </div>
       <div className="dashboard-bar-track">
        <div className="dashboard-bar-fill dashboard-bar-fill-pantry" style={{width:`${item.percent}%`}}/>
       </div>
      </Link>
     ))}
    </div>
   )}
  </section>
 );

}

export default GenreBreakdownCard;
