import {CalendarDays} from "lucide-react";

export default function OverviewWeek({days}){
 const total=days.reduce((sum,day)=>sum+day.count,0);
 const highest=Math.max(1,...days.map(day=>day.count));
 return <section className="overview-panel"><div className="overview-panel-heading"><span className="overview-panel-icon"><CalendarDays size={20}/></span><div><p>Next seven days</p><h2>Upcoming deadlines</h2></div><strong className="overview-week-total">{total}</strong></div><p className="overview-panel-intro">Due dates for open publishing work.</p><div className="overview-week-chart" aria-label="Deadlines by day">{days.map(day=><div key={day.date}><strong>{day.count||""}</strong><span className="overview-week-track"><span style={{height:day.count?`${Math.max(6,day.count/highest*100)}%`:"0"}}/></span><small>{day.label}</small></div>)}</div>{!total&&<p className="overview-calm">No deadlines scheduled this week.</p>}</section>;
}
