import {useEffect,useState} from "react";
import "../styles/MeetingMethods.css";

const blank={kind:"category",name:"",value:"",description:"",isActive:true};

export default function FileOptionsPage({user}){
 const [items,setItems]=useState([]);
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState(blank);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [deleteTarget,setDeleteTarget]=useState(null);

 const load=async()=>{
  const res=await fetch("/api/file-lookups",{credentials:"include"});
  const data=await res.json();
  if(!res.ok)throw new Error(data?.message||"Failed to load file options");
  setItems(data.fileLookups||[]);
 };

 useEffect(()=>{load().catch(err=>setError(err.message));},[]);

 const open=item=>{
  setShowForm(true);
  setEditing(item||null);
  setForm(item?{kind:item.kind,name:item.name,value:item.value,description:item.description||"",isActive:item.isActive}:blank);
 };

 const save=async event=>{
  event.preventDefault();
  setError("");
  const payload={...form,createdBy:user?._id||user?.id||null};
  const res=await fetch(editing?`/api/file-lookups/${editing._id}`:"/api/file-lookups",{
   method:editing?"PUT":"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
  });
  const data=await res.json();
  if(!res.ok){setError(data?.message||"Failed to save file option");return;}
  setMessage(editing?"File option updated.":"File option added.");
  setShowForm(false);setEditing(null);setForm(blank);await load();
 };

 const remove=async()=>{
  const res=await fetch(`/api/file-lookups/${deleteTarget._id}`,{method:"DELETE",credentials:"include"});
  const data=await res.json();
  if(!res.ok){setError(data?.message||"Failed to delete file option");return;}
  setDeleteTarget(null);setMessage("File option deleted.");await load();
 };

 return <div className="container py-4">
  <div className="d-flex justify-content-between align-items-center mb-4">
   <h3>File Types &amp; Categories</h3>
   <button className="btn btn-primary" onClick={()=>open(null)}>Add Option</button>
  </div>
  {error?<div className="app-feedback app-feedback-danger"><span>{error}</span><button onClick={()=>setError("")}>×</button></div>:null}
  {message?<div className="app-feedback app-feedback-success"><span>{message}</span><button onClick={()=>setMessage("")}>×</button></div>:null}
  <div className="card"><div className="card-body"><div className="table-responsive">
   <table className="table align-middle mb-0"><thead><tr><th>Kind</th><th>Name</th><th>Stored Value</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>{items.map(item=><tr key={item._id}>
     <td>{item.kind==="type"?"File Type":"Category"}</td><td>{item.name}</td><td>{item.value}</td><td>{item.description||"—"}</td>
     <td><span className={`app-status-badge ${item.isActive?"status-active":"status-unknown"}`}>{item.isActive?"Active":"Inactive"}</span></td>
     <td><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary" onClick={()=>open(item)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={()=>setDeleteTarget(item)}>Delete</button></div></td>
    </tr>)}</tbody>
   </table>
  </div></div></div>
  {showForm&&<div className="modal d-block meeting-method-modal-backdrop">
   <div className="modal-dialog meeting-method-modal"><div className="modal-content">
    <div className="modal-header"><h5>{editing?"Edit File Option":"Add File Option"}</h5><button className="btn-close" onClick={()=>{setShowForm(false);setEditing(null);setForm(blank);}}/></div>
    <form className="meeting-method-form" onSubmit={save}>
     <div className="row g-2 align-items-center meeting-method-row"><label className="col-auto col-form-label">Kind:</label><div className="col meeting-method-control"><select className="form-select" value={form.kind} disabled={Boolean(editing)} onChange={e=>setForm({...form,kind:e.target.value})}><option value="category">Category</option><option value="type">File Type</option></select></div></div>
     <div className="row g-2 align-items-center meeting-method-row"><label className="col-auto col-form-label">Name:</label><div className="col meeting-method-control"><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div></div>
     <div className="row g-2 align-items-center meeting-method-row"><label className="col-auto col-form-label">Stored Value:</label><div className="col meeting-method-control"><input className="form-control" value={form.value} placeholder="Created from name if blank" onChange={e=>setForm({...form,value:e.target.value})}/></div></div>
     <div className="row g-2 align-items-center meeting-method-row"><label className="col-auto col-form-label">Description:</label><div className="col meeting-method-control"><input className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div></div>
     <div className="row g-2 align-items-center meeting-method-row"><span className="col-auto col-form-label meeting-method-label">Status:</span><div className="col meeting-method-control"><label className={`meeting-method-status-toggle ${form.isActive?"is-active":"is-inactive"}`}><input className="visually-hidden" type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/><span>{form.isActive?"✓":"×"}</span><strong>{form.isActive?"Active":"Inactive"}</strong></label></div></div>
     <div className="meeting-method-actions"><button type="button" className="btn btn-secondary" onClick={()=>{setShowForm(false);setEditing(null);setForm(blank);}}>Cancel</button><button className="btn btn-primary">Save Option</button></div>
    </form>
   </div></div>
  </div>}
  {deleteTarget?<div className="app-modal-backdrop"><section className="app-confirm-dialog"><header><h2>Delete File Option</h2></header><div className="app-confirm-body"><p>Delete <strong>{deleteTarget.name}</strong>?</p></div><footer><button className="btn btn-secondary" onClick={()=>setDeleteTarget(null)}>Cancel</button><button className="btn app-danger-button" onClick={remove}>Delete</button></footer></section></div>:null}
 </div>;
}
