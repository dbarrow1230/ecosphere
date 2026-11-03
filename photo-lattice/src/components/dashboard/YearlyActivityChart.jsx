import ActivityLineChart from "./ActivityLineChart";

function YearlyActivityChart({data=[],yearFilter}){

 const yearLabel=yearFilter==="all"?String(new Date().getFullYear()):yearFilter;

 return(
  <section className="dashboard-section dashboard-insight-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Yearly Activity</p>
     <h2 className="dashboard-section-title">{yearLabel}</h2>
    </div>
   </div>

   <ActivityLineChart data={data} valueKey="value" labelKey="label"/>
  </section>
 );
}

export default YearlyActivityChart;
