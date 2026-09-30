// src/components/dashboard/DashboardStats.jsx
function DashboardStats({stats=[]}){
 return(
  <section className="dashboard-cards">
   {stats.map(stat=>(
    <article className="dashboard-card" key={stat.label}>
     <div className="dashboard-card-top">
      <div className="dashboard-card-icon">•</div>

      <div>
       <p className="dashboard-card-label">{stat.label}</p>
      </div>
     </div>

     <h3 className="dashboard-card-value">{stat.value}</h3>
    </article>
   ))}
  </section>
 );
}

export default DashboardStats;