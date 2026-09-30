import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,ListGroup,Row,Spinner} from "react-bootstrap";
import {Link} from "react-router-dom";
import {photographyApi} from "../../utils/photographyApi.js";

const sections=[['photos','Photos','/photos'],['albums','Albums','/albums'],['shoots','Shoots','/shoots'],['equipment','Equipment','/equipment'],['favorites','Favorites','/favorites'],['archived','Archived photos','/archive']];
export default function DashboardPage(){
 const [data,setData]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{const result=await photographyApi("/api/photography/dashboard");setData(result.data);}catch(error){setError(error.status===401?"Sign in to open your photography dashboard.":error.message);}finally{setLoading(false);}
 },[]);
 useEffect(()=>{load();},[load]);
 return <Container className="py-4"><div className="d-flex justify-content-between mb-3"><h1>Photography Dashboard</h1><Button variant="outline-primary" onClick={load} disabled={loading}>Refresh</Button></div>
  {error&&<Alert variant="danger">{error} <Link to="/login">Sign in</Link></Alert>}
  {loading?<Spinner animation="border" aria-label="Loading dashboard"/>:data&&<>
   <Row className="g-3 mb-4">{sections.map(([key,label,to])=><Col md={4} key={key}><Card as={Link} to={to} className="text-decoration-none"><Card.Body><Card.Title>{label}</Card.Title><p className="display-6 mb-0">{data.counts[key]}</p></Card.Body></Card></Col>)}</Row>
   <h2 className="h4">Recent photos</h2>{!data.recent.length&&<p>Add your first photo to start your library.</p>}
   <Row className="g-3 mb-4">{data.recent.map(photo=><Col md={4} key={photo._id}><Card as={Link} to={`/photos?search=${encodeURIComponent(photo.title)}`}><Card.Img src={photo.fileUrl} alt={photo.title} style={{height:180,objectFit:"contain"}}/><Card.Body>{photo.title}</Card.Body></Card></Col>)}</Row>
   <Row className="g-4"><Col md={6}><h2 className="h4">Upcoming shoots</h2><ListGroup>{data.upcoming.map(shoot=><ListGroup.Item key={shoot._id} as={Link} to="/shoots">{shoot.name} · {new Date(shoot.startsAt).toLocaleString()}</ListGroup.Item>)}</ListGroup>{!data.upcoming.length&&<p>No upcoming shoots.</p>}</Col>
    <Col md={6}><h2 className="h4">Open reminders</h2><ListGroup>{data.reminders.map(reminder=><ListGroup.Item key={reminder._id} as={Link} to="/reminders">{reminder.title} · {new Date(reminder.dueAt).toLocaleString()}{new Date(reminder.dueAt)<new Date()?" · Due":""}</ListGroup.Item>)}</ListGroup>{!data.reminders.length&&<p>No open reminders.</p>}</Col></Row>
   <div className="d-flex gap-3 mt-4"><Link to="/tags">Manage tags</Link><Link to="/backups">Export records</Link></div>
  </>}
 </Container>;
}
