import {useMemo,useState} from "react";
import {Link} from "react-router-dom";
import {Modal} from "react-bootstrap";
import {CheckSquare,NotebookPen} from "lucide-react";

const isOpen=task=>!["done","completed","cancelled"].includes(String(task.status||"").toLowerCase());

function DashboardDailyWork({notes=[],tasks=[]}){
 const[selectedNote,setSelectedNote]=useState(null);
 const[selectedTask,setSelectedTask]=useState(null);
 const visibleTasks=useMemo(()=>tasks.filter(isOpen).slice(0,6),[tasks]);

 return(
  <section className="mentor-daily-work">
   <div className="mentor-today-note">
    <header><NotebookPen size={18}/><h2>Notes Taken Today</h2><span>{new Date().toLocaleDateString()}</span></header>
    {notes.length?notes.map(note=>(
     <button type="button" className="mentor-today-note-row" key={note._id} onClick={()=>setSelectedNote(note)}>
      <div><strong>{note.menteeName}</strong><span>{note.note}</span></div>
      <small>{new Date(note.createdAt).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</small>
     </button>
    )):<p className="mentor-empty">No mentor notes recorded today.</p>}
   </div>
   <div className="mentor-today-tasks">
    <header><CheckSquare size={18}/><h2>Today’s Task List</h2><Link to="/tasks" state={{fromDashboard:true}}>Open Task List</Link></header>
    {visibleTasks.length?visibleTasks.map(task=>(
     <button type="button" className="mentor-task-row" key={task._id} onClick={()=>setSelectedTask(task)}>
      <span>{task.name}</span>
      <small>{task.dueDate?new Date(task.dueDate).toLocaleDateString():"No due date"} · {task.priority||"Normal"}</small>
     </button>
    )):<p className="mentor-empty">No open tasks.</p>}
   </div>

   <Modal show={Boolean(selectedNote)} onHide={()=>setSelectedNote(null)} centered>
    <Modal.Header closeButton><Modal.Title>Mentor Note</Modal.Title></Modal.Header>
    <Modal.Body>
     <div className="mentor-readonly-details">
      <div><strong>Mentee:</strong><span>{selectedNote?.menteeName||"—"}</span></div>
      <div><strong>Date:</strong><span>{selectedNote?.createdAt?new Date(selectedNote.createdAt).toLocaleString():"—"}</span></div>
      <div><strong>Category:</strong><span>{selectedNote?.category||"General"}</span></div>
      <div><strong>Risk:</strong><span>{selectedNote?.riskLevel||"Low"}</span></div>
      <div><strong>Follow-up:</strong><span>{selectedNote?.followUpRequired?"Required":"No"}</span></div>
      <div className="mentor-readonly-wide"><strong>Note:</strong><span>{selectedNote?.note||"—"}</span></div>
     </div>
    </Modal.Body>
   </Modal>

   <Modal show={Boolean(selectedTask)} onHide={()=>setSelectedTask(null)} centered>
    <Modal.Header closeButton><Modal.Title>Task Details</Modal.Title></Modal.Header>
    <Modal.Body>
     <div className="mentor-readonly-details">
      <div><strong>Task:</strong><span>{selectedTask?.name||"—"}</span></div>
      <div><strong>Status:</strong><span>{selectedTask?.status||"Open"}</span></div>
      <div><strong>Priority:</strong><span>{selectedTask?.priority||"Normal"}</span></div>
      <div><strong>Due:</strong><span>{selectedTask?.dueDate?new Date(selectedTask.dueDate).toLocaleString():"No due date"}</span></div>
      <div className="mentor-readonly-wide"><strong>Description:</strong><span>{selectedTask?.description||"—"}</span></div>
      {selectedTask?.message?<div className="mentor-readonly-wide"><strong>Reminder:</strong><span>{selectedTask.message}</span></div>:null}
     </div>
    </Modal.Body>
   </Modal>
  </section>
 );
}

export default DashboardDailyWork;
