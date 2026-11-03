import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {BadgeAlert,BookOpen,Plus,Search} from "lucide-react";
import "../../styles/RadioTermsReference.css";

const emptyForm={
 code:"",
 title:"",
 meaning:"",
 category:"General",
 city:"",
 state:"",
 agency:"",
 jurisdiction:"",
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
const getRoleName=value=>typeof value==="string"?value.trim().toLowerCase():String(value?.name||value?.title||value?.label||"").trim().toLowerCase();

const getBusinessId=user=>{
 return getId(
  user?.business?._id||
  user?.business?.id||
  user?.business||
  user?.business_id||
  user?.businessId||
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
 const business_id=getBusinessId(user);
 if(!business_id)return url;
 return `${url}${url.includes("?")?"&":"?"}business_id=${encodeURIComponent(business_id)}`;
};

const toArray=data=>{
 const value=data?.data||data;
 if(Array.isArray(value))return value;
 if(Array.isArray(value?.tenCodes))return value.tenCodes;
 if(Array.isArray(value?.codes))return value.codes;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The ten codes request failed.");
 return data;
};

const uniqueSorted=values=>[...new Set(values.map(value=>String(value||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:"base"}));

export default function NycPoliceTenCodesPage({user}){
 const [codes,setCodes]=useState([]);
 const [permissions,setPermissions]=useState({create:false,update:false,delete:false,admin:false});
 const [search,setSearch]=useState("");
 const [selectedState,setSelectedState]=useState("NY");
 const [selectedCity,setSelectedCity]=useState("New York City");
 const [selectedAgency,setSelectedAgency]=useState("NYPD");
 const [category,setCategory]=useState("all");
 const [letter,setLetter]=useState("all");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState(emptyForm);

 const roles=[user?.role,...(user?.roleAssignments||[]).map(item=>item.role),...(user?.assignments||[]).map(item=>item.role)].filter(Boolean);
 const privileged=roles.map(getRoleName).some(name=>["owner","business owner","app owner","super admin","admin","administrator"].includes(name));
 const canCreate=privileged||permissions.admin||permissions.create;
 const canUpdate=privileged||permissions.admin||permissions.update;
 const canDelete=privileged||permissions.admin||permissions.delete;

 const loadCodes=useCallback(async()=>{
  setLoading(true);
  setError("");

  try{
   const business_id=getBusinessId(user);
   if(!business_id)throw new Error("Business is required.");

   const data=await readResponse(await fetch(withBusiness("/api/references/ten-codes",user),{headers:authHeaders()}));
   setCodes(toArray(data));

   if(!privileged&&getId(user)){
    const permissionResponse=await fetch(`/api/users/effective-permissions?user=${encodeURIComponent(getId(user))}&business_id=${encodeURIComponent(business_id)}`,{headers:authHeaders()});
    const permissionData=await permissionResponse.json().catch(()=>({}));

    if(permissionResponse.ok){
     const permission=(permissionData?.data||[]).find(item=>item.module==="ten_codes"||item.module==="nyc_police_ten_codes");
     if(permission)setPermissions(permission);
    }
   }
  }catch(loadError){
   setError(loadError.message);
   setCodes([]);
  }finally{
   setLoading(false);
  }
 },[user,privileged]);

 useEffect(()=>{loadCodes();},[loadCodes]);

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

 const stateOptions=useMemo(()=>uniqueSorted(codes.map(code=>code.state)),[codes]);

 const cityOptions=useMemo(()=>{
  return uniqueSorted(codes.filter(code=>selectedState==="all"||code.state===selectedState).map(code=>code.city));
 },[codes,selectedState]);

 const agencyOptions=useMemo(()=>{
  return uniqueSorted(codes.filter(code=>{
   const stateMatches=selectedState==="all"||code.state===selectedState;
   const cityMatches=selectedCity==="all"||code.city===selectedCity;
   return stateMatches&&cityMatches;
  }).map(code=>code.agency));
 },[codes,selectedState,selectedCity]);

 const filteredByLocation=useMemo(()=>{
  return codes.filter(code=>{
   const stateMatches=selectedState==="all"||code.state===selectedState;
   const cityMatches=selectedCity==="all"||code.city===selectedCity;
   const agencyMatches=selectedAgency==="all"||code.agency===selectedAgency;
   return stateMatches&&cityMatches&&agencyMatches;
  });
 },[codes,selectedState,selectedCity,selectedAgency]);

 const categories=useMemo(()=>["all",...new Set(filteredByLocation.map(code=>code.category).filter(Boolean))],[filteredByLocation]);

 const availableLetters=useMemo(()=>[...new Set(filteredByLocation.map(code=>String(code.code||"").charAt(0).toUpperCase()).filter(Boolean))].sort(),[filteredByLocation]);

 const filteredCodes=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return filteredByLocation.filter(code=>{
   const codeValue=String(code.code||"");
   const categoryMatches=category==="all"||code.category===category;
   const letterMatches=letter==="all"||codeValue.toUpperCase().startsWith(letter);
   const searchMatches=!query||[
    code.code,
    code.title,
    code.meaning,
    code.category,
    code.city,
    code.state,
    code.agency,
    code.jurisdiction,
    code.sourceName,
    code.sourceUrl,
    code.notes,
    ...(code.aliases||[])
   ].some(value=>String(value||"").toLowerCase().includes(query));

   return categoryMatches&&letterMatches&&searchMatches;
  }).sort((left,right)=>String(left.code||"").localeCompare(String(right.code||""),undefined,{numeric:true,sensitivity:"base"}));
 },[filteredByLocation,search,category,letter]);

 const groupedCodes=useMemo(()=>filteredCodes.reduce((groups,code)=>{
  const key=String(code.code||"#").charAt(0).toUpperCase();
  (groups[key]??=[]).push(code);
  return groups;
 },{}),[filteredCodes]);

 const openAdd=()=>{
  const stateValue=selectedState==="all"?"":selectedState;
  const cityValue=selectedCity==="all"?"":selectedCity;
  const agencyValue=selectedAgency==="all"?"":selectedAgency;

  setEditing(null);
  setForm({
   ...emptyForm,
   state:stateValue,
   city:cityValue,
   agency:agencyValue,
   jurisdiction:[cityValue,stateValue,agencyValue].filter(Boolean).join(" - ")
  });
  setShowForm(true);
  setError("");
 };

 const openEdit=code=>{
  setEditing(code);
  setForm({
   code:code.code||"",
   title:code.title||"",
   meaning:code.meaning||"",
   category:code.category||"General",
   city:code.city||"",
   state:code.state||"",
   agency:code.agency||"",
   jurisdiction:code.jurisdiction||"",
   sourceName:code.sourceName||"",
   sourceUrl:code.sourceUrl||"",
   notes:code.notes||"",
   aliases:(code.aliases||[]).join(", "),
   isSystem:code.isSystem===true,
   isActive:code.isActive!==false
  });
  setShowForm(true);
  setError("");
 };

 const updateForm=event=>{
  const {name,value,type,checked}=event.target;
  setForm(current=>({...current,[name]:type==="checkbox"?checked:value}));
 };

 const buildPayload=()=>({
  business_id:getBusinessId(user),
  code:form.code,
  title:form.title,
  meaning:form.meaning,
  category:form.category,
  city:form.city,
  state:String(form.state||"").toUpperCase(),
  agency:form.agency,
  jurisdiction:form.jurisdiction,
  sourceName:form.sourceName,
  sourceUrl:form.sourceUrl,
  notes:form.notes,
  aliases:String(form.aliases||"").split(",").map(item=>item.trim()).filter(Boolean),
  isSystem:form.isSystem,
  isActive:form.isActive
 });

 const saveCode=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const wasEditing=!!editing;
   const url=wasEditing?withBusiness(`/api/references/ten-codes/${getId(editing)}`,user):withBusiness("/api/references/ten-codes",user);

   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));

   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"10-code updated.":"10-code added."});
   await loadCodes();
  }catch(saveError){
   setError(saveError.message||"Failed to save 10-code.");
  }finally{
   setSaving(false);
  }
 };

 const deleteCode=async code=>{
  if(!window.confirm(`Delete the 10-code “${code.code}”?`))return;

  try{
   await readResponse(await fetch(withBusiness(`/api/references/ten-codes/${getId(code)}`,user),{
    method:"DELETE",
    headers:authHeaders()
   }));

   setNotice({variant:"success",message:"10-code deleted."});
   await loadCodes();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete 10-code."});
  }
 };

 const handleStateChange=value=>{
  setSelectedState(value);
  setSelectedCity("all");
  setSelectedAgency("all");
  setCategory("all");
  setLetter("all");
 };

 const handleCityChange=value=>{
  setSelectedCity(value);
  setSelectedAgency("all");
  setCategory("all");
  setLetter("all");
 };

 const handleAgencyChange=value=>{
  setSelectedAgency(value);
  setCategory("all");
  setLetter("all");
 };

 if(loading)return <div className="radio-terms-loading"><Spinner animation="border"/><span>Loading 10-code reference...</span></div>;

 return <main className="radio-terms-page">
  <section className="radio-terms-hero">
   <div className="radio-terms-hero-icon"><BadgeAlert size={34}/></div>

   <div className="radio-terms-hero-copy">
    <span className="radio-terms-kicker">Public Safety Reference</span>
    <h1>10-Codes</h1>
    <p>Police and public-safety 10-code references filtered by state, city, and agency.</p>
   </div>

   <div className="radio-terms-summary">
    <strong>{filteredByLocation.length}</strong>
    <span>matching 10-codes for the selected location and agency</span>
   </div>

   {canCreate?<button type="button" className="radio-terms-add" onClick={openAdd}><Plus size={18}/> Add 10-Code</button>:null}
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="radio-terms-tools" aria-label="10-code filters">
   <label className="radio-terms-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search code, meaning, city, state, agency, source, or notes"/>
   </label>

   <div className="radio-term-form-grid">
    <Form.Group>
     <Form.Label>State</Form.Label>
     <Form.Select value={selectedState} onChange={event=>handleStateChange(event.target.value)}>
      <option value="all">All States</option>
      {stateOptions.map(value=><option key={value} value={value}>{value}</option>)}
     </Form.Select>
    </Form.Group>

    <Form.Group>
     <Form.Label>City</Form.Label>
     <Form.Select value={selectedCity} onChange={event=>handleCityChange(event.target.value)}>
      <option value="all">All Cities</option>
      {cityOptions.map(value=><option key={value} value={value}>{value}</option>)}
     </Form.Select>
    </Form.Group>

    <Form.Group>
     <Form.Label>Agency</Form.Label>
     <Form.Select value={selectedAgency} onChange={event=>handleAgencyChange(event.target.value)}>
      <option value="all">All Agencies</option>
      {agencyOptions.map(value=><option key={value} value={value}>{value}</option>)}
     </Form.Select>
    </Form.Group>
   </div>

   <div className="radio-terms-category-tabs" role="group" aria-label="10-code category">
    {categories.map(value=><button type="button" key={value} className={category===value?"active":""} onClick={()=>setCategory(value)}>{value==="all"?"All":value}</button>)}
   </div>

   <nav className="radio-terms-alphabet" aria-label="10-code letters">
    <button type="button" className={letter==="all"?"active":""} onClick={()=>setLetter("all")}>All</button>
    {availableLetters.map(item=><button type="button" key={item} className={letter===item?"active":""} onClick={()=>setLetter(item)}>{item}</button>)}
   </nav>
  </section>

  <section className="radio-terms-directory">
   <div className="radio-terms-directory-heading">
    <BookOpen size={21}/>
    <div>
     <h2>10-Code Directory</h2>
     <p>Showing {filteredCodes.length} of {codes.length} total 10-codes</p>
    </div>
   </div>

   {!filteredCodes.length?<div className="radio-terms-empty">No 10-codes match those filters.</div>:Object.entries(groupedCodes).map(([group,items])=><section className="radio-term-group" key={group}>
    <div className="radio-term-letter">{group}</div>

    <div className="radio-term-list">
     {items.map(code=><article className="radio-term-entry" key={getId(code)}>
      <div className="radio-term-entry-head">
       <div>
        <h3>{code.code}</h3>
        {code.title?<span className="radio-term-expansion">{code.title}</span>:null}
       </div>

       <div className="radio-term-entry-actions">
        <span className={`radio-term-type radio-term-type-${String(code.category||"general").toLowerCase().replaceAll(" ","-")}`}>{code.category||"General"}</span>
        {code.isSystem?<span className="radio-term-source">System Reference</span>:<span className="radio-term-source radio-term-source-custom">Custom</span>}
        {code.isActive?<span className="radio-term-status">Active</span>:<span className="radio-term-status radio-term-status-inactive">Inactive</span>}
        {canUpdate?<button type="button" onClick={()=>openEdit(code)}>Edit</button>:null}
        {canDelete&&!code.isSystem?<button type="button" className="danger" onClick={()=>deleteCode(code)}>Delete</button>:null}
       </div>
      </div>

      {code.meaning?<p className="radio-term-definition">{code.meaning}</p>:null}

      <div className="radio-term-details">
       {code.city?<span><strong>City:</strong> {code.city}</span>:null}
       {code.state?<span><strong>State:</strong> {code.state}</span>:null}
       {code.agency?<span><strong>Agency:</strong> {code.agency}</span>:null}
       {code.jurisdiction?<span><strong>Jurisdiction:</strong> {code.jurisdiction}</span>:null}
      </div>

      {code.aliases?.length?<p className="radio-term-aliases"><strong>Also called:</strong> {code.aliases.join(", ")}</p>:null}
      {code.notes?<p className="radio-term-example"><strong>Notes:</strong> {code.notes}</p>:null}
      {code.sourceName||code.sourceUrl?<p className="radio-term-example"><strong>Source:</strong> {code.sourceUrl?<a href={code.sourceUrl} target="_blank" rel="noreferrer">{code.sourceName||code.sourceUrl}</a>:code.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="radio-term-modal">
   <Form onSubmit={saveCode}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit 10-Code":"Add 10-Code"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <div className="radio-term-form-grid">
      <Form.Group>
       <Form.Label>Code</Form.Label>
       <Form.Control name="code" value={form.code} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Category</Form.Label>
       <Form.Control name="category" value={form.category} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Title</Form.Label>
       <Form.Control name="title" value={form.title} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Meaning</Form.Label>
       <Form.Control as="textarea" rows={3} name="meaning" value={form.meaning} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>City</Form.Label>
       <Form.Control name="city" value={form.city} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>State</Form.Label>
       <Form.Control name="state" value={form.state} onChange={event=>setForm(current=>({...current,state:event.target.value.toUpperCase()}))} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Agency</Form.Label>
       <Form.Control name="agency" value={form.agency} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Jurisdiction</Form.Label>
       <Form.Control name="jurisdiction" value={form.jurisdiction} onChange={updateForm}/>
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
       <Form.Label>Aliases</Form.Label>
       <Form.Control name="aliases" value={form.aliases} onChange={updateForm} placeholder="Comma-separated alternate names"/>
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
     <Button type="submit" disabled={saving}>{saving?editing?"Updating...":"Saving...":editing?"Update 10-Code":"Save 10-Code"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 </main>;
}