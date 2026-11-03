import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {ExternalLink,Library,Plus,Search} from "lucide-react";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/ReferenceOrganizations.css";

const emptyForm={
 name:"",
 key:"",
 role:"",
 url:"",
 category:"",
 jurisdiction:"",
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

const resolveBusiness=async user=>{
 const fromUser=getBusinessId(user);
 if(fromUser)return fromUser;
 const business=await loadCurrentBusiness();
 return getId(getObjectId(business)||business);
};

const withBusiness=(url,business)=>{
 if(!business)return url;
 return `${url}${url.includes("?")?"&":"?"}business=${encodeURIComponent(business)}`;
};

const toArray=data=>{
 const value=data?.data||data;
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.referenceOrganizations))return value.referenceOrganizations;
 if(Array.isArray(value?.organizations))return value.organizations;
 if(Array.isArray(value?.sources))return value.sources;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The reference organizations request failed");
 return data;
};

export default function ReferenceOrganizationsPage({user}){
 const [records,setRecords]=useState([]);
 const [business,setBusiness]=useState("");
 const [search,setSearch]=useState("");
 const [category,setCategory]=useState("all");
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
   const resolvedBusiness=await resolveBusiness(user);
   if(!resolvedBusiness)throw new Error("Business is required.");
   setBusiness(resolvedBusiness);

   const data=await readResponse(await fetch(withBusiness("/api/references/organizations",resolvedBusiness),{headers:authHeaders()}));
   setRecords(toArray(data));
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

 const filteredRecords=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return records.filter(record=>{
   const categoryMatches=category==="all"||record.category===category;
   const searchMatches=!query||[
    record.name,
    record.key,
    record.role,
    record.url,
    record.category,
    record.jurisdiction,
    record.notes
   ].some(value=>String(value||"").toLowerCase().includes(query));

   return categoryMatches&&searchMatches;
  }).sort((left,right)=>String(left.name||"").localeCompare(String(right.name||""),undefined,{numeric:true,sensitivity:"base"}));
 },[records,search,category]);

 const openAdd=()=>{
  setEditing(null);
  setForm(emptyForm);
  setShowForm(true);
  setError("");
 };

 const openEdit=record=>{
  setEditing(record);
  setForm({
   name:record.name||"",
   key:record.key||"",
   role:record.role||"",
   url:record.url||"",
   category:record.category||"",
   jurisdiction:record.jurisdiction||"",
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
  business,
  name:form.name,
  key:form.key,
  role:form.role,
  url:form.url,
  category:form.category,
  jurisdiction:form.jurisdiction,
  notes:form.notes,
  isSystem:form.isSystem,
  isActive:form.isActive
 });

 const saveRecord=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const resolvedBusiness=business||await resolveBusiness(user);
   if(!resolvedBusiness)throw new Error("Business is required.");

   const wasEditing=!!editing;
   const url=wasEditing?withBusiness(`/api/references/organizations/${getId(editing)}`,resolvedBusiness):withBusiness("/api/references/organizations",resolvedBusiness);

   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify({...buildPayload(),business:resolvedBusiness})
   }));

   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Reference organization updated.":"Reference organization added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save reference organization.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the reference organization “${record.name}”?`))return;

  try{
   const resolvedBusiness=business||await resolveBusiness(user);
   if(!resolvedBusiness)throw new Error("Business is required.");

   await readResponse(await fetch(withBusiness(`/api/references/organizations/${getId(record)}`,resolvedBusiness),{
    method:"DELETE",
    headers:authHeaders()
   }));

   setNotice({variant:"success",message:"Reference organization deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete reference organization."});
  }
 };

 if(loading)return <div className="reference-loading"><Spinner animation="border" size="sm"/> Loading organizations...</div>;

 return <main className="reference-page">
  <header className="reference-hero">
   <div className="reference-hero-icon"><Library size={34}/></div>

   <div>
    <span className="reference-kicker">Sources and Authorities</span>
    <h1>Reference Organizations</h1>
    <p>Training organizations, regulators, standards bodies, and operating references used throughout this application.</p>
   </div>

   <div className="reference-count">
    <strong>{records.length}</strong>
    <span>organizations</span>
   </div>

   <button type="button" onClick={openAdd}>
    <Plus size={18}/> Add Organization
   </button>
  </header>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="reference-toolbar" aria-label="Reference organization filters">
   <label>
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search organization, role, category, jurisdiction, URL, or notes"/>
   </label>

   <div className="reference-filter-buttons" role="group" aria-label="Organization category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}
   </div>
  </section>

  <section className="reference-directory">
   <h2>Organizations & Sources</h2>

   {!filteredRecords.length?<div className="reference-empty">No reference organizations match those filters.</div>:<div className="reference-card-grid">
    {filteredRecords.map(source=><article className="reference-card" key={getId(source)}>
     <a className="reference-card-link" href={source.url||"#"} target={source.url?"_blank":undefined} rel={source.url?"noreferrer":undefined}>
      <strong>{source.name}{source.url?<ExternalLink size={14}/>:null}</strong>
      {source.role?<span>{source.role}</span>:null}
     </a>

     <div className="reference-card-details">
      {source.key?<span><strong>Key:</strong> {source.key}</span>:null}
      {source.category?<span><strong>Category:</strong> {source.category}</span>:null}
      {source.jurisdiction?<span><strong>Jurisdiction:</strong> {source.jurisdiction}</span>:null}
      {source.isActive?<span><strong>Status:</strong> Active</span>:<span><strong>Status:</strong> Inactive</span>}
     </div>

     {source.notes?<p><strong>Notes:</strong> {source.notes}</p>:null}

     <div className="reference-entry-actions">
      {source.isSystem?<span>System</span>:<span className="custom">Custom</span>}
      <button type="button" onClick={()=>openEdit(source)}>Edit</button>
      {!source.isSystem?<button type="button" className="danger" onClick={()=>deleteRecord(source)}>Delete</button>:null}
     </div>
    </article>)}
   </div>}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Reference Organization":"Add Reference Organization"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <div className="reference-form-grid">
      <Form.Group>
       <Form.Label>Name</Form.Label>
       <Form.Control name="name" value={form.name} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Key</Form.Label>
       <Form.Control name="key" value={form.key} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Role</Form.Label>
       <Form.Control name="role" value={form.role} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>URL</Form.Label>
       <Form.Control name="url" value={form.url} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Category</Form.Label>
       <Form.Control name="category" value={form.category} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Jurisdiction</Form.Label>
       <Form.Control name="jurisdiction" value={form.jurisdiction} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={updateForm}/>
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
     <Button type="submit" disabled={saving}>{saving?editing?"Updating...":"Saving...":editing?"Update Organization":"Save Organization"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 </main>;
}