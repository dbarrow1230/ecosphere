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

function CategorySpendCharts({lodgingChartData=[],transportationChartData=[],diningChartData=[],activitiesChartData=[],souvenirsChartData=[],documentsChartData=[],otherChartData=[],dynamicChartGroups=[]}){

 return(
  <div className="dashboard-chart-grid">

   <DashboardChartCard
    title="Lodging"
    data={lodgingChartData}
    fillClass="dashboard-bar-fill-pantry"
    emptyMessage="No lodging spending data for the selected period."
   />

   <DashboardChartCard
    title="Transportation"
    data={transportationChartData}
    fillClass="dashboard-bar-fill-household"
    emptyMessage="No transportation spending data for the selected period."
   />

   <DashboardChartCard
    title="Dining"
    data={diningChartData}
    fillClass="dashboard-bar-fill-grocery"
    emptyMessage="No dining spending data for the selected period."
   />

   <DashboardChartCard
    title="Activities"
    data={activitiesChartData}
    fillClass="dashboard-bar-fill-personal"
    emptyMessage="No activity spending data for the selected period."
   />

   <DashboardChartCard
    title="Souvenirs"
    data={souvenirsChartData}
    fillClass="dashboard-bar-fill-clothing"
    emptyMessage="No souvenir spending data for the selected period."
   />

   <DashboardChartCard
    title="Documents & Fees"
    data={documentsChartData}
    fillClass="dashboard-bar-fill-furniture"
    emptyMessage="No document or fee spending data for the selected period."
   />

   <DashboardChartCard
    title="Other Travel Costs"
    data={otherChartData}
    fillClass="dashboard-bar-fill-other"
    emptyMessage="No other travel spending data for the selected period."
   />

   {dynamicChartGroups.map((group)=>(
    <DashboardChartCard
     key={group.type}
     title={group.title}
     data={group.data}
     fillClass={group.fillClass}
     emptyMessage={`No ${group.label.toLowerCase()} travel spending data for the selected period.`}
    />
   ))}

  </div>
 );
}

export default CategorySpendCharts;