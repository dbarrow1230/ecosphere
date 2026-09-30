function ApothecaryDashboardStats({stats=[]}){
 return(
  <section className="dashboard-cards">
   {stats.map(item=>(
    <article key={item.label} className="dashboard-card">
     <div className="dashboard-card-top">
      <span className="dashboard-card-icon">{item.icon}</span>
      <p className="dashboard-card-label">{item.label}</p>
     </div>
     <p className="dashboard-card-value">{item.value??0}</p>
     {Array.isArray(item.detail)&&item.detail.length?(
      <dl className="dashboard-card-detail-list">
       {item.detail.map(detail=>(
        <div key={detail.label} className="dashboard-card-detail-row">
         <dt>{detail.label}:</dt>
         <dd>{detail.value??0}</dd>
        </div>
       ))}
      </dl>
     ):item.detail?(
      <p className="dashboard-card-detail">{item.detail}</p>
     ):null}
    </article>
   ))}
  </section>
 );
}

export default ApothecaryDashboardStats;
