import {Card,ListGroup,Badge} from "react-bootstrap";
import {formatDate} from "../../utils/projectApi.js";

export default function UpcomingDeadlines({tasks}){
 const upcoming=tasks.filter(item=>item.dueDate&&item.status!=="completed").sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,6);
 return <Card className="h-100"><Card.Body><Card.Title>Upcoming Deadlines</Card.Title><ListGroup variant="flush">{upcoming.length?upcoming.map(task=><ListGroup.Item className="px-0 d-flex justify-content-between" key={task._id}><span>{task.title}<small className="d-block text-muted">{task.project?.name||"No project"}</small></span><Badge bg="secondary" className="align-self-start">{formatDate(task.dueDate)}</Badge></ListGroup.Item>):<p className="text-muted mb-0">No upcoming deadlines.</p>}</ListGroup></Card.Body></Card>;
}
