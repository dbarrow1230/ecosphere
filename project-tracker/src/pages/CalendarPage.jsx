import {useEffect,useState} from "react";
import {Container,Row,Col,Card} from "react-bootstrap";
import {formatDate,unwrapList} from "../utils/projectApi.js";

export default function CalendarPage(){
 const [tasks,setTasks]=useState([]);
 useEffect(()=>{fetch("/api/tasks").then(response=>response.json()).then(data=>setTasks(unwrapList(data)));},[]);
 const dated=tasks.filter(task=>task.dueDate).sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate));
 return <Container fluid="lg" className="py-4"><h1>Project Calendar</h1><p className="text-muted">Task deadlines arranged by date.</p><Row className="g-3">{dated.map(task=><Col md={6} lg={4} key={task._id}><Card><Card.Body><small className="text-muted">{formatDate(task.dueDate)}</small><Card.Title>{task.title}</Card.Title><Card.Text>{task.project?.name||"No project"}</Card.Text></Card.Body></Card></Col>)}</Row></Container>;
}
