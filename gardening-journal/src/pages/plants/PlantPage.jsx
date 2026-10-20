// src/pages/plants/PlantPage.jsx
import {useEffect,useState} from "react";
import {Container,Card,ListGroup,Tabs,Tab,Form,InputGroup,Button} from "react-bootstrap";
import SortedList from "../../components/SortedList.jsx";
import "./plants.css";

import PlantCareCard from "./components/PlantCareCard.jsx";
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
 const [search,setSearch]=useState("");
 const [letter,setLetter]=useState("all");
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

 const availableLetters=new Set(plants.map(plant=>(plant.name||"").trim().charAt(0).toUpperCase()));
 const filteredPlants=plants.filter(plant=>{
  const name=plant.name||"";
  return (letter==="all"||name.trim().toUpperCase().startsWith(letter))&&`${name} ${plant.scientificName||""} ${getTypeText(plant.type)}`.toLowerCase().includes(search.trim().toLowerCase());
 });

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
   <div className="plant-profile-layout">
    <aside className="plant-profile-sidebar">
     <Card className="plant-sidebar-card">
      <Card.Header className="fw-bold">
       <h2>Plant List</h2>
      </Card.Header>

      <div className="plant-list-search">
       <InputGroup size="sm"><InputGroup.Text>Search</InputGroup.Text><Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search plants" aria-label="Search plants"/></InputGroup>
      </div>
      <div className="plant-alpha-tabs" aria-label="Filter plants by first letter">
       {["all",...alphabet].map(value=><Button key={value} size="sm" variant="outline-success" active={letter===value} aria-pressed={letter===value} disabled={value!=="all"&&!availableLetters.has(value)} onClick={()=>setLetter(value)}>{value==="all"?"All":value}</Button>)}
      </div>
      <SortedList
       as={ListGroup}
       variant="flush"
       items={filteredPlants}
       getKey={plant=>plant._id}
       getLabel={plant=>plant.name||getTypeText(plant.type)||"Unnamed Plant"}
       wrapItems={false}
       renderItem={plant=>(
        <ListGroup.Item
         action
         active={selectedPlant?._id===plant._id}
         onClick={()=>setSelectedPlant(plant)}
        >
         <strong className="plant-list-name" title={plant.name||"Unnamed Plant"}>{plant.name||"Unnamed Plant"}</strong>
         <div className="plant-list-type" title={getTypeText(plant.type)}>
          {getTypeText(plant.type)}
         </div>
        </ListGroup.Item>
       )}
      >
       {filteredPlants.length===0&&<ListGroup.Item>No plants match the current filter.</ListGroup.Item>}
      </SortedList>
     </Card>
    </aside>

    <main className="plant-profile-main">
     {!selectedPlant?(
      <Card body>No plant selected.</Card>
     ):(
      <PlantHeader plant={selectedPlant}/>
     )}
    </main>
   </div>
   {selectedPlant&&(
    <div className="plant-detail-flow">
     <section className="plant-detail-overview-grid" aria-label="Plant growing overview">
      <PlantGrowingConditions data={selectedPlant.growingConditions}/>
      <PlantSpacing spacing={selectedPlant.spacing} growthDurationDays={selectedPlant.growthDurationDays}/>
     </section>
     <PlantCareCard key={selectedPlant._id} plant={selectedPlant} onSaved={updated=>{setSelectedPlant(updated);setPlants(previous=>previous.map(plant=>plant._id===updated._id?updated:plant));}}/>
     <section className="plant-detail-library" aria-label="Plant reference sections">
        <Tabs defaultActiveKey="seed" id="plant-detail-tabs" className="plant-detail-tabs" mountOnEnter unmountOnExit>
         <Tab eventKey="seed" title="Seed Information">
          <PlantSeedInfo seed={selectedPlant.seed}/>
         </Tab>
         <Tab eventKey="notes" title="Notes">
          <PlantNotes notes={selectedPlant.notes}/>
         </Tab>
         <Tab eventKey="resources" title="Resources">
          <PlantResources plant={selectedPlant}/>
         </Tab>
        </Tabs>
     </section>
    </div>
   )}
  </Container>
 );
}
