// src/pages/forms/diseases/diseaseForm.jsx
import {useEffect,useRef,useState} from "react";
import {Alert,Button,Col,Form,Modal,Row} from "react-bootstrap";
import {sortItems} from "../../../utils/sortItems.js";

const defaultForm={
seeds:[],
plants:[],
diseaseName:"",
scientificName:"",
diseaseType:"",
category:"",
description:"",
cause:"",
symptoms:[],
affectedParts:[],
spreadMethod:"",
favorableConditions:"",
prevention:[],
treatment:"",
treatments:[],
organicTreatment:[],
chemicalTreatment:[],
severity:"moderate",
isContagious:false,
image:"",
references:[]
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

const getSelectedIds=value=>{
if(!value)return [];
const values=Array.isArray(value)?value:[value];
return [...new Set(values.map(item=>getId(item)).filter(Boolean))];
};

const normalizeStringArray=value=>{
if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
if(typeof value==="string")return value.split(",").map(item=>item.trim()).filter(Boolean);
return [];
};

const normalizeInitialData=data=>{
if(!data)return defaultForm;

return {
...defaultForm,
...data,
seeds:getSelectedIds(data.seeds?.length?data.seeds:data.seed),
plants:getSelectedIds(data.plants?.length?data.plants:data.plant),
diseaseType:data.diseaseType||data.type||"",
description:data.description||"",
symptoms:normalizeStringArray(data.symptoms),
affectedParts:normalizeStringArray(data.affectedParts),
prevention:normalizeStringArray(data.prevention),
treatment:data.treatment||data.treatmentText||"",
treatments:Array.isArray(data.treatments)?data.treatments:[],
organicTreatment:normalizeStringArray(data.organicTreatment),
chemicalTreatment:normalizeStringArray(data.chemicalTreatment),
references:normalizeStringArray(data.references)
};
};

const getSeedLabel=item=>{
return item?.plantName||item?.name||item?.commonName||item?.botanicalName||"Unnamed seed";
};

const getPlantLabel=item=>{
return item?.plantName||item?.name||item?.commonName||item?.botanicalName||"Unnamed plant";
};

export default function DiseaseForm({show,onHide,onSuccess,editId=null,initialData=null,mode="add"}){
const [form,setForm]=useState(defaultForm);
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

const loadOptions=async()=>{
try{
const [seedsRes,plantsRes]=await Promise.all([
fetch("/api/seeds"),
fetch("/api/plants")
]);

const [seedsData,plantsData]=await Promise.all([
seedsRes.json().catch(()=>[]),
plantsRes.json().catch(()=>[])
]);

setSeeds(sortItems(Array.isArray(seedsData)?seedsData:seedsData?.data||[],getSeedLabel));
setPlants(sortItems(Array.isArray(plantsData)?plantsData:plantsData?.data||[],getPlantLabel));
}catch{
setSeeds([]);
setPlants([]);
}
};

loadOptions();
},[show]);

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
};

const handleMultiSelect=(name,e)=>{
const selectedValues=Array.from(e.target.selectedOptions).map(option=>option.value);
setForm(prev=>({...prev,[name]:selectedValues}));
};

const handleArrayChange=(name,value)=>{
setForm(prev=>({...prev,[name]:value.split(",").map(item=>item.trim()).filter(Boolean)}));
};

const handleSubmit=async e=>{
e.preventDefault();
e.stopPropagation();
setLoading(true);
setError("");
setSuccess("");
setSavedResult(null);

try{
const payload={
...form,
seeds:getSelectedIds(form.seeds),
plants:getSelectedIds(form.plants)
};

const res=await fetch(editId?`/api/diseases/${editId}`:"/api/diseases",{
method:editId?"PUT":"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(payload)
});

const data=await res.json();
if(!res.ok)throw new Error(data.message||"Failed to save disease");

setSavedResult(data);
setSuccess(mode==="edit"?"Disease updated successfully.":"Disease created successfully.");

if(onSuccess){
onSuccess(data);
}else{
onHide();
}
}catch(err){
setError(err.message);
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
<Modal.Title>{mode==="edit"?"Edit Disease":"Add Disease"}</Modal.Title>
</Modal.Header>

<Modal.Body>
<Form onSubmit={handleSubmit} onSubmitCapture={e=>e.stopPropagation()}>
{error&&<Alert ref={errorRef} variant="danger" className="mb-3">{error}</Alert>}
{success&&<Alert variant="success" className="mb-3">{success}</Alert>}

<Row className="g-3">
<Col md={6}>
<Form.Group>
<Form.Label>Disease Name</Form.Label>
<Form.Control name="diseaseName" value={form.diseaseName} onChange={handleChange} required/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Scientific Name</Form.Label>
<Form.Control name="scientificName" value={form.scientificName} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Disease Type</Form.Label>
<Form.Control
name="diseaseType"
value={form.diseaseType}
onChange={handleChange}
placeholder="Downy mildew, vascular wilt, leaf spot..."
/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Category</Form.Label>
<Form.Control
name="category"
value={form.category}
onChange={handleChange}
placeholder="Fungal, bacterial, oomycete..."
/>
</Form.Group>
</Col>

<Col md={3}>
<Form.Group>
<Form.Label>Severity</Form.Label>
<Form.Select name="severity" value={form.severity} onChange={handleChange}>
<option value="low">Low</option>
<option value="moderate">Moderate</option>
<option value="high">High</option>
<option value="severe">Severe</option>
</Form.Select>
</Form.Group>
</Col>

<Col md={3}>
<Form.Group>
<Form.Label>Contagious</Form.Label>
<Form.Check
type="switch"
id="disease-is-contagious"
label={form.isContagious?"Yes":"No"}
name="isContagious"
checked={form.isContagious}
onChange={handleChange}
/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Affected Seed Records</Form.Label>
<Form.Select multiple value={form.seeds} onChange={event=>handleMultiSelect("seeds",event)} style={{minHeight:"180px"}}>
{seeds.map(seed=>(
<option key={getId(seed)} value={getId(seed)}>
{getSeedLabel(seed)}
</option>
))}
</Form.Select>
<div className="small text-muted mt-1">Hold Ctrl or Cmd to select more than one seed record.</div>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Affected Plant Records</Form.Label>
<Form.Select multiple value={form.plants} onChange={event=>handleMultiSelect("plants",event)} style={{minHeight:"180px"}}>
{plants.map(plant=>(
<option key={getId(plant)} value={getId(plant)}>
{getPlantLabel(plant)}
</option>
))}
</Form.Select>
<div className="small text-muted mt-1">Use this for plant records that can be affected by the same disease.</div>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Description</Form.Label>
<Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Cause</Form.Label>
<Form.Control as="textarea" rows={2} name="cause" value={form.cause} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Spread Method</Form.Label>
<Form.Control name="spreadMethod" value={form.spreadMethod} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Favorable Conditions</Form.Label>
<Form.Control name="favorableConditions" value={form.favorableConditions} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Symptoms (comma separated)</Form.Label>
<Form.Control value={form.symptoms.join(", ")} onChange={event=>handleArrayChange("symptoms",event.target.value)}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Affected Parts (comma separated)</Form.Label>
<Form.Control value={form.affectedParts.join(", ")} onChange={event=>handleArrayChange("affectedParts",event.target.value)}/>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Prevention (comma separated)</Form.Label>
<Form.Control value={form.prevention.join(", ")} onChange={event=>handleArrayChange("prevention",event.target.value)}/>
</Form.Group>
</Col>

<Col md={12}>
<Form.Group>
<Form.Label>Treatment</Form.Label>
<Form.Control
as="textarea"
rows={3}
name="treatment"
value={form.treatment}
onChange={handleChange}
placeholder="Remove infected leaves; apply approved organic fungicide if needed..."
/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Organic Treatments (comma separated)</Form.Label>
<Form.Control value={form.organicTreatment.join(", ")} onChange={event=>handleArrayChange("organicTreatment",event.target.value)}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Chemical Treatments (comma separated)</Form.Label>
<Form.Control value={form.chemicalTreatment.join(", ")} onChange={event=>handleArrayChange("chemicalTreatment",event.target.value)}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>Image</Form.Label>
<Form.Control name="image" value={form.image} onChange={handleChange}/>
</Form.Group>
</Col>

<Col md={6}>
<Form.Group>
<Form.Label>References (comma separated)</Form.Label>
<Form.Control value={form.references.join(", ")} onChange={event=>handleArrayChange("references",event.target.value)}/>
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
