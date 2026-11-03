import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Form,Modal,Spinner} from "react-bootstrap";
import {RadioTower,Plus,Search,BookOpen} from "lucide-react";
import "../../styles/FrequencyReference.css";

const emptyForm={
 service:"",
 band:"",
 channel:"",
 frequency:"",
 frequencyMHz:"",
 frequencyRangeStartMHz:"",
 frequencyRangeEndMHz:"",
 mode:"",
 bandwidth:"",
 usage:"",
 description:"",
 licenseRequired:false,
 powerLimit:"",
 region:"United States",
 notes:"",
 sourceName:"",
 sourceUrl:"",
 aliases:"",
 isSystem:false,
 isActive:true
};

const serviceOptions=[
 "marine",
 "ham",
 "cb",
 "gmrs",
 "frs",
 "aviation",
 "weather"
];

const serviceOrder=[
 "all",
 "marine",
 "ham",
 "cb",
 "gmrs",
 "frs",
 "aviation",
 "weather"
];

const getToken=()=>localStorage.getItem("token")||sessionStorage.getItem("token")||"";
const authHeaders=extra=>({Authorization:`Bearer ${getToken()}`,...extra});
const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value?.id||value||"");

const normalizeService=value=>String(value||"").trim().toLowerCase();

const formatService=value=>String(value||"")
 .trim()
 .replace(/\s+/g," ")
 .replace(/\b\w/g,letter=>letter.toUpperCase());

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
 if(Array.isArray(value?.frequencies))return value.frequencies;
 if(Array.isArray(value?.frequencyReferences))return value.frequencyReferences;
 if(Array.isArray(value?.records))return value.records;
 return [];
};

const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The frequency reference request failed");
 return data;
};

export default function FrequencyReferencePage({user}){
 const [records,setRecords]=useState([]);
 const [search,setSearch]=useState("");
 const [service,setService]=useState("all");
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
   setRecords(toArray(await readResponse(await fetch(withBusiness("/api/references/frequencies",user),{headers:authHeaders()}))));
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

 const serviceTabs=useMemo(()=>{
  const fromRecords=[...new Set(records.map(record=>normalizeService(record.service)).filter(Boolean))];

  const validServices=fromRecords.filter(value=>serviceOptions.includes(value));

  const sorted=validServices.sort((left,right)=>{
   const leftIndex=serviceOrder.indexOf(left);
   const rightIndex=serviceOrder.indexOf(right);

   if(leftIndex!==-1&&rightIndex!==-1)return leftIndex-rightIndex;
   if(leftIndex!==-1)return -1;
   if(rightIndex!==-1)return 1;

   return left.localeCompare(right,undefined,{numeric:true,sensitivity:"base"});
  });

  return ["all",...sorted];
 },[records]);

 useEffect(()=>{
  if(service==="all")return;
  if(!serviceTabs.includes(service))setService("all");
 },[service,serviceTabs]);

 const filteredRecords=useMemo(()=>{
  const query=search.trim().toLowerCase();

  return records.filter(record=>{
   const recordService=normalizeService(record.service);

   if(!serviceOptions.includes(recordService))return false;

   const serviceMatches=service==="all"||recordService===service;

   const searchMatches=!query||[
    record.service,
    record.band,
    record.channel,
    record.frequency,
    record.frequencyMHz,
    record.frequencyRangeStartMHz,
    record.frequencyRangeEndMHz,
    record.mode,
    record.bandwidth,
    record.usage,
    record.description,
    record.powerLimit,
    record.region,
    record.notes,
    record.sourceName,
    record.sourceUrl,
    ...(record.aliases||[])
   ].some(value=>String(value||"").toLowerCase().includes(query));

   return serviceMatches&&searchMatches;
  }).sort((left,right)=>{
   const leftService=normalizeService(left.service);
   const rightService=normalizeService(right.service);

   const leftIndex=serviceOrder.indexOf(leftService);
   const rightIndex=serviceOrder.indexOf(rightService);

   if(leftIndex!==rightIndex)return leftIndex-rightIndex;

   const leftFrequency=Number(left.frequencyMHz||left.frequencyRangeStartMHz||0);
   const rightFrequency=Number(right.frequencyMHz||right.frequencyRangeStartMHz||0);

   if(leftFrequency!==rightFrequency)return leftFrequency-rightFrequency;

   return String(left.channel||"").localeCompare(String(right.channel||""),undefined,{numeric:true,sensitivity:"base"});
  });
 },[records,search,service]);

 const groupedRecords=useMemo(()=>filteredRecords.reduce((groups,record)=>{
  const key=normalizeService(record.service)||"other";
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
   service:normalizeService(record.service),
   band:record.band||"",
   channel:record.channel||"",
   frequency:record.frequency||"",
   frequencyMHz:record.frequencyMHz??"",
   frequencyRangeStartMHz:record.frequencyRangeStartMHz??"",
   frequencyRangeEndMHz:record.frequencyRangeEndMHz??"",
   mode:record.mode||"",
   bandwidth:record.bandwidth||"",
   usage:record.usage||"",
   description:record.description||"",
   licenseRequired:record.licenseRequired===true,
   powerLimit:record.powerLimit||"",
   region:record.region||"United States",
   notes:record.notes||"",
   sourceName:record.sourceName||"",
   sourceUrl:record.sourceUrl||"",
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

 const toNumberOrBlank=value=>{
  if(value===""||value===null||value===undefined)return "";
  const numberValue=Number(value);
  return Number.isFinite(numberValue)?numberValue:"";
 };

 const buildPayload=()=>({
  business:getBusinessId(user),
  service:normalizeService(form.service),
  band:form.band,
  channel:form.channel,
  frequency:form.frequency,
  frequencyMHz:toNumberOrBlank(form.frequencyMHz),
  frequencyRangeStartMHz:toNumberOrBlank(form.frequencyRangeStartMHz),
  frequencyRangeEndMHz:toNumberOrBlank(form.frequencyRangeEndMHz),
  mode:form.mode,
  bandwidth:form.bandwidth,
  usage:form.usage,
  description:form.description,
  licenseRequired:form.licenseRequired,
  powerLimit:form.powerLimit,
  region:form.region,
  notes:form.notes,
  sourceName:form.sourceName,
  sourceUrl:form.sourceUrl,
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
   const url=wasEditing?withBusiness(`/api/references/frequencies/${getId(editing)}`,user):withBusiness("/api/references/frequencies",user);

   await readResponse(await fetch(url,{
    method:wasEditing?"PUT":"POST",
    headers:authHeaders({"Content-Type":"application/json"}),
    body:JSON.stringify(buildPayload())
   }));

   setShowForm(false);
   setEditing(null);
   setForm(emptyForm);
   setNotice({variant:"success",message:wasEditing?"Frequency reference updated.":"Frequency reference added."});
   await loadRecords();
  }catch(saveError){
   setError(saveError.message||"Failed to save frequency reference.");
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete the frequency reference “${record.frequency}”?`))return;

  try{
   await readResponse(await fetch(withBusiness(`/api/references/frequencies/${getId(record)}`,user),{
    method:"DELETE",
    headers:authHeaders()
   }));

   setNotice({variant:"success",message:"Frequency reference deleted."});
   await loadRecords();
  }catch(deleteError){
   setNotice({variant:"danger",message:deleteError.message||"Failed to delete frequency reference."});
  }
 };

 if(loading)return <div className="frequency-reference-loading"><Spinner animation="border"/><span>Loading frequency references...</span></div>;

 return <main className="frequency-reference-page">
  <section className="frequency-reference-hero">
   <div className="frequency-reference-hero-icon"><RadioTower size={34}/></div>

   <div>
    <span className="frequency-reference-kicker">Radio Reference</span>
    <h1>Frequency Reference Chart</h1>
    <p>Marine, ham, CB, GMRS, FRS, aviation, weather, and other real frequency references.</p>
   </div>

   <div className="frequency-reference-summary">
    <strong>{filteredRecords.length}</strong>
    <span>showing of {records.length} stored</span>
   </div>

   <button type="button" className="frequency-reference-add" onClick={openAdd}>
    <Plus size={18}/> Add Frequency
   </button>
  </section>

  {notice?<Alert variant={notice.variant} dismissible onClose={()=>setNotice(null)}>{notice.message}</Alert>:null}
  {error&&!showForm?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}

  <section className="frequency-reference-tools" aria-label="Frequency filters">
   <label className="frequency-reference-search">
    <Search size={19}/>
    <input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search service, band, channel, frequency, mode, usage, notes, or source"/>
   </label>

   <div className="frequency-reference-category-tabs" role="group" aria-label="Frequency service">
    {serviceTabs.map(value=><button type="button" key={value} className={service===value?"active":""} onClick={()=>setService(value)}>{value==="all"?"All":formatService(value)}</button>)}
   </div>
  </section>

  <section className="frequency-reference-directory">
   <div className="frequency-reference-directory-heading">
    <BookOpen size={21}/>
    <div>
     <h2>Frequency Directory</h2>
     <p>Showing {filteredRecords.length} of {records.length} frequency references</p>
    </div>
   </div>

   {!filteredRecords.length?<div className="frequency-reference-empty">No frequency references match those filters.</div>:Object.entries(groupedRecords).map(([group,items])=><section className="frequency-reference-group" key={group}>
    <div className="frequency-reference-letter">{formatService(group)}</div>

    <div className="frequency-reference-list">
     {items.map(record=><article className="frequency-reference-entry" key={getId(record)}>
      <div className="frequency-reference-entry-head">
       <div>
        <h3>{record.frequency}</h3>
        {record.channel?<span className="frequency-reference-expansion">Channel {record.channel}</span>:null}
       </div>

       <div className="frequency-reference-entry-actions">
        <span className="frequency-reference-type">{record.band||formatService(record.service)}</span>
        {record.mode?<span className="frequency-reference-source">{record.mode}</span>:null}
        {record.licenseRequired?<span className="frequency-reference-status">License</span>:<span className="frequency-reference-status frequency-reference-status-inactive">No License</span>}
        {record.isSystem?<span className="frequency-reference-source">System</span>:<span className="frequency-reference-source frequency-reference-source-custom">Custom</span>}
        {record.isActive?<span className="frequency-reference-status">Active</span>:<span className="frequency-reference-status frequency-reference-status-inactive">Inactive</span>}
        <button type="button" onClick={()=>openEdit(record)}>Edit</button>
        {!record.isSystem?<button type="button" className="danger" onClick={()=>deleteRecord(record)}>Delete</button>:null}
       </div>
      </div>

      {record.description?<p className="frequency-reference-definition">{record.description}</p>:null}

      <div className="frequency-reference-details">
       {record.service?<span><strong>Service:</strong> {formatService(record.service)}</span>:null}
       {record.band?<span><strong>Band:</strong> {record.band}</span>:null}
       {record.usage?<span><strong>Usage:</strong> {record.usage}</span>:null}
       {record.bandwidth?<span><strong>Bandwidth:</strong> {record.bandwidth}</span>:null}
       {record.powerLimit?<span><strong>Power:</strong> {record.powerLimit}</span>:null}
       {record.region?<span><strong>Region:</strong> {record.region}</span>:null}
      </div>

      {record.frequencyRangeStartMHz||record.frequencyRangeEndMHz?<p className="frequency-reference-example"><strong>Range:</strong> {record.frequencyRangeStartMHz||""} - {record.frequencyRangeEndMHz||""} MHz</p>:null}
      {record.aliases?.length?<p className="frequency-reference-aliases"><strong>Also called:</strong> {record.aliases.join(", ")}</p>:null}
      {record.notes?<p className="frequency-reference-example"><strong>Notes:</strong> {record.notes}</p>:null}
      {record.sourceName||record.sourceUrl?<p className="frequency-reference-example"><strong>Source:</strong> {record.sourceUrl?<a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceName||record.sourceUrl}</a>:record.sourceName}</p>:null}
     </article>)}
    </div>
   </section>)}
  </section>

  <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} centered className="frequency-reference-modal">
   <Form onSubmit={saveRecord}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Frequency Reference":"Add Frequency Reference"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}

     <div className="frequency-reference-form-grid">
      <Form.Group>
       <Form.Label>Service</Form.Label>
       <Form.Control as="select" name="service" value={form.service} onChange={updateForm} required>
        <option value="">Select service</option>
        {serviceOptions.map(value=><option value={value} key={value}>{formatService(value)}</option>)}
       </Form.Control>
      </Form.Group>

      <Form.Group>
       <Form.Label>Band</Form.Label>
       <Form.Control name="band" value={form.band} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Channel</Form.Label>
       <Form.Control name="channel" value={form.channel} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Frequency</Form.Label>
       <Form.Control name="frequency" value={form.frequency} onChange={updateForm} required/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Frequency MHz</Form.Label>
       <Form.Control type="number" step="0.0001" name="frequencyMHz" value={form.frequencyMHz} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Range Start MHz</Form.Label>
       <Form.Control type="number" step="0.0001" name="frequencyRangeStartMHz" value={form.frequencyRangeStartMHz} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Range End MHz</Form.Label>
       <Form.Control type="number" step="0.0001" name="frequencyRangeEndMHz" value={form.frequencyRangeEndMHz} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Mode</Form.Label>
       <Form.Control name="mode" value={form.mode} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Bandwidth</Form.Label>
       <Form.Control name="bandwidth" value={form.bandwidth} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Usage</Form.Label>
       <Form.Control name="usage" value={form.usage} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Power Limit</Form.Label>
       <Form.Control name="powerLimit" value={form.powerLimit} onChange={updateForm}/>
      </Form.Group>

      <Form.Group>
       <Form.Label>Region</Form.Label>
       <Form.Control name="region" value={form.region} onChange={updateForm}/>
      </Form.Group>

      <Form.Group className="full">
       <Form.Label>Description</Form.Label>
       <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={updateForm}/>
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
       <Form.Check type="checkbox" name="licenseRequired" checked={form.licenseRequired} onChange={updateForm} label="License Required"/>
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
     <Button type="submit" disabled={saving}>{saving?editing?"Updating...":"Saving...":editing?"Update Frequency":"Save Frequency"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 </main>;
}