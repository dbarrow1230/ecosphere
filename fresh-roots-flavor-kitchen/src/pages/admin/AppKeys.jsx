// src/pages/admin/AppKeys.jsx
import {useEffect,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Form,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Trash2} from "../../components/AdminIcon.jsx";

const emptyForm={businessRef:"",name:"",appKey:"",isActive:true};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value._id||value.id||"");
 return "";
};

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.businesses))return data.businesses;
 if(Array.isArray(data?.appKeys))return data.appKeys;
 return [];
};

export default function AppKeys(){
 const [appKeys,setAppKeys]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [showModal,setShowModal]=useState(false);
 const [editingId,setEditingId]=useState("");
 const [formData,setFormData]=useState(emptyForm);
 const [message,setMessage]=useState({type:"",text:""});

 useEffect(()=>{
  fetchAppKeys();
  fetchBusinesses();
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

 const buildAppKey=value=>{
  return String(value||"")
   .trim()
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-");
 };

 const fetchAppKeys=async()=>{
  try{
   setLoading(true);
   setMessage({type:"",text:""});
   const res=await api("/api/app-keys");
   setAppKeys(getRows(res));
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load app keys"});
  }finally{
   setLoading(false);
  }
 };

 const fetchBusinesses=async()=>{
  try{
   const res=await api("/api/businesses");
   const rows=getRows(res);

   rows.sort((a,b)=>{
    const nameA=String(a?.legalName||a?.name||"").toLowerCase();
    const nameB=String(b?.legalName||b?.name||"").toLowerCase();
    return nameA.localeCompare(nameB);
   });

   setBusinesses(rows);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to load businesses"});
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
   businessRef:getObjectId(item.businessRef),
   name:item.name||"",
   appKey:item.appKey||"",
   isActive:item.isActive!==false
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
  if(editingId||formData.appKey.trim())return;
  setFormData(prev=>({...prev,appKey:buildAppKey(prev.name)}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  if(!formData.businessRef.trim()||!formData.name.trim()||!formData.appKey.trim())
  {
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

   if(editingId)
    await api(`/api/app-keys/${editingId}`,{method:"PUT",body:JSON.stringify(payload)});
   else
    await api("/api/app-keys",{method:"POST",body:JSON.stringify(payload)});

   await fetchAppKeys();
   setMessage({type:"success",text:editingId?"App key updated":"App key created"});
   closeModal();
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save app key"});
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async id=>{
  if(!window.confirm("Delete this app key?"))return;

  try{
   setMessage({type:"",text:""});
   await api(`/api/app-keys/${id}`,{method:"DELETE"});
   await fetchAppKeys();
   setMessage({type:"success",text:"App key deleted"});
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to delete app key"});
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
         <h3 className="mb-1">App Keys</h3>
         <div className="text-muted">Manage app keys and their folder names.</div>
        </Col>

        <Col md={4} className="d-flex justify-content-md-end gap-2">
         <Button variant="outline-secondary" onClick={()=>{
          fetchAppKeys();
          fetchBusinesses();
         }} disabled={loading}>
          {loading?<Spinner size="sm" animation="border"/>:<RefreshCw size={16}/>}
         </Button>

         <Button onClick={openAddModal}>
          <Plus size={16}/>
          <span className="ms-2">Add App Key</span>
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
      <Card.Header>App Keys</Card.Header>

      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Business</th>
          <th>Name</th>
          <th>App Key</th>
          <th>Status</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>

        <tbody>
         {!loading&&appKeys.length===0?(
          <tr>
           <td colSpan="5" className="text-center py-4 text-muted">No app keys found.</td>
          </tr>
         ):null}

         {appKeys.map(item=>{
          const businessId=getObjectId(item.businessRef);
          const business=businesses.find(row=>String(row?._id||"")===businessId);

          return(
           <tr key={item._id}>
            <td>{business?.legalName||business?.name||item.businessRef?.legalName||item.businessRef?.name||"-"}</td>
            <td>{item.name}</td>
            <td>{item.appKey}</td>
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
          );
         })}
        </tbody>
       </Table>
      </Card.Body>
     </Card>
    </Col>
   </Row>

   <Modal show={showModal} onHide={closeModal} centered backdrop="static">
    <Form onSubmit={handleSubmit}>
     <Modal.Header closeButton={!saving}>
      <Modal.Title>{editingId?"Edit App Key":"Add App Key"}</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      <Row className="g-3">
       <Col xs={12}>
        <Form.Group>
         <Form.Label>Business</Form.Label>
         <Form.Select name="businessRef" value={formData.businessRef} onChange={handleChange} required>
          <option value="">Select business</option>
          {businesses.map(item=>(
           <option key={item._id} value={item._id}>
            {item.legalName||item.name||item._id}
           </option>
          ))}
         </Form.Select>
        </Form.Group>
       </Col>

       <Col xs={12}>
        <Form.Group>
         <Form.Label>Name</Form.Label>
         <Form.Control name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} required />
        </Form.Group>
       </Col>

       <Col xs={12}>
        <Form.Group>
         <Form.Label>App Key</Form.Label>
         <Form.Control name="appKey" value={formData.appKey} onChange={handleChange} placeholder="ex: home-tracker" required />
         <Form.Text muted>Use the project folder name, like home-tracker, poetry-garden, or bible-study.</Form.Text>
        </Form.Group>
       </Col>

       <Col xs={12}>
        <Form.Check type="switch" id="appKeyIsActive" name="isActive" label="Active" checked={formData.isActive} onChange={handleChange}/>
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
