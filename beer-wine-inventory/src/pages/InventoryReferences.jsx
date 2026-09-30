import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {allRows,inventoryApi} from "../utils/inventoryApi.js";

export default function InventoryReferences({endpoint,title}){
 const [rows,setRows]=useState([]),[form,setForm]=useState(null),[error,setError]=useState(""),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;allRows(`/api/${endpoint}`).then(data=>{if(active)setRows(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[endpoint,revision]);
 async function save(e){e.preventDefault();setSaving(true);setError("");try{
  await inventoryApi(`/api/${endpoint}${form._id?`/${form._id}`:""}`,{method:form._id?"PUT":"POST",body:JSON.stringify({name:form.name,description:form.description,isActive:form.isActive,...(endpoint==="units-of-measure"?{symbol:form.symbol}:{})})});
  setForm(null);setLoading(true);setRevision(v=>v+1);
 }catch(e){setError(e.message);}finally{setSaving(false);}}
 return <section className="container py-4"><h1>{title}</h1><Link to="/beverages">Beverages</Link>
  {error&&<p role="alert" className="alert alert-danger">{error}</p>}
  <button className="btn btn-primary m-3" onClick={()=>setForm({name:"",symbol:"",description:"",isActive:true})}>Add {title.toLowerCase()}</button>
  {loading?<p>Loading…</p>:<table className="table"><thead><tr><th>Name</th><th>Description</th><th>Status</th><th/></tr></thead><tbody>{rows.map(row=><tr key={row._id}><td>{row.name}{row.symbol?` (${row.symbol})`:""}</td><td>{row.description}</td><td>{row.isActive?"Active":"Inactive"}</td><td><button className="btn btn-outline-primary" onClick={()=>setForm({...row})}>Edit</button></td></tr>)}</tbody></table>}
  {form&&<form onSubmit={save}><fieldset disabled={saving}>
   <label className="d-block mb-3">Name<input required className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
   {endpoint==="units-of-measure"&&<label className="d-block mb-3">Symbol<input required className="form-control" value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value})}/></label>}
   <label className="d-block mb-3">Description<textarea className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
   <label className="d-block mb-3"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/> Active</label>
   <button className="btn btn-primary">{saving?"Saving…":"Save"}</button> <button type="button" className="btn btn-secondary" onClick={()=>setForm(null)}>Cancel</button>
  </fieldset></form>}
 </section>;
}
