// src/components/dashboard/DashboardInsights.jsx
import InsightBarChart from "./InsightBarChart.jsx";

function DashboardInsights({loading,costDistribution,formatDistribution,readingStatusData}){

 return(
  <section className="dashboard-section dashboard-section-wide dashboard-section-charts dashboard-insights">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Insights</p>
     <h2 className="dashboard-section-title">Catalog Trends</h2>
    </div>
   </div>

   <div className="dashboard-chart-grid dashboard-chart-grid-compact">
    <InsightBarChart title="Book Cost Breakdown" rows={costDistribution} loading={loading} fillClass="dashboard-bar-fill-household"/>
    <InsightBarChart title="Format Breakdown" rows={formatDistribution} loading={loading} fillClass="dashboard-bar-fill-pantry"/>
    <InsightBarChart title="Reading Status" rows={readingStatusData} loading={loading} fillClass="dashboard-bar-fill-pantry"/>
   </div>
  </section>
 );

}

export default DashboardInsights;