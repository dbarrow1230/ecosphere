// src/pages/plants/components/PlantSeedInfo.jsx
import {Badge,Card,Row,Col} from "react-bootstrap";

export default function PlantSeedInfo({seed}){
 if(!seed){
  return(
   <Card className="plant-info-card">
    <Card.Header className="fw-bold">Linked Seed</Card.Header>
    <Card.Body>No seed linked to this plant.</Card.Body>
   </Card>
  );
 }

 const usdaZones=Array.isArray(seed.growthInformation?.usdaZones)
  ? seed.growthInformation.usdaZones.map(zone=>zone.zone||zone).join(", ")
  : seed.growthInformation?.usdaZones;

 return(
  <Card className="plant-info-card">
   <Card.Header className="fw-bold">Linked Seed</Card.Header>
   <Card.Body>
    <Row>
     <Col md={6} className="mb-3">
      <div><strong>Seed:</strong> {seed.plantName||seed.name||"Unnamed Seed"}</div>
     </Col>

     <Col md={6} className="mb-3">
      <div><strong>Code:</strong> {seed.seedCode||seed.sku||seed.barcode||"Not listed"}</div>
     </Col>

     <Col md={12} className="mb-3">
      <div><strong>Description:</strong> {seed.description||"No description listed."}</div>
     </Col>

     <Col md={4} className="mb-3">
      <div><strong>Taste:</strong> {seed.taste||"Not listed"}</div>
     </Col>

     <Col md={4} className="mb-3">
      <div><strong>Aroma:</strong> {seed.aroma||"Not listed"}</div>
     </Col>

     <Col md={4} className="mb-3">
      <div><strong>Mouthfeel:</strong> {seed.mouthfeel||"Not listed"}</div>
     </Col>

     <Col md={12}>
      {usdaZones?<Badge bg="secondary">USDA Zones {usdaZones}</Badge>:null}
     </Col>
    </Row>
   </Card.Body>
  </Card>
 );
}