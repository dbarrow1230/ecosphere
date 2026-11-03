import {createElement,useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowRight,BookOpen,CalendarClock,ChartNoAxesCombined,CircleAlert,ClipboardCheck,Plus,Tags} from "lucide-react";
import {publishingWorkflowSections,publishingReferencePages} from "../../data/publishingWorkflowSections.js";
import {publishingApi} from "../../utils/publishingApi.js";
import {readable} from "../../data/publishingSchema.js";
import "../../styles/PublishingWorkspace.css";

export default function PublishingDashboard(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;publishingApi("publishing/records").then(data=>{if(active)setRows(data.records||[]);}).catch(cause=>{if(active)setError(cause.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const active=rows.filter(row=>!["completed","archived"].includes(row.status));
 const today=new Date().toLocaleDateString("en-CA");
 const overdue=active.filter(row=>row.dueDate&&row.dueDate.slice(0,10)<today);
 const stats=[
  {label:"Active records",value:active.length,icon:BookOpen},
  {label:"Awaiting review",value:rows.filter(row=>row.status==="in-review").length,icon:ClipboardCheck},
  {label:"Blocked",value:rows.filter(row=>row.status==="blocked").length,icon:CircleAlert},
  {label:"Overdue",value:overdue.length,icon:CalendarClock}
 ];
 return <section className="publishing-workspace publishing-command-center">
  <header className="publishing-command-hero"><div><p className="publishing-command-kicker"><ChartNoAxesCombined size={16}/> Publishing operations</p><h1>Publication Command Center</h1><p>Guide every title from acquisition through release, marketing, sales, and rights.</p></div><div className="publishing-command-actions"><Link className="publishing-command-primary" to="/publishing/acquisitions/submissions?new=1"><Plus size={18}/>Add a submission</Link><Link className="publishing-command-secondary" to="/publishers"><Tags size={18}/>Publishers & categories</Link></div></header>
  {error&&<div className="alert alert-danger" role="alert">{error}</div>}{loading&&<p role="status">Loading publishing activity…</p>}
  <div className="publishing-command-stats">{stats.map(({label,value,icon})=><article key={label}><span className="publishing-command-stat-icon">{createElement(icon,{size:20})}</span><span>{label}</span><strong>{loading||error?"—":value}</strong></article>)}</div>
  <div className="publishing-command-heading"><div><p className="publishing-command-kicker">Workflow reference</p><h2>Move work forward</h2><p>Choose a department, then open the specific step you need.</p></div></div>
  <div className="publishing-command-grid">{publishingWorkflowSections.map((section,index)=>{const count=rows.filter(row=>row.module===section.id&&row.status!=="archived").length;return <article key={section.id} className="publishing-command-card"><div className="publishing-command-card-head"><span className="publishing-command-card-icon">{createElement(section.icon,{size:25})}</span><span className="publishing-command-step">{String(index+1).padStart(2,"0")}</span></div><p className="publishing-command-kicker">{section.kicker}</p><h3><Link to={section.path}>{section.label}<ArrowRight size={20}/></Link></h3><p>{section.summary}</p><span className="publishing-command-count">{loading||error?"—":count} records</span><nav aria-label={`${section.label} steps`}>{section.items.map(item=><Link key={item.path} to={item.path}>{item.label}<ArrowRight size={15}/></Link>)}</nav></article>;})}</div>
  <div className="publishing-command-lower"><section className="publishing-command-panel"><div className="publishing-command-heading"><div><p className="publishing-command-kicker">Activity</p><h2>Recent work</h2></div></div>{!loading&&!error&&!rows.length&&<p>No publishing records yet. Start with a submission above.</p>}<div className="publishing-table-wrap"><table className="table"><thead><tr><th>Title</th><th>Stage</th><th>Status</th><th>Owner</th></tr></thead><tbody>{rows.slice(0,10).map(row=><tr key={row._id}><td><Link to={`/publishing/${row.module}/${row.workflow}?record=${row._id}`}>{row.title}</Link></td><td>{readable(row.workflow)}</td><td>{readable(row.status)}</td><td>{row.owner||"Unassigned"}</td></tr>)}</tbody></table></div></section><section className="publishing-command-panel"><p className="publishing-command-kicker">House standards</p><h2>Reference library</h2><p>Keep guidance and checklists close to the work.</p><nav className="publishing-command-reference">{publishingReferencePages.map(page=>{const Icon=page.icon;return <Link key={page.slug} to={`/referance/${page.slug}`}><Icon size={18}/>{page.title}<ArrowRight size={16}/></Link>;})}</nav></section></div>
 </section>;
}
