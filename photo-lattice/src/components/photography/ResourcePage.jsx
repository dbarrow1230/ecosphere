import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Card,Container,Modal,Spinner} from "react-bootstrap";
import {Link,useSearchParams} from "react-router-dom";
import {photographyApi,photographyOptions} from "../../utils/photographyApi.js";
import RecordDetails from "./RecordDetails.jsx";
const emptyLookups={};

export default function ResourcePage({title,singular,endpoint,FormComponent,fields,lookups=emptyLookups,photoFilter,description}){
 const [params,setParams]=useSearchParams();
 const [rows,setRows]=useState([]),[total,setTotal]=useState(0),[options,setOptions]=useState({});
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [editing,setEditing]=useState(undefined),[selected,setSelected]=useState(null),[removing,setRemoving]=useState(null),[busy,setBusy]=useState(false);
 const page=Math.max(1,Number(params.get("page"))||1);
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   const data=await photographyApi(`${endpoint}?page=${page}&limit=25`);
   setRows(data.data);setTotal(data.total);
   setSelected(current=>data.data.find(row=>row._id===current?._id)||data.data[0]||null);
   const entries=await Promise.all(Object.entries(lookups).map(async([key,url])=>[key,await photographyOptions(url)]));
   setOptions(Object.fromEntries(entries));
  }catch(error){setError(error.status===401?"Please sign in to view your records.":error.message);}finally{setLoading(false);}
 },[endpoint,page,lookups]);
 useEffect(()=>{load();},[load]);
 const save=async payload=>{
  await photographyApi(editing?`${endpoint}/${editing._id}`:endpoint,{method:editing?"PUT":"POST",body:JSON.stringify(payload)});
  setEditing(undefined);await load();
 };
 const remove=async()=>{
  setBusy(true);
  try{await photographyApi(`${endpoint}/${removing._id}`,{method:"DELETE"});setRemoving(null);await load();}catch(error){setError(error.message);setRemoving(null);}finally{setBusy(false);}
 };
 return <Container className="py-4">
  <div className="d-flex justify-content-between align-items-center mb-3"><h1>{title}</h1><Button disabled={loading||!!error} onClick={()=>setEditing(null)}>Add {singular}</Button></div>
  {description&&<p>{description}</p>}
  {error&&<Alert variant="danger">{error} <Link to="/login">Sign in</Link> <Button size="sm" variant="outline-secondary" onClick={load}>Retry</Button></Alert>}
  {loading?<Spinner animation="border" aria-label="Loading"/>:<>
   {!rows.length&&!error&&<Alert variant="info">No {title.toLowerCase()} yet. Add your first {singular.toLowerCase()} to get started.</Alert>}
   <div className="d-flex flex-wrap gap-2 mb-3">{rows.map(row=><Button key={row._id} variant={selected?._id===row._id?"primary":"outline-primary"} onClick={()=>setSelected(row)}>{row.name||row.title}</Button>)}</div>
   {selected&&<Card><Card.Body><div className="d-flex justify-content-between gap-2 mb-3"><h2 className="h4">{selected.name||selected.title}</h2><div className="d-flex gap-2"><Button size="sm" onClick={()=>setEditing(selected)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>setRemoving(selected)}>Delete</Button></div></div><RecordDetails record={selected} fields={fields}/>{photoFilter&&<Link to={`/photos?${photoFilter}=${selected._id}`}>View photos</Link>}</Card.Body></Card>}
   <div className="d-flex gap-3 align-items-center mt-3"><Button disabled={page<=1} variant="outline-secondary" onClick={()=>setParams({page:String(page-1)})}>Previous</Button><span>Page {page} · {total} records</span><Button disabled={page*25>=total} variant="outline-secondary" onClick={()=>setParams({page:String(page+1)})}>Next</Button></div>
  </>}
  <Modal show={editing!==undefined} onHide={()=>setEditing(undefined)} size="lg" backdrop="static"><Modal.Header closeButton><Modal.Title>{editing?"Edit":"Add"} {singular}</Modal.Title></Modal.Header><Modal.Body>{editing!==undefined&&<FormComponent key={editing?._id||"new"} initialData={editing||{}} onSave={save} onCancel={()=>setEditing(undefined)} options={options}/>}</Modal.Body></Modal>
  <Modal show={!!removing} onHide={()=>!busy&&setRemoving(null)}><Modal.Header><Modal.Title>Delete {singular}?</Modal.Title></Modal.Header><Modal.Body>This permanently deletes “{removing?.name||removing?.title}”. Records still in use cannot be deleted.</Modal.Body><Modal.Footer><Button variant="secondary" disabled={busy} onClick={()=>setRemoving(null)}>Cancel</Button><Button variant="danger" disabled={busy} onClick={remove}>{busy?"Deleting…":"Delete"}</Button></Modal.Footer></Modal>
 </Container>;
}
