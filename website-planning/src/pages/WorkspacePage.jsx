import {useEffect,useState} from "react";
import "../styles/Dashboard.css";
import "../styles/Records.css";

export default function WorkspacePage({kicker,title,text,recordType}){
 const type=recordType||title.toLowerCase().replace(/\s+/g,"-");
 const [records,setRecords]=useState([]);
 const [form,setForm]=useState({title:"",description:"",status:"active"});
 const [editingId,setEditingId]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [message,setMessage]=useState("");

 const loadRecords=async()=>{try{const response=await fetch(`/api/planning-records?type=${encodeURIComponent(type)}`);const payload=await response.json();if(!response.ok)throw new Error(payload.message||"Unable to load records");setRecords(payload.data||[]);}catch(error){setMessage(error.message);}};
 useEffect(()=>{
  let cancelled=false;
  fetch(`/api/planning-records?type=${encodeURIComponent(type)}`)
   .then(response=>response.json().then(payload=>({response,payload})))
   .then(({response,payload})=>{if(!response.ok)throw new Error(payload.message||"Unable to load records");if(!cancelled)setRecords(payload.data||[]);})
   .catch(error=>{if(!cancelled)setMessage(error.message);});
  return()=>{cancelled=true;};
 },[type]);

 const saveRecord=async event=>{event.preventDefault();setMessage("");try{const response=await fetch(editingId?`/api/planning-records/${editingId}`:"/api/planning-records",{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,type})});const payload=await response.json();if(!response.ok)throw new Error(payload.message||"Unable to save record");setForm({title:"",description:"",status:"active"});setEditingId("");setShowForm(false);await loadRecords();}catch(error){setMessage(error.message);}};
 const editRecord=record=>{setForm({title:record.title,description:record.description||"",status:record.status||"active"});setEditingId(record._id);setShowForm(true);};
 const deleteRecord=async record=>{if(!window.confirm(`Delete "${record.title}"?`))return;const response=await fetch(`/api/planning-records/${record._id}`,{method:"DELETE"});const payload=await response.json().catch(()=>({}));if(!response.ok){setMessage(payload.message||"Unable to delete record");return;}await loadRecords();};

 return <main className="dashboard-page"><section className="page-heading"><p className="dashboard-kicker">{kicker}</p><h2>{title}</h2><p>{text}</p></section><section className="dashboard-section">
  <div className="section-heading"><h3>{title} workspace</h3><button type="button" className="primary-action" onClick={()=>{setEditingId("");setForm({title:"",description:"",status:"active"});setShowForm(value=>!value);}}>Add {title.replace(/s$/,'')}</button></div>
  {message&&<div className="record-message" role="alert">{message}</div>}
  {showForm&&<form className="record-form" onSubmit={saveRecord}><label>Title:<input value={form.title} onChange={event=>setForm({...form,title:event.target.value})} required/></label><label>Description:<textarea value={form.description} onChange={event=>setForm({...form,description:event.target.value})}/></label><label>Status:<select value={form.status} onChange={event=>setForm({...form,status:event.target.value})}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label><div className="form-actions"><button className="primary-action" type="submit">{editingId?"Save Changes":"Create Record"}</button><button type="button" onClick={()=>setShowForm(false)}>Cancel</button></div></form>}
  {!records.length&&!showForm&&<div className="empty-panel"><strong>No {title.toLowerCase()} have been added.</strong><span>Use Add {title.replace(/s$/,'')} to create the first record.</span></div>}
  {!!records.length&&<div className="record-list">{records.map(record=><article className="record-card" key={record._id}><div><h4>{record.title}</h4><p>{record.description||"No description"}</p><span className="status-badge">{record.status}</span></div><div className="record-actions"><button type="button" onClick={()=>editRecord(record)}>Edit</button><button type="button" onClick={()=>deleteRecord(record)}>Delete</button></div></article>)}</div>}
 </section></main>;
}
