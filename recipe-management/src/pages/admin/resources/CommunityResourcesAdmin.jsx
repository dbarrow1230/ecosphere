import Alert from "../../../components/AppAlert.jsx";
// src/pages/admin/resources/CommunityResourcesAdmin.jsx
import {useEffect,useMemo,useState} from "react";
import {Accordion,Badge,Button,Card,Col,Container,Form,Modal,Row,Spinner,Table} from "react-bootstrap";
import axios from "axios";
import CommunityResourceForm from "../../forms/resources/CommunityResourceForm.jsx";

function CommunityResourcesAdmin(){

 const [categories,setCategories]=useState([]);
 const [resources,setResources]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [editingResourceId,setEditingResourceId]=useState("");
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [deletingResource,setDeletingResource]=useState(null);
 const [deleting,setDeleting]=useState(false);

 const getId=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value==="number")return String(value);
  if(value.$oid)return value.$oid;
  if(value._id){
   if(typeof value._id==="string")return value._id;
   if(value._id?.$oid)return value._id.$oid;
  }
  if(value.id){
   if(typeof value.id==="string")return value.id;
   if(value.id?.$oid)return value.id.$oid;
  }
  return "";
 };

 const getLabel=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(value.name)return value.name;
  if(value.title)return value.title;
  if(value.label)return value.label;
  if(value.code)return value.code;
  return "";
 };

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");

   const [categoriesRes,resourcesRes]=await Promise.all([
    axios.get("/api/resource-categories"),
    axios.get("/api/community-resources")
   ]);

   setCategories(Array.isArray(categoriesRes.data)?categoriesRes.data:[]);
   setResources(Array.isArray(resourcesRes.data)?resourcesRes.data:[]);
  }catch(err){
   console.error(err);
   setError("Unable to load community resources.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchData();
 },[]);

 const groupedResources=useMemo(()=>{
  const query=search.trim().toLowerCase();

  const filteredResources=resources.filter(resource=>{
   if(!query)return true;

   const text=[
    resource?.name,
    resource?.organization,
    resource?.description,
    ...(Array.isArray(resource?.services)?resource.services:[]),
    resource?.address?.address1,
    resource?.address?.address2,
    resource?.address?.city,
    resource?.address?.crossStreets,
    resource?.contact?.phone,
    resource?.contact?.email,
    resource?.contact?.website
   ].filter(Boolean).join(" ").toLowerCase();

   return text.includes(query);
  });

  const groups=categories
   .filter(category=>!category?.parentCategory)
   .sort((a,b)=>(a.order||0)-(b.order||0)||String(a.name||"").localeCompare(String(b.name||"")))
   .map(category=>{
    const categoryId=getId(category);
    const items=filteredResources
     .filter(resource=>getId(resource?.category)===categoryId)
     .sort((a,b)=>String(a?.name||"").localeCompare(String(b?.name||"")));

    return{
     category,
     items
    };
   });

  const uncategorized=filteredResources
   .filter(resource=>{
    const categoryId=getId(resource?.category);
    return !groups.some(group=>getId(group.category)===categoryId);
   })
   .sort((a,b)=>String(a?.name||"").localeCompare(String(b?.name||"")));

  if(uncategorized.length){
   groups.push({
    category:{_id:"uncategorized",name:"Uncategorized"},
    items:uncategorized
   });
  }

  return groups.filter(group=>group.items.length>0||!search.trim());
 },[categories,resources,search]);

 const openAddModal=()=>{
  setEditingResourceId("");
  setShowFormModal(true);
 };

 const openEditModal=(resourceId)=>{
  setEditingResourceId(resourceId);
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  setEditingResourceId("");
  setShowFormModal(false);
 };

 const openDeleteModal=(resource)=>{
  setDeletingResource(resource);
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(deleting)return;
  setDeletingResource(null);
  setShowDeleteModal(false);
 };

 const handleDelete=async()=>{
  if(!deletingResource?._id)return;

  try{
   setDeleting(true);
   await axios.delete(`/api/community-resources/${getId(deletingResource._id)}`);
   setShowDeleteModal(false);
   setDeletingResource(null);
   await fetchData();
  }catch(err){
   console.error(err);
   setError(err?.response?.data?.message||"Unable to delete community resource.");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <Container fluid className="py-4">
   <Row className="align-items-center mb-4">
    <Col md={6}>
     <h1 className="mb-1">Community Resources Admin</h1>
     <p className="text-muted mb-0">Manage community resources by category.</p>
    </Col>
    <Col md={6}>
     <Row className="g-2 justify-content-md-end">
      <Col md={7}>
       <Form.Control
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        placeholder="Search resources"
       />
      </Col>
      <Col md="auto">
       <Button onClick={openAddModal}>Add Resource</Button>
      </Col>
     </Row>
    </Col>
   </Row>

   {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}

   {loading?(
    <div className="text-center py-5">
     <Spinner animation="border"/>
    </div>
   ):(
    <Accordion alwaysOpen defaultActiveKey={groupedResources.map((group,index)=>String(index))}>
     {groupedResources.map((group,index)=>(
      <Accordion.Item eventKey={String(index)} key={getId(group.category)||index}>
       <Accordion.Header>
        <div className="d-flex align-items-center gap-2">
         <span>{getLabel(group.category)||"Unnamed Category"}</span>
         <Badge bg="dark">{group.items.length}</Badge>
        </div>
       </Accordion.Header>
       <Accordion.Body>
        {!group.items.length?(
         <Alert variant="light" className="mb-0">No resources in this category.</Alert>
        ):(
         <Card className="shadow-sm">
          <Card.Body className="p-0">
           <Table responsive hover className="mb-0 align-middle">
            <thead>
             <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
             </tr>
            </thead>
            <tbody>
             {group.items.map(resource=>(
              <tr key={getId(resource._id)}>
               <td>{resource?.name||"—"}</td>
               <td>{resource?.organization||"—"}</td>
               <td>
                <div>{resource?.address?.address1||"—"}</div>
                <div className="small text-muted">
                 {[
                  resource?.address?.city,
                  getLabel(resource?.address?.state),
                  resource?.address?.postalCode
                 ].filter(Boolean).join(", ")||"—"}
                </div>
               </td>
               <td>{resource?.contact?.phone||"—"}</td>
               <td>
                {resource?.isActive?(
                 <Badge bg="success">Active</Badge>
                ):(
                 <Badge bg="secondary">Inactive</Badge>
                )}
               </td>
               <td className="text-end">
                <div className="d-flex justify-content-end gap-2">
                 <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={()=>openEditModal(getId(resource._id))}
                 >
                  Edit
                 </Button>
                 <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={()=>openDeleteModal(resource)}
                 >
                  Delete
                 </Button>
                </div>
               </td>
              </tr>
             ))}
            </tbody>
           </Table>
          </Card.Body>
         </Card>
        )}
       </Accordion.Body>
      </Accordion.Item>
     ))}
    </Accordion>
   )}

   <Modal show={showFormModal} onHide={closeFormModal} size="xl" backdrop="static" scrollable>
    <Modal.Header closeButton>
     <Modal.Title>{editingResourceId?"Edit Community Resource":"Add Community Resource"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <CommunityResourceForm
      resourceId={editingResourceId}
      embedded
      onSaved={()=>{
       closeFormModal();
       fetchData();
      }}
      onCancel={closeFormModal}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Community Resource</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete <strong>{deletingResource?.name||"this resource"}</strong>?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>
      Cancel
     </Button>
     <Button variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting?"Deleting...":"Delete"}
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default CommunityResourcesAdmin;