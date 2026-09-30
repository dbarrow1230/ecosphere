// src/pages/admin/BusinessTypes.jsx
import {useEffect,useState} from "react";
import {Alert,Badge,Button,ButtonGroup,Card,Col,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Edit,Plus,RefreshCw,Trash2} from "lucide-react";
import BusinessTypeForm from "./BusinessTypeForm.jsx";

export default function BusinessTypes(){
 const [businessTypes,setBusinessTypes]=useState([]);
 const [loading,setLoading]=useState(false);
 const [showModal,setShowModal]=useState(false);
 const [editingBusinessType,setEditingBusinessType]=useState(null);
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
  setEditingBusinessType(null);
  setShowModal(true);
 };

 const openEditModal=item=>{
  setEditingBusinessType(item);
  setShowModal(true);
 };

 const closeModal=()=>{
  setShowModal(false);
  setEditingBusinessType(null);
 };

 const handleSaved=async()=>{
  const wasEditing=!!editingBusinessType?._id;
  await fetchBusinessTypes();
  setMessage({type:"success",text:wasEditing?"Business type updated":"Business type created"});
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
    <BusinessTypeForm
     show={showModal}
     onHide={closeModal}
     onSaved={handleSaved}
     initialData={editingBusinessType}
    />
   </Modal>
  </div>
 );
}