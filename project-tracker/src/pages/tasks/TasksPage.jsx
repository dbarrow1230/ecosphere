import {useEffect,useState} from "react";
import {Container,Table,Badge,Alert} from "react-bootstrap";
import {formatDate,unwrapList} from "../../utils/projectApi.js";

export default function TasksPage(){
 const [tasks,setTasks]=useState([]),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/tasks").then(response=>{if(!response.ok)throw new Error("Unable to load tasks");return response.json();}).then(data=>setTasks(unwrapList(data))).catch(err=>setError(err.message));},[]);
 return <Container fluid="lg" className="py-4"><h1>All Tasks</h1><p className="text-muted">Every project task in one searchable work list.</p>{error&&<Alert variant="danger">{error}</Alert>}<div className="table-responsive"><Table hover><thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead><tbody>{tasks.map(task=><tr key={task._id}><td>{task.title}</td><td>{task.project?.name||"—"}</td><td>{task.assignee?.username||"Unassigned"}</td><td>{task.priority}</td><td><Badge>{task.status}</Badge></td><td>{formatDate(task.dueDate)}</td></tr>)}</tbody></Table></div></Container>;
}
