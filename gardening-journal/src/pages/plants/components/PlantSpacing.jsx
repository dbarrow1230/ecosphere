// src/pages/plants/components/PlantSpacing.jsx
import {Card,ListGroup} from "react-bootstrap";

export default function PlantSpacing({spacing,growthDurationDays}){
 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Spacing & Growth</Card.Header>
   <ListGroup variant="flush">
    <ListGroup.Item><strong>Metric Spacing:</strong> {spacing?.metric!==null&&spacing?.metric!==undefined?`${spacing.metric} cm`:"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Imperial Spacing:</strong> {spacing?.imperial!==null&&spacing?.imperial!==undefined?`${spacing.imperial} in`:"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Growth Duration:</strong> {growthDurationDays!==null&&growthDurationDays!==undefined?`${growthDurationDays} days`:"Not listed"}</ListGroup.Item>
   </ListGroup>
  </Card>
 );
}