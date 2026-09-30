import ActivityLineChart from "./ActivityLineChart";
import {months} from "../../utils/dashboard/dashboardFilters";

function MonthlyActivityChart({data=[],yearFilter,monthFilter}){

 const monthLabel=monthFilter==="all"?"Current Month":months.find((item)=>item.value===String(monthFilter))?.label||"Month";
 const yearLabel=yearFilter==="all"?String(new Date().getFullYear()):yearFilter;

 return(
  <section className="dashboard-section dashboard-insight-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Monthly Activity</p>
     <h2 className="dashboard-section-title">{monthLabel} {yearLabel}</h2>
    </div>
   </div>

   <ActivityLineChart data={data} valueKey="value" labelKey="label"/>
  </section>
 );
}

export default MonthlyActivityChart;
