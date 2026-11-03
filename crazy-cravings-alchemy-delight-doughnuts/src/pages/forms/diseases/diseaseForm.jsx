// src/pages/forms/diseases/diseaseForm.jsx
import {useState,useEffect} from "react";
import {Modal,Form,Row,Col,Button,Alert} from "react-bootstrap";

export default function DiseaseForm({show,onHide,onSuccess,editId=null,initialData=null,mode="add"}){
const [form,setForm]=useState({
seed:"",
plant:"",
diseaseName:"",
scientificName:"",
category:"",
cause:"",
symptoms:[],
affectedParts:[],
spreadMethod:"",
favorableConditions:"",
prevention:[],
treatments:[],
organicTreatment:[],
chemicalTreatment:[],
severity:"moderate",
isContagious:false,
image:"",
references:[]
});
const [error,setError]=useState("");
const [loading,setLoading]=useState(false);

useEffect(()=>{
if(show&&initialData){
setForm({...initialData});
}
if(show&&!initialData){
setForm({
seed:"",
plant:"",
diseaseName:"",
scientificName:"",
category:"",
cause:"",
symptoms:[],
affectedParts:[],
spreadMethod:"",
favorableConditions:"",
prevention:[],
treatments:[],
organicTreatment:[],
chemicalTreatment:[],
severity:"moderate",
isContagious:false,
image:"",
references:[]
});
}
setError("");
},[show,initialData]);

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
};

const handleArrayChange=(name,value)=>{
setForm(prev=>({...prev,[name]:value.split(",").map(v=>v.trim())}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const res=await fetch(editId?`/api/diseases/${editId}`:"/api/diseases",{
method:editId?"PUT":"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(form)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message);
if(onSuccess)onSuccess(data);
onHide();
}catch(err){
setError(err.message);
}finally{
setLoading(false);
}
};

return(
<Modal show={show} onHide={onHide} size="lg">
<Modal.Header closeButton>
<Modal.Title>{mode==="edit"?"Edit Disease":"Add Disease"}</Modal.Title>
</Modal.Header>
<Modal.Body>
<Form onSubmit={handleSubmit}>
<Row>
<Col md={6}>
<Form.Group>
<Form.Label>Disease Name</Form.Label>
<Form.Control name="diseaseName" value={form.diseaseName} onChange={handleChange}/>
</Form.Group>
</Col>
<Col md={6}>
<Form.Group>
<Form.Label>Scientific Name</Form.Label>
<Form.Control name="scientificName" value={form.scientificName} onChange={handleChange}/>
</Form.Group>
</Col>
</Row>

<Form.Group className="mt-3">
<Form.Label>Category</Form.Label>
<Form.Control name="category" value={form.category} onChange={handleChange}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Cause</Form.Label>
<Form.Control name="cause" value={form.cause} onChange={handleChange}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Symptoms (comma separated)</Form.Label>
<Form.Control onChange={e=>handleArrayChange("symptoms",e.target.value)}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Affected Parts</Form.Label>
<Form.Control onChange={e=>handleArrayChange("affectedParts",e.target.value)}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Prevention</Form.Label>
<Form.Control onChange={e=>handleArrayChange("prevention",e.target.value)}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Organic Treatments</Form.Label>
<Form.Control onChange={e=>handleArrayChange("organicTreatment",e.target.value)}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Chemical Treatments</Form.Label>
<Form.Control onChange={e=>handleArrayChange("chemicalTreatment",e.target.value)}/>
</Form.Group>

<Form.Group className="mt-3">
<Form.Label>Severity</Form.Label>
<Form.Select name="severity" value={form.severity} onChange={handleChange}>
<option value="low">Low</option>
<option value="moderate">Moderate</option>
<option value="high">High</option>
<option value="severe">Severe</option>
</Form.Select>
</Form.Group>

<Form.Check className="mt-3" label="Contagious" name="isContagious" checked={form.isContagious} onChange={handleChange}/>

{error&&<Alert variant="danger">{error}</Alert>}

<div className="mt-3 d-flex gap-2">
<Button type="submit" disabled={loading}>{loading?"Saving...":"Save"}</Button>
<Button variant="secondary" onClick={onHide}>Cancel</Button>
</div>
</Form>
</Modal.Body>
</Modal>
);
}