// src/pages/admin/BusinessTypeForm.jsx
import {useEffect,useState} from "react";
import {Button,Form,Modal,Row,Col,Spinner,Alert} from "react-bootstrap";

const emptyForm={name:"",code:"",description:"",isActive:true,notes:""};

export default function BusinessTypeForm({show,onHide,onSaved,initialData=null}){
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});

 // slug/code generator
 const buildCode=value=>
  String(value||"")
   .trim()
   .toUpperCase()
   .replace(/[^A-Z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-")
   .replace(/^-|-$/g,"");

 // initialize form when opening modal
 useEffect(()=>{
  if(!show)return;

  if(initialData){
   const name=initialData.name||"";
   const code=initialData.code&&initialData.code!=="-"?buildCode(initialData.code):"";

   setFormData({
    name,
    code,
    description:initialData.description||"",
    isActive:initialData.isActive!==false,
    notes:initialData.notes||""
   });
   setMessage({type:"",text:""});
   return;
  }

  setFormData(emptyForm);
  setMessage({type:"",text:""});
 },[initialData,show]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  setFormData(prev=>{
   if(name==="name"){
    return {...prev,name:value,code:buildCode(value)};
   }

   return {...prev,[name]:type==="checkbox"?checked:value};
  });
 };

 const handleCodeFocus=()=>{
  setFormData(prev=>{
   if((!prev.code.trim()||prev.code==="-")&&prev.name.trim()){
    return {...prev,code:buildCode(prev.name)};
   }

   return prev;
  });
 };

 const handleCodeChange=e=>{
  const {value}=e.target;

  setFormData(prev=>({...prev,code:buildCode(value)}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  if(!formData.name.trim()){
   setMessage({type:"danger",text:"Name is required"});
   return;
  }

  try{
   setSaving(true);
   setMessage({type:"",text:""});

   const payload={
    name:formData.name.trim(),
    code:buildCode(formData.code||formData.name),
    description:formData.description.trim(),
    isActive:!!formData.isActive,
    notes:formData.notes.trim()
   };

   const saved=initialData?._id
    ?await fetch(`/api/business-types/${initialData._id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
     }).then(r=>r.json())
    :await fetch(`/api/business-types`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
     }).then(r=>r.json());

   if(onSaved)await onSaved(saved);
   onHide();
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save business type"});
  }finally{
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Modal.Header closeButton={!saving}>
    <Modal.Title>{initialData?._id?"Edit Business Type":"Add Business Type"}</Modal.Title>
   </Modal.Header>

   <Modal.Body>
    {message.text?<Alert variant={message.type||"info"} className="mb-3">{message.text}</Alert>:null}

    <Row className="g-3">
     <Col md={6}>
      <Form.Group>
       <Form.Label>Name</Form.Label>
       <Form.Control
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter business type name"
        required
       />
      </Form.Group>
     </Col>

     <Col md={6}>
      <Form.Group>
       <Form.Label>Code</Form.Label>
       <Form.Control
        name="code"
        value={formData.code}
        onFocus={handleCodeFocus}
        onClick={handleCodeFocus}
        onChange={handleCodeChange}
        placeholder="ex: CATERING"
       />
      </Form.Group>
     </Col>

     <Col xs={12}>
      <Form.Group>
       <Form.Label>Description</Form.Label>
       <Form.Control
        as="textarea"
        rows={3}
        name="description"
        value={formData.description}
        onChange={handleChange}
       />
      </Form.Group>
     </Col>

     <Col xs={12}>
      <Form.Group>
       <Form.Label>Notes</Form.Label>
       <Form.Control
        as="textarea"
        rows={3}
        name="notes"
        value={formData.notes}
        onChange={handleChange}
       />
      </Form.Group>
     </Col>

     <Col xs={12}>
      <Form.Check
       type="switch"
       id="businessTypeIsActive"
       name="isActive"
       label="Active"
       checked={formData.isActive}
       onChange={handleChange}
      />
     </Col>
    </Row>
   </Modal.Body>

   <Modal.Footer>
    <Button type="button" variant="outline-secondary" onClick={onHide} disabled={saving}>Cancel</Button>
    <Button type="submit" disabled={saving}>
     {saving?<Spinner size="sm" animation="border"/>:null}
     <span className={saving?"ms-2":""}>{initialData?._id?"Update":"Create"}</span>
    </Button>
   </Modal.Footer>
  </Form>
 );
}