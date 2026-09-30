// CwReferencePage.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {AudioLines,BookOpen,Plus,Search} from "lucide-react";
import "../../styles/CwReference.css";

const emptyForm={
 title:"",
 key:"",
 code:"",
 category:"",
 summary:"",
 definition:"",
 example:"",
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
 if(Array.isArray(value?.cwReferences))return value.cwReferences;
 if(Array.isArray(value?.cw))return value.cw;
 if(Array.isArray(value?.references))return value.references;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The CW reference request failed");
 return data;
};

export default function CwReferencePage({user}){
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
  setLoading(true);
  setError("");
  try{
   setRecords(toArray(await readResponse(await fetch(withBusiness("/api/references/cw",user),{headers:authHeaders()}))));
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
    record.code,
    record.category,
    record.summary,
    record.definition,
    record.example,
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
   code:record.code||record.summary||"",
   category:record.category||"",
   summary:record.summary||record.code||"",
   definition:record.definition||"",
   example:record.example||"",
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
  setForm(current=>{
   const updated={...current,[name]:type==="checkbox"?checked:value};
   if(name==="code")updated.summary=value;
   return updated;
  });
 };

 const buildPayload=()=>({
  business:getBusinessId(user),
  title:form.title,
  key:form.key,
  code:form.code,
  category:form.category,
  summary:form.summary||form.code,
  definition:form.definition,
  example:form.example,
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
   const url=wasEditing?withBusiness(`/api/references/cw/${getId(editing)}`,user):withBusiness("/api/references/cw",user);
   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));
   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"CW reference updated.":"CW reference added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save CW reference.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the CW reference “${record.title}”?`))return;
  try{
   await readResponse(await fetch(withBusiness(`/api/references/cw/${getId(record)}`,user),{method:"DELETE",headers:authHeaders()}));
   setNotice({variant:"success",message:"CW reference deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete CW reference."});
  }
 };

 if(loading)return <div className="cw-reference-loading"><Spinner animation="border"/><span>Loading CW references...</span></div>;

 return <main className="cw-reference-page">
  <section className="cw-reference-hero">
   <div className="cw-reference-hero-icon"><AudioLines size={34}/></div>
   <div className="cw-reference-hero-copy">
    <span className="cw-reference-kicker">Station Reference</span>
    <h1>CW & Morse Reference</h1>
    <p>International Morse characters, prosigns, Q-codes, and CW operating abbreviations.</p>
   </div>
   <div className="cw-reference-summary"><strong>{records.length}</strong><span>CW references stored</span></div>
   <button type="button" className="cw-reference-add" onClick={openAdd}><Plus size={18}/> Add CW Reference</button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="cw-reference-tools" aria-label="CW filters">
   <label className="cw-reference-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search CW title, category, Morse code, definition, source, notes, or aliases"/>
   </label>
   <div className="cw-reference-category-tabs" role="group" aria-label="CW category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}
   </div>
   <nav className="cw-reference-alphabet" aria-label="CW letters">
    <button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>
    {availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}
   </nav>
  </section>

  <section className="cw-reference-directory">
   <div className="cw-reference-directory-heading">
    <BookOpen size={21}/>
    <div><h2>CW & Morse Directory</h2><p>Showing {filteredRecords.length} of {records.length} CW references</p></div>
   </div>
   {!filteredRecords.length?<div className="cw-reference-empty">No CW references match those filters.</div>:Object.entries(groupedRecords).map(([group,items])=><section className="cw-reference-group" key={group}>
    <div className="cw-reference-letter">{group}</div>
    <div className="cw-reference-list">
     {items.map(record=><article className="cw-reference-entry" key={getId(record)}>
      <div className="cw-reference-entry-head">
       <div>
        <h3>{record.title}</h3>
        {record.code?<span className="cw-reference-expansion">{record.code}</span>:record.summary?<span className="cw-reference-expansion">{record.summary}</span>:null}
       </div>
       <div className="cw-reference-entry-actions">
        <span className="cw-reference-type">{record.category||"Reference"}</span>
        {record.isSystem?<span className="cw-reference-source">System</span>:<span className="cw-reference-source cw-reference-source-custom">Custom</span>}
        {record.isActive?<span className="cw-reference-status">Active</span>:<span className="cw-reference-status cw-reference-status-inactive">Inactive</span>}
        <button type="button" onClick={()=>openEdit(record)}>Edit</button>
        <button type="button" className="danger" onClick={()=>deleteRecord(record)}>Delete</button>
       </div>
      </div>
      {record.definition?<p className="cw-reference-definition">{record.definition}</p>:null}
      {record.example?<p className="cw-reference-example"><strong>Example:</strong> {record.example}</p>:null}
      {record.aliases?.length?<p className="cw-reference-aliases"><strong>Also called:</strong> {record.aliases.join(", ")}</p>:null}
      {record.notes?<p className="cw-reference-example"><strong>Notes:</strong> {record.notes}</p>:null}
      {record.sourceName||record.sourceUrl?<p className="cw-reference-example"><strong>Source:</strong> {record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceName||record.sourceUrl}</a>:record.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="cw-reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton><Modal.Title>{editing?"Edit CW Reference":"Add CW Reference"}</Modal.Title></Modal.Header>
    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}
     <div className="cw-reference-form-grid">
      <Form.Group><Form.Label>Title</Form.Label><Form.Control name="title" value={form.title} onChange={updateForm} required/></Form.Group>
      <Form.Group><Form.Label>Category</Form.Label><Form.Control name="category" value={form.category} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Key</Form.Label><Form.Control name="key" value={form.key} onChange={updateForm}/></Form.Group>
      <Form.Group><Form.Label>Morse Code</Form.Label><Form.Control name="code" value={form.code} onChange={updateForm}/></Form.Group>

      <Form.Group className="full"><Form.Label>Summary</Form.Label><Form.Control name="summary" value={form.summary} onChange={updateForm}/></Form.Group>
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