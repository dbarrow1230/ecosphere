// src/pages/plants/components/PlantNotes.jsx
import {Card,ListGroup} from "react-bootstrap";

export default function PlantNotes({notes}){
 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Notes</Card.Header>
   <ListGroup variant="flush">
    {Array.isArray(notes)&&notes.length?notes.map((item,index)=>(
     <ListGroup.Item key={index}>
      <div>{item.note||"No note text."}</div>
      <small className="text-muted">
       {item.date?new Date(item.date).toLocaleDateString():"No date"}
      </small>
     </ListGroup.Item>
    )):(
     <ListGroup.Item>No notes listed.</ListGroup.Item>
    )}
   </ListGroup>
  </Card>
 );
}