// AntennaReferencePage.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {Antenna,BookOpen,Plus,Search} from "lucide-react";
import "../../styles/AntennaReference.css";

const emptyForm={
 title:"",
 key:"",
 category:"",
 summary:"",
 definition:"",
 example:"",
 frequencyRange:"",
 band:"",
 polarization:"",
 radiationPattern:"",
 gain:"",
 impedance:"",
 sourceName:"",
 sourceUrl:"",
 notes:"",
 aliases:"",
 isSystem:false,
 isActive:true
};

const getToken=()=>localStorage.getItem("token")||sessionStorage.getItem("token")||"";
const authHeaders=extra=>({Authorization:`Bearer ${getToken()}`,...extra});
const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value?.id||value||"");

const getBusinessId=user=>{
 return getId(
  user?.business?._id||
  user?.business?.id||
  user?.business||
  user?.businessId||
  user?.business_id||
  user?.currentBusiness?._id||
  user?.currentBusiness?.id||
  user?.currentBusiness||
  user?.selectedBusiness?._id||
  user?.selectedBusiness?.id||
  user?.selectedBusiness||
  user?.businesses?.[0]?.business?._id||
  user?.businesses?.[0]?.business?.id||
  user?.businesses?.[0]?.business||
  user?.businesses?.[0]?._id||
  user?.businesses?.[0]?.id
 );
};

const withBusiness=(url,user)=>{
 const business=getBusinessId(user);
 if(!business)return url;
 return `${url}${url.includes("?")?"&":"?"}business=${encodeURIComponent(business)}`;
};

const toArray=data=>{
 const value=data?.data||data;
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.antennaReferences))return value.antennaReferences;
 if(Array.isArray(value?.antennas))return value.antennas;
 if(Array.isArray(value?.references))return value.references;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The antenna reference request failed");
 return data;
};

export default function AntennaReferencePage({user}){
 const [records,setRecords]=useState([]);
 const [search,setSearch]=useState("");
 const [category,setCategory]=useState("all");
 const [letter,setLetter]=useState("all");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState(null);
 const [editing,setEditing]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [form,setForm]=useState(emptyForm);

 const loadRecords=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   setRecords(toArray(await readResponse(await fetch(withBusiness("/api/references/antennas",user),{headers:authHeaders()}))));
  }catch(loadError){
   setError(loadError.message);
   setRecords([]);
  }finally{
   setLoading(false);
  }
 },[user]);

 useEffect(()=>{loadRecords();},[loadRecords]);
 useEffect(()=>{if(!notice)return undefined;const timer=window.setTimeout(()=>setNotice(null),5000);return()=>window.clearTimeout(timer);},[notice]);
 useEffect(()=>{if(!error)return undefined;const timer=window.setTimeout(()=>setError(""),5000);return()=>window.clearTimeout(timer);},[error]);

 const categories=useMemo(()=>["all",...new Set(records.map(record=>record.category).filter(Boolean))],[records]);
 const availableLetters=useMemo(()=>[...new Set(records.map(record=>String(record.title||"").charAt(0).toUpperCase()).filter(Boolean))].sort(),[records]);

 const filteredRecords=useMemo(()=>{
  const query=search.trim().toLowerCase();
  return records.filter(record=>{
   const categoryMatches=category==="all"||record.category===category;
   const letterMatches=letter==="all"||String(record.title||"").toUpperCase().startsWith(letter);
   const searchMatches=!query||[
    record.title,
    record.key,
    record.category,
    record.summary,
    record.definition,
    record.example,
    record.frequencyRange,
    record.band,
    record.polarization,
    record.radiationPattern,
    record.gain,
    record.impedance,
    record.sourceName,
    record.sourceUrl,
    record.notes,
    ...(record.aliases||[])
   ].some(value=>String(value||"").toLowerCase().includes(query));
   return categoryMatches&&letterMatches&&searchMatches;
  }).sort((left,right)=>String(left.title||"").localeCompare(String(right.title||""),undefined,{numeric:true,sensitivity:"base"}));
 },[records,search,category,letter]);

 const groupedRecords=useMemo(()=>filteredRecords.reduce((groups,record)=>{
  const key=String(record.title||"#").charAt(0).toUpperCase();
  (groups[key]??=[]).push(record);
  return groups;
 },{}),[filteredRecords]);

 const openAdd=()=>{
  setEditing(null);
  setForm(emptyForm);
  setShowForm(true);
  setError("");
 };

 const openEdit=record=>{
  setEditing(record);
  setForm({
   title:record.title||"",
   key:record.key||"",
   category:record.category||"",
   summary:record.summary||"",
   definition:record.definition||"",
   example:record.example||"",
   frequencyRange:record.frequencyRange||"",
   band:record.band||"",
   polarization:record.polarization||"",
   radiationPattern:record.radiationPattern||"",
   gain:record.gain||"",
   impedance:record.impedance||"",
   sourceName:record.sourceName||"",
   sourceUrl:record.sourceUrl||"",
   notes:record.notes||"",
   aliases:(record.aliases||[]).join(", "),
   isSystem:record.isSystem===true,
   isActive:record.isActive!==false
  });
  setShowForm(true);
  setError("");
 };

 const updateForm=event=>{
  const {name,value,type,checked}=event.target;
  setForm(current=>({...current,[name]:type==="checkbox"?checked:value}));
 };

 const buildPayload=()=>({
  business:getBusinessId(user),
  title:form.title,
  key:form.key,
  category:form.category,
  summary:form.summary,
  definition:form.definition,
  example:form.example,
  frequencyRange:form.frequencyRange,
  band:form.band,
  polarization:form.polarization,
  radiationPattern:form.radiationPattern,
  gain:form.gain,
  impedance:form.impedance,
  sourceName:form.sourceName,
  sourceUrl:form.sourceUrl,
  notes:form.notes,
  aliases:String(form.aliases||"").split(",").map(item=>item.trim()).filter(Boolean),
  isSystem:form.isSystem,
  isActive:form.isActive
 });

 const saveRecord=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");
  try{
   const wasEditing=!!editing;
   const url=wasEditing?withBusiness(`/api/references/antennas/${getId(editing)}`,user):withBusiness("/api/references/antennas",user);
   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));
   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Antenna reference updated.":"Antenna reference added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save antenna reference.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the antenna reference “${record.title}”?`))return;
  try{
   await readResponse(await fetch(withBusiness(`/api/references/antennas/${getId(record)}`,user),{method:"DELETE",headers:authHeaders()}));
   setNotice({variant:"success",message:"Antenna reference deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete antenna reference."});
  }
 };

 if(loading)return <div className="antenna-reference-loading"><Spinner animation="border"/><span>Loading antenna references...</span></div>;

 return <main className="antenna-reference-page">
  <section className="antenna-reference-hero">
   <div className="antenna-reference-hero-icon"><Antenna size={34}/></div>
   <div className="antenna-reference-hero-copy"><span className="antenna-reference-kicker">Station Reference</span><h1>Antenna Reference</h1><p>Antenna types, construction styles, operating uses, and station terminology.</p></div>
   <div className="antenna-reference-summary"><strong>{records.length}</strong><span>antenna references stored</span></div>
   <button type="button" className="antenna-reference-add" onClick={openAdd}><Plus size={18}/> Add Antenna Reference</button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="antenna-reference-tools" aria-label="Antenna filters">
   <label className="antenna-reference-search"><Search size={19}/><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search antenna title, band, category, frequency, definition, source, notes, or aliases"/></label>
   <div className="antenna-reference-category-tabs" role="group" aria-label="Antenna category">{categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}</div>
   <nav className="antenna-reference-alphabet" aria-label="Antenna letters"><button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>{availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}</nav>
  </section>

  <section className="antenna-reference-directory">
   <div className="antenna-reference-directory-heading"><BookOpen size={21}/><div><h2>Antenna Directory</h2><p>Showing {filteredRecords.length} of {records.length} antenna references</p></div></div>
   {!filteredRecords.length?<div className="antenna-reference-empty">No antenna references match those filters.</div>:Object.entries(groupedRecords).map(([group,items])=><section className="antenna-reference-group" key={group}>
    <div className="antenna-reference-letter">{group}</div>
    <div className="antenna-reference-list">{items.map(record=><article className="antenna-reference-entry" key={getId(record)}>
     <div className="antenna-reference-entry-head">
      <div>
       <h3>{record.title}</h3>
       {record.summary?<span className="antenna-reference-expansion">{record.summary}</span>:null}
      </div>
      <div className="antenna-reference-entry-actions">
       <span className="antenna-reference-type">{record.category||"Reference"}</span>
       {record.isSystem?<span className="antenna-reference-source">System</span>:<span className="antenna-reference-source antenna-reference-source-custom">Custom</span>}
       {record.isActive?<span className="antenna-reference-status">Active</span>:<span className="antenna-reference-status antenna-reference-status-inactive">Inactive</span>}
       <button type="button" onClick={()=>openEdit(record)}>Edit</button>
       <button type="button" className="danger" onClick={()=>deleteRecord(record)}>Delete</button>
      </div>
     </div>
     {record.definition?<p className="antenna-reference-definition">{record.definition}</p>:null}
     <div className="antenna-reference-details">
      {record.frequencyRange?<span><strong>Frequency:</strong> {record.frequencyRange}</span>:null}
      {record.band?<span><strong>Band:</strong> {record.band}</span>:null}
      {record.polarization?<span><strong>Polarization:</strong> {record.polarization}</span>:null}
      {record.radiationPattern?<span><strong>Pattern:</strong> {record.radiationPattern}</span>:null}
      {record.gain?<span><strong>Gain:</strong> {record.gain}</span>:null}
      {record.impedance?<span><strong>Impedance:</strong> {record.impedance}</span>:null}
     </div>
     {record.example?<p className="antenna-reference-example"><strong>Example:</strong> {record.example}</p>:null}
     {record.aliases?.length?<p className="antenna-reference-aliases"><strong>Also called:</strong> {record.aliases.join(", ")}</p>:null}
     {record.notes?<p className="antenna-reference-example"><strong>Notes:</strong> {record.notes}</p>:null}
     {record.sourceName||record.sourceUrl?<p className="antenna-reference-example"><strong>Source:</strong> {record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceName||record.sourceUrl}</a>:record.sourceName}</p>:null}
    </article>)}</div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="antenna-reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton><Modal.Title>{editing?"Edit Antenna Reference":"Add Antenna Reference"}</Modal.Title></Modal.Header>
    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}
     <div className="antenna-reference-form-grid">
      <Form.Group><Form.Label>Title</Form.Label><Form.Control name="title" value={form.title} onChange={updateForm} required/></Form.Group>
      <Form.Group><Form.Label>Category</Form.Label><Form.Control name="category" value={form.category} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Key</Form.Label><Form.Control name="key" value={form.key} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Summary</Form.Label><Form.Control name="summary" value={form.summary} onChange={updateForm}/></Form.Group>

      <Form.Group><Form.Label>Frequency Range</Form.Label><Form.Control name="frequencyRange" value={form.frequencyRange} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Band</Form.Label><Form.Control name="band" value={form.band} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Polarization</Form.Label><Form.Control name="polarization" value={form.polarization} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Radiation Pattern</Form.Label><Form.Control name="radiationPattern" value={form.radiationPattern} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Gain</Form.Label><Form.Control name="gain" value={form.gain} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Impedance</Form.Label><Form.Control name="impedance" value={form.impedance} onChange={updateForm}/></Form.Group>

      <Form.Group className="full"><Form.Label>Definition</Form.Label><Form.Control as="textarea" rows={3} name="definition" value={form.definition} onChange={updateForm}/></Form.Group>
      <Form.Group className="full"><Form.Label>Example</Form.Label><Form.Control name="example" value={form.example} onChange={updateForm}/></Form.Group>
      <Form.Group className="full"><Form.Label>Aliases</Form.Label><Form.Control name="aliases" value={form.aliases} onChange={updateForm} placeholder="Comma-separated aliases"/></Form.Group>

      <Form.Group><Form.Label>Source Name</Form.Label><Form.Control name="sourceName" value={form.sourceName} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Source URL</Form.Label><Form.Control name="sourceUrl" value={form.sourceUrl} onChange={updateForm}/></Form.Group>
      <Form.Group className="full"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={updateForm}/></Form.Group>

      <Form.Group className="full"><Form.Check type="checkbox" name="isSystem" checked={form.isSystem} onChange={updateForm} label="System Reference"/></Form.Group>
      <Form.Group className="full"><Form.Check type="checkbox" name="isActive" checked={form.isActive} onChange={updateForm} label="Active"/></Form.Group>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowForm(false)} disabled={saving}>Cancel</Button>
     <Button type="submit" disabled={saving}>{saving?editing?"Updating...":"Saving...":editing?"Update Reference":"Save Reference"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 </main>;
}