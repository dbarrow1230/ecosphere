import {useCallback,useEffect,useMemo,useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import axios from "axios";
import {Alert,Badge,Button,Card,Container,Form,Modal,Spinner,Table} from "react-bootstrap";
import ResourceForm from "./forms/ResourceForm";
import "../styles/ResourcePage.css";

const today=()=>new Date().toISOString().slice(0,10);
const fullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim();
const getStatusCode=mentee=>String(mentee?.status?.code||mentee?.status?.name||mentee?.status||"").trim().toLowerCase();
const formatDate=value=>{
 if(!value)return"—";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"—":date.toLocaleDateString();
};

function ResourcePage({user}){
 const[searchParams]=useSearchParams();
 const navigate=useNavigate();
 const menteeId=searchParams.get("mentee")||"";
 const isMenteeProfile=Boolean(menteeId);
 const[mentee,setMentee]=useState(null);
 const[catalog,setCatalog]=useState([]);
 const[givenResources,setGivenResources]=useState([]);
 const[search,setSearch]=useState("");
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[success,setSuccess]=useState("");
 const[showCatalogForm,setShowCatalogForm]=useState(false);
 const[formMode,setFormMode]=useState("add");
 const[selectedResource,setSelectedResource]=useState(null);
 const[showGiveForm,setShowGiveForm]=useState(false);
 const[giveForm,setGiveForm]=useState({resource:"",resourceLink:"",givenDate:today(),notes:"",followUpNeeded:false,followUpDate:""});
 const[saving,setSaving]=useState(false);
 const canGiveResource=["incoming","active"].includes(getStatusCode(mentee));

 const load=useCallback(async()=>{
  try{
   setLoading(true);
   setError("");
   const requests=[axios.get("/api/resources")];
   if(isMenteeProfile){
    requests.push(axios.get(`/api/mentees/${menteeId}`),axios.get(`/api/resources/mentee/${menteeId}`));
   }
   const responses=await Promise.all(requests);
   setCatalog(Array.isArray(responses[0].data)?responses[0].data:responses[0].data?.resources||[]);
   if(isMenteeProfile){
    setMentee(responses[1].data?.mentee||responses[1].data);
    setGivenResources(Array.isArray(responses[2].data)?responses[2].data:responses[2].data?.resources||[]);
   }else{
    setMentee(null);
    setGivenResources([]);
   }
  }catch(err){
   setError(err.response?.data?.message||"Failed to load resources.");
  }finally{
   setLoading(false);
  }
 },[isMenteeProfile,menteeId]);

 useEffect(()=>{load();},[load]);
 useEffect(()=>{
  if(!success)return;
  const timer=setTimeout(()=>setSuccess(""),4000);
  return()=>clearTimeout(timer);
 },[success]);

 const filteredCatalog=useMemo(()=>{
  const query=search.trim().toLowerCase();
  if(!query)return catalog;
  return catalog.filter(item=>`${item.title||""} ${item.description||""} ${item.topic||""} ${item.category?.name||""}`.toLowerCase().includes(query));
 },[catalog,search]);

 const availableCatalog=useMemo(()=>{
  const used=new Set(givenResources.map(item=>`${item.resource?._id||item.resource}:${item.resourceLink||""}`));
  return catalog.filter(item=>item.status==="active").map(item=>({
   ...item,
   availableLinks:(item.links||[]).filter(link=>!used.has(`${item._id}:${link._id}`))
  })).filter(item=>item.availableLinks.length);
 },[catalog,givenResources]);

 const openAdd=()=>{setFormMode("add");setSelectedResource(null);setShowCatalogForm(true);};
 const openEdit=resource=>{setFormMode("edit");setSelectedResource(resource);setShowCatalogForm(true);};
 const openGive=()=>{
  setGiveForm({resource:"",resourceLink:"",givenDate:today(),notes:"",followUpNeeded:false,followUpDate:""});
  setShowGiveForm(true);
 };

 const saveGiven=async event=>{
  event.preventDefault();
  try{
   setSaving(true);
   setError("");
   await axios.post("/api/resources/give",{
    ...giveForm,
    mentee:menteeId,
    followUpDate:giveForm.followUpNeeded&&giveForm.followUpDate?giveForm.followUpDate:null,
    createdBy:user?._id||""
   });
   setShowGiveForm(false);
   setSuccess("Resource recorded in this mentee's profile.");
   await load();
  }catch(err){
   setError(err.response?.data?.message||"Failed to give resource.");
  }finally{
   setSaving(false);
  }
 };

 const removeGiven=async record=>{
  if(!window.confirm(`Remove "${record.resource?.title||"this resource"}" from this mentee's given-resource history?`))return;
  try{
   await axios.delete(`/api/resources/given/${record._id}`);
   setSuccess("Resource removed from this mentee's history.");
   await load();
  }catch(err){
   setError(err.response?.data?.message||"Failed to remove resource from mentee.");
  }
 };

 const deleteCatalogResource=async resource=>{
  if(!window.confirm(`Delete "${resource.title}" from your catalog?`))return;
  try{
   await axios.delete(`/api/resources/${resource._id}`);
   setSuccess("Catalog resource deleted.");
   await load();
  }catch(err){
   setError(err.response?.data?.message||"Failed to delete catalog resource.");
  }
 };

 const resourceLinks=(resource,resourceLink)=>resource?.links?.length?resource.links.filter(link=>!resourceLink||String(link._id)===String(resourceLink)).map(link=>{
  const storedValue=String(link.url||"").trim();
  const isWebsite=/^https?:\/\//i.test(storedValue);
  const normalizedValue=storedValue.replaceAll("\\","/");
  const filename=normalizedValue.split("/").pop();
  const resourceUrl=isWebsite?storedValue:normalizedValue.startsWith("/resources/")?normalizedValue:`/resources/${encodeURIComponent(filename)}`;

  return(
   <div key={link._id||link.url}><a href={resourceUrl} target="_blank" rel="noreferrer">{link.title}</a><span className="text-muted small ms-2">{link.resourceType}</span></div>
  );
 }):"—";

 return(
  <Container fluid className="py-4">
   <Card className="shadow-sm border-0 mb-4">
    <Card.Body className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
     <div>
      <h3 className="mb-1">{isMenteeProfile?`Resources Given to ${fullName(mentee)}`:"Mentee Resource Catalog"}</h3>
      <div className="text-muted">{isMenteeProfile?"Materials selected from your catalog and given or recommended to this mentee.":"Maintain your reusable collection of files, ebooks, links, and materials that may help your mentees."}</div>
     </div>
     <div className="d-flex gap-2">
      {isMenteeProfile?(
       <>
        {canGiveResource?<Button variant="dark" onClick={openGive} disabled={!availableCatalog.length}>Give Resource</Button>:null}
        <Button variant="outline-dark" onClick={()=>navigate("/resources")}>Open Catalog</Button>
       </>
      ):<Button variant="dark" onClick={openAdd}>Add Catalog Resource</Button>}
     </div>
    </Card.Body>
   </Card>

   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   {success?<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>:null}

   {loading?<div className="py-5 text-center"><Spinner animation="border"/></div>:isMenteeProfile?(
    <Card className="shadow-sm border-0">
     <Card.Body className="p-0">
      <Table responsive hover className="align-middle mb-0">
       <thead><tr><th>Resource</th><th>Category</th><th>File / Link</th><th>Given</th><th>Follow-up</th><th>Notes</th><th className="text-end">Action</th></tr></thead>
       <tbody>
        {givenResources.length?givenResources.map(record=>(
         <tr key={record._id}>
          <td><strong>{record.resource?.title||"Unavailable catalog item"}</strong><div className="text-muted small">{record.resource?.description||"—"}</div></td>
          <td>{record.resource?.category?.name||"—"}</td>
          <td>{resourceLinks(record.resource,record.resourceLink)}</td>
          <td>{formatDate(record.givenDate)}</td>
          <td>{record.followUpNeeded?<><Badge bg="warning" text="dark">Needed</Badge><div>{formatDate(record.followUpDate)}</div></>:<Badge bg="secondary">No</Badge>}</td>
          <td>{record.notes||"—"}</td>
          <td className="text-end">{canGiveResource?<Button size="sm" variant="outline-danger" onClick={()=>removeGiven(record)}>Remove</Button>:null}</td>
         </tr>
        )):<tr><td colSpan="7" className="text-center py-5 text-muted">No catalog resources have been given to this mentee.</td></tr>}
       </tbody>
      </Table>
     </Card.Body>
    </Card>
   ):(
    <>
     <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="d-flex align-items-center gap-3">
       <Form.Label htmlFor="resource-catalog-search" className="mb-0 fw-semibold text-nowrap">Find Resource:</Form.Label>
       <Form.Control id="resource-catalog-search" type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search title, topic, category, or description"/>
      </Card.Body>
     </Card>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-0">
       <Table responsive hover className="align-middle mb-0">
        <thead><tr><th>Resource</th><th>Category</th><th>Topic</th><th>File / Link</th><th>Status</th><th className="text-end">Catalog Actions</th></tr></thead>
        <tbody>
         {filteredCatalog.length?filteredCatalog.map(resource=>(
          <tr key={resource._id}>
           <td><strong>{resource.title}</strong><div className="text-muted small">{resource.description||"—"}</div></td>
           <td>{resource.category?.name||"—"}</td><td>{resource.topic||"—"}</td><td>{resourceLinks(resource)}</td>
           <td><Badge bg={resource.status==="active"?"success":"secondary"}>{resource.status}</Badge></td>
           <td className="text-end"><div className="d-flex justify-content-end gap-2"><Button size="sm" variant="outline-secondary" onClick={()=>openEdit(resource)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>deleteCatalogResource(resource)}>Delete</Button></div></td>
          </tr>
         )):<tr><td colSpan="6" className="text-center py-5 text-muted">No resources are in your catalog.</td></tr>}
        </tbody>
       </Table>
      </Card.Body>
     </Card>
    </>
   )}

   <Modal show={showCatalogForm} onHide={()=>setShowCatalogForm(false)} size="xl" centered backdrop="static">
    <Modal.Header closeButton><Modal.Title>{formMode==="edit"?"Update Catalog Resource":"Add Catalog Resource"}</Modal.Title></Modal.Header>
    <Modal.Body><ResourceForm mode={formMode} currentUser={user} initialData={selectedResource} onSuccess={async()=>{setShowCatalogForm(false);setSuccess("Resource catalog updated.");await load();}} onCancel={()=>setShowCatalogForm(false)}/></Modal.Body>
   </Modal>

   <Modal className="give-resource-modal" show={showGiveForm} onHide={()=>setShowGiveForm(false)} centered backdrop="static" keyboard={false}>
    <Form className="give-resource-form" onSubmit={saveGiven}>
     <Modal.Header closeButton><Modal.Title>Give Resource to {fullName(mentee)}</Modal.Title></Modal.Header>
     <Modal.Body>
      <div className="give-resource-row"><Form.Label>Catalog Item:</Form.Label><Form.Select value={giveForm.resourceLink?`${giveForm.resource}:${giveForm.resourceLink}`:""} onChange={event=>{const[resource,resourceLink]=event.target.value.split(":");setGiveForm(current=>({...current,resource:resource||"",resourceLink:resourceLink||""}));}} required><option value="">Choose a file or link</option>{availableCatalog.map(item=><optgroup key={item._id} label={`${item.title}${item.category?.name?` — ${item.category.name}`:""}`}>{item.availableLinks.map(link=><option key={link._id} value={`${item._id}:${link._id}`}>{link.title} ({link.resourceType})</option>)}</optgroup>)}</Form.Select></div>
      <div className="give-resource-row"><Form.Label>Date Given:</Form.Label><Form.Control type="date" value={giveForm.givenDate} onChange={event=>setGiveForm(current=>({...current,givenDate:event.target.value}))} required/></div>
      <div className="give-resource-row give-resource-notes"><Form.Label>Notes:</Form.Label><Form.Control as="textarea" rows={3} value={giveForm.notes} onChange={event=>setGiveForm(current=>({...current,notes:event.target.value}))}/></div>
      <div className="give-resource-row"><Form.Label>Follow-up:</Form.Label><div className="give-resource-follow-up"><Form.Check label="Needed" checked={giveForm.followUpNeeded} onChange={event=>setGiveForm(current=>({...current,followUpNeeded:event.target.checked,followUpDate:event.target.checked?current.followUpDate:""}))}/>{giveForm.followUpNeeded?<Form.Control type="date" value={giveForm.followUpDate} onChange={event=>setGiveForm(current=>({...current,followUpDate:event.target.value}))}/>:null}</div></div>
     </Modal.Body>
     <Modal.Footer><Button variant="secondary" onClick={()=>setShowGiveForm(false)}>Cancel</Button><Button type="submit" variant="dark" disabled={saving}>{saving?"Saving…":"Record Resource Given"}</Button></Modal.Footer>
    </Form>
   </Modal>
  </Container>
 );
}

export default ResourcePage;