// src/pages/clients/Clients.jsx
import {useState,useEffect} from "react";
import {Container,Row,Col,Card,Table,Badge,Button,Modal} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";
import ClientsForm from "../forms/clients/ClientsForm";
import "../../styles/clients.css";

function Clients(){

 const [clients,setClients]=useState([]);
 const [loading,setLoading]=useState(true);
 const [selectedClient,setSelectedClient]=useState(null);
 const [showClientModal,setShowClientModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [isEditing,setIsEditing]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  return status==="inactive"?"inactive":"active";
 };

 const getRelationLabel=value=>{
  if(!value) return "-";
  if(typeof value==="object") return value.name||value.title||value.label||value._id||"-";
  return value;
 };

 const formatPhone=value=>{
  const raw=String(value||"").trim();
  if(!raw) return "-";
  const digits=raw.replace(/\D/g,"");
  if(digits.length===11&&digits.startsWith("1")){
   return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  if(digits.length===10){
   return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return raw;
 };

 const loadClients=async()=>{
  try{
   setLoading(true);
   const res=await fetch("/api/clients");
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to load clients");
   const clientList=Array.isArray(data?.clients)?data.clients:Array.isArray(data?.data)?data.data:[];
   setClients(clientList);
   if(selectedClient?._id){
    const updatedSelected=clientList.find(client=>client._id===selectedClient._id)||null;
    setSelectedClient(updatedSelected);
   }
  }catch(err){
   console.error("Error loading clients:",err);
   setClients([]);
   setAlert({show:true,variant:"danger",message:"Failed to load clients."});
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadClients();
 },[]);

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleSaved=client=>{
  setClients(prev=>{
   const exists=prev.some(item=>item._id===client._id);
   if(exists){
    return prev.map(item=>item._id===client._id?client:item);
   }
   return [client,...prev];
  });
  setSelectedClient(client);
  setShowClientModal(false);
  setIsEditing(false);
  setAlert({show:true,variant:"success",message:isEditing?"Client updated successfully.":"Client saved successfully."});
 };

 const handleViewClient=client=>{
  setSelectedClient(client);
  setIsEditing(false);
  closeAlert();
 };

 const handleAddClient=()=>{
  setSelectedClient(null);
  setIsEditing(false);
  setShowClientModal(true);
  closeAlert();
 };

 const handleEditClient=client=>{
  setSelectedClient(client);
  setIsEditing(true);
  setShowClientModal(true);
  closeAlert();
 };

 const handleDeleteClick=client=>{
  setSelectedClient(client);
  setShowDeleteModal(true);
  closeAlert();
 };

 const handleCloseModal=()=>{
  setShowClientModal(false);
  setIsEditing(false);
 };

 const handleCloseDeleteModal=()=>{
  setShowDeleteModal(false);
 };

 const handleDeleteClient=async()=>{
  if(!selectedClient?._id) return;

  try{
   setDeleting(true);
   const res=await fetch(`/api/clients/${selectedClient._id}`,{method:"DELETE"});
   const data=await res.json();

   if(res.ok){
    setClients(prev=>prev.filter(client=>client._id!==selectedClient._id));
    setSelectedClient(null);
    setShowDeleteModal(false);
    setAlert({show:true,variant:"success",message:data?.message||"Client deleted successfully."});
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to delete client."});
   }
  }catch(err){
   console.error("Error deleting client:",err);
   setAlert({show:true,variant:"danger",message:"Error deleting client."});
  }finally{
   setDeleting(false);
  }
 };

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="active") return "success";
  if(normalized==="inactive") return "secondary";
  return "secondary";
 };

 const total=clients.length;
 const active=clients.filter(client=>normalizeStatus(client.status)==="active").length;
 const inactive=clients.filter(client=>normalizeStatus(client.status)==="inactive").length;

 return(
  <section className="clients-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Client Management</p>
       <h1 className="mb-2">Clients</h1>
       <p className="text-muted mb-0">
        Manage client records, contact information, and client details.
       </p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <Row className="g-3 text-center">
         <Col xs={4}>
          <p className="text-muted mb-1">Total</p>
          <h3 className="mb-0">{total}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Active</p>
          <h3 className="mb-0">{active}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Inactive</p>
          <h3 className="mb-0">{inactive}</h3>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    {alert.show&&(
     <Row className="mb-4">
      <Col lg={12}>
       <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-0">
        {alert.message}
       </Alert>
      </Col>
     </Row>
    )}

    <Row className="g-4">

     <Col lg={4}>
      <Card>
       <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
         <h2 className="h4 mb-0">Client Details</h2>
         <Button variant="primary" size="sm" onClick={handleAddClient}>
          Add Client
         </Button>
        </div>

        {!selectedClient&&(
         <p className="text-muted mb-0">Select a client to view details.</p>
        )}

        {selectedClient&&(
         <>
          <div className="d-flex justify-content-end gap-2 mb-3">
           <Button variant="outline-primary" size="sm" onClick={()=>handleEditClient(selectedClient)}>
            Edit Client
           </Button>
           <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteClick(selectedClient)}>
            Delete Client
           </Button>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>First Name</strong>
             <div>{selectedClient.firstName||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Last Name</strong>
             <div>{selectedClient.lastName||"-"}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Name</strong>
           <div>{selectedClient.name||`${selectedClient.firstName||""} ${selectedClient.lastName||""}`.trim()||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Company</strong>
           <div>{selectedClient.company||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Email</strong>
           <div>{selectedClient.email||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Phone</strong>
             <div>{formatPhone(selectedClient.phone)}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Alt Phone</strong>
             <div>{formatPhone(selectedClient.altPhone)}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Address 1</strong>
           <div>{selectedClient.address1||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Address 2</strong>
           <div>{selectedClient.address2||"-"}</div>
          </div>

          <Row>
           <Col md={4}>
            <div className="mb-3">
             <strong>City</strong>
             <div>{selectedClient.city||"-"}</div>
            </div>
           </Col>

           <Col md={4}>
            <div className="mb-3">
             <strong>Country</strong>
             <div>{getRelationLabel(selectedClient.country)}</div>
            </div>
           </Col>

           <Col md={4}>
            <div className="mb-3">
             <strong>State</strong>
             <div>{getRelationLabel(selectedClient.state)}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Postal Code</strong>
             <div>{selectedClient.postalCode||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div>
              <Badge bg={statusVariant(selectedClient.status)}>
               {normalizeStatus(selectedClient.status)}
              </Badge>
             </div>
            </div>
           </Col>
          </Row>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{selectedClient.notes||"-"}</div>
          </div>
         </>
        )}
       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>

        <div className="d-flex justify-content-between align-items-center mb-3">
         <div>
          <h2 className="h4 mb-1">Client Directory</h2>
          <p className="text-muted mb-0">
           View clients and track their contact details.
          </p>
         </div>

        </div>

        <div className="table-responsive">
         <Table hover className="align-middle mb-0">

          <thead>
           <tr>
            <th>First</th>
            <th>Last</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="7" className="text-center text-muted py-4">Loading clients...</td>
            </tr>
           )}

           {!loading&&clients.length===0&&(
            <tr>
             <td colSpan="7" className="text-center text-muted py-4">No clients found.</td>
            </tr>
           )}

           {!loading&&clients.map(client=>(
            <tr
             key={client._id}
             onClick={()=>handleViewClient(client)}
             style={{cursor:"pointer"}}
             className={selectedClient?._id===client._id?"table-active":""}
            >
             <td>{client.firstName||"-"}</td>
             <td>{client.lastName||"-"}</td>
             <td>{client.company||"-"}</td>
             <td>{client.email||"-"}</td>
             <td>{formatPhone(client.phone)}</td>
             <td>{client.city||"-"}</td>
             <td>
              <Badge bg={statusVariant(client.status)}>
               {normalizeStatus(client.status)}
              </Badge>
             </td>
            </tr>
           ))}
          </tbody>

         </Table>
        </div>

       </Card.Body>
      </Card>
     </Col>

    </Row>

    <Modal show={showClientModal} onHide={handleCloseModal} centered size="lg">
     <Modal.Header closeButton>
      <Modal.Title>{isEditing?"Edit Client":"Add Client"}</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      <ClientsForm
       selectedClient={isEditing?selectedClient:null}
       onSaved={handleSaved}
       onCancel={handleCloseModal}
      />
     </Modal.Body>
    </Modal>

    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
     <Modal.Header closeButton>
      <Modal.Title>Delete Client</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      Are you sure you want to delete <strong>{selectedClient?.name||`${selectedClient?.firstName||""} ${selectedClient?.lastName||""}`.trim()||"this client"}</strong>?
     </Modal.Body>

     <Modal.Footer>
      <Button variant="outline-secondary" onClick={handleCloseDeleteModal}>
       Cancel
      </Button>
      <Button variant="danger" onClick={handleDeleteClient} disabled={deleting}>
       {deleting?"Deleting...":"Delete"}
      </Button>
     </Modal.Footer>
    </Modal>

   </Container>
  </section>
 );
}

export default Clients;