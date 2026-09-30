import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Container,Form,Modal,Spinner,Table} from "react-bootstrap";
import DomainSelect from "../components/DomainSelect.jsx";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.$oid||value._id||value.id||value._id?.$oid||value.id?.$oid||"";
};

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const user=parsed?.user||parsed?.data||parsed;
   const userId=getObjectId(user);
   if(userId)return userId;
  }catch{
   continue;
  }
 }
 return "";
};

const formatSize=value=>{
 const bytes=Number(value)||0;
 if(bytes<1024)return `${bytes} B`;
 if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
 return `${(bytes/(1024*1024)).toFixed(1)} MB`;
};

function AttachmentsPage(){
 const userId=getStoredUserId();
 const [attachments,setAttachments]=useState([]);
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState({description:"",tags:"",status:"active"});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const load=useCallback(async()=>{
  if(!userId){setLoading(false);return;}
  try{
   setLoading(true);
   setError("");
   const response=await fetch(`/api/attachments?userId=${encodeURIComponent(userId)}`,{credentials:"include"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to load attachments");
   setAttachments(Array.isArray(data?.data)?data.data:[]);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{queueMicrotask(load);},[load]);

 const openEdit=attachment=>{
  setEditing(attachment);
  setForm({domainId:getObjectId(attachment.domainId),domainCode:attachment.domainId?.code||"",description:attachment.description||"",tags:(attachment.tags||[]).join(", "),status:attachment.status||"active"});
 };

 const save=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");
  try{
   const response=await fetch(`/api/attachments/${editing._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId,...form,tags:form.tags.split(",").map(tag=>tag.trim()).filter(Boolean)})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to update attachment");
   setEditing(null);
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async attachment=>{
  const response=await fetch(`/api/attachments/${attachment._id}/archive`,{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId})});
  const data=await response.json().catch(()=>null);
  if(!response.ok){setError(data?.message||"Unable to archive attachment");return;}
  await load();
 };

 const remove=async attachment=>{
  if(!window.confirm(`Delete the attachment record for ${attachment.originalName||attachment.fileName}? The stored file will not be removed.`))return;
  const response=await fetch(`/api/attachments/${attachment._id}?userId=${encodeURIComponent(userId)}`,{method:"DELETE",credentials:"include"});
  const data=await response.json().catch(()=>null);
  if(!response.ok){setError(data?.message||"Unable to delete attachment");return;}
  await load();
 };

 if(!userId)return <Container className="py-5"><Alert variant="info">Log in to view attachments.</Alert></Container>;
 if(loading)return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

 return <Container fluid className="py-5 px-4">
  <div className="mb-4"><p className="dashboard-section-kicker mb-1">Associated Files</p><h1 className="mb-1">Attachments</h1><p className="text-muted mb-0">Files uploaded from workflow records and their Mongo metadata links.</p></div>
  {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
  {!attachments.length?<Alert variant="light">No attachment records yet. Upload a file from a Source form to create one.</Alert>:<Table responsive hover className="align-middle workflow-table">
   <thead><tr><th>File</th><th>Associated Record</th><th>Type</th><th>Size</th><th>Status</th><th>Actions</th></tr></thead>
   <tbody>{attachments.map(attachment=><tr key={attachment._id}>
    <td><a href={`/api/attachments/${attachment._id}/content?userId=${encodeURIComponent(userId)}`} target="_blank" rel="noreferrer">{attachment.originalName||attachment.fileName}</a><div className="small text-muted">{attachment.description||attachment.attachmentId}</div></td>
    <td>{attachment.parentModel} — {attachment.parentDisplayId||getObjectId(attachment.parentRecordId)}</td>
    <td>{attachment.fileType||attachment.mimeType||"—"}</td><td>{formatSize(attachment.size)}</td><td>{attachment.status}</td>
    <td><ButtonGroup size="sm"><Button variant="outline-primary" href={`/api/attachments/${attachment._id}/content?userId=${encodeURIComponent(userId)}`} target="_blank">View</Button><Button variant="outline-secondary" onClick={()=>openEdit(attachment)}>Edit</Button><Button variant="outline-warning" disabled={attachment.status==="archived"} onClick={()=>archive(attachment)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(attachment)}>Delete</Button></ButtonGroup></td>
   </tr>)}</tbody>
  </Table>}

  <Modal className="workflow-modal" show={Boolean(editing)} onHide={()=>setEditing(null)} centered backdrop="static" keyboard={false}>
   <Modal.Header closeButton><Modal.Title>Edit Attachment</Modal.Title></Modal.Header>
   <Modal.Body><Form onSubmit={save}>
    <DomainSelect value={form.domainId} onChange={(domainId,domain)=>setForm(current=>({...current,domainId,domainCode:domain?.code||""}))}/>
    <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} value={form.description} onChange={event=>setForm(current=>({...current,description:event.target.value}))}/></Form.Group>
    <Form.Group className="mb-3"><Form.Label>Tags</Form.Label><Form.Control value={form.tags} onChange={event=>setForm(current=>({...current,tags:event.target.value}))} placeholder="Comma-separated tags"/></Form.Group>
    <Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select value={form.status} onChange={event=>setForm(current=>({...current,status:event.target.value}))}><option value="active">Active</option><option value="archived">Archived</option></Form.Select></Form.Group>
    <div className="text-end"><Button type="submit" disabled={saving}>{saving?"Saving…":"Save Attachment"}</Button></div>
   </Form></Modal.Body>
  </Modal>
 </Container>;
}

export default AttachmentsPage;
