// src/components/dashboard/DashboardPeriodSummary.jsx
function DashboardPeriodSummary({summary,yearFilter,monthFilter,onClear}){
 const filtered=yearFilter!=="all"||monthFilter!=="all";

 return(
  <section className="dashboard-period-summary">
   <div>
    <p className="dashboard-section-kicker">Dashboard View</p>
    <h2>{summary.title}</h2>
    <p>{summary.detail}</p>
   </div>

   <div className="dashboard-period-actions">
    <span className="dashboard-period-badge">{summary.badge}</span>
    {filtered&&(
     <button type="button" className="dashboard-period-clear" onClick={onClear}>
      Clear filter
     </button>
    )}
   </div>
  </section>
 );
}

export default DashboardPeriodSummary;
