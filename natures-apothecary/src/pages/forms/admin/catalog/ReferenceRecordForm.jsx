import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const splitLines=value=>String(value||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
const getId=value=>typeof value==="string"?value:String(value?._id||"");

export default function ReferenceRecordForm({type,initialData={},statuses=[],onSubmit,saving=false}){
 const [data,setData]=useState(()=>({
   name:initialData.name||"",slug:initialData.slug||"",code:initialData.code||"",
   description:initialData.description||"",image:Array.isArray(initialData.image)?initialData.image.join("\n"):initialData.image||"",
   notes:Array.isArray(initialData.notes)?initialData.notes.join("\n"):"",status:getId(initialData.status)||initialData.status||"",
   color:initialData.color||"#6c757d",isDefault:Boolean(initialData.isDefault),singular:initialData.singular||"",
   plural:initialData.plural||"",symbol:initialData.symbol||"",unitType:initialData.unitType||"weight",
   baseUnit:Boolean(initialData.baseUnit),conversionFactor:initialData.conversionFactor?.toString?.()||"1",isActive:initialData.isActive!==false
  }));

 const set=(name,value)=>setData(previous=>({...previous,[name]:value}));
 const submit=event=>{
  event.preventDefault();
  const common={name:data.name.trim(),description:data.description.trim()};
  let payload=common;
  if(type==="category")payload={...common,slug:data.slug.trim(),image:data.image.trim(),status:data.status||"active"};
  if(type==="status")payload={...common,code:data.code.trim(),color:data.color,isDefault:data.isDefault};
  if(type==="part"||type==="form")payload={...common,slug:data.slug.trim(),image:splitLines(data.image),notes:splitLines(data.notes),status:data.status};
  if(type==="unit")payload={...common,singular:data.singular.trim(),plural:data.plural.trim(),symbol:data.symbol.trim(),code:data.code.trim(),unitType:data.unitType,baseUnit:data.baseUnit,conversionFactor:data.conversionFactor,notes:splitLines(data.notes)};
  if(type==="locationType")payload={...common,isActive:data.isActive};
  onSubmit(payload);
 };

 const isNamedReference=["category","part","form"].includes(type);
 return <Form onSubmit={submit}>
  <Row className="g-3">
   <Col md={type==="unit"?6:12}><Form.Group><Form.Label>Name</Form.Label><Form.Control value={data.name||""} onChange={e=>set("name",e.target.value)} required/></Form.Group></Col>
   {(isNamedReference)&&<Col md={6}><Form.Group><Form.Label>Slug</Form.Label><Form.Control value={data.slug||""} onChange={e=>set("slug",e.target.value)} placeholder="Generated from name when blank"/></Form.Group></Col>}
   {(type==="status"||type==="unit")&&<Col md={6}><Form.Group><Form.Label>Code</Form.Label><Form.Control value={data.code||""} onChange={e=>set("code",e.target.value)} required/></Form.Group></Col>}
   {type==="status"&&<Col md={6}><Form.Group><Form.Label>Color</Form.Label><Form.Control type="color" value={data.color||"#6c757d"} onChange={e=>set("color",e.target.value)}/></Form.Group></Col>}
   {(type==="part"||type==="form")&&<Col md={6}><Form.Group><Form.Label>Status</Form.Label><Form.Select value={data.status||""} onChange={e=>set("status",e.target.value)} required><option value="">Select status</option>{statuses.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select></Form.Group></Col>}
   {type==="category"&&<Col md={6}><Form.Group><Form.Label>Status</Form.Label><Form.Select value={data.status||"active"} onChange={e=>set("status",e.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></Form.Select></Form.Group></Col>}
   {type==="unit"&&<><Col md={6}><Form.Group><Form.Label>Singular label</Form.Label><Form.Control value={data.singular||""} onChange={e=>set("singular",e.target.value)}/></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Plural label</Form.Label><Form.Control value={data.plural||""} onChange={e=>set("plural",e.target.value)}/></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Symbol</Form.Label><Form.Control value={data.symbol||""} onChange={e=>set("symbol",e.target.value)} required/></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Unit type</Form.Label><Form.Select value={data.unitType||"weight"} onChange={e=>set("unitType",e.target.value)}><option value="weight">Weight</option><option value="volume">Volume</option></Form.Select></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Conversion factor</Form.Label><Form.Control type="number" min="0" step="any" value={data.conversionFactor||""} onChange={e=>set("conversionFactor",e.target.value)} required/></Form.Group></Col></>}
   {(type==="part"||type==="form"||type==="category")&&<Col md={12}><Form.Group><Form.Label>{type==="category"?"Image URL":"Image URLs (one per line)"}</Form.Label><Form.Control as="textarea" rows={2} value={data.image||""} onChange={e=>set("image",e.target.value)}/></Form.Group></Col>}
   <Col md={12}><Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={data.description||""} onChange={e=>set("description",e.target.value)}/></Form.Group></Col>
   {(type==="part"||type==="form"||type==="unit")&&<Col md={12}><Form.Group><Form.Label>Notes (one per line)</Form.Label><Form.Control as="textarea" rows={3} value={data.notes||""} onChange={e=>set("notes",e.target.value)}/></Form.Group></Col>}
   {(type==="status"||type==="unit")&&<Col md={12}><Form.Check type="switch" label={type==="status"?"Default status":"Base unit"} checked={type==="status"?data.isDefault:data.baseUnit} onChange={e=>set(type==="status"?"isDefault":"baseUnit",e.target.checked)}/></Col>}
   {type==="locationType"&&<Col md={12}><Form.Check type="switch" label="Active" checked={data.isActive} onChange={e=>set("isActive",e.target.checked)}/></Col>}
  </Row>
  <div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={saving}>{saving?"Saving...":"Save"}</Button></div>
 </Form>;
}
