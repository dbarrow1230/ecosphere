import {ArrowRight,FileOutput,Inbox,Network} from "lucide-react";
import {Link} from "react-router-dom";

function WorkflowPrioritiesPanel({fleetingCount=0,draftStructureCount=0,draftOutputs=[],loading=false}){
 const priorities=[
  {label:"Process Fleeting Captures",meta:"Move captured ideas into the permanent workflow.",value:fleetingCount,to:"/inbox",icon:<Inbox size={18} strokeWidth={2.2}/>},
  {label:"Develop Structure Notes",meta:"Continue outlines that are still in draft.",value:draftStructureCount,to:"/structures",icon:<Network size={18} strokeWidth={2.2}/>},
  {label:"Finish Draft Outputs",meta:"Continue unfinished work toward publication.",value:draftOutputs.length,to:"/outputs?status=draft",icon:<FileOutput size={18} strokeWidth={2.2}/>,items:draftOutputs}
 ];

 return(
  <section className="dashboard-section dashboard-priorities-card">
   <div className="dashboard-section-head">
    <div><p className="dashboard-section-kicker">Next Actions</p><h2 className="dashboard-section-title">Workflow Priorities</h2></div>
   </div>
   <div className="dashboard-priority-list">
    {priorities.map(item=><div key={item.label} className="dashboard-priority-item"><Link className="dashboard-priority-main" to={item.to}><span className="dashboard-card-icon">{item.icon}</span><span className="dashboard-priority-copy"><strong>{item.label}</strong><span>{item.meta}</span></span><span className="dashboard-priority-count">{loading?"…":item.value}</span><ArrowRight className="dashboard-priority-arrow" size={16} strokeWidth={2.1}/></Link>{item.items?.length?<div className="dashboard-priority-links">{item.items.map(output=><Link key={output._id} to={`/outputs?status=draft&selected=${encodeURIComponent(output._id)}`}>{output.title||"Untitled Output"}</Link>)}</div>:null}</div>)}
   </div>
  </section>
 );
}

export default WorkflowPrioritiesPanel;
