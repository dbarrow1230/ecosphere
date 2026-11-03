// src/components/dashboard/CategorySpendCharts.jsx
function CategorySpendCharts({recipeChartData=[],ingredientChartData=[]}){
 const getMaxValue=rows=>Math.max(...rows.map(row=>Number(row.cost??row.value??0)),0);

 const renderRows=(rows,emptyMessage)=>{
  const maxValue=getMaxValue(rows);

  return rows.length?(
   <div className="dashboard-chart-body">
    {rows.map(row=>{
     const percent=maxValue?Math.max((Number(row.value||0)/maxValue)*100,4):0;

     return(
      <div className="dashboard-bar-row" key={row.category||row.label}>
       <div className="dashboard-bar-meta">
        <span className="dashboard-bar-label">{row.category||row.label}</span>
        <span className="dashboard-bar-value">${Number(row.value||0).toFixed(2)}</span>
       </div>

       <meter className="dashboard-cost-meter" min="0" max="100" value={percent} aria-label={(row.category||row.label)+" cost proportion"}/>
      </div>
     );
    })}
   </div>
  ):(
   <p className="dashboard-empty">{emptyMessage}</p>
  );
 };

 return(
  <div className="dashboard-chart-grid">
   <article className="dashboard-chart-card">
    <div className="dashboard-chart-head">
     <h3 className="dashboard-chart-title">Recipe Category Costs</h3>
    </div>

    {renderRows(recipeChartData,"No recipe costing data found.")}
   </article>

   <article className="dashboard-chart-card">
    <div className="dashboard-chart-head">
     <h3 className="dashboard-chart-title">Ingredient Category Costs</h3>
    </div>

    {renderRows(ingredientChartData,"No ingredient costing data found.")}
   </article>
  </div>
 );
}

export default CategorySpendCharts;