import {useEffect,useState} from "react";
import {api} from "../../utils/api.js";

const empty={name:"",code:"",category:"standard",description:"",defaultBladeLength:0,defaultBladeSteel:"",defaultEdgeAngle:15,isActive:true};

function KnifeTypesAdmin(){
 const [records,setRecords]=useState([]);const [form,setForm]=useState(empty);const [message,setMessage]=useState("");
 const load=()=>api("/api/catalog/knife-types").then(setRecords).catch(error=>setMessage(error.message));
 useEffect(()=>{
  load();
 },[]);
 const save=async event=>{event.preventDefault();try{await api(form._id?`/api/catalog/knife-types/${form._id}`:"/api/catalog/knife-types",{method:form._id?"PUT":"POST",body:JSON.stringify(form)});setForm(empty);load();}catch(error){setMessage(error.message);}};
 const seed=async()=>{try{await api("/api/catalog/seed",{method:"POST"});load();setMessage("Default knife types and tiers are ready.");}catch(error){setMessage(error.message);}};
 return <section className="page-stack"><div className="page-heading"><p className="app-eyebrow">Admin Reference</p><h2>Knife Types</h2><p>Define standard and non-standard knives that can be assigned to tiers or selected in Custom.</p></div><button className="button secondary fit" onClick={seed}>Create Default Catalog</button>
  <div className="admin-grid"><form className="panel form-grid" onSubmit={save}><h3>{form._id?"Edit":"Add"} Knife Type</h3>{["name","code","description","defaultBladeSteel"].map(key=><label key={key}>{key.replace(/([A-Z])/g," $1")}<input required={["name","code"].includes(key)} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})}/></label>)}<label>Category<select value={form.category} onChange={event=>setForm({...form,category:event.target.value})}><option>standard</option><option>specialty</option><option>accessory</option></select></label><label>Blade length<input type="number" min="0" step="0.1" value={form.defaultBladeLength} onChange={event=>setForm({...form,defaultBladeLength:Number(event.target.value)})}/></label><label>Edge angle<input type="number" min="0" max="90" value={form.defaultEdgeAngle} onChange={event=>setForm({...form,defaultEdgeAngle:Number(event.target.value)})}/></label><button className="button full">Save Knife Type</button></form>
   <section className="panel"><h3>Configured Knife Types</h3><div className="reference-list">{records.map(item=><button type="button" key={item._id} onClick={()=>setForm(item)}><b>{item.name}</b><span>{item.code} · {item.category}</span></button>)}</div></section></div>{message&&<p className="status-banner">{message}</p>}</section>;
}

export default KnifeTypesAdmin;
