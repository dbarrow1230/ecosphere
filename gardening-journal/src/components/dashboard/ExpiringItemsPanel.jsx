// src/components/dashboard/ExpiringItemsPanel.jsx
import {Clock3} from "lucide-react";
import DashboardEmpty from "./DashboardEmpty";
import DashboardSection from "./DashboardSection";
import {useEffect,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {localDateKey,sortTasksByUrgency,taskDateKey,taskUrgency} from "../../utils/dashboard/taskUrgency.js";

function ExpiringItemsPanel({expiringItems=[],className=""}){
 const location=useLocation();
 const [today,setToday]=useState(()=>localDateKey());
 useEffect(()=>{
  const timer=setInterval(()=>setToday(localDateKey()),30000);
  return()=>clearInterval(timer);
 },[]);
 const items=sortTasksByUrgency(expiringItems,today);
 return(
  <DashboardSection className={`dashboard-upcoming-tasks ${className}`.trim()} kicker="Time Sensitive" title="Upcoming Garden Tasks" linkTo="/tasks" linkLabel="View all">
   <ul className="dashboard-list" tabIndex={0} aria-label="Upcoming garden tasks">
    {items.length?items.map(item=>(
     <li key={item._id||item.id||item.name||item.title} className={`dashboard-list-item dashboard-task-${taskUrgency(item,today)}`}>
      <Link className="dashboard-task-link" state={{followUpOrigin:location.pathname+location.search+location.hash}} to={item.journalEntryId?`/journal?entry=${encodeURIComponent(item.journalEntryId)}`:item.href||`/tasks?task=${encodeURIComponent(item._id||item.id)}`}>
      <span className="dashboard-list-icon dashboard-list-icon-accent"><Clock3 size={17} strokeWidth={2.2}/></span>
      <div className="dashboard-list-content">
       <span className="dashboard-item-title">{item.title||item.name||"Garden task"}</span>
       <span className="dashboard-item-meta"><strong>{taskUrgency(item,today)==="overdue"?"Overdue":taskUrgency(item,today)==="today"?"Due today":"Upcoming"}</strong> · {taskDateKey(item)||"No due date"} · {item.garden||item.location||item.section||item.category||"Garden"}</span>
      </div>
      </Link>
     </li>
    )):(
     <DashboardEmpty as="li" message="No upcoming garden tasks right now."/>
    )}
   </ul>
  </DashboardSection>
 );
}

export default ExpiringItemsPanel;
