import {useEffect,useState} from "react";
import {Container,ListGroup,ProgressBar} from "react-bootstrap";
import {formatDate,unwrapList} from "../../utils/projectApi.js";

export default function TimelinePage(){
 const [projects,setProjects]=useState([]);
 useEffect(()=>{fetch("/api/projects").then(response=>response.json()).then(data=>setProjects(unwrapList(data)));},[]);
 return <Container fluid="lg" className="py-4"><h1>Project Timeline</h1><p className="text-muted">Project dates and progress in chronological order.</p><ListGroup>{[...projects].sort((a,b)=>new Date(a.startDate||0)-new Date(b.startDate||0)).map(project=><ListGroup.Item key={project._id}><div className="d-flex justify-content-between"><strong>{project.name}</strong><span>{formatDate(project.startDate)} – {formatDate(project.dueDate)}</span></div><ProgressBar className="mt-2" now={project.progress||0}/></ListGroup.Item>)}</ListGroup></Container>;
}
