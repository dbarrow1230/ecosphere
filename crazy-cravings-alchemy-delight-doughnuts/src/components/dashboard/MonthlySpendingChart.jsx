// src/components/dashboard/MonthlySpendingChart.jsx
import SpendingLineChart from "./SpendingLineChart";
import {months} from "../../utils/dashboard/dashboardFilters";

function MonthlySpendingChart({data=[],yearFilter,monthFilter}){

 const monthLabel=months.find((item)=>item.value===String(monthFilter))?.label||"Month";

 return(
  <section className="dashboard-section dashboard-insight-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Monthly Shop Spending</p>
     <h2 className="dashboard-section-title">{monthLabel} {yearFilter}</h2>
    </div>
   </div>

   <SpendingLineChart data={data} valueKey="value" labelKey="label"/>
  </section>
 );
}

export default MonthlySpendingChart;