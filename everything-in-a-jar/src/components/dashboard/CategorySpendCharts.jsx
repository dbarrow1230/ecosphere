// src/components/dashboard/CategorySpendCharts.jsx
import DashboardEmpty from "./DashboardEmpty";

function DashboardChartCard({title,data=[],fillClass="",emptyMessage=""}){

 const getLabel=item=>item.category||item.name||item.label||"Uncategorized";
 const getCost=item=>Number(item.cost||item.value||item.amount||item.total||0);
 const maxCost=Math.max(...data.map(item=>getCost(item)),0);

 return(
  <div className="dashboard-chart-card">
   <div className="dashboard-chart-head">
    <h3 className="dashboard-chart-title">{title}</h3>
   </div>

   <div className="dashboard-chart-body">
    {data.length?data.map((item)=>(
     <div key={getLabel(item)} className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
       <span className="dashboard-bar-label">{getLabel(item)}</span>
       <span className="dashboard-bar-value">${getCost(item).toFixed(2)}</span>
      </div>

      <div className="dashboard-bar-track">
       <div className={`dashboard-bar-fill ${fillClass}`.trim()} style={{width:maxCost?`${Math.min((getCost(item)/maxCost)*100,100)}%`:"0%"}}/>
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
    title="Preserves"
    data={pantryChartData}
    fillClass="dashboard-bar-fill-pantry"
    emptyMessage="No preserve spending data for the selected period."
   />

   <DashboardChartCard
    title="Fermented Goods"
    data={householdChartData}
    fillClass="dashboard-bar-fill-household"
    emptyMessage="No fermented goods spending data for the selected period."
   />

   <DashboardChartCard
    title="Ingredients"
    data={groceryChartData}
    fillClass="dashboard-bar-fill-grocery"
    emptyMessage="No ingredient spending data for the selected period."
   />

   <DashboardChartCard
    title="Packaging"
    data={personalChartData}
    fillClass="dashboard-bar-fill-personal"
    emptyMessage="No packaging spending data for the selected period."
   />

   <DashboardChartCard
    title="Equipment"
    data={clothingChartData}
    fillClass="dashboard-bar-fill-clothing"
    emptyMessage="No equipment spending data for the selected period."
   />

   <DashboardChartCard
    title="Markets & Sales"
    data={furnitureChartData}
    fillClass="dashboard-bar-fill-furniture"
    emptyMessage="No market or sales spending data for the selected period."
   />

   <DashboardChartCard
    title="Other Business Costs"
    data={otherChartData}
    fillClass="dashboard-bar-fill-other"
    emptyMessage="No other business cost data for the selected period."
   />

   {dynamicChartGroups.map((group)=>(
    <DashboardChartCard
     key={group.type||group.category||group.title}
     title={group.title}
     data={group.data}
     fillClass={group.fillClass}
     emptyMessage={`No ${String(group.label||group.title||"business").toLowerCase()} spending data for the selected period.`}
    />
   ))}

  </div>
 );
}

export default CategorySpendCharts;