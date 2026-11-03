// src/pages/plants/components/PlantGrowingConditions.jsx
import {Card,ListGroup} from "react-bootstrap";
import PlantRecord from "./PlantRecord.jsx";

export default function PlantGrowingConditions({data,seed,record}){
 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Growing Conditions</Card.Header>
   <ListGroup variant="flush">
    <ListGroup.Item><strong>Sunlight:</strong> {data?.sunlight||seed?.growthInformation?.sunlightRequirements||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Water:</strong> {data?.water||seed?.growingConditionsAndRequirements?.watering||seed?.growingConditionsAndRequirements?.wateringRequirements?.name||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Soil:</strong> {data?.soil||seed?.growingConditionsAndRequirements?.soilType?.name||"Not listed"}</ListGroup.Item>
    <ListGroup.Item><strong>Temperature:</strong> {data?.temperature||"Not listed"}</ListGroup.Item>
   </ListGroup>
   <PlantRecord record={record} embedded/>
  </Card>
 );
}