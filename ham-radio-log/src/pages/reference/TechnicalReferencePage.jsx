// TechnicalReferencePage.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {BookOpen,Plus,Search,Wrench} from "lucide-react";
import "../../styles/TechnicalReference.css";

const emptyForm={
 title:"",
 key:"",
 category:"",
 summary:"",
 definition:"",
 formula:"",
 example:"",
 unit:"",
 relatedBand:"",
 relatedMode:"",
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
 if(Array.isArray(value?.technicalReferences))return value.technicalReferences;
 if(Array.isArray(value?.technical))return value.technical;
 if(Array.isArray(value?.references))return value.references;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The technical reference request failed");
 return data;
};

export default function TechnicalReferencePage({user}){
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
   setRecords(toArray(await readResponse(await fetch(withBusiness("/api/references/technical",user),{headers:authHeaders()}))));
  }catch(loadError){
   setError(loadError.message);
   setRecords([]);
  }finally{
   setLoading(false);
  }
 },[user]);

 useEffect(()=>{loadRecords();},[loadRecords]);

 useEffect(()=>{
  if(!notice)return undefined;
  const timer=window.setTimeout(()=>setNotice(null),5000);
  return()=>window.clearTimeout(timer);
 },[notice]);

 useEffect(()=>{
  if(!error)return undefined;
  const timer=window.setTimeout(()=>setError(""),5000);
  return()=>window.clearTimeout(timer);
 },[error]);

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
    record.formula,
    record.example,
    record.unit,
    record.relatedBand,
    record.relatedMode,
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
   formula:record.formula||"",
   example:record.example||"",
   unit:record.unit||"",
   relatedBand:record.relatedBand||"",
   relatedMode:record.relatedMode||"",
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
  formula:form.formula,
  example:form.example,
  unit:form.unit,
  relatedBand:form.relatedBand,
  relatedMode:form.relatedMode,
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
   const url=wasEditing?withBusiness(`/api/references/technical/${getId(editing)}`,user):withBusiness("/api/references/technical",user);

   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));

   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Technical reference updated.":"Technical reference added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save technical reference.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the technical reference “${record.title}”?`))return;

  try{
   await readResponse(await fetch(withBusiness(`/api/references/technical/${getId(record)}`,user),{
    method:"DELETE",
    headers:authHeaders()
   }));

   setNotice({variant:"success",message:"Technical reference deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete technical reference."});
  }
 };

 if(loading)return <div className="technical-reference-loading"><Spinner animation="border"/><span>Loading technical references...</span></div>;

 return <main className="technical-reference-page">
  <section className="technical-reference-hero">
   <div className="technical-reference-hero-icon"><Wrench size={34}/></div>

   <div className="technical-reference-hero-copy">
    <span className="technical-reference-kicker">Station Reference</span>
    <h1>Technical Reference</h1>
    <p>Radio formulas, electrical principles, antenna calculations, measurements, and units.</p>
   </div>

   <div className="technical-reference-summary">
    <strong>{records.length}</strong>
    <span>technical references stored</span>
   </div>

   <button type="button" className="technical-reference-add" onClick={openAdd}>
    <Plus size={18}/> Add Technical Reference
   </button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="technical-reference-tools" aria-label="Technical filters">
   <label className="technical-reference-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search technical title, formula, unit, band, mode, definition, source, notes, or aliases"/>
   </label>

   <div className="technical-reference-category-tabs" role="group" aria-label="Technical category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}
   </div>

   <nav className="technical-reference-alphabet" aria-label="Technical letters">
    <button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>
    {availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}
   </nav>
  </section>

  <section className="technical-reference-directory">
   <div className="technical-reference-directory-heading">
    <BookOpen size={21}/>
    <div>
     <h2>Technical Directory</h2>
     <p>Showing {filteredRecords.length} of {records.length} technical references</p>
    </div>
   </div>

   {!filteredRecords.length?<div className="technical-reference-empty">No technical references match those filters.</div>:Object.entries(groupedRecords).map(([group,items])=><section className="technical-reference-group" key={group}>
    <div className="technical-reference-letter">{group}</div>

    <div className="technical-reference-list">
     {items.map(record=><article className="technical-reference-entry" key={getId(record)}>
      <div className="technical-reference-entry-head">
       <div>
        <h3>{record.title}</h3>
        {record.summary?<span className="technical-reference-expansion">{record.summary}</span>:null}
       </div>

       <div className="technical-reference-entry-actions">
        <span className="technical-reference-type">{record.category||"Reference"}</span>
        {record.isSystem?<span className="technical-reference-source">System</span>:<span className="technical-reference-source technical-reference-source-custom">Custom</span>}
        {record.isActive?<span className="technical-reference-status">Active</span>:<span className="technical-reference-status technical-reference-status-inactive">Inactive</span>}
        <button type="button" onClick={()=>openEdit(record)}>Edit</button>
        {!record.isSystem?<button type="button" className="danger" onClick={()=>deleteRecord(record)}>Delete</button>:null}
       </div>
      </div>

      {record.definition?<p className="technical-reference-definition">{record.definition}</p>:null}

      <div className="technical-reference-details">
       {record.formula?<span><strong>Formula:</strong> {record.formula}</span>:null}
       {record.unit?<span><strong>Unit:</strong> {record.unit}</span>:null}
       {record.relatedBand?<span><strong>Band:</strong> {record.relatedBand}</span>:null}
       {record.relatedMode?<span><strong>Mode:</strong> {record.relatedMode}</span>:null}
      </div>

      {record.example?<p className="technical-reference-example"><strong>Example:</strong> {record.example}</p>:null}
      {record.aliases?.length?<p className="technical-reference-aliases"><strong>Also called:</strong> {record.aliases.join(", ")}</p>:null}
      {record.notes?<p className="technical-reference-example"><strong>Notes:</strong> {record.notes}</p>:null}
      {record.sourceName||record.sourceUrl?<p className="technical-reference-example"><strong>Source:</strong> {record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceName||record.sourceUrl}</a>:record.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="technical-reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Technical Reference":"Add Technical Reference"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <div className="technical-reference-form-grid">
      <Form.Group>
       <Form.Label>Title</Form.Label>
       <Form.Control name="title" value={form.title} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Category</Form.Label>
       <Form.Control name="category" value={form.category} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Key</Form.Label>
       <Form.Control name="key" value={form.key} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Summary</Form.Label>
       <Form.Control name="summary" value={form.summary} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Formula</Form.Label>
       <Form.Control name="formula" value={form.formula} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Unit</Form.Label>
       <Form.Control name="unit" value={form.unit} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Related Band</Form.Label>
       <Form.Control name="relatedBand" value={form.relatedBand} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Related Mode</Form.Label>
       <Form.Control name="relatedMode" value={form.relatedMode} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Definition</Form.Label>
       <Form.Control as="textarea" rows={3} name="definition" value={form.definition} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Example</Form.Label>
       <Form.Control name="example" value={form.example} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Source Name</Form.Label>
       <Form.Control name="sourceName" value={form.sourceName} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Source URL</Form.Label>
       <Form.Control name="sourceUrl" value={form.sourceUrl} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Aliases</Form.Label>
       <Form.Control name="aliases" value={form.aliases} onChange={updateForm} placeholder="Comma-separated aliases"/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Check type="checkbox" name="isSystem" checked={form.isSystem} onChange={updateForm} label="System Reference"/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Check type="checkbox" name="isActive" checked={form.isActive} onChange={updateForm} label="Active"/>
      </Form.Group>
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