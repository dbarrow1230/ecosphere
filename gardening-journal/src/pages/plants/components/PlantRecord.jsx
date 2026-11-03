import {Card,ListGroup} from "react-bootstrap";
const date=value=>value?String(value).slice(0,10):"Not listed";
export default function PlantRecord({record,embedded=false}){
 if(!record)return null;
 const rows=[["Planted",date(record.plantedDate)],["Death recorded",date(record.deathDate)],["Indoors",record.indoors==null?"Not listed":record.indoors?"Yes":"No"],["Outdoors",record.outdoors==null?"Not listed":record.outdoors?"Yes":"No"],["Sun direction",record.sunDirection],["Sun exposure",record.sunExposureHours==null?"Not listed":`${record.sunExposureHours} hours`],["Batch",record.batchNumber],["Location",record.location]];
 if(embedded)return <ListGroup variant="flush">{rows.map(([label,value])=><ListGroup.Item key={label}><strong>{label}:</strong> {value||"Not listed"}</ListGroup.Item>)}</ListGroup>;
 return <Card className="plant-info-card"><Card.Header className="fw-bold">Saved Planting Details</Card.Header><ListGroup variant="flush">{rows.map(([label,value])=><ListGroup.Item key={label}><strong>{label}:</strong> {value||"Not listed"}</ListGroup.Item>)}</ListGroup></Card>;
}
