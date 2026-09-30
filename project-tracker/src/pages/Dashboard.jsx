import {useEffect,useState} from "react";
import {Container,Row,Col,Alert,Spinner} from "react-bootstrap";
import DashboardMetrics from "../components/dashboard/DashboardMetrics.jsx";
import ProjectProgress from "../components/dashboard/ProjectProgress.jsx";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines.jsx";
import RecentWork from "../components/dashboard/RecentWork.jsx";
import {loadTrackerData} from "../utils/projectApi.js";

export default function Dashboard(){
 const [data,setData]=useState({projects:[],tasks:[]});
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;loadTrackerData().then(value=>active&&setData(value)).catch(err=>active&&setError(err.message)).finally(()=>active&&setLoading(false));return()=>{active=false;};},[]);
 return <Container fluid="lg" className="py-4"><header className="mb-4"><h1>Project Dashboard</h1><p className="text-muted">Project health, task progress, and deadlines at a glance.</p></header>{error&&<Alert variant="danger">{error}</Alert>}{loading?<Spinner animation="border"/>:<><DashboardMetrics {...data}/><Row className="g-3 mt-1"><Col lg={7}><ProjectProgress projects={data.projects}/></Col><Col lg={5}><UpcomingDeadlines tasks={data.tasks}/></Col><Col xs={12}><RecentWork tasks={data.tasks}/></Col></Row></>}</Container>;
}
