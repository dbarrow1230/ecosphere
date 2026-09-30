import {CheckCircle2,Layers3} from "lucide-react";

export default function OverviewActivity({open,completed,archived}){
 const total=open+completed+archived;
 const percent=value=>total?`${Math.round(value/total*100)}%`:"0%";
 return <section className="overview-panel"><div className="overview-panel-heading"><span className="overview-panel-icon"><Layers3 size={20}/></span><div><p>Workload</p><h2>Publication progress</h2></div></div><p className="overview-panel-intro">A snapshot of publishing records across all departments.</p><div className="overview-progress" role="img" aria-label={`${open} open, ${completed} completed, ${archived} archived`}><span style={{width:percent(open)}}/><span style={{width:percent(completed)}}/><span style={{width:percent(archived)}}/></div><div className="overview-progress-legend"><div><span className="overview-dot is-open"/>Open<strong>{open}</strong></div><div><span className="overview-dot is-complete"/>Completed<strong>{completed}</strong></div><div><span className="overview-dot is-archived"/>Archived<strong>{archived}</strong></div></div>{!total&&<p className="overview-calm"><CheckCircle2 size={17}/> No publishing records yet.</p>}</section>;
}
