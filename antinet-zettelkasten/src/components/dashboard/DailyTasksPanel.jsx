import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {taskCompletedOnDate,taskOccursOnDate} from "../../utils/dailyTaskRecurrence.js";
import "../../styles/DailyTasks.css";

const emptyTask=date=>({title:"",details:"",scheduledDate:date,startTime:"",recurrenceRule:"none",recurrenceEndDate:"",completed:false});
const formFromTask=task=>({title:task.title||"",details:task.details||"",scheduledDate:task.scheduledDate,startTime:task.startTime||"",recurrenceRule:task.recurrenceRule||"none",recurrenceEndDate:task.recurrenceEndDate||"",completed:!!task.completed});
const repeatLabels={daily:"Daily",weekly:"Weekly",biweekly:"Every 2 weeks",monthly:"Monthly"};
const sortTasks=tasks=>[...tasks].sort((a,b)=>a.scheduledDate.localeCompare(b.scheduledDate)||String(a.startTime||"").localeCompare(String(b.startTime||""))||a.title.localeCompare(b.title));

export default function DailyTasksPanel({userId,selectedDate,onDateChange,onTasksChange,selectedTask,onClearSelection}){
 const [tasks,setTasks]=useState([]);
 const [loading,setLoading]=useState(true);
 const [busyId,setBusyId]=useState("");
 const [error,setError]=useState("");
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState(emptyTask(selectedDate));

 const applyTasks=useCallback(next=>{const sorted=sortTasks(next);setTasks(sorted);onTasksChange(sorted);},[onTasksChange]);
 useEffect(()=>{
  if(!userId){queueMicrotask(()=>setLoading(false));return;}
  let active=true;
  fetch(`/api/daily-tasks?userId=${encodeURIComponent(userId)}`,{credentials:"include"})
   .then(async response=>{const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Unable to load daily tasks");return data?.data||[];})
   .then(records=>{if(active)applyTasks(records);})
   .catch(loadError=>{if(active)setError(loadError.message);})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[userId,applyTasks]);
 useEffect(()=>{
  if(!selectedTask)return;
  setEditing(selectedTask);
  setForm(formFromTask(selectedTask));
 },[selectedTask]);

 const openNew=()=>{setEditing({});setForm(emptyTask(selectedDate));setError("");};
 const openEdit=task=>{setEditing(task);setForm(formFromTask(task));setError("");};
 const closeEditor=()=>{setEditing(null);onClearSelection?.();};
 const save=async event=>{
  event.preventDefault();
  setBusyId(editing?._id||"new");setError("");
  try{
   if(form.recurrenceRule!=="none"&&form.recurrenceEndDate&&form.recurrenceEndDate<form.scheduledDate)throw new Error("Repeat end date must be on or after the first date");
   const response=await fetch(editing?._id?`/api/daily-tasks/${editing._id}`:"/api/daily-tasks",{method:editing?._id?"PUT":"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId,...form})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to save task");
   applyTasks(editing?._id?tasks.map(task=>task._id===editing._id?data.data:task):[...tasks,data.data]);
   onDateChange(taskOccursOnDate(data.data,selectedDate)?selectedDate:data.data.scheduledDate);
   closeEditor();
  }catch(saveError){setError(saveError.message);}
  finally{setBusyId("");}
 };
 const toggle=async task=>{
  setBusyId(task._id);setError("");
  try{
   const recurring=task.recurrenceRule&&task.recurrenceRule!=="none";
   const completedDates=new Set(task.completedDates||[]);
   if(recurring){if(completedDates.has(selectedDate))completedDates.delete(selectedDate);else completedDates.add(selectedDate);}
   const changes=recurring?{completedDates:[...completedDates]}:{completed:!task.completed};
   const response=await fetch(`/api/daily-tasks/${task._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId,...changes})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to update task");
   applyTasks(tasks.map(item=>item._id===task._id?data.data:item));
  }catch(updateError){setError(updateError.message);}
  finally{setBusyId("");}
 };
 const remove=async task=>{
  if(!window.confirm(`Delete “${task.title}”${task.recurrenceRule&&task.recurrenceRule!=="none"?" and all its future repeats":""}?`))return;
  setBusyId(task._id);setError("");
  try{
   const response=await fetch(`/api/daily-tasks/${task._id}?userId=${encodeURIComponent(userId)}`,{method:"DELETE",credentials:"include"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to delete task");
   applyTasks(tasks.filter(item=>item._id!==task._id));
  }catch(deleteError){setError(deleteError.message);}
  finally{setBusyId("");}
 };
 const dailyTasks=tasks.filter(task=>taskOccursOnDate(task,selectedDate));

 return <section className="dashboard-section dashboard-daily-tasks" aria-label="Daily tasks">
  <div className="dashboard-section-head"><div><p className="dashboard-section-kicker">Daily planning</p><h2 className="dashboard-section-title">Tasks for the day</h2></div><Button type="button" onClick={openNew} disabled={!userId}>Add task</Button></div>
  <Form.Group className="dashboard-daily-tasks-date"><Form.Label htmlFor="daily-tasks-date">Day</Form.Label><Form.Control id="daily-tasks-date" type="date" value={selectedDate} onChange={event=>onDateChange(event.target.value)}/></Form.Group>
  {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
  {loading?<div className="py-3 text-center"><Spinner animation="border"/></div>:dailyTasks.length?<ul className="dashboard-daily-tasks-list">{dailyTasks.map(task=><li key={task._id} className={taskCompletedOnDate(task,selectedDate)?"is-complete":""}>
   <div className="dashboard-daily-task-content"><Form.Check type="checkbox" id={`daily-task-${task._id}`} checked={taskCompletedOnDate(task,selectedDate)} disabled={busyId===task._id} onChange={()=>toggle(task)} label={task.title}/>{task.recurrenceRule&&task.recurrenceRule!=="none"&&<small className="daily-task-repeat-label">Repeats {repeatLabels[task.recurrenceRule]?.toLowerCase()}</small>}{task.details&&<p>{task.details}</p>}</div>
   {task.startTime&&<time>{task.startTime}</time>}
   <div className="dashboard-daily-tasks-actions"><Button size="sm" variant="outline-primary" onClick={()=>openEdit(task)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>remove(task)} disabled={busyId===task._id}>Delete</Button></div>
  </li>)}</ul>:<p className="mb-0">No tasks for this day.</p>}
  <Modal show={editing!==null} onHide={closeEditor} centered size="lg" className="daily-task-modal">
   <Form onSubmit={save}>
    <Modal.Header closeButton><Modal.Title>{editing?._id?"Edit task":"Add task"}</Modal.Title></Modal.Header>
    <Modal.Body>
     {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
     <Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-title">Task</Form.Label><Form.Control id="daily-task-title" required maxLength={200} value={form.title} onChange={event=>setForm(current=>({...current,title:event.target.value}))}/></Form.Group>
     <div className="daily-task-date-time">
      <Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-date">First date</Form.Label><Form.Control id="daily-task-date" required type="date" value={form.scheduledDate} onChange={event=>setForm(current=>({...current,scheduledDate:event.target.value}))}/></Form.Group>
      <Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-time">Time</Form.Label><Form.Control id="daily-task-time" type="time" value={form.startTime} onChange={event=>setForm(current=>({...current,startTime:event.target.value}))}/><Form.Text>Optional; leave blank for an all-day task.</Form.Text></Form.Group>
     </div>
     <div className="daily-task-date-time">
      <Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-repeat">Repeat</Form.Label><Form.Select id="daily-task-repeat" value={form.recurrenceRule} onChange={event=>setForm(current=>({...current,recurrenceRule:event.target.value,recurrenceEndDate:event.target.value==="none"?"":current.recurrenceEndDate}))}><option value="none">Does not repeat</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Every month</option></Form.Select></Form.Group>
      {form.recurrenceRule!=="none"&&<Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-repeat-end">Repeat until</Form.Label><Form.Control id="daily-task-repeat-end" type="date" min={form.scheduledDate} value={form.recurrenceEndDate} onChange={event=>setForm(current=>({...current,recurrenceEndDate:event.target.value}))}/><Form.Text>Optional; leave blank to keep repeating.</Form.Text></Form.Group>}
     </div>
     <Form.Group className="daily-task-field"><Form.Label htmlFor="daily-task-details">Details</Form.Label><Form.Control id="daily-task-details" as="textarea" rows={5} maxLength={5000} value={form.details} onChange={event=>setForm(current=>({...current,details:event.target.value}))}/></Form.Group>
     {form.recurrenceRule==="none"&&<Form.Check className="mt-3" type="checkbox" label="Completed" checked={form.completed} onChange={event=>setForm(current=>({...current,completed:event.target.checked}))}/>}
    </Modal.Body>
    <Modal.Footer><Button type="button" variant="outline-secondary" onClick={closeEditor}>Cancel</Button><Button type="submit" disabled={!!busyId}>{busyId?"Saving…":"Save task"}</Button></Modal.Footer>
   </Form>
  </Modal>
 </section>;
}
