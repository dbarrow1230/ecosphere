import Alert from "../../../../components/AppAlert.jsx";
import {Button,Card,Col,Form,Row} from "react-bootstrap";

const CheckboxGrid=({items,selected,onToggle,label,columns=4,scrollable=false})=>(
 <div className={`recipe-checkbox-grid recipe-checkbox-grid-${columns}${scrollable?" recipe-checkbox-grid-scrollable":""}`}>
  {items.map(item=><Form.Check key={item._id} type="checkbox" label={label(item)} checked={selected.includes(item._id)} onChange={()=>onToggle(item._id)}/>) }
 </div>
);

export default function RecipeRelatedModule({data,setData,lookups,change,toggleDietary,toggleLookup,createLookup,newLookups,setNewLookups,addLookup,creatingLookup}){
 return(
  <Card>
   <Card.Body>
    <h3 className="h5">Dietary Considerations</h3>
    {data.unmatchedDietaries?.length?<Alert variant="warning">Detected but not matched: {data.unmatchedDietaries.map(name=><span className="me-2" key={name}><strong>{name}</strong><Button type="button" size="sm" variant="link" onClick={()=>createLookup("dietaries",name,value=>setData(current=>({...current,dietaryConsiderations:[...new Set([...current.dietaryConsiderations,value])],unmatchedDietaries:current.unmatchedDietaries.filter(item=>item!==name)})))}>Create and select</Button></span>)}</Alert>:null}
    <CheckboxGrid items={lookups.dietaries||[]} selected={data.dietaryConsiderations} onToggle={toggleDietary} label={item=>item.name}/>
    <Row className="g-3 align-items-end mb-4"><Col><Form.Group><Form.Label>New Dietary Consideration</Form.Label><Form.Control value={newLookups.dietaries} onChange={event=>setNewLookups(current=>({...current,dietaries:event.target.value}))}/></Form.Group></Col><Col xs="auto"><Button type="button" className="recipe-add-select-button" onClick={()=>addLookup("dietaries","dietaryConsiderations","dietaries")} disabled={!newLookups.dietaries.trim()||Boolean(creatingLookup)}>Add and Select</Button></Col></Row>

    <hr/>
    <h3 className="h5">Techniques</h3>
    {data.unmatchedTechniques?.length?<Alert variant="warning">Detected but not matched: {data.unmatchedTechniques.map(name=><span className="me-2" key={name}><strong>{name}</strong><Button type="button" size="sm" variant="link" onClick={()=>createLookup("techniques",name,value=>setData(current=>({...current,techniqueRefs:[...new Set([...current.techniqueRefs,value])],unmatchedTechniques:current.unmatchedTechniques.filter(item=>item!==name)})))}>Create and select</Button></span>)}</Alert>:null}
    <CheckboxGrid items={lookups.techniques||[]} selected={data.techniqueRefs} onToggle={value=>toggleLookup("techniqueRefs",value)} label={item=>item.name} columns={5} scrollable/>
    <Row className="g-3 align-items-end mb-4"><Col><Form.Group><Form.Label>New Technique</Form.Label><Form.Control value={newLookups.techniques} onChange={event=>setNewLookups(current=>({...current,techniques:event.target.value}))}/></Form.Group></Col><Col xs="auto"><Button type="button" className="recipe-add-select-button" onClick={()=>addLookup("techniques","techniqueRefs","techniques")} disabled={!newLookups.techniques.trim()||Boolean(creatingLookup)}>Add and Select</Button></Col></Row>

    <hr/>
    <h3 className="h5">Equipment</h3>
    {data.unmatchedEquipment?.length?<Alert variant="warning">Detected but not matched: {data.unmatchedEquipment.map(name=><span className="me-2" key={name}><strong>{name}</strong><Button type="button" size="sm" variant="link" onClick={()=>createLookup("equipment",name,value=>setData(current=>({...current,equipment:[...new Set([...current.equipment,value])],unmatchedEquipment:current.unmatchedEquipment.filter(item=>item!==name)})))}>Create and select</Button></span>)}</Alert>:null}
    <CheckboxGrid items={lookups.equipment||[]} selected={data.equipment} onToggle={value=>toggleLookup("equipment",value)} label={item=>item.name} columns={5} scrollable/>
    <Row className="g-3 align-items-end mb-4"><Col><Form.Group><Form.Label>New Equipment</Form.Label><Form.Control value={newLookups.equipment} onChange={event=>setNewLookups(current=>({...current,equipment:event.target.value}))}/></Form.Group></Col><Col xs="auto"><Button type="button" className="recipe-add-select-button" onClick={()=>addLookup("equipment","equipment","equipment")} disabled={!newLookups.equipment.trim()||Boolean(creatingLookup)}>Add and Select</Button></Col></Row>

    <hr/>
    <h3 className="h5">Allergens</h3>
    <CheckboxGrid items={lookups.allergens||[]} selected={data.allergens} onToggle={value=>toggleLookup("allergens",value)} label={item=>`${item.emoji||""} ${item.name}`.trim()} columns={4}/>
    <Row className="g-3 align-items-end"><Col md={3}><Form.Group><Form.Label>Emoji</Form.Label><Form.Control value={newLookups.allergenEmoji} onChange={event=>setNewLookups(current=>({...current,allergenEmoji:event.target.value}))} placeholder="e.g. 🥜"/></Form.Group></Col><Col><Form.Group><Form.Label>New Allergen</Form.Label><Form.Control value={newLookups.allergenName} onChange={event=>setNewLookups(current=>({...current,allergenName:event.target.value}))}/></Form.Group></Col><Col xs="auto"><Button type="button" className="recipe-add-select-button" onClick={()=>addLookup("allergens","allergens","allergenName")} disabled={!newLookups.allergenName.trim()||Boolean(creatingLookup)}>Add and Select</Button></Col></Row>
   </Card.Body>
  </Card>
 );
}
