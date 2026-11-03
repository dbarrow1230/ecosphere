import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const id=value=>typeof value==="string"?value:String(value?._id||"");
const lines=value=>String(value||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
const blank={name:"",slug:"",botanicalName:"",inciName:"",part:"",form:"",metricUnit:"",imperialUnit:"",description:"",image:"",notes:"",status:""};

export default function IngredientForm({initialData={},lookups,onSubmit,saving}){
 const [data,setData]=useState(()=>({...blank,...initialData,part:id(initialData.part),form:id(initialData.form),metricUnit:id(initialData.metricUnit),imperialUnit:id(initialData.imperialUnit),status:id(initialData.status),image:Array.isArray(initialData.image)?initialData.image.join("\n"):"",notes:Array.isArray(initialData.notes)?initialData.notes.join("\n"):""}));
 const set=(name,value)=>setData(previous=>({...previous,[name]:value}));
 const select=(label,name,options)=><Col md={6}><Form.Group><Form.Label>{label}</Form.Label><Form.Select value={data[name]} onChange={e=>set(name,e.target.value)} required><option value="">Select {label.toLowerCase()}</option>{options.map(item=><option key={item._id} value={item._id}>{item.name}{item.symbol?` (${item.symbol})`:""}</option>)}</Form.Select></Form.Group></Col>;
 return <Form onSubmit={event=>{event.preventDefault();onSubmit({...data,image:lines(data.image),notes:lines(data.notes)});}}><Row className="g-3">
  <Col md={6}><Form.Group><Form.Label>Name</Form.Label><Form.Control value={data.name} onChange={e=>set("name",e.target.value)} required/></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Slug</Form.Label><Form.Control value={data.slug} onChange={e=>set("slug",e.target.value)} placeholder="Generated from name when blank"/></Form.Group></Col>
  <Col md={6}><Form.Group><Form.Label>Botanical name</Form.Label><Form.Control value={data.botanicalName} onChange={e=>set("botanicalName",e.target.value)}/></Form.Group></Col><Col md={6}><Form.Group><Form.Label>INCI name</Form.Label><Form.Control value={data.inciName} onChange={e=>set("inciName",e.target.value)}/></Form.Group></Col>
  {select("Part","part",lookups.parts)}{select("Form","form",lookups.forms)}{select("Metric unit","metricUnit",lookups.metricUnits)}{select("Imperial unit","imperialUnit",lookups.imperialUnits)}{select("Status","status",lookups.statuses)}
  <Col md={12}><Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={data.description} onChange={e=>set("description",e.target.value)}/></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Image URLs (one per line)</Form.Label><Form.Control as="textarea" rows={3} value={data.image} onChange={e=>set("image",e.target.value)}/></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Notes (one per line)</Form.Label><Form.Control as="textarea" rows={3} value={data.notes} onChange={e=>set("notes",e.target.value)}/></Form.Group></Col>
 </Row><div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Ingredient"}</Button></div></Form>;
}
