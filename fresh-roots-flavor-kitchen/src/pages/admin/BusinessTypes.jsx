// src/pages/admin/BusinessTypes.jsx
import {useEffect,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Trash2} from "../../components/AdminIcon.jsx";

const emptyForm={name:"",code:"",description:"",isActive:true,notes:""};

export default function BusinessTypes(){
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [showModal,setShowModal]=useState(false);
 const [editingId,setEditingId]=useState("");
 const [formData,setFormData]=useState(emptyForm);
 const [message,setMessage]=useState({type:"",text:""});

 useEffect(()=>{
  fetchBusinessTypes();
 },[]);

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

 const fetchBusinessTypes=async()=>{
  try{
   setLoading(true);
   setMessage({type:"",text:""});
   const res=await api("/api/business-types");
   setBusinessTypes(Array.isArray(res)?res:Array.isArray(res?.data)?res.data:[]);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load business types"});
  }finally{
   setLoading(false);
  }
 };

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

   if(editingId)
    await api(`/api/business-types/${editingId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/business-types",{method:"POST",body:JSON.stringify(payload)});

   await fetchBusinessTypes();
   setMessage({type:"success",text:editingId?"Business type updated":"Business type created"});
   closeModal();
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
  <div className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={8}>
         <h3 className="mb-1">Business Types</h3>
         <div className="text-muted">Manage business types like catering, food truck, restaurant, and more.</div>
        </Col>

        <Col md={4} className="d-flex justify-content-md-end gap-2">
         <Button variant="outline-secondary" onClick={fetchBusinessTypes} disabled={loading}>
          {loading?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
         </Button>

         <Button onClick={openAddModal}>
          <Plus size={16}/>
          <span className="ms-2">Add Business Type</span>
         </Button>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {message.text?(
     <Col xs={12}>
      <Alert variant={message.type||"info"} className="mb-0">{message.text}</Alert>
     </Col>
    ):null}

    <Col xs={12}>
     <Card className="shadow-sm">
      <Card.Header>Business Types</Card.Header>

      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Description</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>

        <tbody>
         {!loading&&businessTypes.length===0?(
          <tr>
           <td colSpan="5" className="text-center py-4 text-muted">No business types found.</td>
          </tr>
         ):null}

         {businessTypes.map(item=>(
          <tr key={item._id}>
           <td>{item.name}</td>
           <td>{item.code||"-"}</td>
           <td>{item.description||"-"}</td>
           <td>
            <Badge bg={item.isActive?"success":"secondary"}>{item.isActive?"Active":"Inactive"}</Badge>
           </td>
           <td className="text-end">
            <ButtonGroup size="sm">
             <Button variant="outline-primary" onClick={()=>openEditModal(item)}>
              <Edit size={14}/>
             </Button>
             <Button variant="outline-danger" onClick={()=>handleDelete(item._id)}>
              <Trash2 size={14}/>
             </Button>
            </ButtonGroup>
           </td>
          </tr>
         ))}
        </tbody>
       </Table>
      </Card.Body>
     </Card>
    </Col>
   </Row>

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
