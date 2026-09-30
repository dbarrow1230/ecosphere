import {useCallback,useEffect,useMemo,useState} from "react";
import {Badge,Button,Card,Container,Form,Modal,Table} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";
import ReferenceRecordForm from "../forms/admin/catalog/ReferenceRecordForm.jsx";

const getId=value=>typeof value==="string"?value:String(value?._id||"");
const rowsFrom=(data,key)=>Array.isArray(data?.[key])?data[key]:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];

export default function ReferenceDataPage({title,description,endpoint,collectionKey,type}){
 const singularTitle={Categories:"Category",Statuses:"Status",Parts:"Part","Ingredient Forms":"Ingredient Form","Metric Units":"Metric Unit","Imperial Units":"Imperial Unit","Location Types":"Location Type"}[title]||title.replace(/s$/,"");
 const [rows,setRows]=useState([]),[statuses,setStatuses]=useState([]),[search,setSearch]=useState("");
 const [selected,setSelected]=useState(null),[mode,setMode]=useState("add"),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");

 const load=useCallback(async()=>{
  try{
   setLoading(true);setError("");
   const requests=[fetch(endpoint)];
   if(type==="part"||type==="form")requests.push(fetch("/api/reference/statuses"));
   const responses=await Promise.all(requests);
   const payloads=await Promise.all(responses.map(response=>response.json().catch(()=>null)));
   if(!responses[0].ok)throw new Error(payloads[0]?.message||`${title} could not load.`);
   setRows(rowsFrom(payloads[0],collectionKey));
   if(responses[1]){
    if(!responses[1].ok)throw new Error(payloads[1]?.message||"Statuses could not load.");
    setStatuses(rowsFrom(payloads[1],"statuses"));
   }
  }catch(err){setError(err.message||`${title} could not load.`);}finally{setLoading(false);}
 },[collectionKey,endpoint,title,type]);
 useEffect(()=>{const timer=window.setTimeout(load,0);return()=>window.clearTimeout(timer);},[load]);

 const filtered=useMemo(()=>rows.filter(row=>[row.name,row.code,row.slug,row.symbol].some(value=>String(value||"").toLowerCase().includes(search.toLowerCase()))),[rows,search]);
 const save=async payload=>{
  try{
   setSaving(true);setError("");
   const editing=mode==="edit"&&selected;
   const response=await fetch(editing?`${endpoint}/${getId(selected)}`:endpoint,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Record could not save.");
   setShowForm(false);setMessage(editing?"Record updated.":"Record created.");await load();
  }catch(err){setError(err.message||"Record could not save.");}finally{setSaving(false);}
 };
 const remove=async()=>{
  try{
   setSaving(true);setError("");
   const response=await fetch(`${endpoint}/${getId(selected)}`,{method:"DELETE"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Record could not delete.");
   setShowDelete(false);setSelected(null);setMessage("Record deleted.");await load();
  }catch(err){setError(err.message||"Record could not delete.");}finally{setSaving(false);}
 };

 return <Container fluid className="py-4">
  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><h1>{title}</h1><p className="text-muted mb-0">{description}</p></div><Button onClick={()=>{setMode("add");setSelected(null);setShowForm(true);}}>Add {singularTitle}</Button></div>
  {message&&<Alert variant="success" dismissible onClose={()=>setMessage("")}>{message}</Alert>}{error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
  <Card className="border-0 shadow-sm"><Card.Body><Form.Control className="mb-3" placeholder={`Search ${title.toLowerCase()}`} value={search} onChange={e=>setSearch(e.target.value)}/><Table responsive hover><thead><tr><th>Name</th><th>Code / Slug</th><th>Status / Type</th><th className="text-end">Actions</th></tr></thead><tbody>
   {loading&&<tr><td colSpan="4">Loading...</td></tr>}{!loading&&filtered.length===0&&<tr><td colSpan="4" className="text-muted">No records found.</td></tr>}
   {filtered.map(row=><tr key={getId(row)}><td>{row.name}</td><td>{row.code||row.slug||row.symbol||"—"}</td><td>{row.status?.name||row.status||row.unitType||(row.isDefault?"Default":row.isActive===false?"Inactive":row.isActive===true?"Active":"—")}</td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-2" onClick={()=>{setSelected(row);setMode("edit");setShowForm(true);}}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>{setSelected(row);setShowDelete(true);}}>Delete</Button></td></tr>)}
  </tbody></Table></Card.Body></Card>
  <Modal show={showForm} onHide={()=>setShowForm(false)} size="lg"><Modal.Header closeButton><Modal.Title>{mode==="edit"?"Edit":"Add"} {singularTitle}</Modal.Title></Modal.Header><Modal.Body><ReferenceRecordForm key={`${type}-${mode}-${getId(selected)}`} type={type} initialData={mode==="edit"?selected||{}:{}} statuses={statuses} onSubmit={save} saving={saving}/></Modal.Body></Modal>
  <Modal show={showDelete} onHide={()=>setShowDelete(false)}><Modal.Header closeButton><Modal.Title>Delete record</Modal.Title></Modal.Header><Modal.Body>Delete <strong>{selected?.name}</strong>?</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button><Button variant="danger" disabled={saving} onClick={remove}>Delete</Button></Modal.Footer></Modal>
 </Container>;
}
