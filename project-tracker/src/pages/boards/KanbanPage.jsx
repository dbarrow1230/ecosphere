import {useEffect,useState} from "react";
import {Container,Row,Col,Card,Badge} from "react-bootstrap";
import {unwrapList} from "../../utils/projectApi.js";

const columns=[["backlog","Backlog"],["todo","To Do"],["in-progress","In Progress"],["review","Review"],["completed","Completed"]];
export default function KanbanPage(){
 const [tasks,setTasks]=useState([]);
 useEffect(()=>{fetch("/api/tasks").then(response=>response.json()).then(data=>setTasks(unwrapList(data)));},[]);
 return <Container fluid className="py-4"><h1>Kanban Board</h1><p className="text-muted">Move work through the project task stages.</p><Row className="g-3 flex-nowrap overflow-auto">{columns.map(([status,label])=><Col style={{minWidth:280}} key={status}><h2 className="h5">{label} <Badge bg="secondary">{tasks.filter(task=>task.status===status).length}</Badge></h2>{tasks.filter(task=>task.status===status).map(task=><Card className="mb-2" key={task._id}><Card.Body><strong>{task.title}</strong><small className="d-block text-muted">{task.project?.name||"No project"}</small></Card.Body></Card>)}</Col>)}</Row></Container>;
}
