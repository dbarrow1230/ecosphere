// src/pages/plants/PlantPage.jsx
import {useEffect,useState} from "react";
import {Container,Row,Col,Card,ListGroup} from "react-bootstrap";
import SortedList from "../../components/SortedList.jsx";
import "./plants.css";

import PlantHeader from "./components/PlantHeader";
import PlantGrowingConditions from "./components/PlantGrowingConditions";
import PlantSpacing from "./components/PlantSpacing";
import PlantSeedInfo from "./components/PlantSeedInfo";
import PlantNotes from "./components/PlantNotes";
import PlantResources from "./components/PlantResources";

export default function PlantPage(){
 const [plants,setPlants]=useState([]);
 const [selectedPlant,setSelectedPlant]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const getTypeText=type=>{
  if(!type)return "Type not listed";
  if(typeof type==="string")return type;
  return type.name||type.title||"Type not listed";
 };

 useEffect(()=>{
  async function fetchPlants(){
   try{
    const res=await fetch("/api/plants");
    const data=await res.json();

    if(!res.ok)throw new Error(data.message||"Failed to fetch plants");

    const plantList=Array.isArray(data)?data:[];
    setPlants(plantList);
    setSelectedPlant(plantList[0]||null);
   }catch(err){
    setError(err.message||"Unable to load plants");
   }finally{
    setLoading(false);
   }
  }

  fetchPlants();
 },[]);

 if(loading){
  return(
   <Container className="py-4">
    <Card body>Loading plant data...</Card>
   </Container>
  );
 }

 if(error){
  return(
   <Container className="py-4">
    <Card body className="text-danger">
     {error}
    </Card>
   </Container>
  );
 }

 return(
  <Container fluid className="py-4 plant-page">
   <Row className="g-4">
    <Col lg={3}>
     <Card className="plant-sidebar-card">
      <Card.Header className="fw-bold">
       <h2>Plant List</h2>
      </Card.Header>

      <SortedList
       as={ListGroup}
       variant="flush"
       items={plants}
       getKey={plant=>plant._id}
       getLabel={plant=>plant.name||getTypeText(plant.type)||"Unnamed Plant"}
       wrapItems={false}
       renderItem={plant=>(
        <ListGroup.Item
         action
         active={selectedPlant?._id===plant._id}
         onClick={()=>setSelectedPlant(plant)}
        >
         <strong>{plant.name||"Unnamed Plant"}</strong>
         <div className="small text-muted">
          {getTypeText(plant.type)}
         </div>
        </ListGroup.Item>
       )}
      >
       <ListGroup.Item>No plants found.</ListGroup.Item>
      </SortedList>
     </Card>
    </Col>

    <Col lg={9}>
     {!selectedPlant?(
      <Card body>No plant selected.</Card>
     ):(
      <Row className="g-4">
       <Col xs={12}>
        <PlantHeader plant={selectedPlant}/>
       </Col>

       <Col md={6}>
        <PlantGrowingConditions data={selectedPlant.growingConditions}/>
       </Col>

       <Col md={6}>
        <PlantSpacing spacing={selectedPlant.spacing} growthDurationDays={selectedPlant.growthDurationDays}/>
       </Col>

       <Col xs={12}>
        <PlantSeedInfo seed={selectedPlant.seed}/>
       </Col>

       <Col md={6}>
        <PlantNotes notes={selectedPlant.notes}/>
       </Col>

       <Col md={6}>
        <PlantResources plant={selectedPlant}/>
       </Col>
      </Row>
     )}
    </Col>
   </Row>
  </Container>
 );
}
