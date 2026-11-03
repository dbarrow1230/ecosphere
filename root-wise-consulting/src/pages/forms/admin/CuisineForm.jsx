import {useEffect,useState} from "react";
import {Button,Form,Modal,Alert} from "react-bootstrap";

function CuisineForm({row,onClose,onSubmit,onSaved,loading=false}){
 const [form,setForm]=useState({
  name:"",
  slug:"",
  description:"",
  isActive:true
 });
 const [error,setError]=useState("");

 useEffect(()=>{
  if(row){
   setForm({
    _id:row._id,
    name:row.name||"",
    slug:row.slug||"",
    description:row.description||"",
    isActive:row.isActive!==false
   });
  }else{
   setForm({
    name:"",
    slug:"",
    description:"",
    isActive:true
   });
  }
 },[row]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setError("");

   const payload={
    ...form,
    isActive:!!form.isActive
   };

   const saved=await onSubmit?.(payload);
   onSaved?.(saved);
   onClose?.();
  }catch(err){
   setError(err.message||"Failed to save cuisine");
  }
 };

 return(
  <Modal show onHide={onClose} centered>
   <Form onSubmit={handleSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>{form._id?"Edit Cuisine":"Add Cuisine"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control name="name" value={form.name} onChange={handleChange} required disabled={loading}/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Slug</Form.Label>
      <Form.Control name="slug" value={form.slug} onChange={handleChange} disabled={loading}/>
     </Form.Group>

     <Form.Group className="mb-3">
      <Form.Label>Description</Form.Label>
      <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} disabled={loading}/>
     </Form.Group>

     <Form.Check type="checkbox" label="Active" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading}/>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
     <Button type="submit" disabled={loading}>{loading?"Saving...":form._id?"Update":"Create"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

export default CuisineForm;