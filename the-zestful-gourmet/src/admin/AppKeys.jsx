// src/pages/admin/AppKeys.jsx
import {useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Col,Form,Modal,Row,Spinner} from "react-bootstrap";
import {Edit,Trash2} from "lucide-react";
import AdminCatalogWorkspace from "../components/AdminCatalogWorkspace.jsx";

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
 const [selectedId,setSelectedId]=useState("");

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
   const loaded=getRows(res);
   setAppKeys(loaded);
   setSelectedId(current=>loaded.some(item=>String(item._id)===String(current))?current:String(loaded[0]?._id||""));
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

 useEffect(()=>{
  queueMicrotask(()=>{
   fetchAppKeys();
   fetchBusinesses();
  });
 },[]);

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

   const saved=editingId?await api(`/api/app-keys/${editingId}`,{method:"PUT",body:JSON.stringify(payload)}):await api("/api/app-keys",{method:"POST",body:JSON.stringify(payload)});
   await fetchAppKeys();
   setSelectedId(String(saved?._id||saved?.data?._id||editingId||""));
   setMessage({type:"success",text:editingId?"App key updated":"App key created"});
   setShowModal(false);
   setEditingId("");
   setFormData(emptyForm);
  }catch(err){
   setMessage({type:"danger",text:err.message||"Failed to save app key"});
  }finally{
   setSaving(false);
  }
 };

 const selected=appKeys.find(item=>String(item._id)===String(selectedId))||null;

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
  <div>
   {message.text&&<Alert variant={message.type||"info"} className="mx-4 mt-3 mb-0">{message.text}</Alert>}
   {loading&&!appKeys.length?<div className="py-5 text-center"><Spinner animation="border"/></div>:(
    <AdminCatalogWorkspace title="App Keys" description="Manage application keys and their business assignments." records={appKeys} selectedId={selectedId} onSelect={setSelectedId} onAdd={openAddModal} getId={item=>String(item._id)} getName={item=>item.name} getCode={item=>item.appKey} getDescription={item=>{const business=businesses.find(row=>String(row?._id||"")===getObjectId(item.businessRef));return business?.legalName||business?.name||"";}} isActive={item=>item.isActive!==false} actions={selected&&<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEditModal(selected)}><Edit size={14}/> Edit</Button><Button variant="outline-danger" onClick={()=>handleDelete(selected._id)}><Trash2 size={14}/> Delete</Button></ButtonGroup>}>
     {selected?<><code>{selected.appKey}</code><h2>{selected.name}</h2><p>{businesses.find(row=>String(row?._id||"")===getObjectId(selected.businessRef))?.legalName||businesses.find(row=>String(row?._id||"")===getObjectId(selected.businessRef))?.name||"No business assigned."}</p></>:<p>No app key selected.</p>}
    </AdminCatalogWorkspace>
   )}
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
