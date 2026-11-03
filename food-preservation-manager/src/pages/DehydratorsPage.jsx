import {useEffect,useState} from "react";
import {Alert,Button,Card,Col,Container,Modal,Row,Spinner,Table,Badge} from "react-bootstrap";
import DehydratorForm from "../pages/forms/DehydratorForm";

export default function DehydratorsPage(){
 const [items,setItems]=useState([]);
 const [editing,setEditing]=useState(null);
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [deleteTarget,setDeleteTarget]=useState(null);
 const [loading,setLoading]=useState(false);
 const [pageLoading,setPageLoading]=useState(true);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const showAlert=(variant,message)=>{
  setAlert({show:true,variant,message});
 };

 useEffect(()=>{
  if(!alert.show)return;
  const timer=setTimeout(()=>{
   setAlert(prev=>({...prev,show:false,message:""}));
  },5000);
  return()=>clearTimeout(timer);
 },[alert.show]);

 const loadData=async()=>{
  try{
   setPageLoading(true);
   const res=await fetch("/api/dehydrators");
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to fetch dehydrators");
   setItems(data);
  }catch(err){
   showAlert("danger",err.message);
  }finally{
   setPageLoading(false);
  }
 };

 useEffect(()=>{
  loadData();
 },[]);

 const handleAdd=()=>{
  setEditing(null);
  setShowFormModal(true);
 };

 const handleEdit=item=>{
  setEditing(item);
  setShowFormModal(true);
 };

 const handleCloseFormModal=()=>{
  if(loading)return;
  setShowFormModal(false);
  setEditing(null);
 };

 const handleSubmit=async payload=>{
  try{
   setLoading(true);

   if(editing?._id){
    const res=await fetch(`/api/dehydrators/${editing._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(payload)
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to update dehydrator");
    setItems(prev=>prev.map(item=>item._id===data._id?data:item));
    setShowFormModal(false);
    setEditing(null);
    showAlert("success","Dehydrator updated successfully.");
   }else{
    const res=await fetch("/api/dehydrators",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(payload)
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to create dehydrator");
    setItems(prev=>[data,...prev]);
    setShowFormModal(false);
    showAlert("success","Dehydrator added successfully.");
   }
  }catch(err){
   showAlert("danger",err.message);
  }finally{
   setLoading(false);
  }
 };

 const handleToggle=async id=>{
  try{
   const res=await fetch(`/api/dehydrators/${id}/toggle-status`,{
    method:"PATCH"
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to update dehydrator status");
   setItems(prev=>prev.map(item=>item._id===data._id?data:item));
   showAlert("success","Dehydrator status updated successfully.");
  }catch(err){
   showAlert("danger",err.message);
  }
 };

 const handleDeleteClick=item=>{
  setDeleteTarget(item);
  setShowDeleteModal(true);
 };

 const handleCloseDeleteModal=()=>{
  if(loading)return;
  setShowDeleteModal(false);
  setDeleteTarget(null);
 };

 const handleDeleteConfirm=async()=>{
  if(!deleteTarget?._id)return;

  try{
   setLoading(true);
   const res=await fetch(`/api/dehydrators/${deleteTarget._id}`,{
    method:"DELETE"
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to delete dehydrator");
   setItems(prev=>prev.filter(item=>item._id!==deleteTarget._id));
   setShowDeleteModal(false);
   setDeleteTarget(null);
   if(editing?._id===deleteTarget._id){
    setEditing(null);
    setShowFormModal(false);
   }
   showAlert("success","Dehydrator deleted successfully.");
  }catch(err){
   showAlert("danger",err.message);
  }finally{
   setLoading(false);
  }
 };

 return(
  <Container className="py-4">
   <Row className="align-items-center mb-4">
    <Col xs={12} md={6}>
     <h1 className="mb-0">Dehydrators</h1>
    </Col>
    <Col xs={12} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
     <Button type="button" onClick={handleAdd}>Add Dehydrator</Button>
    </Col>
   </Row>

   {alert.show&&(
    <Row className="mb-3">
     <Col xs={12}>
      <Alert variant={alert.variant} dismissible onClose={()=>setAlert(prev=>({...prev,show:false,message:""}))} className="mb-0">
       {alert.message}
      </Alert>
     </Col>
    </Row>
   )}

   <Row>
    <Col xs={12}>
     <Card>
      <Card.Body>
       <Card.Title className="mb-3">Dehydrator List</Card.Title>

       {pageLoading?(
        <div className="d-flex align-items-center gap-2">
         <Spinner animation="border" size="sm"/>
         <span>Loading...</span>
        </div>
       ):items.length===0?(
        <p className="mb-0">No dehydrators found.</p>
       ):(
        <div className="table-responsive">
         <Table striped responsive hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Brand</th>
            <th>Name</th>
            <th>Watts</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
           </tr>
          </thead>
          <tbody>
           {items.map(item=>(
            <tr key={item._id}>
             <td>{item.brand}</td>
             <td>{item.name}</td>
             <td>{item.watts}W</td>
             <td>
              <Badge bg={item.isActive?"success":"secondary"}>
               {item.isActive?"Active":"Inactive"}
              </Badge>
             </td>
             <td>{item.notes||"-"}</td>
             <td>
              <div className="d-flex gap-2 flex-wrap">
               <Button variant="outline-primary" size="sm" type="button" onClick={()=>handleEdit(item)}>
                Edit
               </Button>
               <Button variant="outline-warning" size="sm" type="button" onClick={()=>handleToggle(item._id)}>
                {item.isActive?"Deactivate":"Activate"}
               </Button>
               <Button variant="outline-danger" size="sm" type="button" onClick={()=>handleDeleteClick(item)}>
                Delete
               </Button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </Table>
        </div>
       )}
      </Card.Body>
     </Card>
    </Col>
   </Row>

   <Modal show={showFormModal} onHide={handleCloseFormModal} backdrop="static" keyboard={false} centered size="lg">
    <Modal.Header closeButton={!loading}>
     <Modal.Title>{editing?"Edit Dehydrator":"Add Dehydrator"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <DehydratorForm
      onSubmit={handleSubmit}
      initialData={editing}
      loading={loading}
      submitText={editing?"Update":"Create"}
      onCancel={handleCloseFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} backdrop="static" keyboard={false} centered>
    <Modal.Header closeButton={!loading}>
     <Modal.Title>Delete Dehydrator</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete {deleteTarget?.brand&&deleteTarget?.name?`${deleteTarget.brand} ${deleteTarget.name}`:"this dehydrator"}?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" type="button" onClick={handleCloseDeleteModal} disabled={loading}>
      Cancel
     </Button>
     <Button variant="danger" type="button" onClick={handleDeleteConfirm} disabled={loading}>
      {loading?"Deleting...":"Delete"}
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}