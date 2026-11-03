// E:\React-Projects\bible-study\src\pages\StudyTaskPage.jsx
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import {Button,Card,Table,Modal,Badge,Spinner,Alert} from "react-bootstrap";
import StudyTaskForm from "./forms/StudyTaskForm";
import "../styles/study-task-form.css";

export default function StudyTaskPage(){
 const[searchParams]=useSearchParams();
 const navigate=useNavigate();
 const returnToDashboard=searchParams.get("from")==="dashboard";
 const[tasks,setTasks]=useState([]);
 const[studies,setStudies]=useState([]);
 const[priorities,setPriorities]=useState([]);
 const[statuses,setStatuses]=useState([]);
 const[loading,setLoading]=useState(true);
 const[saving,setSaving]=useState(false);
 const[deleting,setDeleting]=useState(false);
 const[showFormModal,setShowFormModal]=useState(false);
 const[showDeleteModal,setShowDeleteModal]=useState(false);
 const[showDetailsModal,setShowDetailsModal]=useState(false);
 const[selectedTask,setSelectedTask]=useState(null);
 const[alert,setAlert]=useState({show:false,variant:"success",message:""});
 const alertTimerRef=useRef(null);
 const openedTaskParamRef=useRef("");

 const getStoredUser=()=>{
  const userKeys=["currentUser","userInfo","authUser","user"];

  for(const key of userKeys){
   try{
    const localRaw=localStorage.getItem(key);
    const localParsed=localRaw?JSON.parse(localRaw):null;
    const localUser=localParsed?.user||localParsed?.data||localParsed;
    if(localUser?._id)return localUser;
   }catch{
    // Continue checking other storage keys when stored user data is malformed.
   }

   try{
    const sessionRaw=sessionStorage.getItem(key);
    const sessionParsed=sessionRaw?JSON.parse(sessionRaw):null;
    const sessionUser=sessionParsed?.user||sessionParsed?.data||sessionParsed;
    if(sessionUser?._id)return sessionUser;
   }catch{
    // Continue checking other storage keys when stored user data is malformed.
   }
  }

  return null;
 };

 const showAlert=useCallback((variant,message)=>{
  if(alertTimerRef.current)clearTimeout(alertTimerRef.current);

  setAlert({show:true,variant,message});

  alertTimerRef.current=setTimeout(()=>{
   setAlert(prev=>({...prev,show:false}));
  },5000);
 },[]);

 const loadData=useCallback(async()=>{
  setLoading(true);

  try{
   const[tasksRes,studiesRes,prioritiesRes,statusesRes]=await Promise.all([
    fetch("/api/studies/tasks"),
    fetch("/api/studies"),
    fetch("/api/lookups/task-priorities"),
    fetch("/api/lookups/task-statuses")
   ]);

   const[tasksData,studiesData,prioritiesData,statusesData]=await Promise.all([
    tasksRes.json(),
    studiesRes.json(),
    prioritiesRes.json(),
    statusesRes.json()
   ]);

   if(!tasksRes.ok)throw new Error(tasksData?.message||"Failed to load study tasks");
   if(!studiesRes.ok)throw new Error(studiesData?.message||"Failed to load studies");
   if(!prioritiesRes.ok)throw new Error(prioritiesData?.message||"Failed to load task priorities");
   if(!statusesRes.ok)throw new Error(statusesData?.message||"Failed to load task statuses");

   setTasks(tasksData?.data||[]);
   setStudies(studiesData?.data||[]);
   setPriorities(prioritiesData?.data||[]);
   setStatuses(statusesData?.data||[]);
  }catch(err){
   setTasks([]);
   setStudies([]);
   setPriorities([]);
   setStatuses([]);
   showAlert("danger",err.message||"Failed to load page data");
  }finally{
   setLoading(false);
  }
 },[showAlert]);

 useEffect(()=>{
  const timer=window.setTimeout(loadData,0);

  return()=>{
   window.clearTimeout(timer);
   if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
  };
 },[loadData]);

 useEffect(()=>{
  if(loading)return;
  const taskId=searchParams.get("task");
  if(!taskId)return;
  if(openedTaskParamRef.current===taskId)return;

  const matchingTask=tasks.find(task=>String(task._id||task.id)===String(taskId));
  if(matchingTask){
   openedTaskParamRef.current=taskId;
   window.setTimeout(()=>{
    setSelectedTask(matchingTask);
    setShowDetailsModal(true);
   },0);
  }
 },[loading,searchParams,tasks]);

 const studyMap=useMemo(()=>{
  return Object.fromEntries(studies.map(item=>[item._id,item.title||item.name]));
 },[studies]);

 const priorityMap=useMemo(()=>{
  return Object.fromEntries(priorities.map(item=>[item._id,item.name||item.title]));
 },[priorities]);

 const statusMap=useMemo(()=>{
  return Object.fromEntries(statuses.map(item=>[item._id,item.name||item.title]));
 },[statuses]);

 const getPriorityColor=priority=>{
  const color=priority?.color||"";
  if(color==="red")return"danger";
  if(color==="orange")return"warning";
  if(color==="green")return"success";
  return"secondary";
 };

 const getStatusColor=status=>{
  const slug=status?.slug||"";
  if(slug==="completed")return"success";
  if(slug==="in-progress")return"warning";
  if(slug==="open")return"primary";
  if(slug==="archived")return"secondary";
  return"secondary";
 };

 const openAdd=()=>{
  setSelectedTask(null);
  setShowFormModal(true);
 };

 const openEdit=task=>{
  setSelectedTask(task);
  setShowDetailsModal(false);
  setShowFormModal(true);
 };

 const openDelete=task=>{
  setSelectedTask(task);
  setShowDetailsModal(false);
  setShowDeleteModal(true);
 };

 const openDetails=task=>{
  setSelectedTask(task);
  setShowDetailsModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
  setSelectedTask(null);
 };

 const handleSubmit=async data=>{
  setSaving(true);

  try{
   const currentUser=getStoredUser();

   if(!currentUser?._id){
    throw new Error("No logged in user found");
   }

   const isEdit=!!selectedTask?._id;
   const url=isEdit?`/api/studies/tasks/${selectedTask._id}`:"/api/studies/tasks";
   const method=isEdit?"PUT":"POST";
   const payload=isEdit?data:{...data,user:currentUser._id};

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const result=await res.json();

   if(!res.ok){
    throw new Error(result?.message||result?.error||"Failed to save study task");
   }

   setShowFormModal(false);
   setSelectedTask(null);
   showAlert("success",isEdit?"Study task updated successfully":"Study task created successfully");
   await loadData();
  }catch(err){
   showAlert("danger",err.message||"Failed to save study task");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  if(!selectedTask?._id)return;

  setDeleting(true);

  try{
   const res=await fetch(`/api/studies/tasks/${selectedTask._id}`,{
    method:"DELETE"
   });

   const result=await res.json();

   if(!res.ok){
    throw new Error(result?.message||result?.error||"Failed to delete study task");
   }

   setShowDeleteModal(false);
   setSelectedTask(null);
   showAlert("success","Study task deleted successfully");
   await loadData();
  }catch(err){
   showAlert("danger",err.message||"Failed to delete study task");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <>
   {alert.show&&(
    <Alert variant={alert.variant} dismissible onClose={()=>setAlert(prev=>({...prev,show:false}))} className="mx-3 mt-3">
     {alert.message}
    </Alert>
   )}

   <Card className="shadow-sm study-task-page-card">
    <Card.Body>
     <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Study Tasks</h5>
      <div className="d-flex gap-2">
       {returnToDashboard?(
        <Button type="button" variant="secondary" onClick={()=>navigate("/dashboard")}>
         Back to Dashboard
        </Button>
       ):null}
       <Button onClick={openAdd}>Add Task</Button>
      </div>
     </div>

     {loading?(
      <div className="text-center py-4">
       <Spinner animation="border"/>
      </div>
     ):(
      <Table striped bordered hover responsive>
       <thead>
        <tr>
         <th>Title</th>
         <th>Study</th>
         <th>Priority</th>
         <th>Status</th>
         <th>Due</th>
         <th>Completed</th>
         <th>Actions</th>
        </tr>
       </thead>
       <tbody>
        {tasks.map(task=>(
         <tr key={task._id} onClick={()=>openDetails(task)} style={{cursor:"pointer"}}>
          <td>{task.title}</td>
          <td>{task.study?.title||task.study?.name||studyMap[task.study]||"-"}</td>
          <td>
           <Badge bg={getPriorityColor(task.priority)}>
            {task.priority?.title||task.priority?.name||priorityMap[task.priority]||"-"}
           </Badge>
          </td>
          <td>
           <Badge bg={getStatusColor(task.status)}>
            {task.status?.title||task.status?.name||statusMap[task.status]||"-"}
           </Badge>
          </td>
          <td>{task.dueDate?new Date(task.dueDate).toLocaleString():"-"}</td>
          <td>{task.completed?<Badge bg="success">Yes</Badge>:<Badge bg="danger">No</Badge>}</td>
          <td className="d-flex gap-2" onClick={e=>e.stopPropagation()}>
           <Button size="sm" variant="warning" onClick={()=>openEdit(task)}>Edit</Button>
           <Button size="sm" variant="danger" onClick={()=>openDelete(task)}>Delete</Button>
          </td>
         </tr>
        ))}

        {!tasks.length&&(
         <tr>
          <td colSpan="7" className="text-center">No tasks found</td>
         </tr>
        )}
       </tbody>
      </Table>
     )}
    </Card.Body>
   </Card>

   <Modal show={showDetailsModal} onHide={()=>setShowDetailsModal(false)} size="lg">
    <Modal.Header closeButton>
     <Modal.Title>Task Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {selectedTask&&(
      <div className="d-grid gap-3">
       <div><strong>Title:</strong> {selectedTask.title||"-"}</div>
       <div><strong>Study:</strong> {selectedTask.study?.title||selectedTask.study?.name||studyMap[selectedTask.study]||"No Study"}</div>
       <div><strong>Description:</strong> {selectedTask.description||"-"}</div>
       <div><strong>Context:</strong> {selectedTask.context||"-"}</div>
       <div><strong>Due Label:</strong> {selectedTask.dueLabel||"-"}</div>
       <div><strong>Due Date:</strong> {selectedTask.dueDate?new Date(selectedTask.dueDate).toLocaleString():"-"}</div>
       <div>
        <strong>Priority:</strong>{" "}
        <Badge bg={getPriorityColor(selectedTask.priority)}>
         {selectedTask.priority?.title||selectedTask.priority?.name||priorityMap[selectedTask.priority]||"-"}
        </Badge>
       </div>
       <div>
        <strong>Status:</strong>{" "}
        <Badge bg={getStatusColor(selectedTask.status)}>
         {selectedTask.status?.title||selectedTask.status?.name||statusMap[selectedTask.status]||"-"}
        </Badge>
       </div>
       <div>
        <strong>Completed:</strong>{" "}
        {selectedTask.completed?<Badge bg="success">Yes</Badge>:<Badge bg="danger">No</Badge>}
       </div>
       <div><strong>Completed At:</strong> {selectedTask.completedAt?new Date(selectedTask.completedAt).toLocaleString():"-"}</div>
       <div><strong>Reminder At:</strong> {selectedTask.reminderAt?new Date(selectedTask.reminderAt).toLocaleString():"-"}</div>
       <div><strong>Tags:</strong> {Array.isArray(selectedTask.tags)&&selectedTask.tags.length?selectedTask.tags.join(", "):"-"}</div>
      </div>
     )}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowDetailsModal(false)}>Close</Button>
     <Button variant="warning" onClick={()=>openEdit(selectedTask)}>Edit</Button>
    </Modal.Footer>
   </Modal>

   <Modal
    show={showFormModal}
    onHide={closeFormModal}
    size="xl"
    centered
    dialogClassName="study-task-modal-dialog"
    contentClassName="study-task-modal-content"
   >
    <Modal.Header closeButton>
     <Modal.Title>{selectedTask?"Edit Task":"Add Task"}</Modal.Title>
    </Modal.Header>
    <Modal.Body className="study-task-modal-body">
     <StudyTaskForm
      initialData={selectedTask||{}}
      studies={studies}
      priorities={priorities}
      statuses={statuses}
      onSubmit={handleSubmit}
      loading={saving}
      mode={selectedTask?"edit":"add"}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete <strong>{selectedTask?.title}</strong>?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowDeleteModal(false)}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting?"Deleting...":"Delete"}
     </Button>
    </Modal.Footer>
   </Modal>
  </>
 );
}
