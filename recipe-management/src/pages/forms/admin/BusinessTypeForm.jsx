import Alert from "../../../components/AppAlert.jsx";
// src/pages/forms/admin/BusinessTypeForm.jsx
import {useEffect,useState} from "react";
import {Button,Form,Modal,Row,Col,Spinner} from "react-bootstrap";

const emptyForm={name:"",code:"",description:"",isActive:true,notes:""};

export default function BusinessTypeForm({show,onHide,onSaved,initialData=null}){
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});

 useEffect(()=>{
  if(initialData){
   setFormData({
    name:initialData.name||"",
    code:initialData.code||"",
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

 const api=async(url,options={})=>{
  const res=await fetch(url,{
   headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})},
   ...options
  });

  const data=await res.json().catch(()=>null);

  if(!res.ok)
   throw new Error(data?.message||data?.error||`Request failed (${res.status})`);

  return data;
 };

 const buildCode=value=>{
  return String(value||"")
   .trim()
   .toUpperCase()
   .replace(/[^A-Z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-");
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleNameBlur=()=>{
  if(initialData?._id||formData.code.trim())return;
  setFormData(prev=>({...prev,code:buildCode(prev.name)}));
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
    code:buildCode(formData.code),
    description:formData.description.trim(),
    isActive:!!formData.isActive,
    notes:formData.notes.trim()
   };

   const saved=initialData?._id
    ?await api(`/api/business-types/${initialData._id}`,{method:"PUT",body:JSON.stringify(payload)})
    :await api("/api/business-types",{method:"POST",body:JSON.stringify(payload)});

   if(onSaved)await onSaved(saved);
   onHide();
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save business type"});
  }finally{
   setSaving(false);
  }
 };

 return(
  <>
   <Modal.Header closeButton>
    <Modal.Title>{initialData?._id?"Edit Business Type":"Add Business Type"}</Modal.Title>
   </Modal.Header>

   <Form onSubmit={handleSubmit}>
    <Modal.Body>
     {message.text?(
      <Alert variant={message.type||"info"} className="mb-3" onClose={()=>setMessage({type:"",text:""})}>{message.text}</Alert>
     ):null}

     <Row className="g-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} required />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Code</Form.Label>
        <Form.Control name="code" value={formData.code} onChange={handleChange} placeholder="ex: CATERING" />
       </Form.Group>
      </Col>

      <Col xs={12}>
       <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col xs={12}>
       <Form.Group>
        <Form.Label>Notes</Form.Label>
        <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} />
       </Form.Group>
      </Col>

      <Col xs={12}>
       <Form.Check type="switch" id="businessTypeIsActive" name="isActive" label="Active" checked={formData.isActive} onChange={handleChange} />
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
  </>
 );
}