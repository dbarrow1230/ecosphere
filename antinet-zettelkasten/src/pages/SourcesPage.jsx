import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Container,Modal,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import SourceForm from "./forms/SourceForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import "../styles/RecordDetail.css";

const emptySource={
 sourceId:"",
 projectId:"",
 projectIds:[],
 subtypeId:"",
 title:"",
 subtype:"WEB",
 author:"",
 publisher:"",
 libraryBookId:"",
 libraryBookUrl:"",
 originalUrl:"",
 filePath:"",
 uploadFile:null,
 accessDate:"",
 archiveType:"",
 archiveLocation:"",
 copiedText:"",
 summary:"",
 entityIds:[],
 producedZettelIds:[],
 tags:"",
 status:"active"
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

const splitList=value=>{
 return String(value||"")
  .split(",")
  .map(item=>item.trim())
  .filter(Boolean);
};

const textList=value=>{
 return Array.isArray(value)?value.join(", "):"";
};

const selectedIds=value=>{
 if(!Array.isArray(value))return [];

 return value
  .map(item=>getObjectId(item))
  .filter(Boolean);
};

const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value
   .map(item=>displayValue(item))
   .filter(item=>item!=="--");

  return labels.length?labels.join(", "):"--";
 }

 if(value&&typeof value==="object"){
  return(
   value.sourceId||
   value.entityId||
   value.projectId||
   value.title||
   value.name||
   value.code||
   getObjectId(value)||
   "--"
  );
 }

 return value===null||value===undefined||value===""?"--":String(value);
};

const formatDate=value=>{
 if(!value)return "--";

 const date=new Date(value);

 if(Number.isNaN(date.getTime()))return "--";

 return date.toLocaleDateString();
};


const fetchList=async(url,required=false)=>{
 const response=await fetch(url,{credentials:"include"});
 const data=await response.json();

 if(!response.ok){
  if(required)throw new Error(data?.message||"Unable to load records");
  return [];
 }

 return Array.isArray(data?.data)?data.data:[];
};

function SourcesPage(){
 const {id:routeId}=useParams();
 const navigate=useNavigate();
 const userId=getStoredUserId();

 const [sources,setSources]=useState([]);
 const [projects,setProjects]=useState([]);
 const [entities,setEntities]=useState([]);
 const [zettels,setZettels]=useState([]);
 const [sourceTypes,setSourceTypes]=useState([]);
 const [attachments,setAttachments]=useState([]);
 const [form,setForm]=useState({...emptySource});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

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
    sourceData,
    projectData,
    entityData,
    sourceTypeData,
    attachmentData,
    zettelData
   ]=await Promise.all([
    fetchList(`/api/sources${query}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/entities${query}`),
    fetchList(`/api/record-subtypes${query}&recordType=SRC&status=active`,true),
    fetchList(`/api/attachments${query}`),
    fetchList(`/api/zettels${query}`)
   ]);

   const sourcesWithProducedZettels=sourceData.map(source=>({
    ...source,
    producedZettels:zettelData.filter(zettel=>selectedIds(zettel.sourceIds).includes(source._id))
   }));
   setSources(sourcesWithProducedZettels);
   setDetail(current=>sourcesWithProducedZettels.find(source=>source._id===current?._id)||sourcesWithProducedZettels[0]||null);
   setProjects(projectData);
   setEntities(entityData);
   setSourceTypes(sourceTypeData);
   setAttachments(attachmentData);
   setZettels(zettelData);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const openCreate=()=>{
  setForm({...emptySource});
  setEditing({});
 };

 const openEdit=source=>{
  const sourceObjectId=getObjectId(source);
  const savedProducedZettelIds=zettels
   .filter(zettel=>selectedIds(zettel.sourceIds).includes(sourceObjectId))
   .map(getObjectId);
  setForm({
   sourceId:source.sourceId||"",
   domainId:getObjectId(source.domainId),
   domainCode:source.domainId?.code||"",
   projectId:getObjectId(source.projectId),
   projectIds:[...new Set([...(source.projectIds||[]),source.projectId].map(getObjectId).filter(Boolean))],
   subtypeId:getObjectId(source.subtypeId)||getObjectId(sourceTypes.find(type=>String(type.code||"").toUpperCase()===String(source.subtype||"").toUpperCase())),
   title:source.title||"",
   subtype:source.subtype||"WEB",
   author:source.author||"",
   publisher:source.publisher||"",
   libraryBookId:source.libraryBookId||"",
   libraryBookUrl:source.libraryBookUrl||"",
   originalUrl:source.originalUrl||"",
   filePath:source.filePath||"",
   uploadFile:null,
   accessDate:source.accessDate?String(source.accessDate).slice(0,10):"",
   archiveType:source.archiveType||"",
   archiveLocation:source.archiveLocation||"",
   copiedText:source.copiedText||"",
   summary:source.summary||"",
   entityIds:selectedIds(source.entityIds),
   producedZettelIds:[...new Set([...selectedIds(source.producedZettels),...savedProducedZettelIds])],
   tags:textList(source.tags),
   status:source.status||"active"
  });

  setEditing(source);
 };

 const openDetail=async source=>{
  try{
   setError("");
   const sourceId=getObjectId(source);

   const response=await fetch(
    `/api/sources/${sourceId}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to load source");
   }

   const selectedSource=data.data||source;
   const selectedSourceId=getObjectId(selectedSource)||sourceId;

   setDetail(selectedSource);

   if(selectedSourceId&&selectedSourceId!==routeId){
    navigate(`/references/${selectedSourceId}`,{replace:true});
   }
  }catch(err){
   setError(err.message);
  }
 };

 const detailId=getObjectId(detail);

 useEffect(()=>{
  const record=routeId&&sources.find(item=>getObjectId(item)===routeId);
  if(record&&detailId!==routeId)queueMicrotask(()=>setDetail(record));
 },[routeId,sources,detailId]);


 const save=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");

  try{
   const id=editing?._id;

   const payload={
    userId,
    projectId:form.projectId||null,
    domainId:form.domainId||null,
    projectIds:form.projectIds,
    subtypeId:form.subtypeId,
    title:form.title,
    subtype:form.subtype,
    author:form.author,
    publisher:form.publisher,
    libraryBookId:form.libraryBookId,
    libraryBookUrl:form.libraryBookUrl,
    originalUrl:form.originalUrl,
    filePath:form.filePath,
    accessDate:form.accessDate||null,
    archiveType:form.archiveType,
    archiveLocation:form.archiveLocation,
    copiedText:form.copiedText,
    summary:form.summary,
    entityIds:form.entityIds,
    producedZettelIds:form.producedZettelIds,
    tags:splitList(form.tags),
    status:form.status
   };

   const response=await fetch(
    id?`/api/sources/${id}`:"/api/sources",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to save source");
   }

   const savedSource=data?.data;
   if(form.uploadFile){
    const attachmentForm=new FormData();
    attachmentForm.append("file",form.uploadFile);
    attachmentForm.append("userId",userId);
    attachmentForm.append("parentModel","Source");
    attachmentForm.append("parentRecordId",savedSource._id);
    attachmentForm.append("parentDisplayId",savedSource.sourceId||form.sourceId);
    attachmentForm.append("description",`Source file for ${savedSource.title||form.title}`);
    attachmentForm.append("tags",form.tags||"");

    const uploadResponse=await fetch("/api/attachments/upload",{
     method:"POST",
     credentials:"include",
     body:attachmentForm
    });
    const uploadData=await uploadResponse.json().catch(()=>null);

    if(!uploadResponse.ok){
     setEditing(null);
     setForm({...emptySource});
     await load();
     throw new Error(`Source saved, but the file upload failed: ${uploadData?.message||"Unable to upload file"}`);
    }

    await fetch(`/api/sources/${savedSource._id}`,{
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId,filePath:uploadData.data.filePath})
    });
   }

   setEditing(null);
   setForm({...emptySource});
   await load();
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 const detailAttachments=attachments.filter(attachment=>
  attachment.parentModel==="Source"&&getObjectId(attachment.parentRecordId)===getObjectId(detail)
 );

 const archive=async source=>{
  try{
   setError("");

   const response=await fetch(
    `/api/sources/${source._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive source");
   }

   setDetail(null);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 const remove=async source=>{
  if(!window.confirm(`Delete ${source.sourceId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/sources/${source._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json();

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete source");
   }

   setDetail(null);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 if(!userId){
  return(
  <Container fluid className="py-5 px-4">
    <Alert variant="info">
     Log in to manage sources.
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
   <div className="d-flex justify-content-between align-items-start mb-4">
    <div>
     <p className="dashboard-section-kicker mb-1">
      2. Preserve Source Material
     </p>

     <h1>Sources</h1>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>
     Add Source
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

   {sources.length&&detail?(
    <KnowledgeWorkflowWorkspace
     eyebrow="Source archive"
     title="Preserved sources"
     records={sources}
     selectedId={detail._id}
     getRecordId={source=>source.sourceId}
     getRecordTitle={source=>source.title||"Untitled source"}
     onSelect={openDetail}
     header={<><code>{detail.sourceId}</code><h2>{detail.title||"Source"}</h2><p>{richTextToPlainText(detail.summary)||detail.author||"Preserved source material"}</p></>}
     actions={<ButtonGroup size="sm"><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button><Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}
    >
     <article className="record-detail workflow-record-detail">
      <dl className="workflow-record-meta">
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div>
       <div className="workflow-record-projects">
        <dt>Projects</dt>
        <dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd>
       </div>
       <div className="workflow-record-summary">
        <div><dt>Source Type</dt><dd>{detail.subtype||"--"}</dd></div>
        <div><dt>Author / Creator</dt><dd>{detail.author||"--"}</dd></div>
        <div><dt>Publisher</dt><dd>{detail.publisher||"--"}</dd></div>
        {detail.libraryBookUrl&&<div><dt>Library Book</dt><dd><a href={detail.libraryBookUrl} target="_blank" rel="noreferrer">Open in Book Management</a></dd></div>}
        <div><dt>Access Date</dt><dd>{formatDate(detail.accessDate)}</dd></div>
        <div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div>
       </div>
       <div className="workflow-record-list-value"><dt>Tags</dt><dd>{displayValue(detail.tags)}</dd></div>
      </dl>

      <div className="workflow-record-content-grid source-record-content-grid">
       <section className="source-record-long-form"><h3>Saved Extract</h3><RichTextContent value={detail.copiedText}/></section>
       <section className="source-record-long-form"><h3>Summary</h3><RichTextContent value={detail.summary}/></section>
      </div>

      <div className="workflow-record-relationships workflow-record-relationships-two">
       <section><h3>Linked Entities</h3><LinkedRecordList records={detail.entityIds} type="entity"/></section>
       <section><h3>Produced Zettels</h3><LinkedRecordList records={detail.producedZettels} type="zettel"/></section>
      </div>

      <section>
       <h3>Associated Files</h3>
       {detailAttachments.length?(
        <ul className="list-unstyled mb-0">
         {detailAttachments.map(attachment=><li key={attachment._id} className="mb-2"><a href={`/api/attachments/${attachment._id}/content?userId=${encodeURIComponent(userId)}`} target="_blank" rel="noreferrer">{attachment.originalName||attachment.fileName}</a> <small className="text-muted">({attachment.fileType||attachment.mimeType||"file"})</small></li>)}
        </ul>
       ):<p className="text-muted mb-0">No files linked to this source.</p>}
      </section>
     </article>
    </KnowledgeWorkflowWorkspace>
   ):(
    <Alert variant="light">
     No sources yet.
    </Alert>
   )}

   <Modal
    className="workflow-modal"
    show={!!editing}
   onHide={()=>setEditing(null)}
   backdrop="static"
   keyboard={false}
    centered
    size="lg"
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?._id?"Edit Source":"Add Source"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <SourceForm
      form={form}
      setForm={setForm}
      projects={projects}
      entities={entities}
      zettels={zettels}
      sourceTypes={sourceTypes}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default SourcesPage;
