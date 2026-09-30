// src/components/dashboard/CategorySpendCharts.jsx
import DashboardEmpty from "./DashboardEmpty";

function DashboardChartCard({title,data=[],fillClass="",emptyMessage=""}){
 return(
  <div className="dashboard-chart-card">
   <div className="dashboard-chart-head">
    <h3 className="dashboard-chart-title">{title}</h3>
   </div>

   <div className="dashboard-chart-body">
    {data.length?data.map(item=>(
     <div key={item.category} className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
       <span className="dashboard-bar-label">{item.category}</span>
       <span className="dashboard-bar-value">${Number(item.cost||0).toFixed(2)}</span>
      </div>

      <div className="dashboard-bar-track">
       <div className={`dashboard-bar-fill ${fillClass}`.trim()} style={{width:item.width}}/>
      </div>
     </div>
    )):(
     <DashboardEmpty message={emptyMessage}/>
    )}
   </div>
  </div>
 );
}

function CategorySpendCharts({seedChartData=[],supplyChartData=[]}){
 return(
  <div className="dashboard-chart-grid">
   <DashboardChartCard
    title="Seed Categories"
    data={seedChartData}
    fillClass="dashboard-bar-fill-seed"
    emptyMessage="No seed category cost data for the selected period."
   />

   <DashboardChartCard
    title="Supply Categories"
    data={supplyChartData}
    fillClass="dashboard-bar-fill-supply"
    emptyMessage="No garden supply category cost data for the selected period."
   />
  </div>
 );
}

export default CategorySpendCharts;
