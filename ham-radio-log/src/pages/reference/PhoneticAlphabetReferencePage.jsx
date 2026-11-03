// PhoneticAlphabetReferencePage.jsx
import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {BookOpen,Languages,Plus,Search} from "lucide-react";
import "../../styles/PhoneticAlphabetReference.css";

const emptyForm={
 symbol:"",
 word:"",
 key:"",
 category:"letter",
 pronunciation:"",
 definition:"",
 example:"",
 sourceName:"",
 sourceUrl:"",
 notes:"",
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
 if(Array.isArray(value?.phoneticAlphabetReferences))return value.phoneticAlphabetReferences;
 if(Array.isArray(value?.phoneticReferences))return value.phoneticReferences;
 if(Array.isArray(value?.phoneticAlphabet))return value.phoneticAlphabet;
 if(Array.isArray(value?.references))return value.references;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The phonetic alphabet reference request failed");
 return data;
};

export default function PhoneticAlphabetReferencePage({user}){
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
   setRecords(toArray(await readResponse(await fetch(withBusiness("/api/references/phonetic-alphabet",user),{headers:authHeaders()}))));
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

 const availableLetters=useMemo(()=>[...new Set(records.map(record=>String(record.symbol||record.word||"").charAt(0).toUpperCase()).filter(Boolean))].sort(),[records]);

 const filteredRecords=useMemo(()=>{
  const query=search.trim().toLowerCase();
  return records.filter(record=>{
   const value=String(record.symbol||record.word||"");
   const categoryMatches=category==="all"||record.category===category;
   const letterMatches=letter==="all"||value.toUpperCase().startsWith(letter);
   const searchMatches=!query||[
    record.symbol,
    record.word,
    record.key,
    record.category,
    record.pronunciation,
    record.definition,
    record.example,
    record.sourceName,
    record.sourceUrl,
    record.notes
   ].some(value=>String(value||"").toLowerCase().includes(query));
   return categoryMatches&&letterMatches&&searchMatches;
  }).sort((left,right)=>String(left.symbol||left.word||"").localeCompare(String(right.symbol||right.word||""),undefined,{numeric:true,sensitivity:"base"}));
 },[records,search,category,letter]);

 const groupedRecords=useMemo(()=>filteredRecords.reduce((groups,record)=>{
  const key=String(record.symbol||record.word||"#").charAt(0).toUpperCase();
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
   symbol:record.symbol||"",
   word:record.word||"",
   key:record.key||"",
   category:record.category||"letter",
   pronunciation:record.pronunciation||"",
   definition:record.definition||"",
   example:record.example||"",
   sourceName:record.sourceName||"",
   sourceUrl:record.sourceUrl||"",
   notes:record.notes||"",
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
  symbol:form.symbol,
  word:form.word,
  key:form.key,
  category:form.category,
  pronunciation:form.pronunciation,
  definition:form.definition,
  example:form.example,
  sourceName:form.sourceName,
  sourceUrl:form.sourceUrl,
  notes:form.notes,
  isSystem:form.isSystem,
  isActive:form.isActive
 });

 const saveRecord=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");
  try{
   const wasEditing=!!editing;
   const url=wasEditing?withBusiness(`/api/references/phonetic-alphabet/${getId(editing)}`,user):withBusiness("/api/references/phonetic-alphabet",user);
   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));
   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Phonetic alphabet reference updated.":"Phonetic alphabet reference added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save phonetic alphabet reference.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the phonetic alphabet reference “${record.symbol||record.word}”?`))return;
  try{
   await readResponse(await fetch(withBusiness(`/api/references/phonetic-alphabet/${getId(record)}`,user),{method:"DELETE",headers:authHeaders()}));
   setNotice({variant:"success",message:"Phonetic alphabet reference deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete phonetic alphabet reference."});
  }
 };

 if(loading)return <div className="phonetic-alphabet-reference-loading"><Spinner animation="border"/><span>Loading phonetic alphabet references...</span></div>;

 return <main className="phonetic-alphabet-reference-page">
  <section className="phonetic-alphabet-reference-hero">
   <div className="phonetic-alphabet-reference-hero-icon"><Languages size={34}/></div>
   <div className="phonetic-alphabet-reference-hero-copy">
    <span className="phonetic-alphabet-reference-kicker">Station Reference</span>
    <h1>Phonetic Alphabet Reference</h1>
    <p>ITU/NATO phonetic words, symbols, and pronunciations for clear radio communication.</p>
   </div>
   <div className="phonetic-alphabet-reference-summary"><strong>{records.length}</strong><span>phonetic references stored</span></div>
   <button type="button" className="phonetic-alphabet-reference-add" onClick={openAdd}><Plus size={18}/> Add Phonetic Reference</button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="phonetic-alphabet-reference-tools" aria-label="Phonetic alphabet filters">
   <label className="phonetic-alphabet-reference-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search symbol, word, key, pronunciation, definition, source, or notes"/>
   </label>
   <div className="phonetic-alphabet-reference-category-tabs" role="group" aria-label="Phonetic alphabet category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}
   </div>
   <nav className="phonetic-alphabet-reference-alphabet" aria-label="Phonetic alphabet letters">
    <button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>
    {availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}
   </nav>
  </section>

  <section className="phonetic-alphabet-reference-directory">
   <div className="phonetic-alphabet-reference-directory-heading">
    <BookOpen size={21}/>
    <div>
     <h2>Phonetic Alphabet Directory</h2>
     <p>Showing {filteredRecords.length} of {records.length} phonetic references</p>
    </div>
   </div>

   {!filteredRecords.length?<div className="phonetic-alphabet-reference-empty">No phonetic alphabet references match those filters.</div>:Object.entries(groupedRecords).map(([group,items])=><section className="phonetic-alphabet-reference-group" key={group}>
    <div className="phonetic-alphabet-reference-letter">{group}</div>
    <div className="phonetic-alphabet-reference-list">
     {items.map(record=><article className="phonetic-alphabet-reference-entry" key={getId(record)}>
      <div className="phonetic-alphabet-reference-entry-head">
       <div>
        <h3>{record.symbol}</h3>
        {record.word?<span className="phonetic-alphabet-reference-expansion">{record.word}</span>:null}
       </div>
       <div className="phonetic-alphabet-reference-entry-actions">
        <span className="phonetic-alphabet-reference-type">{record.category||"Reference"}</span>
        {record.isSystem?<span className="phonetic-alphabet-reference-source">System</span>:<span className="phonetic-alphabet-reference-source phonetic-alphabet-reference-source-custom">Custom</span>}
        {record.isActive?<span className="phonetic-alphabet-reference-status">Active</span>:<span className="phonetic-alphabet-reference-status phonetic-alphabet-reference-status-inactive">Inactive</span>}
        <button type="button" onClick={()=>openEdit(record)}>Edit</button>
        <button type="button" className="danger" onClick={()=>deleteRecord(record)}>Delete</button>
       </div>
      </div>
      {record.pronunciation?<p className="phonetic-alphabet-reference-example"><strong>Pronunciation:</strong> {record.pronunciation}</p>:null}
      {record.definition?<p className="phonetic-alphabet-reference-definition">{record.definition}</p>:null}
      {record.example?<p className="phonetic-alphabet-reference-example"><strong>Example:</strong> {record.example}</p>:null}
      {record.notes?<p className="phonetic-alphabet-reference-example"><strong>Notes:</strong> {record.notes}</p>:null}
      {record.sourceName||record.sourceUrl?<p className="phonetic-alphabet-reference-example"><strong>Source:</strong> {record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceName||record.sourceUrl}</a>:record.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="phonetic-alphabet-reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Phonetic Reference":"Add Phonetic Reference"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}
     <div className="phonetic-alphabet-reference-form-grid">
      <Form.Group>
       <Form.Label>Symbol</Form.Label>
       <Form.Control name="symbol" value={form.symbol} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Word</Form.Label>
       <Form.Control name="word" value={form.word} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Key</Form.Label>
       <Form.Control name="key" value={form.key} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Category</Form.Label>
       <Form.Control name="category" value={form.category} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Pronunciation</Form.Label>
       <Form.Control name="pronunciation" value={form.pronunciation} onChange={updateForm}/>
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