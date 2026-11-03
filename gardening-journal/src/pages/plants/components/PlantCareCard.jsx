import {useState} from "react";
import {Alert,Button,Card,Col,Form,Row} from "react-bootstrap";
const fields=[["variety", "Variety"], ["lifespan", "Annual / biennial / perennial"], ["plantCategory", "Herb / flower / shrub / tree / evergreen"], ["currentHeight", "Current height (include unit)"], ["matureHeight", "Mature height (include unit)"], ["currentWidth", "Current width (include unit)"], ["matureWidth", "Mature width (include unit)"], ["soilPh", "Soil pH"], ["pruningNeeds", "Pruning needs"], ["bloomCharacteristics", "Blooming characteristics"], ["foliageCharacteristics", "Foliage characteristics"], ["bloomMonths", "Bloom / foliage months"], ["edibleLifecycle", "Edible plant lifecycle / months"], ["sunExposure", "Sun exposure: AM / noon / PM"], ["vendor", "Purchase vendor"], ["purchaseCost", "Purchase cost and currency"], ["purchaseDate", "Purchase date"], ["fertilizers", "Fertilizers to use"], ["repellingPests", "Pests to repel"], ["repellentFor", "Plant repels"], ["attractorFor", "Plant attracts"], ["compatible", "Compatible plants"], ["incompatible", "Incompatible plants"], ["careNotes", "Plant care"]];
export default function PlantCareCard({plant,onSaved}){
 const [editing,setEditing]=useState(false);
 const [form,setForm]=useState({});
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const save=async event=>{event.preventDefault();setSaving(true);setError("");try{
  const response=await fetch(`/api/plants/${plant._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({careCard:form})});
  const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to save plant card");onSaved(data);setEditing(false);
 }catch(error){setError(error.message);}finally{setSaving(false);}};
 return <Card className="my-3"><Card.Body><h2 className="h4">Plant Care Card</h2>{error&&<Alert variant="danger">{error}</Alert>}{editing?<Form onSubmit={save}><Row className="g-3">{fields.map(([key,label])=><Col md={6} key={key}><Form.Group controlId={`care-${key}`}><Form.Label>{label}</Form.Label><Form.Control type={key==="purchaseDate"?"date":"text"} value={form[key]||""} onChange={event=>setForm(previous=>({...previous,[key]:event.target.value}))}/></Form.Group></Col>)}</Row><div className="d-flex gap-2 mt-3"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save care card"}</Button><Button variant="outline-secondary" onClick={()=>setEditing(false)} disabled={saving}>Cancel</Button></div></Form>:<><Row as="dl">{fields.map(([key,label])=><Col md={6} key={key}><dt>{label}</dt><dd>{plant.careCard?.[key]||"Not recorded"}</dd></Col>)}</Row><Button onClick={()=>{setForm(plant.careCard||{});setEditing(true);}}>Edit care card</Button></>}</Card.Body></Card>;
}
