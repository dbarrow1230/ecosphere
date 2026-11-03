import {useState} from "react";
import {summarizeActivity} from "../../utils/dashboard/activityMetrics.js";
import "../../styles/ActivityMetrics.css";

function ReviewInsightCards({yearlyData=[],monthlyData=[],year,monthLabel,linkCount=0,noteCount=0}){
 const [view,setView]=useState("year");
 const yearly=summarizeActivity(yearlyData);
 const monthly=summarizeActivity(monthlyData);
 const data=view==="year"?yearlyData:monthlyData;
 const summary=view==="year"?yearly:monthly;
 const period=view==="year"?String(year):`${monthLabel} ${year}`;
 const width=720,height=180,left=44,right=16,top=30,bottom=36;
 const plotHeight=height-top-bottom;
 const step=Math.max(1,Math.ceil(summary.peakValue/4));
 const ceiling=step*4;
 const slot=(width-left-right)/Math.max(data.length,1);
 const metrics=[
  {label:`Notes in ${year}`,value:yearly.total},
  {label:`Notes in ${monthLabel}`,value:monthly.total},
  {label:`Active days in ${monthLabel}`,value:`${monthly.activePeriods} / ${monthlyData.length}`},
  {label:"Notes per calendar day",value:monthly.average.toFixed(1)},
  {label:"Busiest month",value:yearly.total?yearly.peakLabel:"—",detail:yearly.total?`${yearly.peakValue} notes`:"No notes in this year"},
  {label:`Busiest day in ${monthLabel}`,value:monthly.total?monthly.peakLabel:"—",detail:monthly.total?`${monthly.peakValue} notes`:"No notes in this month"}
 ];
 return <section className="dashboard-section dashboard-review-card activity-metrics-card">
  <div className="dashboard-section-head"><div><p className="dashboard-section-kicker">Activity metrics</p><h2 className="dashboard-section-title">Activity</h2></div></div>
  <dl className="activity-metrics-grid">{metrics.slice(0,4).map(metric=><div key={metric.label}><dt>{metric.label}</dt><dd>{typeof metric.value==="number"?metric.value.toLocaleString():metric.value}</dd>{metric.detail&&<small>{metric.detail}</small>}</div>)}</dl>
  <div className="activity-metrics-toolbar" role="group" aria-label="Activity chart period">
   <button type="button" className={`btn btn-sm ${view==="year"?"btn-primary":"btn-outline-secondary"}`} aria-pressed={view==="year"} onClick={()=>setView("year")}>By month</button>
   <button type="button" className={`btn btn-sm ${view==="month"?"btn-primary":"btn-outline-secondary"}`} aria-pressed={view==="month"} onClick={()=>setView("month")}>By day</button>
  </div>
  <h3 className="h6 mt-2 mb-1">{period} · {summary.total.toLocaleString()} notes</h3>
  <div className="activity-metrics-chart">
   <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${period} notes ${view==="year"?"by month":"by day"}. ${summary.total} total notes.`}>
    <text x={left} y="14" className="activity-metrics-axis">Notes</text>
    {[0,1,2,3,4].map(index=>{const value=index*step;const y=top+plotHeight-value/ceiling*plotHeight;return <g key={value}><line x1={left} x2={width-right} y1={y} y2={y} className="activity-metrics-gridline"/><text x={left-8} y={y+4} textAnchor="end" className="activity-metrics-axis">{value}</text></g>;})}
    {data.map((item,index)=>{const barHeight=item.value/ceiling*plotHeight;const x=left+index*slot+slot*.18;return <g key={item.label} tabIndex={0} aria-label={`${item.label}: ${item.value} notes`}>
     <title>{`${view==="month"?monthLabel+" ":""}${item.label}: ${item.value} notes`}</title>
     <rect x={x} y={top+plotHeight-barHeight} width={slot*.64} height={barHeight} rx="2" className="activity-metrics-bar"/>
     {item.value>0&&<text x={x+slot*.32} y={top+plotHeight-barHeight-6} textAnchor="middle" className="activity-metrics-value">{item.value}</text>}
     <text x={x+slot*.32} y={height-12} textAnchor="middle" className="activity-metrics-axis">{item.label}</text>
    </g>;})}
   </svg>
  </div>
  {!summary.total&&<p className="activity-metrics-scope">No notes recorded for {period}.</p>}
  <details><summary>More metrics and exact counts</summary><p className="activity-metrics-scope mt-2">Busiest month: {yearly.peakLabel||"—"} ({yearly.peakValue} notes). Busiest day in {monthLabel}: {monthly.peakLabel||"—"} ({monthly.peakValue} notes).</p><p className="activity-metrics-scope">Year and month follow the calendar selection. The day filter does not change these totals. Daily average includes zero-activity days; tied peaks show the earliest period.</p><div className="activity-metrics-table"><table className="table table-sm"><caption>Note activity for {period}</caption><thead><tr><th scope="col">{view==="year"?"Month":"Day"}</th><th scope="col">Notes</th></tr></thead><tbody>{data.map(item=><tr key={item.label}><th scope="row">{item.label}</th><td>{item.value.toLocaleString()}</td></tr>)}</tbody></table></div></details>
  <p className="activity-metrics-scope mt-2 mb-0">All-time collection: <strong>{noteCount.toLocaleString()} notes</strong> · <strong>{linkCount.toLocaleString()} connections</strong>.</p>
 </section>;
}
export default ReviewInsightCards;
