import {useEffect,useState} from "react";
import {Container,ListGroup,Alert,Badge} from "react-bootstrap";
import {getStoredUser,formatDate,unwrapList} from "../../utils/projectApi.js";

export default function MyTasksPage(){
 const [tasks,setTasks]=useState([]),[error,setError]=useState("");
 useEffect(()=>{queueMicrotask(()=>{const user=getStoredUser();const id=user?._id||user?.id;if(!id){setError("Log in to view your assigned tasks.");return;}fetch(`/api/tasks?assignee=${encodeURIComponent(id)}`).then(response=>response.json()).then(data=>setTasks(unwrapList(data))).catch(()=>setError("Unable to load your tasks."));});},[]);
 return <Container fluid="lg" className="py-4"><h1>My Tasks</h1><p className="text-muted">Work assigned specifically to you.</p>{error&&<Alert variant="warning">{error}</Alert>}<ListGroup>{tasks.map(task=><ListGroup.Item key={task._id} className="d-flex justify-content-between"><span><strong>{task.title}</strong><small className="d-block text-muted">{task.project?.name||"No project"} · Due {formatDate(task.dueDate)}</small></span><Badge className="align-self-start">{task.status}</Badge></ListGroup.Item>)}</ListGroup></Container>;
}
