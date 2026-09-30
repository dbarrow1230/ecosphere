import {Row,Col,Card} from "react-bootstrap";

export default function DashboardMetrics({projects,tasks}){
 const active=projects.filter(item=>item.status==="active").length;
 const completed=tasks.filter(item=>item.status==="completed").length;
 const overdue=tasks.filter(item=>item.dueDate&&item.status!=="completed"&&new Date(item.dueDate)<new Date()).length;
 const metrics=[["Active Projects",active],["Open Tasks",tasks.length-completed],["Completed Tasks",completed],["Overdue",overdue]];
 return <Row className="g-3">{metrics.map(([label,value])=><Col md={6} xl={3} key={label}><Card className="h-100"><Card.Body><div className="text-muted">{label}</div><div className="display-6 fw-bold">{value}</div></Card.Body></Card></Col>)}</Row>;
}
