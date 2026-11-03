import SpendingLineChart from "./SpendingLineChart";

function YearlySpendingChart({data=[],yearFilter}){

 return(
  <section className="dashboard-section dashboard-insight-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Yearly Spending</p>
     <h2 className="dashboard-section-title">{yearFilter}</h2>
    </div>
   </div>

   <SpendingLineChart data={data} valueKey="value" labelKey="label"/>
  </section>
 );
}

export default YearlySpendingChart;