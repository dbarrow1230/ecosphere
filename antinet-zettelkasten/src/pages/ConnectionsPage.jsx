import {resolveConnectionRecord} from "../utils/connectionRecords.js";
import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "react-router-dom";
import {
 Alert,
 Badge,
 Button,
 ButtonGroup,
 Container,
 Form,
 Modal,
 Spinner,
} from "react-bootstrap";
import ConnectionForm from "./forms/ConnectionForm.jsx";
import RelationTypeForm from "./forms/RelationTypeForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import SortedList from "../components/SortedList.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import "../styles/RecordDetail.css";
import "../styles/ConnectionsPage.css";

const emptyConnection={
 subjectCode:"",
 projectId:"",
 projectIds:[],
 fromRecord:"",
 fromRecordType:"ZTL",
 toRecord:"",
 toRecords:[],
 toSelections:[],
 toRecordType:"ZTL",
 relation:"",
 reason:"",
 strength:"medium",
 tags:"",
 status:"active"
};

// Helper: normalize IDs from strings and populated records
const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value.$oid==="string")return value.$oid;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

// Helper: locate the stored authenticated user ID
const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);

   if(!raw)continue;

   const parsed=JSON.parse(raw);
   const user=parsed?.user||parsed?.data||parsed;
   const userId=getObjectId(user);

   if(userId)return userId;
  }catch{
   continue;
  }
 }

 return "";
};

// Helper: load one API collection
const fetchList=async(url,required=false)=>{
 const response=await fetch(url,{credentials:"include"});
 const data=await response.json().catch(()=>null);

 if(!response.ok){
  if(required){
   throw new Error(data?.message||"Unable to load records");
  }

  return [];
 }

 return Array.isArray(data?.data)?data.data:[];
};

// Helper: return the visible ID field for each record type
const getRecordIdentifier=(record,type)=>{
 const fields={
  ZTL:"zettelId",
  SRC:"sourceId",
  ENT:"entityId",
  STR:"structureNoteId",
  OUT:"outputId",
  FLT:"fleetingNoteId",
  PRJ:"projectId"
 };

 return record?.[fields[type]]||getObjectId(record);
};

// Helper: return the visible title field for each record type
const getRecordTitle=(record,type)=>{
 if(type==="ENT")return record?.name||"Untitled entity";
 if(type==="FLT")return record?.topic||richTextToPlainText(record?.rawCapture)||"Untitled capture";

 return record?.title||record?.name||record?.purpose||"Untitled record";
};

// Helper: format stored timestamps

// Helper: return the Bootstrap badge style for connection strength
const strengthVariant=strength=>{
 if(strength==="strong")return "success";
 if(strength==="weak")return "secondary";
 return "primary";
};

const escapeHtml=value=>String(value||"").replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]);

function ConnectionsPage(){
 const userId=getStoredUserId();
 const [searchParams,setSearchParams]=useSearchParams();

 const [connections,setConnections]=useState([]);
 const [recordsByType,setRecordsByType]=useState({
  ZTL:[],
  SRC:[],
  ENT:[],
  STR:[],
  OUT:[],
  FLT:[],
  PRJ:[]
 });
 const [relationTypes,setRelationTypes]=useState([]);
 const [form,setForm]=useState({...emptyConnection});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [connectionView,setConnectionView]=useState("meaningful");
 const [connectionSearch,setConnectionSearch]=useState("");
 const [relationTypeForm,setRelationTypeForm]=useState(null);
 const [savingRelationType,setSavingRelationType]=useState(false);

 const load=useCallback(async()=>{
  if(!userId){
   setLoading(false);
   return;
  }

  try{
   setLoading(true);
   setError("");

   const query=`?userId=${encodeURIComponent(userId)}`;

   const [
    connectionData,
    zettelData,
    sourceData,
    entityData,
    structureData,
    outputData,
    fleetingData,
    projectData,
    relationTypeData
   ]=await Promise.all([
    fetchList(`/api/connections${query}`,true),
    fetchList(`/api/zettels${query}`),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/entities${query}`),
    fetchList(`/api/structure-notes${query}`),
    fetchList(`/api/outputs${query}`),
    fetchList(`/api/fleeting-notes${query}&includeProcessed=true`),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/relation-types${query}`)
   ]);

   setConnections(connectionData);
   setDetail(current=>connectionData.find(connection=>connection._id===current?._id)||connectionData[0]||null);

   setRecordsByType({
    ZTL:zettelData,
    SRC:sourceData,
    ENT:entityData,
    STR:structureData,
    OUT:outputData,
    FLT:fleetingData,
    PRJ:projectData
   });

   setRelationTypes(relationTypeData);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 useEffect(()=>{
  const fromId=searchParams.get("fromId");
  const fromType=searchParams.get("fromType")||"ZTL";

  if(searchParams.get("create")!=="1"||!fromId||!recordsByType[fromType]?.some(record=>getObjectId(record)===fromId))return;

  queueMicrotask(()=>{
   setConnectionView("meaningful");
   setForm({...emptyConnection,fromRecordType:fromType,fromRecord:fromId});
   setEditing({});
  });
 },[searchParams,recordsByType]);

 const recordIndex=useMemo(()=>{
  const index={};

  Object.entries(recordsByType).forEach(([type,records])=>{
   records.forEach(record=>{
    const recordId=getObjectId(record);

    if(recordId){
     index[`${type}:${recordId}`]=record;
    }
   });
  });

  return index;
 },[recordsByType]);

 const automaticConnections=useMemo(()=>{
  const links=[];
  const seen=new Set();
  const relationshipFields={
   ZTL:[{field:"sourceIds",toType:"SRC",relation:"uses source"},{field:"entityIds",toType:"ENT",relation:"mentions entity"}],
   SRC:[{field:"entityIds",toType:"ENT",relation:"mentions entity"}],
   ENT:[{field:"relatedSourceIds",toType:"SRC",relation:"uses source"},{field:"linkedZettelIds",toType:"ZTL",relation:"links to"},{field:"linkedOutputIds",toType:"OUT",relation:"links to"},{field:"linkedSources",toType:"SRC",relation:"links to"},{field:"linkedZettels",toType:"ZTL",relation:"links to"},{field:"linkedOutputs",toType:"OUT",relation:"links to"}],
   STR:[{field:"zettelIds",toType:"ZTL",relation:"organizes"},{field:"sourceIds",toType:"SRC",relation:"uses source"},{field:"entityIds",toType:"ENT",relation:"mentions entity"}],
   OUT:[{field:"zettelIds",toType:"ZTL",relation:"developed from"},{field:"sourceIds",toType:"SRC",relation:"uses source"},{field:"entityIds",toType:"ENT",relation:"mentions entity"},{field:"structureNoteIds",toType:"STR",relation:"developed from"}]
  };

  Object.entries(relationshipFields).forEach(([fromType,fields])=>{
   (recordsByType[fromType]||[]).forEach(fromRecord=>{
    const fromId=getObjectId(fromRecord);
    if(!fromId)return;

    fields.forEach(({field,toType,relation})=>{
     (Array.isArray(fromRecord[field])?fromRecord[field]:[]).forEach(toRecord=>{
      const toId=getObjectId(toRecord);
      if(!toId||toId===fromId)return;

      const key=`${fromType}:${fromId}:${toType}:${toId}:${relation}`;
      if(seen.has(key))return;
      seen.add(key);

      links.push({
       _id:`automatic:${key}`,
       connectionId:`AUTO-${getRecordIdentifier(fromRecord,fromType)}-${getRecordIdentifier(toRecord,toType)}`,
       fromRecord,
       fromRecordType:fromType,
       toRecord,
       toRecordType:toType,
       relation,
       reason:`Automatically derived from the saved ${field} relationship.`,
       strength:"medium",
       status:"active",
       isAutomatic:true
      });
     });
    });
   });
  });

  return links;
 },[recordsByType]);

 const displayedConnections=connectionView==="automatic"?automaticConnections:connections;

 useEffect(()=>{
  if(!displayedConnections.length){
   if(detail)queueMicrotask(()=>setDetail(null));
   return;
  }

  if(!displayedConnections.some(connection=>connection._id===detail?._id)){
   queueMicrotask(()=>setDetail(displayedConnections[0]));
  }
 },[displayedConnections,detail]);

 const recordLabel=(type,value,displayId="")=>{
  const resolved=resolveConnectionRecord(recordIndex,type,value);
  if(!resolved)return displayId||"Record unavailable";
  return getRecordIdentifier(resolved.record,resolved.type)+" - "+getRecordTitle(resolved.record,resolved.type);
 };

 const recordTitle=(type,value,displayId="")=>{
  const resolved=resolveConnectionRecord(recordIndex,type,value);
  return resolved?getRecordTitle(resolved.record,resolved.type):(displayId||"Record unavailable");
 };

 const connectionEndpoint=(connection,side)=>{
  const type=connection[side+"RecordType"]||connection[side+"Model"];
  const value=connection[side+"Record"]||connection[side+"RecordId"];
  return recordTitle(type,value,connection[side+"DisplayId"]);
 };

 const visibleConnections=useMemo(()=>{
  const query=connectionSearch.trim().toLocaleLowerCase();
  if(!query)return displayedConnections;

  return displayedConnections.filter(connection=>[
   connection.connectionId,
   connectionEndpoint(connection,"from"),
   connection.relation||connection.relationType,
   connectionEndpoint(connection,"to")
  ].some(value=>String(value||"").toLocaleLowerCase().includes(query)));
 },[connectionSearch,displayedConnections,recordIndex]);

 const buildConnectionReason=(toRecord,toRecordType=form.toRecordType)=>{
  if(editing?._id)return form.reason;
  const toTitle=recordTitle(toRecordType,toRecord);
  const generatedContext=`<p>${escapeHtml(toTitle)}</p>`;
  const typedReason=form.reasonContext&&String(form.reason||"").startsWith(form.reasonContext)?String(form.reason||"").slice(form.reasonContext.length):String(form.reason||"");
  return `${generatedContext}${typedReason}`;
 };

 const formFromTitle=form.fromRecord?recordTitle(form.fromRecordType,form.fromRecord):"";

 const openCreate=()=>{
  setForm({...emptyConnection});
  setEditing({});
 };

 const closeForm=()=>{
  setEditing(null);
  const nextParams=new URLSearchParams(searchParams);
  nextParams.delete("create");
  nextParams.delete("fromType");
  nextParams.delete("fromId");
  setSearchParams(nextParams,{replace:true});
 };

 const openEdit=connection=>{
  setForm({
   subjectCode:"",
   domainId:getObjectId(connection.domainId),
   domainCode:connection.domainId?.code||"",
   projectId:getObjectId(connection.projectId),
   projectIds:[...new Set([...(connection.projectIds||[]),connection.projectId].map(getObjectId).filter(Boolean))],
   fromRecord:getObjectId(
    connection.fromRecord||connection.fromRecordId
   ),
   fromRecordType:
    connection.fromRecordType||
    connection.fromModel||
    "ZTL",
   toRecord:getObjectId(
    connection.toRecord||connection.toRecordId
   ),
   toRecords:[getObjectId(connection.toRecord||connection.toRecordId)].filter(Boolean),
   toSelections:[{recordType:connection.toRecordType||connection.toModel||"ZTL",recordId:getObjectId(connection.toRecord||connection.toRecordId)}].filter(selection=>selection.recordId),
   toRecordType:
    connection.toRecordType||
    connection.toModel||
    "ZTL",
   relation:
    connection.relation||
    connection.relationType||
    "",
   reason:connection.reason||"",
   strength:connection.strength||"medium",
   tags:(connection.tags||[]).join(", "),
   status:connection.status||"active"
  });

  setEditing(connection);
 };

 const openDetail=async connection=>{
  try{
   setError("");

   const response=await fetch(
    `/api/connections/${connection._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load connection");
   }

   setDetail(data?.data||connection);
  }catch(detailError){
   setError(detailError.message);
  }
 };

 const save=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const id=editing?._id;

   const destinations=editing?._id?[{recordType:form.toRecordType,recordId:form.toRecord}]:(form.toSelections||[]);
   if(!destinations.length)throw new Error("Select at least one destination record");

   const payload={
    userId,
    projectId:form.projectId,
    domainId:form.domainId||null,
    projectIds:form.projectIds,
    fromRecord:form.fromRecord,
    fromRecordType:form.fromRecordType,
    toRecordType:form.toRecordType,
    relation:form.relation.trim().toLowerCase(),
    strength:form.strength,
    tags:form.tags,
    status:form.status
   };

   if(!id){
    payload.subjectCode=form.subjectCode;
   }

   for(const destination of destinations){
    const response=await fetch(id?`/api/connections/${id}`:"/api/connections",{
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({...payload,toRecord:destination.recordId,toRecordType:destination.recordType,reason:buildConnectionReason(destination.recordId,destination.recordType)})
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(data?.message||"Unable to save connection");
   }

   closeForm();
   setForm({...emptyConnection});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const saveRelationType=async event=>{
  event.preventDefault();
  setSavingRelationType(true);
  setError("");
  try{
   const response=await fetch("/api/relation-types",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({...relationTypeForm,userId})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to save relation type");
   const created=data.data;
   setRelationTypes(current=>[...current.filter(type=>type._id!==created._id),created].sort((a,b)=>a.name.localeCompare(b.name)));
   setForm(current=>({...current,relation:String(created.name||created.code||"").trim().toLowerCase()}));
   setRelationTypeForm(null);
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSavingRelationType(false);
  }
 };

 const archive=async connection=>{
  try{
   setError("");

   const response=await fetch(
    `/api/connections/${connection._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive connection");
   }

   setDetail(null);
   await load();
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const remove=async connection=>{
  if(!window.confirm(`Delete ${connection.connectionId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/connections/${connection._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete connection");
   }

   setDetail(null);
   await load();
  }catch(deleteError){
   setError(deleteError.message);
  }
 };

 if(!userId){
  return(
  <Container fluid className="py-5 px-4">
    <Alert variant="info">
     Log in to manage connections.
    </Alert>
   </Container>
  );
 }

 if(loading){
  return(
   <Container className="py-5 text-center">
    <Spinner animation="border"/>
   </Container>
  );
 }

 return(
  <Container fluid className="py-5 px-4">
   <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
    <div>
     <p className="dashboard-section-kicker mb-1">
      5. Connect Ideas With Meaning
     </p>

     <h1 className="mb-0">Connections</h1>
     <p className="mb-0 text-muted">Saved connections provide outgoing links and inverse backlinks. Record associations from sources, entities, structures, and outputs appear separately.</p>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>
     Add Meaningful Connection
    </Button>
   </div>

   {error&&(
    <Alert
     variant="danger"
     dismissible
     onClose={()=>setError("")}
    >
     {error}
    </Alert>
   )}

   <section className="connections-browser">
    <div className="connections-browser-header">
     <div>
      <p className="dashboard-section-kicker">Connection Index</p>
      <h2>{connectionView==="automatic"?"Record Associations":"Meaningful Connections"}</h2>
     </div>
     <ButtonGroup className="connections-view-toggle" aria-label="Choose connection view">
      <Button variant={connectionView==="meaningful"?"primary":"outline-primary"} onClick={()=>setConnectionView("meaningful")}>Meaningful Connections <span>{connections.length}</span></Button>
      <Button variant={connectionView==="automatic"?"primary":"outline-primary"} onClick={()=>setConnectionView("automatic")}>Record Associations <span>{automaticConnections.length}</span></Button>
     </ButtonGroup>
    </div>
    <div className="connections-list-search">
     <Form.Control
      type="search"
      value={connectionSearch}
      onChange={event=>setConnectionSearch(event.target.value)}
      placeholder="Search connections"
      aria-label="Search connections"
     />
    </div>

   {!visibleConnections.length||!detail?(
    <Alert variant="light">
     {displayedConnections.length?"No connections match your search.":`No ${connectionView==="automatic"?"record associations":"meaningful connections"} yet.`}
    </Alert>
   ):(
    <div className="connections-browser-body">
     <SortedList items={visibleConnections} getKey={connection=>connection._id} getLabel={connection=>connectionEndpoint(connection,"from")} className="connections-list" role="list" wrapItems={false} renderItem={connection=><button type="button" role="listitem" className={`connections-list-item${detail._id===connection._id?" is-selected":""}`} onClick={()=>connection.isAutomatic?setDetail(connection):openDetail(connection)}>
       <strong>{connectionEndpoint(connection,"from")}</strong>
       <span>{connection.relation||connection.relationType||"relates to"}</span>
       <strong>{connectionEndpoint(connection,"to")}</strong>
      </button>}/>
     <article className="connections-detail">
      <div className="connections-detail-heading">
       <div><p>{detail.isAutomatic?"Record Association":"Meaningful Connection"}</p><h2>{connectionEndpoint(detail,"from")} <span>{detail.relation||detail.relationType||"relates to"}</span> {connectionEndpoint(detail,"to")}</h2></div>
       {detail.isAutomatic?<Badge bg="info">Generated automatically</Badge>:<ButtonGroup size="sm"><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button><Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}
      </div>
      <dl className="connections-detail-meta">
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div><div><dt>From</dt><dd>{recordLabel(detail.fromRecordType||detail.fromModel,detail.fromRecord||detail.fromRecordId,detail.fromDisplayId)}</dd></div><div><dt>Relationship</dt><dd>{detail.relation||detail.relationType||"—"}</dd></div><div><dt>To</dt><dd>{recordLabel(detail.toRecordType||detail.toModel,detail.toRecord||detail.toRecordId,detail.toDisplayId)}</dd></div><div><dt>Projects</dt><dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd></div><div><dt>Tags</dt><dd>{(detail.tags||[]).join(", ")||"—"}</dd></div><div><dt>Strength</dt><dd><Badge bg={strengthVariant(detail.strength)}>{detail.strength||"medium"}</Badge></dd></div><div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div></dl>
      <section className="connections-reason"><h3>{detail.isAutomatic?"How this association was found":"Reason / Context"}</h3><RichTextContent value={detail.reason}/></section>
     </article>
    </div>
   )}
   </section>

   <Modal
    className="workflow-modal"
   show={!!editing}
    onHide={closeForm}
    backdrop="static"
    keyboard={false}
    centered
    size="xl"
   >
    <Modal.Header closeButton>
     <Modal.Title>
     {editing?._id
       ?`Edit Connection${formFromTitle?` — ${formFromTitle}`:""}`
       :`Add Meaningful Connection${formFromTitle?` — ${formFromTitle}`:""}`}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <ConnectionForm
      form={form}
      setForm={setForm}
      recordsByType={recordsByType}
      projects={recordsByType.PRJ}
      relationTypes={relationTypes}
      onAddRelationType={()=>setRelationTypeForm({name:"",code:"",description:"",status:"active"})}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
   </Modal.Body>
   </Modal>

   <Modal className="workflow-modal" show={!!relationTypeForm} onHide={()=>setRelationTypeForm(null)} centered size="lg" backdrop="static" keyboard={false}>
    <Modal.Header closeButton><Modal.Title>Add Relation Type</Modal.Title></Modal.Header>
    <Modal.Body><RelationTypeForm form={relationTypeForm||{name:"",code:"",description:"",status:"active"}} setForm={setRelationTypeForm} editing={{}} saving={savingRelationType} onSubmit={saveRelationType}/></Modal.Body>
   </Modal>

  </Container>
 );
}

export default ConnectionsPage;
