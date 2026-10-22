import {useEffect,useRef,useState} from "react";
import {Button,Modal} from "react-bootstrap";
import {Link,useLocation} from "react-router-dom";
import {buildJournalFollowUpTasks} from "../utils/dashboard/journalFollowUpTasks.js";
import {localDateKey,sortTasksByUrgency,taskUrgency} from "../utils/dashboard/taskUrgency.js";

export default function FollowUpAlerts({userId}){
 const [alerts,setAlerts]=useState([]);
 const seen=useRef(new Set());
 const {pathname,search,hash}=useLocation();
 useEffect(()=>{
  if(!userId)return;
  let ignore=false;
  const check=async()=>{
   try{
    const response=await fetch("/api/journal-entries");
    if(!response.ok)return;
    const data=await response.json();
    if(ignore)return;
    const today=localDateKey();
    const entries=Array.isArray(data)?data:data.data||data.items||data.results||[];
    const due=sortTasksByUrgency(buildJournalFollowUpTasks(entries),today).filter(task=>["today","overdue"].includes(taskUrgency(task,today)));
    const fresh=due.filter(task=>{
     const key=`follow-up-alert:${userId}:${today}:${task._id}:${task.dueDate}:${taskUrgency(task,today)}`;
     try{if(sessionStorage.getItem(key))return false;}catch{/* Storage may be unavailable. */}
     if(seen.current.has(key))return false;
     seen.current.add(key);
     return true;
    });
    setAlerts(current=>[...current.filter(task=>due.some(item=>item._id===task._id&&item.dueDate===task.dueDate)),...fresh]);
   }catch{/* Retry on the next check if the connection is unavailable. */}
  };
  check();
  const timer=setInterval(check,60000);
  window.addEventListener("focus",check);
  return()=>{ignore=true;clearInterval(timer);window.removeEventListener("focus",check);};
 },[userId,pathname]);
 const dismiss=()=>{
  for(const task of alerts){
   try{sessionStorage.setItem(`follow-up-alert:${userId}:${localDateKey()}:${task._id}:${task.dueDate}:${taskUrgency(task)}`,"1");}catch{/* Keep the in-memory fallback. */}
  }
  setAlerts([]);
 };
 return <Modal show={!!userId&&alerts.length>0} onHide={dismiss} centered scrollable>
  <Modal.Header closeButton><Modal.Title>Garden follow-ups need attention</Modal.Title></Modal.Header>
  <Modal.Body>{alerts.map(task=><div key={task._id} className={`alert ${taskUrgency(task)==="overdue"?"alert-danger":"alert-warning"}`}>
   <Link to={`/journal?entry=${encodeURIComponent(task.journalEntryId)}`} state={{followUpOrigin:pathname+search+hash}} onClick={dismiss}><strong>{task.title}</strong></Link><div>{taskUrgency(task)==="overdue"?"Overdue":"Due today"} · {task.dueDate}</div>
   {task.garden&&<div>{task.garden}</div>}
  </div>)}</Modal.Body>
  <Modal.Footer><Button variant="secondary" onClick={dismiss}>Dismiss</Button><Button as={Link} to="/journal" onClick={dismiss}>Review follow-ups</Button></Modal.Footer>
 </Modal>;
}
