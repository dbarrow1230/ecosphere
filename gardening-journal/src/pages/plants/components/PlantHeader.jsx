// src/pages/plants/components/PlantHeader.jsx
import {Badge,Card,Image} from "react-bootstrap";
import resolveUploadUrl from "../../../utils/resolveUploadUrl.js";

export default function PlantHeader({plant}){
 if(!plant)return null;

 const rawImage=Array.isArray(plant.images)&&plant.images.length>0
  ? plant.images.find(img=>{
     const value=String(img||"").trim();
     return value&&value!=="/plant/"&&value!=="plant/"&&value!=="/plants/"&&value!=="plants/";
    })
  : "";

 const imageUrl=resolveUploadUrl(rawImage,"plant");

 const typeText=plant.type
  ? typeof plant.type==="string"?plant.type:plant.type.name||plant.type.title||"Not listed"
  : "Not listed";

 return(
  <Card className="plant-hero-card">
   <Card.Body>
    <h1 className="plant-title mb-1">{plant.name||"Unnamed Plant"}</h1>

    <div className="plant-hero-row">
     {imageUrl?(
      <div className="plant-image-hover-wrap">
       <Image src={imageUrl} alt={plant.name||"Plant image"} className="plant-hero-image"/>
       <div className="plant-image-preview">
        <Image src={imageUrl} alt={plant.name||"Plant full image"}/>
       </div>
      </div>
     ):(
      <div className="plant-hero-image plant-hero-placeholder">
       No Image
      </div>
     )}

     <div className="plant-hero-text">
      <p className="plant-lead mb-2">
       {plant.description||"No description listed."}
      </p>

      <div className="plant-header-details">
       <p className="mb-1">
        <span className="text-scientific"><strong>Scientific Name:</strong></span> {plant.scientificName||"Not listed"}
       </p>

       <p className="mb-1">
        <span className="text-family"><strong>Family:</strong></span> {plant.family||"Not listed"}
       </p>

       <p className="mb-1">
        <span className="text-type"><strong>Type:</strong></span> {typeText}
       </p>

       <p className="mb-0">
        <span className="text-seed"><strong>Linked Seed:</strong></span> {plant.seed?.plantName||plant.seed?.name||"No linked seed listed"}
       </p>
      </div>

      <div className="mt-3">
       <Badge bg={plant.isActive?"success":"secondary"} className="me-2">
        {plant.isActive?"Active":"Inactive"}
       </Badge>

       {Array.isArray(plant.tags)&&plant.tags.length?plant.tags.map(tag=>(
        <Badge key={tag} bg="secondary" className="me-2">{tag}</Badge>
       )):null}
      </div>
     </div>
    </div>
   </Card.Body>
  </Card>
 );
}
