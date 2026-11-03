import {useEffect,useMemo,useState} from "react";
import {Container,Row,Col,Card,ProgressBar} from "react-bootstrap";
import {loadTrackerData} from "../utils/projectApi.js";

export default function ReportsPage(){
 const [data,setData]=useState({projects:[],tasks:[]});useEffect(()=>{loadTrackerData().then(setData);},[]);
 const report=useMemo(()=>{const completed=data.tasks.filter(task=>task.status==="completed").length;return{completion:data.tasks.length?Math.round(completed/data.tasks.length*100):0,active:data.projects.filter(project=>project.status==="active").length,urgent:data.tasks.filter(task=>task.priority==="urgent"&&task.status!=="completed").length};},[data]);
 return <Container fluid="lg" className="py-4"><h1>Project Reports</h1><p className="text-muted">Portfolio delivery and workload reporting.</p><Row className="g-3"><Col md={4}><Card><Card.Body><Card.Title>Task Completion</Card.Title><div className="display-6">{report.completion}%</div><ProgressBar now={report.completion}/></Card.Body></Card></Col><Col md={4}><Card><Card.Body><Card.Title>Active Projects</Card.Title><div className="display-6">{report.active}</div></Card.Body></Card></Col><Col md={4}><Card><Card.Body><Card.Title>Urgent Open Tasks</Card.Title><div className="display-6">{report.urgent}</div></Card.Body></Card></Col></Row></Container>;
}
