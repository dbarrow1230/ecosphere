// src/pages/plants/components/PlantGrowingConditions.jsx
import {Card,ListGroup} from "react-bootstrap";

export default function PlantGrowingConditions({data}){
 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Growing Conditions</Card.Header>
   <ListGroup variant="flush">
    <ListGroup.Item><strong>Sunlight:</strong> {data?.sunlight||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Water:</strong> {data?.water||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Soil:</strong> {data?.soil||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Temperature:</strong> {data?.temperature||"Not listed"}</ListGroup.Item>
   </ListGroup>
  </Card>
 );
}