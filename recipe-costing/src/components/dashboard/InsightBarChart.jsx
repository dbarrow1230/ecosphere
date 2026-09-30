// src/components/dashboard/InsightBarChart.jsx
import {Link} from "react-router-dom";

function BarRow({item,loading,fillClass}){
 const content=(
  <>
   <div className="dashboard-bar-meta">
    <span className="dashboard-bar-label">{item.label}</span>
    <span className="dashboard-bar-value">{loading?"—":item.value}</span>
   </div>
   <div className="dashboard-bar-track">
    <div className={`dashboard-bar-fill ${fillClass}`} style={{width:`${loading?0:item.percent}%`}}/>
   </div>
  </>
 );

 if(item.to){
  return <Link to={item.to} className="dashboard-bar-row dashboard-bar-link">{content}</Link>;
 }

 return <div className="dashboard-bar-row">{content}</div>;
}

function InsightBarChart({title,rows,loading,fillClass}){

 return(
  <div className="dashboard-chart-card">
   <div className="dashboard-chart-head">
    <h3 className="dashboard-chart-title">{title}</h3>
   </div>

   <div className="dashboard-chart-body">
    {rows.map(item=><BarRow key={item.label} item={item} loading={loading} fillClass={fillClass}/>)}
   </div>
  </div>
 );

}

export default InsightBarChart;
