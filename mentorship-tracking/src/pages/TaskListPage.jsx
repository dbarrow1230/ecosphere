import {useEffect,useState} from "react";

const emptyTask={name:"",description:"",dueDate:"",status:"Open",priority:"Normal"};

function TaskListPage({user}){
 const[tasks,setTasks]=useState([]);
 const[form,setForm]=useState(emptyTask);
 const userId=user?._id||user?.id||"";

 const loadTasks=async()=>{
  if(!userId)return;
  const response=await fetch(`/api/tasks?user=${encodeURIComponent(userId)}`);
  const data=await response.json();
  setTasks(data.tasks||[]);
 };

 useEffect(()=>{loadTasks();},[userId]);

 const addTask=async event=>{
  event.preventDefault();
  const response=await fetch("/api/tasks",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({...form,user:userId})
  });
  if(response.ok){setForm(emptyTask);await loadTasks();}
 };

 const updateStatus=async(task,status)=>{
  await fetch(`/api/tasks/${task._id}`,{
   method:"PUT",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({...task,user:userId,status,completedAt:status==="Completed"?new Date().toISOString():null})
  });
  await loadTasks();
 };

 return(
  <section className="mentor-task-page">
   <header><div><p className="mentor-kicker">My mentorship work</p><h1>Task List</h1></div></header>
   <form className="mentor-task-entry" onSubmit={addTask}>
    <label>Task: <input value={form.name} onChange={event=>setForm({...form,name:event.target.value})} required/></label>
    <label>Due: <input type="date" value={form.dueDate} onChange={event=>setForm({...form,dueDate:event.target.value})}/></label>
    <label>Priority:
     <select value={form.priority} onChange={event=>setForm({...form,priority:event.target.value})}>
      <option>Low</option><option>Normal</option><option>High</option>
     </select>
    </label>
    <button type="submit">Add Task</button>
   </form>
   <div className="mentor-task-list">
    <div className="mentor-task-list-head"><span>Task</span><span>Due</span><span>Priority</span><span>Status</span></div>
    {tasks.map(task=>(
     <div className="mentor-task-list-row" key={task._id}>
      <span><strong>{task.name}</strong>{task.description?<small>{task.description}</small>:null}</span>
      <span>{task.dueDate?new Date(task.dueDate).toLocaleDateString():"—"}</span>
      <span>{task.priority||"Normal"}</span>
      <select value={task.status||"Open"} onChange={event=>updateStatus(task,event.target.value)}>
       <option>Open</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
      </select>
     </div>
    ))}
   </div>
  </section>
 );
}

export default TaskListPage;
