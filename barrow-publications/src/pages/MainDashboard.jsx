import {useEffect,useMemo,useState} from "react";
import OverviewSummary from "../components/dashboard/OverviewSummary.jsx";
import OverviewActivity from "../components/dashboard/OverviewActivity.jsx";
import OverviewWeek from "../components/dashboard/OverviewWeek.jsx";
import DashboardError from "../components/dashboard/DashboardError.jsx";
import {publishingApi} from "../utils/publishingApi.js";
import "../styles/Dashboard.css";

const dateKey=value=>String(value||"").slice(0,10);
const localDate=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");

export default function MainDashboard(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [asOf]=useState(()=>new Date());
 useEffect(()=>{let active=true;publishingApi("publishing/records").then(data=>{if(active)setRows(data.records||[]);}).catch(cause=>{if(active)setError(cause.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const overview=useMemo(()=>{
  const open=rows.filter(row=>!["completed","archived"].includes(row.status));
  const today=localDate(asOf);
  const overdue=open.filter(row=>row.dueDate&&dateKey(row.dueDate)<today);
  const blocked=open.filter(row=>row.status==="blocked");
  const review=open.filter(row=>row.status==="in-review");
  const attention=new Set([...overdue,...blocked,...review].map(row=>row._id)).size;
  const days=Array.from({length:7},(_,index)=>{const date=new Date(asOf.getFullYear(),asOf.getMonth(),asOf.getDate()+index);const key=localDate(date);return {date:key,label:date.toLocaleDateString(undefined,{weekday:"short"}),count:open.filter(row=>dateKey(row.dueDate)===key).length};});
  return {open:open.length,completed:rows.filter(row=>row.status==="completed").length,archived:rows.filter(row=>row.status==="archived").length,overdue:overdue.length,blocked:blocked.length,review:review.length,attention,days};
 },[rows,asOf]);
 return <div className="dashboard dashboard-overview">
  {error?<DashboardError message={error}/>:null}
  {loading?<p role="status">Loading publishing overview…</p>:<><OverviewSummary attention={overview.attention} overdue={overview.overdue} blocked={overview.blocked} review={overview.review}/><div className="overview-panel-grid"><OverviewActivity open={overview.open} completed={overview.completed} archived={overview.archived}/><OverviewWeek days={overview.days}/></div></>}
 </div>;
}
