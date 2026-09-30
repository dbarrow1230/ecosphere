import Alert from "../../components/AppAlert.jsx";
import {useEffect,useMemo,useState} from "react";
import {Badge,Button,Container,Modal,Table} from "react-bootstrap";
import ReferenceDataForm from "../forms/recipes/ReferenceDataForm.jsx";
import "../../styles/ReferenceDataPage.css";

const getRows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:[];

export default function ReferenceDataPage({title,singular,endpoint,description}){
 const [rows,setRows]=useState([]);
 const [selected,setSelected]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [showDelete,setShowDelete]=useState(false);

 const sortedRows=useMemo(()=>[...rows].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""))),[rows]);

 const loadRows=async()=>{
  const res=await fetch(endpoint);
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.message||`Failed to load ${title.toLowerCase()}.`);
  setRows(getRows(data));
 };

 useEffect(()=>{
  loadRows().catch(err=>setError(err.message)).finally(()=>setLoading(false));
 },[endpoint]);

 const openAdd=()=>{setSelected(null);setShowForm(true);setError("");};
 const openEdit=row=>{setSelected(row);setShowForm(true);setError("");};

 const save=async payload=>{
  try{
   setSaving(true);
   setError("");
   const editing=Boolean(selected?._id);
   const res=await fetch(editing?`${endpoint}/${selected._id}`:endpoint,{
    method:editing?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to save ${singular.toLowerCase()}.`);
   await loadRows();
   setShowForm(false);
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 const remove=async()=>{
  if(!selected?._id)return;
  try{
   setSaving(true);
   const res=await fetch(`${endpoint}/${selected._id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to delete ${singular.toLowerCase()}.`);
   await loadRows();
   setShowDelete(false);
   setSelected(null);
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 return(
  <Container fluid className="reference-data-page py-4 px-3 px-lg-4">
   <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
    <div><h1 className="mb-1">{title}</h1><p className="text-muted mb-0">{description}</p></div>
    <Button onClick={openAdd}>Add {singular}</Button>
   </div>
   {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}
   <div className="table-responsive">
    <Table hover bordered align="middle">
     <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
     <tbody>
      {loading?<tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>:null}
      {!loading&&sortedRows.length===0?<tr><td colSpan="5" className="text-center py-4 text-muted">No {title.toLowerCase()} have been created.</td></tr>:null}
      {sortedRows.map(row=>(
       <tr key={row._id}>
        <td className="fw-semibold">{row.name}</td><td>{row.slug||"-"}</td><td>{row.description||"-"}</td>
        <td><Badge bg={row.isActive!==false?"success":"secondary"}>{row.isActive!==false?"Active":"Inactive"}</Badge></td>
        <td className="text-end text-nowrap"><span className="d-inline-flex flex-nowrap gap-2"><Button size="sm" variant="outline-primary" onClick={()=>openEdit(row)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>{setSelected(row);setShowDelete(true);}}>Delete</Button></span></td>
       </tr>
      ))}
     </tbody>
    </Table>
   </div>
   <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered>
    <Modal.Header closeButton><Modal.Title>{selected?"Edit":"Add"} {singular}</Modal.Title></Modal.Header>
    <Modal.Body><ReferenceDataForm initialData={selected||{}} label={singular} onSubmit={save} loading={saving}/></Modal.Body>
   </Modal>
   <Modal show={showDelete} onHide={()=>!saving&&setShowDelete(false)} centered>
    <Modal.Header closeButton><Modal.Title>Delete {singular}</Modal.Title></Modal.Header>
    <Modal.Body>Delete <strong>{selected?.name}</strong>?</Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button><Button variant="danger" onClick={remove} disabled={saving}>{saving?"Deleting...":"Delete"}</Button></Modal.Footer>
   </Modal>
  </Container>
 );
}
