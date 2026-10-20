import {useEffect,useState} from "react";
import {Alert,Button,Card,Form,Modal} from "react-bootstrap";
import {Leaf,RefreshCw,Sprout} from "lucide-react";
import SeedFormPage from "../forms/seeds/SeedFormPage.jsx";
import "./planning.css";
import "./companionPlanting.css";

export default function CropRelationshipsBrowser({title,field,description,user}){
 const [entries,setEntries]=useState([]);
 const [type,setType]=useState("seed");
 const [selectedKey,setSelectedKey]=useState("");
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [editing,setEditing]=useState(null);
 const [opening,setOpening]=useState(false);
 const matches=entries.filter(entry=>entry.libraryType===type&&entry.name.toLowerCase().includes(search.toLowerCase()));
 const selected=matches.find(entry=>entry.libraryKey===selectedKey)||matches[0];
 async function load(){
  setLoading(true);setError("");
  try{const response=await fetch("/api/companion-planting/library");const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load crops");setEntries(data);}
  catch(error){setError(error.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 async function edit(){
  setOpening(true);setError("");
  try{const response=await fetch(`/api/seeds/${selected.sourceSeedId}`);const seed=await response.json();if(!response.ok)throw new Error(seed.message||"Unable to load seed");setEditing(seed);}
  catch(error){setError(error.message);}finally{setOpening(false);}
 }
 return <section className="garden-planning-page companion-page">
  <header className="garden-planning-header"><div><h1>{title}</h1><p>{description}</p></div><Button variant="outline-primary" onClick={load} disabled={loading}><RefreshCw size={16} aria-hidden="true"/> Refresh</Button></header>
  {error&&<Alert variant="danger">{error}</Alert>}
  <div className="companion-browser"><aside className="companion-sidebar" aria-label="Select a seed or plant">
   <div className="companion-type-tabs" role="tablist" aria-label="Seeds and plants">{[{key:"seed",label:"Seeds",Icon:Sprout},{key:"plant",label:"Plants",Icon:Leaf}].map(({key,label,Icon})=><Button key={key} variant="link" role="tab" id={`${field}-${key}`} aria-controls={`${field}-list`} aria-selected={type===key} className="companion-type-tab" onClick={()=>setType(key)}><Icon size={16} aria-hidden="true"/>{label}</Button>)}</div>
   <Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} aria-label="Search crops" placeholder="Search crops"/>
   <nav className="companion-name-list" role="tabpanel" id={`${field}-list`} aria-labelledby={`${field}-${type}`}>{matches.map(entry=><Button type="button" variant="link" className="companion-name-link" key={entry.libraryKey} aria-current={entry.libraryKey===selected?.libraryKey?"true":undefined} onClick={()=>setSelectedKey(entry.libraryKey)}>{entry.name}</Button>)}{!matches.length&&<p>{loading?"Loading...":"No matching crops."}</p>}</nav>
  </aside><main className="companion-center"><Card className="companion-detail"><Card.Body>{!selected?<p>Select a seed or plant.</p>:<>
   <div className="companion-detail-heading"><h2>{selected.name}</h2>{selected.sourceSeedId&&<Button onClick={edit} disabled={opening}>{opening?"Opening...":`Edit ${title.toLowerCase()}`}</Button>}</div>
   {selected[field]?.length?<ul>{selected[field].map(crop=><li key={crop.sourceId||crop.name}>{crop.name}</li>)}</ul>:<p>No {title.toLowerCase()} recorded for {selected.name}.</p>}
  </>}</Card.Body></Card></main></div>
  <Modal show={!!editing} onHide={()=>setEditing(null)} size="xl" fullscreen="lg-down" scrollable className="seed-form-modal"><Modal.Header closeButton><Modal.Title>{title}: {selected?.name}</Modal.Title></Modal.Header><Modal.Body>{editing&&<SeedFormPage mode="edit" initialSeed={editing} initialTab="planting" embedded user={user} onCancel={()=>setEditing(null)} onSaved={()=>{setEditing(null);load();}}/>}</Modal.Body></Modal>
 </section>;
}
