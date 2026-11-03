// src/components/dashboard/CategorySpendCharts.jsx
import DashboardEmpty from "./DashboardEmpty";

function DashboardChartCard({title,data=[],fillClass="",emptyMessage=""}){

 return(
  <div className="dashboard-chart-card">
   <div className="dashboard-chart-head">
    <h3 className="dashboard-chart-title">{title}</h3>
   </div>

   <div className="dashboard-chart-body">
    {data.length?data.map((item)=>(
     <div key={item.category} className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
       <span className="dashboard-bar-label">{item.category}</span>
       <span className="dashboard-bar-value">${item.cost.toFixed(2)}</span>
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

function CategorySpendCharts({inventoryChartData=[],orderChartData=[]}){

 return(
  <div className="dashboard-chart-grid">

   <DashboardChartCard
    title="Kitchen Inventory Value"
    data={inventoryChartData}
    fillClass="dashboard-bar-fill-inventory"
    emptyMessage="No inventory category cost data for the selected period."
   />

   <DashboardChartCard
    title="Order Revenue"
    data={orderChartData}
    fillClass="dashboard-bar-fill-orders"
    emptyMessage="No order revenue data for the selected period."
   />

  </div>
 );
}

export default CategorySpendCharts;
