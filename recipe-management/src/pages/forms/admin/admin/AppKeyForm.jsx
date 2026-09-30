import Alert from "../../../../components/AppAlert.jsx";
// src/pages/forms/admin/AppKeyForm.jsx
import {useEffect,useState} from "react";
import {Button,Form,Modal,Row,Col,Spinner} from "react-bootstrap";

const emptyForm={businessRef:"",name:"",appKey:"",isActive:true};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value._id||value.id||"");
 return "";
};

export default function AppKeyForm({show,onHide,onSaved,initialData=null,businesses=[]}){
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState({type:"",text:""});

 useEffect(()=>{
  if(initialData){
   setFormData({
    businessRef:getObjectId(initialData.businessRef),
    name:initialData.name||"",
    appKey:initialData.appKey||"",
    isActive:initialData.isActive!==false
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

  if(!res.ok)throw new Error(data?.message||data?.error||`Request failed (${res.status})`);

  return data;
 };

 const buildAppKey=value=>{
  return String(value||"")
   .trim()
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-");
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleNameBlur=()=>{
  if(initialData?._id||formData.appKey.trim())return;
  setFormData(prev=>({...prev,appKey:buildAppKey(prev.name)}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  if(!formData.businessRef.trim()||!formData.name.trim()||!formData.appKey.trim()){
   setMessage({type:"danger",text:"Business, name and app key are required"});
   return;
  }

  try{
   setSaving(true);
   setMessage({type:"",text:""});

   const payload={
    businessRef:formData.businessRef.trim(),
    name:formData.name.trim(),
    appKey:buildAppKey(formData.appKey),
    isActive:!!formData.isActive
   };

   if(initialData?._id)await api(`/api/app-keys/${initialData._id}`,{method:"PUT",body:JSON.stringify(payload)});
   else await api("/api/app-keys",{method:"POST",body:JSON.stringify(payload)});

   if(onSaved)await onSaved();
   onHide();
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save app key"});
  }finally{
   setSaving(false);
  }
 };

 return(
  <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
   <Modal.Header closeButton>
    <Modal.Title>{initialData?._id?"Edit App Key":"Add App Key"}</Modal.Title>
   </Modal.Header>

   <Form onSubmit={handleSubmit}>
    <Modal.Body>
     {message.text?(
      <Alert variant={message.type||"info"} className="mb-3" onClose={()=>setMessage({type:"",text:""})}>{message.text}</Alert>
     ):null}

     <Row className="g-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Business</Form.Label>
        <Form.Select name="businessRef" value={formData.businessRef} onChange={handleChange} required>
         <option value="">Select business</option>
         {businesses.map(business=>{
          const id=String(business?._id||business?.id||"");
          return(
           <option key={id} value={id}>
            {business?.legalName||business?.name||id}
           </option>
          );
         })}
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} required />
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group>
        <Form.Label>App Key</Form.Label>
        <Form.Control name="appKey" value={formData.appKey} onChange={handleChange} placeholder="ex: home-tracker" required />
        <Form.Text muted>Use the app folder name, like home-tracker or bible-study.</Form.Text>
       </Form.Group>
      </Col>

      <Col xs={12}>
       <Form.Check type="switch" id="appKeyIsActive" name="isActive" label="Active" checked={formData.isActive} onChange={handleChange}/>
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
  </Modal>
 );
}