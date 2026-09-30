import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {BookOpen,Plus,RadioTower,Search} from "lucide-react";
import "../../styles/RadioTermsReference.css";

const emptyForm={
 term:"",
 key:"",
 category:"both",
 abbreviation:"",
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
 if(Array.isArray(value?.radioTerms))return value.radioTerms;
 if(Array.isArray(value?.terms))return value.terms;
 if(Array.isArray(value?.references))return value.references;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The radio terms reference request failed");
 return data;
};

export default function RadioTermsReferencePage({user}){
 const [terms,setTerms]=useState([]);
 const [search,setSearch]=useState("");
 const [category,setCategory]=useState("all");
 const [letter,setLetter]=useState("all");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState(emptyForm);

 const loadTerms=useCallback(async()=>{
  setLoading(true);
  setError("");
  try{
   setTerms(toArray(await readResponse(await fetch(withBusiness("/api/references/radio-terms",user),{headers:authHeaders()}))));
  }catch(loadError){
   setError(loadError.message);
   setTerms([]);
  }finally{
   setLoading(false);
  }
 },[user]);

 useEffect(()=>{loadTerms();},[loadTerms]);

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

 const categories=useMemo(()=>["all",...new Set(terms.map(term=>term.category).filter(Boolean))],[terms]);

 const availableLetters=useMemo(()=>[...new Set(terms.map(term=>String(term.term||"").charAt(0).toUpperCase()).filter(Boolean))].sort(),[terms]);

 const filteredTerms=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return terms.filter(term=>{
   const categoryMatches=category==="all"||term.category===category||term.category==="both";
   const letterMatches=letter==="all"||String(term.term||"").toUpperCase().startsWith(letter);
   const searchMatches=!query||[
    term.term,
    term.key,
    term.category,
    term.abbreviation,
    term.definition,
    term.example,
    term.sourceName,
    term.sourceUrl,
    term.notes,
    ...(term.aliases||[])
   ].some(value=>String(value||"").toLowerCase().includes(query));

   return categoryMatches&&letterMatches&&searchMatches;
  }).sort((left,right)=>String(left.term||"").localeCompare(String(right.term||""),undefined,{numeric:true,sensitivity:"base"}));
 },[terms,search,category,letter]);

 const groupedTerms=useMemo(()=>filteredTerms.reduce((groups,term)=>{
  const key=String(term.term||"#").charAt(0).toUpperCase();
  (groups[key]??=[]).push(term);
  return groups;
 },{}),[filteredTerms]);

 const openAdd=()=>{
  setEditing(null);
  setForm(emptyForm);
  setShowForm(true);
  setError("");
 };

 const openEdit=term=>{
  setEditing(term);
  setForm({
   term:term.term||"",
   key:term.key||"",
   category:term.category||"both",
   abbreviation:term.abbreviation||"",
   definition:term.definition||"",
   example:term.example||"",
   sourceName:term.sourceName||"",
   sourceUrl:term.sourceUrl||"",
   notes:term.notes||"",
   aliases:(term.aliases||[]).join(", "),
   isSystem:term.isSystem===true,
   isActive:term.isActive!==false
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
  term:form.term,
  key:form.key,
  category:form.category,
  abbreviation:form.abbreviation,
  definition:form.definition,
  example:form.example,
  sourceName:form.sourceName,
  sourceUrl:form.sourceUrl,
  notes:form.notes,
  aliases:String(form.aliases||"").split(",").map(item=>item.trim()).filter(Boolean),
  isSystem:form.isSystem,
  isActive:form.isActive
 });

 const saveTerm=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const wasEditing=!!editing;
   const url=wasEditing?withBusiness(`/api/references/radio-terms/${getId(editing)}`,user):withBusiness("/api/references/radio-terms",user);

   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));

   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Radio term updated.":"Radio term added."});
   await loadTerms();
  }catch(saveError){
   setError(saveError.message||"Failed to save radio term.");
  }finally{
   setSaving(false);
  }
 };

 const deleteTerm=async term=>{
  if(!window.confirm(`Delete the term “${term.term}”?`))return;

  try{
   await readResponse(await fetch(withBusiness(`/api/references/radio-terms/${getId(term)}`,user),{
    method:"DELETE",
    headers:authHeaders()
   }));

   setNotice({variant:"success",message:"Radio term deleted."});
   await loadTerms();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete radio term."});
  }
 };

 if(loading)return <div className="radio-terms-loading"><Spinner animation="border"/><span>Loading station reference...</span></div>;

 return <main className="radio-terms-page">
  <section className="radio-terms-hero">
   <div className="radio-terms-hero-icon"><RadioTower size={34}/></div>

   <div className="radio-terms-hero-copy">
    <span className="radio-terms-kicker">Operator Reference</span>
    <h1>Ham & CB Radio Glossary</h1>
    <p>Learn the language used on the air, around the station, and in your QSO logbook.</p>
   </div>

   <div className="radio-terms-summary">
    <strong>{terms.length}</strong>
    <span>reference terms stored for this business</span>
   </div>

   <button type="button" className="radio-terms-add" onClick={openAdd}><Plus size={18}/> Add Radio Term</button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="radio-terms-tools" aria-label="Glossary filters">
   <label className="radio-terms-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search term, key, abbreviation, definition, source, notes, or aliases"/>
   </label>

   <div className="radio-terms-category-tabs" role="group" aria-label="Radio category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value==="ham"?"Ham Radio":value==="cb"?"CB Radio":value==="both"?"Shared":value}</button>)}
   </div>

   <nav className="radio-terms-alphabet" aria-label="Glossary letters">
    <button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>
    {availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}
   </nav>
  </section>

  <section className="radio-terms-directory">
   <div className="radio-terms-directory-heading">
    <BookOpen size={21}/>
    <div>
     <h2>Radio Terms Directory</h2>
     <p>Showing {filteredTerms.length} of {terms.length} terms</p>
    </div>
   </div>

   {!filteredTerms.length?<div className="radio-terms-empty">No radio terms match those filters.</div>:Object.entries(groupedTerms).map(([group,items])=><section className="radio-term-group" key={group}>
    <div className="radio-term-letter">{group}</div>

    <div className="radio-term-list">
     {items.map(term=><article className="radio-term-entry" key={getId(term)}>
      <div className="radio-term-entry-head">
       <div>
        <h3>{term.term}</h3>
        {term.abbreviation?<span className="radio-term-expansion">{term.abbreviation}</span>:null}
       </div>

       <div className="radio-term-entry-actions">
        <span className={`radio-term-type radio-term-type-${String(term.category||"both").toLowerCase().replaceAll(" ","-")}`}>{term.category==="ham"?"Ham":term.category==="cb"?"CB":term.category==="both"?"Ham + CB":term.category||"Reference"}</span>
        {term.isSystem?<span className="radio-term-source">Station Reference</span>:<span className="radio-term-source radio-term-source-custom">Custom</span>}
        {term.isActive?<span className="radio-term-status">Active</span>:<span className="radio-term-status radio-term-status-inactive">Inactive</span>}
        <button type="button" onClick={()=>openEdit(term)}>Edit</button>
        {!term.isSystem?<button type="button" className="danger" onClick={()=>deleteTerm(term)}>Delete</button>:null}
       </div>
      </div>

      {term.definition?<p className="radio-term-definition">{term.definition}</p>:null}
      {term.example?<p className="radio-term-example"><strong>On-air example:</strong> {term.example}</p>:null}
      {term.aliases?.length?<p className="radio-term-aliases"><strong>Also called:</strong> {term.aliases.join(", ")}</p>:null}
      {term.notes?<p className="radio-term-example"><strong>Notes:</strong> {term.notes}</p>:null}
      {term.sourceName||term.sourceUrl?<p className="radio-term-example"><strong>Source:</strong> {term.sourceUrl?<a href={term.sourceUrl} target="_blank" rel="noreferrer">{term.sourceName||term.sourceUrl}</a>:term.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="radio-term-modal">
   <Form onSubmit={saveTerm}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Radio Term":"Add Radio Term"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <div className="radio-term-form-grid">
      <Form.Group>
       <Form.Label>Term</Form.Label>
       <Form.Control name="term" value={form.term} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Category</Form.Label>
       <Form.Select name="category" value={form.category} onChange={updateForm}>
        <option value="both">Ham & CB</option>
        <option value="ham">Ham Radio</option>
        <option value="cb">CB Radio</option>
       </Form.Select>
      </Form.Group>

      <Form.Group>
       <Form.Label>Key</Form.Label>
       <Form.Control name="key" value={form.key} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Full name / abbreviation expansion</Form.Label>
       <Form.Control name="abbreviation" value={form.abbreviation} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Definition</Form.Label>
       <Form.Control as="textarea" rows={3} name="definition" value={form.definition} onChange={updateForm} required/>
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
       <Form.Control name="aliases" value={form.aliases} onChange={updateForm} placeholder="Comma-separated alternate names"/>
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
     <Button type="submit" disabled={saving}>{saving?editing?"Updating...":"Saving...":editing?"Update Term":"Save Term"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 </main>;
}