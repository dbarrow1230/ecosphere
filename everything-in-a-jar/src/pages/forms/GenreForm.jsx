// frontend/forms/GenreForm.jsx
import {useEffect,useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const initialFormData={
 name:""
};

export default function GenreForm({mode="add",genreId="",initialData=null,onSaved,onCancel}){
 const [formData,setFormData]=useState(initialFormData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(mode==="edit"&&initialData){
   setFormData({
    name:initialData?.name||""
   });
   return;
  }
  setFormData(initialFormData);
 },[mode,initialData]);

 const handleChange=e=>{
  const {name,value}=e.target;
  setFormData(prev=>({...prev,[name]:value}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  if(saving)return;

  try{
   setSaving(true);
   setError("");

   const url=mode==="edit"&&genreId?`/api/genres/${genreId}`:"/api/genres";
   const method=mode==="edit"?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify({
     name:formData.name.trim()
    })
   });

   const data=await res.json().catch(()=>null);

   if(!res.ok)throw new Error(data?.message||`Failed to ${mode==="edit"?"update":"create"} genre`);

   if(onSaved)onSaved(data?.genre);
  }catch(err){
   setError(err.message||`Failed to ${mode==="edit"?"update":"create"} genre`);
  }finally{
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   {error?<div className="alert alert-danger">{error}</div>:null}

   <Row>
    <Col md={12}>
     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control name="name" value={formData.name} onChange={handleChange} placeholder="Enter genre name" required />
     </Form.Group>
    </Col>
   </Row>

   <div className="d-flex gap-2 justify-content-end">
    <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
    <Button type="submit" disabled={saving}>{saving?(mode==="edit"?"Saving...":"Creating..."):(mode==="edit"?"Save Changes":"Create Genre")}</Button>
   </div>
  </Form>
 );
}