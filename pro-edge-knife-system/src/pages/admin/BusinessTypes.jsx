// src/pages/admin/BusinessTypes.jsx
import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Col,Form,Modal,Row,Spinner} from "react-bootstrap";
import {Edit,Trash2} from "lucide-react";
import AdminCatalogWorkspace from "../../components/AdminCatalogWorkspace.jsx";

const emptyForm={name:"",code:"",description:"",isActive:true,notes:""};

const api=async(url,options={})=>{
 const res=await fetch(url,{
  headers:{...(options.body?{"Content-Type":"application/json"}:{}),...(options.headers||{})},
  ...options
 });
 const data=await res.json().catch(()=>null);
 if(!res.ok)throw new Error(data?.message||data?.error||`Request failed (${res.status})`);
 return data;
};

export default function BusinessTypes(){
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [showModal,setShowModal]=useState(false);
 const [editingId,setEditingId]=useState("");
 const [formData,setFormData]=useState(emptyForm);
 const [message,setMessage]=useState({type:"",text:""});
 const [selected,setSelectedState]=useState(null);
 const setSelected=value=>setSelectedState(typeof value==="string"?businessTypes.find(item=>String(item._id)===value)||null:value);

 const buildCode=value=>{
  return String(value||"")
   .trim()
   .toUpperCase()
   .replace(/[^A-Z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-");
 };

 const fetchBusinessTypes=useCallback(async preferredId=>{
  try{
   setLoading(true);
   setMessage({type:"",text:""});
   const res=await api("/api/business-types");
   const loaded=Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[];
   setBusinessTypes(loaded);
   setSelected(current=>loaded.find(item=>String(item._id)===String(preferredId||current?._id))||loaded[0]||null);
   return loaded;
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load business types"});
  }finally{
   setLoading(false);
  }
 },[]);

 useEffect(()=>{
  queueMicrotask(fetchBusinessTypes);
 },[fetchBusinessTypes]);

 const openAddModal=()=>{
  setEditingId("");
  setFormData(emptyForm);
  setShowModal(true);
 };

 const openEditModal=item=>{
  setEditingId(String(item._id));
  setFormData({
   name:item.name||"",
   code:item.code||"",
   description:item.description||"",
   isActive:item.isActive!==false,
   notes:item.notes||""
  });
  setShowModal(true);
 };

 const closeModal=()=>{
  if(saving)return;
  setShowModal(false);
  setEditingId("");
  setFormData(emptyForm);
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleNameBlur=()=>{
  if(editingId||formData.code.trim())return;
  setFormData(prev=>({...prev,code:buildCode(prev.name)}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  if(!formData.name.trim())
  {
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

   const saved=editingId
    ?await api(`/api/business-types/${editingId}`,{method:"PUT",body:JSON.stringify(payload)})
    :await api("/api/business-types",{method:"POST",body:JSON.stringify(payload)});

   const savedRecord=saved?.data||saved;
   await fetchBusinessTypes(savedRecord?._id||editingId);
   setMessage({type:"success",text:editingId?"Business type updated":"Business type created"});
   setShowModal(false);
   setEditingId("");
   setFormData(emptyForm);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save business type"});
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async id=>{
  if(!window.confirm("Delete this business type?"))return;

  try{
   setMessage({type:"",text:""});
   await api(`/api/business-types/${id}`,{method:"DELETE"});
   await fetchBusinessTypes();
   setMessage({type:"success",text:"Business type deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete business type"});
  }
 };

 return(
  <div>
   {message.text&&<Alert variant={message.type||"info"} className="mx-4 mt-3 mb-0">{message.text}</Alert>}
   {loading&&!businessTypes.length?(
    <div className="py-5 text-center"><Spinner animation="border"/></div>
   ):(
    <AdminCatalogWorkspace title="Business Types" description="Manage business types like catering, food truck, restaurant, and more." records={businessTypes} selectedId={selected?._id||""} onSelect={setSelected} onAdd={openAddModal} getId={item=>String(item._id)} getName={item=>item.name} getCode={item=>item.code} getDescription={item=>item.description} isActive={item=>item.isActive!==false} actions={selected&&<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEditModal(selected)}><Edit size={14}/> Edit</Button><Button variant="outline-danger" onClick={()=>handleDelete(selected._id)}><Trash2 size={14}/> Delete</Button></ButtonGroup>}>
     {selected?<><code>{selected.code||"NO-CODE"}</code><h2>{selected.name}</h2><p>{selected.description||"No description provided."}</p>{selected.notes&&<><h3>Notes</h3><p>{selected.notes}</p></> }</>:<p>No business type selected.</p>}
    </AdminCatalogWorkspace>
   )}

   <Modal show={showModal} onHide={closeModal} centered backdrop="static" size="lg">
    <Form onSubmit={handleSubmit}>
     <Modal.Header closeButton={!saving}>
      <Modal.Title>{editingId?"Edit Business Type":"Add Business Type"}</Modal.Title>
     </Modal.Header>

     <Modal.Body>
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
         <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col xs={12}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>

       <Col xs={12}>
        <Form.Check type="switch" id="businessTypeIsActive" name="isActive" label="Active" checked={formData.isActive} onChange={handleChange}/>
       </Col>
      </Row>
     </Modal.Body>

     <Modal.Footer>
      <Button type="button" variant="outline-secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
      <Button type="submit" disabled={saving}>
       {saving?<Spinner size="sm" animation="border"/>:null}
       <span className={saving?"ms-2":""}>{editingId?"Update":"Create"}</span>
      </Button>
     </Modal.Footer>
    </Form>
   </Modal>
  </div>
 );
}
