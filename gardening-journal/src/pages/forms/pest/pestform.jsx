// src/pages/forms/pest/pestform.jsx
import {useEffect,useRef,useState} from "react";
import {Alert,Button,Col,Form,Modal,Row,Card} from "react-bootstrap";
import {Plus,Trash2} from "lucide-react";
import {sortItems} from "../../../utils/sortItems.js";

const emptyTreatment={
_id:"",
name:"",
description:"",
type:"",
applicationMethod:"",
dosage:"",
frequency:"",
duration:"",
notes:[]
};

const defaultForm={
seeds:[],
plants:[],
name:"",
description:"",
type:"",
category:"",
treatmentText:"",
treatment:[],
prevention:"",
isActive:true,
createdBy:""
};

const getId=value=>{
if(!value)return "";
if(typeof value==="string")return value;
if(typeof value==="object"){
if(typeof value.$oid==="string")return value.$oid;
if(typeof value._id==="string")return value._id;
if(typeof value.id==="string")return value.id;
if(typeof value._id?.$oid==="string")return value._id.$oid;
if(typeof value.id?.$oid==="string")return value.id.$oid;
}
return "";
};

const isObjectId=value=>{
return typeof value==="string"&&/^[a-f\d]{24}$/i.test(value);
};

const getSelectedIds=value=>{
if(!value)return [];
const values=Array.isArray(value)?value:[value];
return [...new Set(values.map(item=>getId(item)).filter(Boolean))];
};

const getArrayData=data=>{
if(Array.isArray(data))return data;
if(Array.isArray(data?.data))return data.data;
if(Array.isArray(data?.items))return data.items;
if(Array.isArray(data?.pestTypes))return data.pestTypes;
if(Array.isArray(data?.types))return data.types;
return [];
};

const getPestTypeLabel=item=>{
return item?.pest_type||item?.name||item?.title||item?.label||"Unnamed pest type";
};

const getSeedLabel=item=>{
return item?.plantName||item?.name||item?.commonName||item?.botanicalName||"Unnamed seed";
};

const getPlantLabel=item=>{
return item?.plantName||item?.name||item?.commonName||item?.botanicalName||"Unnamed plant";
};

const normalizeTreatment=item=>{
if(!item)return {...emptyTreatment};

if(typeof item==="string"){
return {...emptyTreatment,_id:isObjectId(item)?item:"",name:""};
}

return {
_id:getId(item),
name:item.name||"",
description:item.description||"",
type:getId(item.type),
applicationMethod:item.applicationMethod||"",
dosage:item.dosage||"",
frequency:item.frequency||"",
duration:item.duration||"",
notes:Array.isArray(item.notes)?item.notes:[]
};
};

const normalizeInitialData=data=>{
if(!data)return {...defaultForm};

return {
...defaultForm,
...data,
seeds:getSelectedIds(data.seeds?.length?data.seeds:data.seed),
plants:getSelectedIds(data.plants?.length?data.plants:data.plant),
name:data.name||"",
description:data.description||"",
type:getId(data.type),
category:data.category||"",
treatmentText:data.treatmentText||"",
treatment:Array.isArray(data.treatment)?data.treatment.map(item=>normalizeTreatment(item)):[],
prevention:data.prevention||"",
isActive:data.isActive!==undefined?data.isActive:true,
createdBy:getId(data.createdBy)
};
};

const treatmentHasContent=item=>{
return !!(
getId(item)||
item.name?.trim()||
item.description?.trim()||
item.applicationMethod?.trim()||
item.dosage?.trim()||
item.frequency?.trim()||
item.duration?.trim()
);
};

export default function PestForm({show,onHide,onSuccess,editId=null,initialData=null,mode="add",user=null}){
const [form,setForm]=useState(defaultForm);
const [pestTypes,setPestTypes]=useState([]);
const [seeds,setSeeds]=useState([]);
const [plants,setPlants]=useState([]);
const [error,setError]=useState("");
const [success,setSuccess]=useState("");
const [loading,setLoading]=useState(false);
const [savedResult,setSavedResult]=useState(null);
const errorRef=useRef(null);

useEffect(()=>{
if(!show)return;

setForm(normalizeInitialData(initialData));
setError("");
setSuccess("");
setLoading(false);
setSavedResult(null);
},[show,initialData]);

useEffect(()=>{
if(error&&errorRef.current){
errorRef.current.scrollIntoView({behavior:"smooth",block:"start"});
}
},[error]);

useEffect(()=>{
if(!show)return;

let active=true;

const loadPestTypes=async()=>{
try{
const [pestTypesRes,seedsRes,plantsRes]=await Promise.all([
fetch("/api/pest-types"),
fetch("/api/seeds"),
fetch("/api/plants")
]);

const [pestTypesData,seedsData,plantsData]=await Promise.all([
pestTypesRes.json().catch(()=>[]),
seedsRes.json().catch(()=>[]),
plantsRes.json().catch(()=>[])
]);

if(!pestTypesRes.ok){
throw new Error(pestTypesData.message||"Failed to load pest types");
}

if(active){
setPestTypes(sortItems(getArrayData(pestTypesData).filter(item=>getId(item)),getPestTypeLabel));
setSeeds(sortItems(getArrayData(seedsData).filter(item=>getId(item)),getSeedLabel));
setPlants(sortItems(getArrayData(plantsData).filter(item=>getId(item)),getPlantLabel));
}
}catch(err){
if(active){
setPestTypes([]);
setSeeds([]);
setPlants([]);
setError(err.message||"Failed to load pest types");
}
}
};

loadPestTypes();

return()=>{
active=false;
};
},[show]);

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
};

const handleMultiSelect=(name,e)=>{
const selectedValues=Array.from(e.target.selectedOptions).map(option=>option.value);
setForm(prev=>({...prev,[name]:selectedValues}));
};

const addTreatmentRow=()=>{
setForm(prev=>({...prev,treatment:[...(Array.isArray(prev.treatment)?prev.treatment:[]),{...emptyTreatment}]}));
};

const updateTreatmentRow=(index,key,value)=>{
setForm(prev=>{
const list=Array.isArray(prev.treatment)?[...prev.treatment]:[];
list[index]={...(list[index]||emptyTreatment),[key]:value};
return {...prev,treatment:list};
});
};

const removeTreatmentRow=index=>{
setForm(prev=>{
const list=Array.isArray(prev.treatment)?[...prev.treatment]:[];
list.splice(index,1);
return {...prev,treatment:list};
});
};

const saveTreatment=async item=>{
const id=getId(item);

if(id&&!item.name&&!item.description&&!item.applicationMethod&&!item.dosage&&!item.frequency&&!item.duration){
return id;
}

const payload={
name:item.name||"",
description:item.description||"",
type:item.type||null,
applicationMethod:item.applicationMethod||"",
dosage:item.dosage||"",
frequency:item.frequency||"",
duration:item.duration||"",
notes:Array.isArray(item.notes)?item.notes:[]
};

const res=await fetch(id?`/api/pest-ref-treatments/${id}`:"/api/pest-ref-treatments",{
method:id?"PUT":"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
});

const data=await res.json().catch(()=>({message:"Invalid server response while saving pest treatment."}));
if(!res.ok)throw new Error(data.message||"Failed to save pest treatment");

return getId(data);
};

const handleSubmit=async e=>{
e.preventDefault();
e.stopPropagation();

setLoading(true);
setError("");
setSuccess("");
setSavedResult(null);

try{
const treatmentIds=[];

for(const item of Array.isArray(form.treatment)?form.treatment:[]){
if(treatmentHasContent(item)){
const id=await saveTreatment(item);
if(isObjectId(id))treatmentIds.push(id);
}
}

const payload={
seeds:getSelectedIds(form.seeds),
plants:getSelectedIds(form.plants),
name:form.name||"",
description:form.description||"",
type:isObjectId(getId(form.type))?getId(form.type):null,
category:form.category||"",
treatmentText:form.treatmentText||"",
treatment:treatmentIds,
prevention:form.prevention||"",
isActive:form.isActive!==undefined?form.isActive:true,
createdBy:getId(form.createdBy)||getId(user)||null
};

const res=await fetch(editId?`/api/pests/${editId}`:"/api/pests",{
method:editId?"PUT":"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
});

const data=await res.json().catch(()=>({message:"Invalid server response while saving pest."}));

if(!res.ok){
throw new Error(data.message||"Failed to save pest");
}

const savedData={
...data,
category:payload.category,
treatmentText:payload.treatmentText,
prevention:payload.prevention
};

setSavedResult(savedData);
setSuccess(mode==="edit"?"Pest updated successfully.":"Pest created successfully.");

if(onSuccess){
onSuccess(savedData);
}else{
onHide();
}
}catch(err){
setError(err.message||"Failed to save pest");
}finally{
setLoading(false);
}
};

const handleClose=()=>{
if(loading)return;

if(savedResult&&onSuccess){
onSuccess(savedResult);
return;
}

setError("");
setSuccess("");
setSavedResult(null);
onHide();
};

return(
<Modal show={show} onHide={handleClose} size="xl" backdrop="static" keyboard={false}>
<Modal.Header closeButton={!loading}>
<Modal.Title>{mode==="edit"?"Edit Pest":"Add Pest"}</Modal.Title>
</Modal.Header>

<Modal.Body>
<Form onSubmit={handleSubmit} onSubmitCapture={e=>e.stopPropagation()}>
{error&&<Alert ref={errorRef} variant="danger" className="mb-3">{error}</Alert>}
{success&&<Alert variant="success" className="mb-3">{success}</Alert>}

<Row className="g-3">
<Col md={6}>
<Form.Group>
<Form.Label>Pest Name</Form.Label>
<Form.Control name="name" value={form.name} onChange={handleChange} required disabled={loading}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Pest Type</Form.Label>
<Form.Select name="type" value={form.type} onChange={handleChange} disabled={loading}>
<option value="">Select pest type</option>
{pestTypes.map(type=>(
<option key={getId(type)} value={getId(type)}>
{getPestTypeLabel(type)}
</option>
))}
</Form.Select>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Pest Category</Form.Label>
<Form.Control
name="category"
value={form.category}
onChange={handleChange}
placeholder="Insect, Mite, Mollusk, Soil pest..."
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Affected Seed Records</Form.Label>
<Form.Select multiple value={form.seeds} onChange={event=>handleMultiSelect("seeds",event)} style={{minHeight:"180px"}} disabled={loading}>
{seeds.map(seed=>(
<option key={getId(seed)} value={getId(seed)}>
{getSeedLabel(seed)}
</option>
))}
</Form.Select>
<div className="small text-muted mt-1">Use this when this reusable pest applies to one or more seed records.</div>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Affected Plant Records</Form.Label>
<Form.Select multiple value={form.plants} onChange={event=>handleMultiSelect("plants",event)} style={{minHeight:"180px"}} disabled={loading}>
{plants.map(plant=>(
<option key={getId(plant)} value={getId(plant)}>
{getPlantLabel(plant)}
</option>
))}
</Form.Select>
<div className="small text-muted mt-1">Use this for plant records that can be affected by the same pest.</div>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Treatment</Form.Label>
<Form.Control
as="textarea"
rows={3}
name="treatmentText"
value={form.treatmentText}
onChange={handleChange}
placeholder="Spray with water, insecticidal soap, neem..."
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Description</Form.Label>
<Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} disabled={loading}/>
</Form.Group>
</Col>

<Col md={12}>
<div className="d-flex justify-content-between align-items-center mb-2">
<Form.Label className="mb-0">Treatments</Form.Label>
<Button
type="button"
variant="outline-success"
size="sm"
className="d-inline-flex align-items-center gap-1"
onClick={addTreatmentRow}
disabled={loading}
>
<Plus size={15}/>
Add Treatment
</Button>
</div>

{(!Array.isArray(form.treatment)||form.treatment.length===0)&&(
<div className="text-muted small mb-2">No treatments added.</div>
)}

{Array.isArray(form.treatment)&&form.treatment.map((item,index)=>(
<Card className="border mb-2" key={index}>
<Card.Body>
<Row className="g-2">
<Col md={6}>
<Form.Group>
<Form.Label>Treatment Name</Form.Label>
<Form.Control
value={item.name||""}
onChange={e=>updateTreatmentRow(index,"name",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Application Method</Form.Label>
<Form.Control
value={item.applicationMethod||""}
onChange={e=>updateTreatmentRow(index,"applicationMethod",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Treatment Description</Form.Label>
<Form.Control
as="textarea"
rows={2}
value={item.description||""}
onChange={e=>updateTreatmentRow(index,"description",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={4}>
<Form.Group>
<Form.Label>Dosage</Form.Label>
<Form.Control
value={item.dosage||""}
onChange={e=>updateTreatmentRow(index,"dosage",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={4}>
<Form.Group>
<Form.Label>Frequency</Form.Label>
<Form.Control
value={item.frequency||""}
onChange={e=>updateTreatmentRow(index,"frequency",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col md={4}>
<Form.Group>
<Form.Label>Duration</Form.Label>
<Form.Control
value={item.duration||""}
onChange={e=>updateTreatmentRow(index,"duration",e.target.value)}
disabled={loading}
/>
</Form.Group>
</Col>

<Col xs={12}>
<Button
type="button"
variant="outline-danger"
size="sm"
className="d-inline-flex align-items-center gap-1"
onClick={()=>removeTreatmentRow(index)}
disabled={loading}
>
<Trash2 size={15}/>
Remove Treatment
</Button>
</Col>
</Row>
</Card.Body>
</Card>
))}
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Prevention</Form.Label>
<Form.Control as="textarea" rows={3} name="prevention" value={form.prevention} onChange={handleChange} disabled={loading}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Active</Form.Label>
<Form.Check
type="switch"
id="pest-is-active"
label={form.isActive?"Yes":"No"}
name="isActive"
checked={form.isActive}
onChange={handleChange}
disabled={loading}
/>
</Form.Group>
</Col>
</Row>

<div className="mt-3 d-flex justify-content-end gap-2">
<Button variant="secondary" onClick={handleClose} disabled={loading}>{savedResult?"Done":"Cancel"}</Button>
<Button type="submit" disabled={loading}>{loading?"Saving...":"Save"}</Button>
</div>
</Form>
</Modal.Body>
</Modal>
);
}
