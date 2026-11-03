import {Card,ListGroup} from "react-bootstrap";

export default function RecentWork({tasks}){
 const recent=[...tasks].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
 return <Card><Card.Body><Card.Title>Recent Work</Card.Title><ListGroup variant="flush">{recent.length?recent.map(task=><ListGroup.Item className="px-0" key={task._id}><strong>{task.title}</strong><span className="text-muted ms-2">{task.status}</span></ListGroup.Item>):<p className="text-muted mb-0">No task activity yet.</p>}</ListGroup></Card.Body></Card>;
}
