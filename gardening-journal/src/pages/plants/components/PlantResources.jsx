// src/pages/plants/components/PlantResources.jsx
import {Card,ListGroup} from "react-bootstrap";

export default function PlantResources({plant}){
 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Plant Details</Card.Header>
   <ListGroup variant="flush">
    <ListGroup.Item><strong>Created By:</strong> {plant?.createdBy?.name||plant?.createdBy?.email||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Created:</strong> {plant?.createdAt?new Date(plant.createdAt).toLocaleDateString():"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Updated:</strong> {plant?.updatedAt?new Date(plant.updatedAt).toLocaleDateString():"Not listed"}</ListGroup.Item>
   </ListGroup>
  </Card>
 );
}