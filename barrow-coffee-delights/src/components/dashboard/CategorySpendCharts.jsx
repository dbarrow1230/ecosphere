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

function CategorySpendCharts({pantryChartData=[],householdChartData=[],groceryChartData=[],personalChartData=[],clothingChartData=[],furnitureChartData=[],otherChartData=[],dynamicChartGroups=[]}){

 return(
  <div className="dashboard-chart-grid">

   <DashboardChartCard
    title="Pantry Categories"
    data={pantryChartData}
    fillClass="dashboard-bar-fill-pantry"
    emptyMessage="No pantry category spending data for the selected period."
   />

   <DashboardChartCard
    title="Household Categories"
    data={householdChartData}
    fillClass="dashboard-bar-fill-household"
    emptyMessage="No household category spending data for the selected period."
   />

   <DashboardChartCard
    title="Grocery Categories"
    data={groceryChartData}
    fillClass="dashboard-bar-fill-grocery"
    emptyMessage="No grocery category spending data for the selected period."
   />

   <DashboardChartCard
    title="Personal Categories"
    data={personalChartData}
    fillClass="dashboard-bar-fill-personal"
    emptyMessage="No personal category spending data for the selected period."
   />

   <DashboardChartCard
    title="Clothing Categories"
    data={clothingChartData}
    fillClass="dashboard-bar-fill-clothing"
    emptyMessage="No clothing category spending data for the selected period."
   />

   <DashboardChartCard
    title="Furniture Categories"
    data={furnitureChartData}
    fillClass="dashboard-bar-fill-furniture"
    emptyMessage="No furniture category spending data for the selected period."
   />

   <DashboardChartCard
    title="Other Categories"
    data={otherChartData}
    fillClass="dashboard-bar-fill-other"
    emptyMessage="No other category spending data for the selected period."
   />

   {dynamicChartGroups.map((group)=>(
    <DashboardChartCard
     key={group.type}
     title={group.title}
     data={group.data}
     fillClass={group.fillClass}
     emptyMessage={`No ${group.label.toLowerCase()} category spending data for the selected period.`}
    />
   ))}

  </div>
 );
}

export default CategorySpendCharts;