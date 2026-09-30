import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,ButtonGroup,Container,Form,Modal,Spinner} from "react-bootstrap";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import FleetingNoteForm from "./forms/FleetingNoteForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import ProcessFleetingNoteForm from "./forms/ProcessFleetingNoteForm.jsx";
import {richTextToTitle} from "../utils/richText.js";
import "../styles/FleetingInbox.css";

const emptyCapture={
 fleetingNoteId:"",
 projectId:"",
 projectIds:[],
 topic:"",
 subjectCode:"",
 rawCapture:"",
 captureType:"",
 possibleProject:[],
 processLaterAs:"",
 notes:[],
 status:"active",
 processedInto:"",
 hideFromInbox:false
};

const emptyProcess={
 targetType:"ZTL",
 projectId:"",
 projectIds:[],
 title:"",
 name:"",
 tags:"",
 status:"active",
 subtype:"",
 mainIdea:"",
 body:"",
 sourceIds:[],
 entityIds:[],
 futureUse:"",
 questions:"",
 isFavorite:false,
 author:"",
 publisher:"",
 originalUrl:"",
 filePath:"",
 accessDate:"",
 archiveType:"",
 archiveLocation:"",
 copiedText:"",
 summary:"",
 entityType:"",
 code:"",
 description:"",
 roleUse:"",
 aliases:"",
 relatedSourceIds:[],
 linkedZettelIds:[],
 linkedOutputIds:[],
 linkedSources:[],
 linkedZettels:[],
 linkedOutputs:[],
 purpose:"",
 zettelIds:[],
 outline:"",
 outputType:"",
 documentPath:"",
 structureNoteIds:[]
};

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

const normalizeArray=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 if(value===null||value===undefined||value==="")return [];
 return [String(value).trim()].filter(Boolean);
};

const splitList=value=>{
 if(Array.isArray(value))return normalizeArray(value);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const displayList=value=>{
 const values=normalizeArray(value);
 return values.length?values.join(", "):"--";
};

const getCaptureTitle=capture=>String(capture?.topic||"").trim()||richTextToTitle(capture?.rawCapture)||"Untitled capture";

const getCaptureDateValue=capture=>{
 const date=new Date(capture.createdAt||capture.updatedAt||0);
 return Number.isNaN(date.getTime())?0:date.getTime();
};

const getIdParts=id=>{
 const match=String(id||"").match(/^(.*)-(\d+)$/);

 return{
  prefix:match?.[1]||String(id||""),
  number:match?Number(match[2]):Number.MAX_SAFE_INTEGER
 };
};

const fetchList=async(url,required=false)=>{
 const response=await fetch(url,{credentials:"include"});
 const data=await response.json().catch(()=>null);

 if(!response.ok){
  if(required)throw new Error(data?.message||"Unable to load records");
  return [];
 }

 return Array.isArray(data?.data)?data.data:[];
};

function FleetingInboxPage(){
 const userId=getStoredUserId();

 const [captures,setCaptures]=useState([]);
 const [projects,setProjects]=useState([]);
 const [recordSubtypes,setRecordSubtypes]=useState([]);
 const [sources,setSources]=useState([]);
 const [entities,setEntities]=useState([]);
 const [zettels,setZettels]=useState([]);
 const [structureNotes,setStructureNotes]=useState([]);
 const [outputs,setOutputs]=useState([]);
 const [form,setForm]=useState({...emptyCapture});
 const [processForm,setProcessForm]=useState({...emptyProcess});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [processing,setProcessing]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [,setError]=useState("");
 const [subtypeFilter,setSubtypeFilter]=useState("");
 const [queueView,setQueueView]=useState("inbox");

 const load=useCallback(async()=>{
  if(!userId){
   setLoading(false);
   return;
  }

  try{
   setLoading(true);
   setError("");

   const query=`?userId=${encodeURIComponent(userId)}`;
   const fleetingQuery=`${query}&includeProcessed=true`;

   const [
    captureData,
    projectData,
    subtypeData,
    sourceData,
    entityData,
    zettelData,
    structureData,
    outputData
   ]=await Promise.all([
    fetchList(`/api/fleeting-notes${fleetingQuery}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/record-subtypes${query}&status=active`,true),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/entities${query}`),
    fetchList(`/api/zettels${query}`),
    fetchList(`/api/structure-notes${query}`),
    fetchList(`/api/outputs${query}`)
   ]);

   setCaptures(captureData);
   setDetail(current=>captureData.find(capture=>capture._id===current?._id)||captureData[0]||null);
   setProjects(projectData);
   setRecordSubtypes(subtypeData);
   setSources(sourceData);
   setEntities(entityData);
   setZettels(zettelData);
   setStructureNotes(structureData);
   setOutputs(outputData);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const fleetingSubtypes=useMemo(()=>{
  const subtypeMap=new Map();

  for(const subtype of recordSubtypes){
   if(String(subtype.recordType||"").toUpperCase()!=="FLT")continue;

   const code=String(subtype.code||"").toUpperCase();
   if(!code)continue;

   subtypeMap.set(code,{
    _id:subtype._id||code,
    code,
    name:subtype.name||code
   });
  }

  for(const capture of captures){
   const code=String(capture.captureType||"").toUpperCase();
   if(!code||subtypeMap.has(code))continue;

   subtypeMap.set(code,{
    _id:`capture-type-${code}`,
    code,
    name:code
   });
  }

  return Array.from(subtypeMap.values())
   .sort((a,b)=>String(a.name||a.code).localeCompare(String(b.name||b.code)));
 },[captures,recordSubtypes]);

 const visibleCaptures=useMemo(()=>{
  const byQueue=captures.filter(capture=>{
   if(queueView==="processed")return capture.status==="processed"||Boolean(capture.processedInto);
   if(queueView==="all")return true;
   return !capture.hideFromInbox&&capture.status!=="processed";
  });

  const filtered=subtypeFilter
   ?byQueue.filter(capture=>String(capture.captureType||"").toUpperCase()===subtypeFilter)
   :byQueue;

  const groups=new Map();

  for(const capture of filtered){
   const idParts=getIdParts(capture.fleetingNoteId);
   const key=idParts.prefix||capture._id;
   const captureDate=getCaptureDateValue(capture);

   if(!groups.has(key)){
    groups.set(key,{
     key,
     latestDate:captureDate,
     records:[]
    });
   }

   const group=groups.get(key);
   group.latestDate=Math.max(group.latestDate,captureDate);
   group.records.push({
    ...capture,
    __sequenceNumber:idParts.number
   });
  }

  return Array.from(groups.values())
   .sort((a,b)=>b.latestDate-a.latestDate)
   .flatMap(group=>group.records
    .sort((a,b)=>{
     if(a.__sequenceNumber!==b.__sequenceNumber)return a.__sequenceNumber-b.__sequenceNumber;
     return getCaptureDateValue(b)-getCaptureDateValue(a);
    })
    .map((capture,index)=>({
     ...capture,
     __isSequenceChild:index>0,
     __sequenceGroupSize:group.records.length
    })));
 },[captures,queueView,subtypeFilter]);

 useEffect(()=>{
  queueMicrotask(()=>{
   if(!visibleCaptures.length){
    setDetail(null);
    return;
   }

   if(!visibleCaptures.some(capture=>capture._id===detail?._id)){
    setDetail(visibleCaptures[0]);
   }
  });
 },[detail?._id,visibleCaptures]);

 const openCreate=()=>{
  setForm({
   ...emptyCapture,
   possibleProject:[],
   notes:[]
  });

  setEditing({});
 };

 const openEdit=capture=>{
  setForm({
   fleetingNoteId:capture.fleetingNoteId||"",
   domainId:getObjectId(capture.domainId),
   domainCode:capture.domainId?.code||"",
   projectId:getObjectId(capture.projectId),
   projectIds:[...new Set([...(capture.projectIds||[]),capture.projectId].map(getObjectId).filter(Boolean))],
   topic:capture.topic||"",
   subjectCode:capture.subjectCode||"",
   rawCapture:capture.rawCapture||"",
   captureType:String(capture.captureType||"IDEA").toUpperCase(),
   possibleProject:normalizeArray(capture.possibleProject),
   processLaterAs:capture.processLaterAs||"",
   notes:normalizeArray(capture.notes),
   status:capture.status||"active",
   processedInto:capture.processedInto||"",
   hideFromInbox:Boolean(capture.hideFromInbox)
  });

  setEditing(capture);
 };

 const openDetail=async capture=>{
  try{
   setError("");

   const response=await fetch(
    `/api/fleeting-notes/${capture._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load fleeting note");
   }

   setDetail(data?.data||capture);
  }catch(err){
   setError(err.message);
  }
 };

const openProcess=capture=>{
  setError("");
  const possibleProjects=normalizeArray(capture.possibleProject).map(value=>value.toLowerCase());

  const matchedProject=projects.find(project=>{
   const values=[
    project.title,
    project.code,
    project.projectId
   ].map(value=>String(value||"").trim().toLowerCase());

   return values.some(value=>possibleProjects.includes(value));
  });

  const captureNotes=normalizeArray(capture.notes).join("\n");

  setProcessForm({
   ...emptyProcess,
   targetType:capture.processLaterAs||"ZTL",
   projectId:getObjectId(matchedProject),
   projectIds:[...new Set([...(capture.projectIds||[]),capture.projectId,matchedProject].map(getObjectId).filter(Boolean))],
   title:getCaptureTitle(capture),
   name:getCaptureTitle(capture),
   mainIdea:capture.rawCapture||"",
   body:captureNotes||capture.rawCapture||"",
   copiedText:capture.rawCapture||"",
   description:captureNotes,
   purpose:captureNotes,
   summary:captureNotes,
   outline:capture.rawCapture||""
  });

  setProcessing(capture);
 };

 const save=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const id=editing?._id;
   const selectedProject=projects.find(project=>String(project._id)===String(form.projectId));

   const payload={
    userId,
    projectId:form.projectId||null,
    domainId:form.domainId||null,
    projectIds:form.projectIds,
    topic:form.topic,
    projectCode:form.topic||selectedProject?.code,
    subjectCode:form.subjectCode,
    rawCapture:form.rawCapture,
    captureType:form.captureType,
    possibleProject:normalizeArray(form.possibleProject),
    processLaterAs:form.processLaterAs,
    notes:normalizeArray(form.notes),
    status:form.status,
    processedInto:form.processedInto,
    hideFromInbox:form.hideFromInbox
   };

   const response=await fetch(
    id?`/api/fleeting-notes/${id}`:"/api/fleeting-notes",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to save fleeting capture");
   }

   setEditing(null);
   setForm({
    ...emptyCapture,
    possibleProject:[],
    notes:[]
   });

   await load();
  }catch(err){
   setError(err.message);
   requestAnimationFrame(()=>{
    const modalBody=document.querySelector(".workflow-modal.show .modal-body");
    if(modalBody)modalBody.scrollTo({top:0,behavior:"smooth"});
    else window.scrollTo({top:0,behavior:"smooth"});
   });
  }finally{
   setSaving(false);
  }
 };

 const processCapture=async event=>{
  event.preventDefault();

  if(!processing?._id)return;

  setSaving(true);
  setError("");

  try{
   const payload={
    ...processForm,
    userId,
    projectId:processForm.projectId||null,
    projectIds:processForm.projectIds,
    tags:splitList(processForm.tags),
    futureUse:splitList(processForm.futureUse),
    questions:splitList(processForm.questions),
    aliases:splitList(processForm.aliases),
    accessDate:processForm.accessDate||null
   };

   const response=await fetch(
    `/api/fleeting-notes/${processing._id}/process`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to process fleeting capture");
   }

   setProcessing(null);
   setProcessForm({...emptyProcess});
   await load();
  }catch(err){
   setError(err.message);
   requestAnimationFrame(()=>{
    const modalBody=document.querySelector(".workflow-modal.show .modal-body");
    if(modalBody)modalBody.scrollTo({top:0,behavior:"smooth"});
    else window.scrollTo({top:0,behavior:"smooth"});
   });
  }finally{
   setSaving(false);
  }
 };

 const archive=async capture=>{
  try{
   setError("");

   const response=await fetch(
    `/api/fleeting-notes/${capture._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive fleeting capture");
   }

   await load();
  }catch(err){
   setError(err.message);
  }
 };

 const remove=async capture=>{
  if(!window.confirm(`Delete ${capture.fleetingNoteId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/fleeting-notes/${capture._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete fleeting capture");
   }

   setDetail(null);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 if(!userId){
  return(
   <Container className="py-5">
    <Alert variant="info">Log in to manage fleeting captures.</Alert>
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
  <Container fluid className="fleeting-inbox-page">
   <div className="fleeting-inbox-page-header">
    <div>
     <p className="dashboard-section-kicker mb-1">1. Capture Before You Lose It</p>
     <h1>Fleeting Inbox</h1>
    </div>

    <Button className="fleeting-inbox-add" size="sm" onClick={openCreate}>Add Capture</Button>
   </div>

   <div className="fleeting-inbox-filters">
    <Form.Group className="fleeting-subtype-filter" controlId="fleeting-queue-view">
     <Form.Label>View</Form.Label>
     <Form.Select value={queueView} onChange={event=>setQueueView(event.target.value)}>
      <option value="inbox">Inbox</option>
      <option value="processed">Processed</option>
      <option value="all">All Captures</option>
     </Form.Select>
    </Form.Group>

    <Form.Group className="fleeting-subtype-filter" controlId="fleeting-subtype-filter">
     <Form.Label>Filter by Subtype</Form.Label>
     <Form.Select value={subtypeFilter} onChange={event=>setSubtypeFilter(event.target.value)}>
      <option value="">All fleeting subtypes</option>
      {fleetingSubtypes.map(subtype=>(
       <option key={subtype._id} value={String(subtype.code||"").toUpperCase()}>
        {subtype.code} - {subtype.name}
       </option>
      ))}
     </Form.Select>
    </Form.Group>
   </div>

   {visibleCaptures.length&&detail?(
    <KnowledgeWorkflowWorkspace
     eyebrow={queueView==="processed"?"Processed archive":"Capture queue"}
     title={queueView==="processed"?"Processed fleeting notes":"Fleeting captures"}
     records={visibleCaptures}
     selectedId={detail._id}
     getRecordId={capture=>capture.fleetingNoteId}
     getRecordTitle={getCaptureTitle}
     getRecordClassName={capture=>capture.__isSequenceChild?"is-sequence-child":""}
     onSelect={openDetail}
     header={<><code>{detail.fleetingNoteId}</code><h2>{getCaptureTitle(detail)}</h2></>}
     actions={(
      <ButtonGroup size="sm">
       <Button variant="outline-primary" disabled={["archived","discarded"].includes(detail.status)} onClick={()=>openProcess(detail)}>
        {detail.status==="processed"?"Process Again":"Process"}
       </Button>
       <Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button>
       <Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button>
       <Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button>
      </ButtonGroup>
     )}
    >
   <article className="record-detail">
 <section className="fleeting-capture-content"><h3>Capture</h3><RichTextContent value={detail.rawCapture}/></section>
 <dl>
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div>
  <div><dt>Capture Type</dt><dd>{detail.captureType||"--"}</dd></div>
  <div><dt>Projects</dt><dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd></div>
  <div><dt>Topic</dt><dd>{detail.topic||"--"}</dd></div>
  <div><dt>Subject Code</dt><dd>{detail.subjectCode||"--"}</dd></div>
  <div><dt>Possible Projects</dt><dd>{displayList(detail.possibleProject)}</dd></div>
  <div><dt>Process Later As</dt><dd>{detail.processLaterAs||"--"}</dd></div>
  <div><dt>Processed Into</dt><dd><code>{detail.processedInto||"--"}</code></dd></div>
  <div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div>
  <div>
   <dt>Notes</dt>
   <dd className="fleeting-note-list">
    {normalizeArray(detail.notes).length
     ?normalizeArray(detail.notes).map((note,index)=><p key={`${detail._id}-note-${index}`}>{note}</p>)
     :"--"}
   </dd>
  </div>
 </dl>
</article>
   </KnowledgeWorkflowWorkspace>
   ):(
    <div className="fleeting-inbox-empty" role="status">No fleeting captures found.</div>
   )}

   <Modal className="workflow-modal" show={!!editing} onHide={()=>setEditing(null)} centered size="lg" backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?._id?`Edit Fleeting Note — ${getCaptureTitle(editing)}`:"Add Fleeting Note"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <FleetingNoteForm
      form={form}
      setForm={setForm}
      projects={projects}
      subtypes={recordSubtypes}
      onSubtypeCreated={created=>{
       setRecordSubtypes(current=>[
        ...current.filter(type=>type._id!==created._id),
        created
       ].sort((a,b)=>a.name.localeCompare(b.name)));
       setForm(current=>({
        ...current,
        captureType:created.code,
        fleetingNoteId:""
       }));
      }}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

   <Modal className="workflow-modal" show={!!processing} onHide={()=>setProcessing(null)} centered size="xl" backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>Process <code className="fleeting-detail-id">{processing?.fleetingNoteId}</code></Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <ProcessFleetingNoteForm
      form={processForm}
      setForm={setProcessForm}
      userId={userId}
      projects={projects}
      recordSubtypes={recordSubtypes}
      onSubtypeCreated={created=>{
       setRecordSubtypes(current=>[
        ...current.filter(type=>type._id!==created._id),
        created
       ].sort((a,b)=>a.name.localeCompare(b.name)));
      }}
      sources={sources}
      entities={entities}
      zettels={zettels}
      structureNotes={structureNotes}
      outputs={outputs}
      saving={saving}
      onSubmit={processCapture}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default FleetingInboxPage;
