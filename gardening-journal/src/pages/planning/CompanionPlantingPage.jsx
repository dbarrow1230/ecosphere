import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Form,Modal,Table} from "react-bootstrap";
import {Leaf,Plus,RefreshCw,Sprout} from "lucide-react";
import CompanionPlantingForm from "../forms/planning/CompanionPlantingForm.jsx";
import {buildCompanionBrowserEntries,compatibleCompanions} from "../../utils/growing/companionBrowser.js";
import "./planning.css";
import "./companionPlanting.css";

const endpoint="/api/companion-planting";

export default function CompanionPlantingPage(){
 const [rows,setRows]=useState([]);
 const [catalog,setCatalog]=useState([]);
 const [activeType,setActiveType]=useState("seed");
 const [selectedKeys,setSelectedKeys]=useState({seed:"",plant:""});
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [formError,setFormError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 const entries=useMemo(()=>buildCompanionBrowserEntries(catalog,rows),[catalog,rows]);
 const matches=entries.filter(row=>row.libraryType===activeType&&row.name.toLowerCase().includes(search.toLowerCase()));
 const selected=matches.find(row=>row.browserKey===selectedKeys[activeType])||matches[0]||null;
 const companions=compatibleCompanions(selected);
 const unlinked=entries.filter(row=>!row.libraryType);

 async function load(){
  setLoading(true);setError("");
  try{
   const [response,catalogResponse]=await Promise.all([fetch(endpoint),fetch(`${endpoint}/library`)]);
   const [data,plants]=await Promise.all([response.json(),catalogResponse.json()]);
   if(!response.ok)throw new Error(data.message||"Unable to load companions");
   if(!catalogResponse.ok)throw new Error(plants.message||"Unable to load seeds and plants");
   setRows(data);setCatalog(plants);
  }catch(error){setError(error.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 function open(record){setEditing(record);setFormError("");setNotice("");setShowForm(true);}
 async function save(values){
  setSaving(true);setFormError("");
  try{
   const response=await fetch(editing?._id?`${endpoint}/${editing._id}`:endpoint,{method:editing?._id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
   const data=await response.json();
   if(!response.ok)throw new Error(data.message||"Unable to save companions");
   setRows(previous=>[...previous.filter(row=>data.libraryKey?row.libraryKey!==data.libraryKey:row._id!==data._id),data]);
   setShowForm(false);setNotice("Companions saved.");
  }catch(error){setFormError(error.message);}finally{setSaving(false);}
 }
 async function remove(record){
  if(!window.confirm(`Remove saved additions for ${record.name}?`))return;
  setError("");setNotice("");
  try{
   const response=await fetch(`${endpoint}/${record._id}`,{method:"DELETE"});
   const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to remove additions");
   await load();setNotice("Saved additions removed.");
  }catch(error){setError(error.message);}
 }
 return <section className="garden-planning-page companion-page">
  <header className="garden-planning-header"><div><h1>Companion Planting</h1><p>Select a seed or plant to see its companions.</p></div><Button variant="outline-primary" onClick={load} disabled={loading}><RefreshCw size={16} aria-hidden="true"/> Refresh</Button></header>
  {error&&<Alert variant="danger">{error}</Alert>}{notice&&<Alert variant="success">{notice}</Alert>}
  <div className="companion-browser">
   <aside className="companion-sidebar" aria-label="Select a seed or plant">
    <div role="tablist" aria-label="Seeds and plants" className="companion-type-tabs">
     {[{type:"seed",label:"Seeds",Icon:Sprout},{type:"plant",label:"Plants",Icon:Leaf}].map(({type,label,Icon})=><Button key={type} id={`companion-tab-${type}`} role="tab" variant="link" aria-selected={activeType===type} aria-controls={`companion-list-${type}`} className="companion-type-tab" onClick={()=>setActiveType(type)}><Icon size={16} aria-hidden="true"/>{label}</Button>)}
    </div>
    <Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} aria-label={`Search ${activeType==="seed"?"seeds":"plants"}`} placeholder={`Search ${activeType==="seed"?"seeds":"plants"}`}/>
    <nav role="tabpanel" id={`companion-list-${activeType}`} aria-labelledby={`companion-tab-${activeType}`} className="companion-name-list">
     {matches.map(row=><Button variant="link" type="button" key={row.browserKey} className="companion-name-link" aria-current={selected?.browserKey===row.browserKey?"true":undefined} onClick={()=>setSelectedKeys(previous=>({...previous,[activeType]:row.browserKey}))}>{row.name}</Button>)}
     {!matches.length&&<p>{loading?"Loading...":`No ${activeType==="seed"?"seeds":"plants"} match.`}</p>}
    </nav>
    {!!unlinked.length&&<details className="companion-unlinked"><summary>Other saved records</summary>{unlinked.map(row=><Button variant="link" key={row.browserKey} onClick={()=>open(row)}>{row.name}</Button>)}</details>}
   </aside>
   <main className="companion-center" aria-live="polite">
    {!selected?<Card body>{loading?"Loading companions...":"Select a seed or plant from the list."}</Card>:<Card className="companion-detail"><Card.Body>
     <div className="companion-detail-heading"><h2>{selected.name}</h2><div className="d-flex gap-2 flex-wrap"><Button onClick={()=>open(selected)}><Plus size={16} aria-hidden="true"/>{companions.length?"Edit companions":"Add companions"}</Button>{selected._id&&<Button variant="outline-danger" onClick={()=>remove(selected)}>Remove saved additions</Button>}</div></div>
     {companions.length?<Table responsive className="companion-detail-table"><thead><tr><th scope="col">Companion plant</th><th scope="col">Observations</th></tr></thead><tbody>{companions.map((companion,index)=><tr key={`${companion.name}-${index}`}><td>{companion.name}</td><td>{companion.notes||"—"}</td></tr>)}</tbody></Table>:<p className="companion-empty">No companions recorded for {selected.name}.</p>}
     {selected.notes&&<p>{selected.notes}</p>}
    </Card.Body></Card>}
   </main>
  </div>
  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} size="lg" centered backdrop="static"><Modal.Header closeButton={!saving}><Modal.Title>Companions for {editing?.name}</Modal.Title></Modal.Header><Modal.Body>{showForm&&<CompanionPlantingForm key={editing?._id||editing?.libraryKey||"new"} record={editing} library={catalog} onSave={save} onCancel={()=>setShowForm(false)} saving={saving} error={formError}/>}</Modal.Body></Modal>
 </section>;
}
