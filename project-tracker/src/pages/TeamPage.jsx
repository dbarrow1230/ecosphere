import {useEffect,useState} from "react";
import {Container,Row,Col,Card} from "react-bootstrap";
import {unwrapList} from "../utils/projectApi.js";

export default function TeamPage(){const [users,setUsers]=useState([]);useEffect(()=>{fetch("/api/users").then(response=>response.json()).then(data=>setUsers(unwrapList(data)));},[]);return <Container fluid="lg" className="py-4"><h1>Project Team</h1><p className="text-muted">People available for project ownership and task assignments.</p><Row className="g-3">{users.map(user=><Col md={6} lg={4} key={user._id}><Card><Card.Body><Card.Title>{user.username}</Card.Title><Card.Text>{user.email}</Card.Text></Card.Body></Card></Col>)}</Row></Container>;}
