import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useParams,useSearchParams} from "react-router-dom";
import {
 Alert,
 Button,
 ButtonGroup,
 Container,
 Form,
 Modal,
 Spinner,
 Table
} from "react-bootstrap";
import OutputForm from "./forms/OutputForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import "../styles/RecordDetail.css";

const emptyOutput={
 projectId:"",
 projectIds:[],
 subjectCode:"",
 title:"",
 outputType:"",
 outputTypes:[],
 description:"",
 body:"",
 documentPath:"",
 zettelIds:[],
 sourceIds:[],
 entityIds:[],
 structureNoteIds:[],
 tags:"",
 status:"draft",
 isFavorite:false
};

const outputStatuses=["draft","active","published","archived"];
const outputStatusOrder=new Map(outputStatuses.map((status,index)=>[status,index]));
const sortOutputs=records=>[...records].sort((left,right)=>{
 const statusDifference=(outputStatusOrder.get(left.status)??outputStatuses.length)-(outputStatusOrder.get(right.status)??outputStatuses.length);
 if(statusDifference)return statusDifference;
 return new Date(right.updatedAt||right.createdAt||0)-new Date(left.updatedAt||left.createdAt||0);
});

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

// Helper: convert comma-separated text into an array
const splitList=value=>{
 return String(value||"")
  .split(",")
  .map(item=>item.trim())
  .filter(Boolean);
};

// Helper: convert string arrays into editable text
const textList=value=>{
 return Array.isArray(value)?value.join(", "):"";
};

// Helper: extract ObjectIds from reference arrays
const selectedIds=value=>{
 if(!Array.isArray(value))return [];

 return value
  .map(item=>getObjectId(item))
  .filter(Boolean);
};

// Helper: display strings, arrays and populated references
const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value
   .map(item=>displayValue(item))
   .filter(item=>item!=="—");

  return labels.length?labels.join(", "):"—";
 }

 if(value&&typeof value==="object"){
  return(
   value.outputId||
   value.structureNoteId||
   value.zettelId||
   value.sourceId||
   value.entityId||
   value.projectId||
   value.title||
   value.name||
   value.code||
   getObjectId(value)||
   "—"
  );
 }

 return value===null||value===undefined||value===""?"—":String(value);
};

const createDocumentExcerpt=(value,maxLength=1400)=>{
 const text=richTextToPlainText(value).replace(/\s+/g," ").trim();
 if(text.length<=maxLength)return {text,isExcerpt:false};
 const shortened=text.slice(0,maxLength);
 const lastWordBreak=shortened.lastIndexOf(" ");
 return {
  text:`${shortened.slice(0,lastWordBreak>maxLength*.75?lastWordBreak:maxLength).trim()}…`,
  isExcerpt:true
 };
};

// Helper: format stored timestamps

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

function OutputsPage(){
 const userId=getStoredUserId();
 const {id:routeId}=useParams();
 const [searchParams,setSearchParams]=useSearchParams();
 const requestedStatus=String(searchParams.get("status")||"all").toLowerCase();
 const statusFilter=outputStatuses.includes(requestedStatus)?requestedStatus:"all";
 const selectedOutputId=String(routeId||searchParams.get("selected")||"");

 const [outputs,setOutputs]=useState([]);
 const [projects,setProjects]=useState([]);
 const [zettels,setZettels]=useState([]);
 const [sources,setSources]=useState([]);
 const [entities,setEntities]=useState([]);
 const [structures,setStructures]=useState([]);
 const [outputTypes,setOutputTypes]=useState([]);
 const [attachments,setAttachments]=useState([]);
 const [form,setForm]=useState({...emptyOutput});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [previewAttachment,setPreviewAttachment]=useState(null);

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
    outputData,
    projectData,
    zettelData,
    sourceData,
    entityData,
    structureData,
    attachmentData,
    outputTypeData
   ]=await Promise.all([
    fetchList(`/api/outputs${query}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/zettels${query}`),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/entities${query}`),
    fetchList(`/api/structure-notes${query}`),
    fetchList(`/api/attachments${query}&status=active`),
    fetchList(`/api/record-subtypes${query}&recordType=OUT&status=active`,true)
   ]);

   const orderedOutputs=sortOutputs(outputData);
   const availableOutputs=statusFilter==="all"?orderedOutputs:orderedOutputs.filter(record=>record.status===statusFilter);
   setOutputs(orderedOutputs);
   setDetail(current=>availableOutputs.find(record=>record._id===selectedOutputId)||availableOutputs.find(record=>record._id===current?._id)||availableOutputs[0]||null);
   setProjects(projectData);
   setZettels(zettelData);
   setSources(sourceData);
   setEntities(entityData);
   setStructures(structureData);
   setAttachments(attachmentData);
   setOutputTypes(outputTypeData);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId,statusFilter,selectedOutputId]);

 const visibleOutputs=useMemo(()=>statusFilter==="all"?outputs:outputs.filter(output=>output.status===statusFilter),[outputs,statusFilter]);

 const changeStatusFilter=value=>{
  const nextParams=new URLSearchParams(searchParams);
  if(value==="all")nextParams.delete("status");
  else nextParams.set("status",value);
  setSearchParams(nextParams);
  const nextOutputs=value==="all"?outputs:outputs.filter(output=>output.status===value);
  setDetail(nextOutputs[0]||null);
 };

 const storedAttachments=detail?attachments.filter(attachment=>getObjectId(attachment.parentRecordId)===getObjectId(detail)):[];
 const directDocument=detail?.documentPath?{
  _id:`output-document:${detail._id}`,
  fileName:String(detail.documentPath).split(/[\\/]/).pop(),
 filePath:detail.documentPath,
 fileType:String(detail.documentPath).split(".").pop()?.toUpperCase()||"File",
 size:Number(detail.documentSize)||0,
 isOutputDocument:true
 }:null;
 const detailAttachments=directDocument?[directDocument,...storedAttachments]:storedAttachments;
 const documentContent=detail?.body||detail?.outline||detail?.purpose||"";
 const documentExcerpt=createDocumentExcerpt(documentContent);
 const attachmentUrl=attachment=>attachment.isOutputDocument
  ?`/api/outputs/${detail._id}/document?userId=${encodeURIComponent(userId)}`
  :`/api/attachments/${attachment._id}/content?userId=${encodeURIComponent(userId)}`;
 const isPreviewable=attachment=>{
  const type=String(attachment.mimeType||attachment.fileType||attachment.fileName||"").toLowerCase();
  return type.includes("pdf")||type.includes("image/")||/\.(pdf|png|jpe?g|gif|webp|svg)$/.test(type);
 };

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const openCreate=()=>{
  setForm({...emptyOutput,outputType:"",outputTypes:[]});
  setEditing({});
 };

 useEffect(()=>{
  if(searchParams.get("new")!=="1")return;
  setForm({...emptyOutput,outputType:"",outputTypes:[]});
  setEditing({});
  const next=new URLSearchParams(searchParams);
  next.delete("new");
  setSearchParams(next,{replace:true});
 },[searchParams,setSearchParams]);

 const openEdit=output=>{
  setForm({
   domainId:getObjectId(output.domainId),
   domainCode:output.domainId?.code||"",
   projectId:getObjectId(output.projectId),
   projectIds:[...new Set([...(Array.isArray(output.projectIds)?output.projectIds.map(getObjectId):[]),getObjectId(output.projectId)].filter(Boolean))],
   subjectCode:"",
   title:output.title||"",
   outputType:output.outputType||"",
   outputTypes:[...new Set([...(Array.isArray(output.outputTypes)?output.outputTypes:[]),output.outputType].filter(Boolean))],
   description:output.description||"",
   body:output.body||"",
   documentPath:output.documentPath||"",
   zettelIds:selectedIds(output.zettelIds),
   sourceIds:selectedIds(output.sourceIds),
   entityIds:selectedIds(output.entityIds),
   structureNoteIds:selectedIds(output.structureNoteIds),
   tags:textList(output.tags),
   status:output.status||"draft",
   isFavorite:Boolean(output.isFavorite)
  });

  setEditing(output);
 };

 const openDetail=async output=>{
  try{
   setError("");

   const response=await fetch(
    `/api/outputs/${output._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load output");
   }

   setDetail(data?.data||output);
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

   const payload={
    userId,
    projectIds:form.projectIds,
    projectId:form.projectIds[0]||null,
    domainId:form.domainId||null,
    title:form.title,
    outputType:form.outputType,
    outputTypes:form.outputTypes,
    description:form.description,
    body:form.body,
    documentPath:form.documentPath,
    zettelIds:form.zettelIds,
    sourceIds:form.sourceIds,
    entityIds:form.entityIds,
    structureNoteIds:form.structureNoteIds,
    tags:splitList(form.tags),
    status:form.status,
    isFavorite:form.isFavorite
   };

   if(!id){
    payload.subjectCode=form.subjectCode;
   }

   const response=await fetch(
    id
     ?`/api/outputs/${id}`
     :"/api/outputs",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to save output");
   }

   setEditing(null);
   setForm({...emptyOutput});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async output=>{
  try{
   setError("");

   const response=await fetch(
    `/api/outputs/${output._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive output");
   }

   setDetail(null);
   await load();
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const toggleFavorite=async output=>{
  try{
   setError("");

   const response=await fetch(
    `/api/outputs/${output._id}/favorite`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to update favorite");
   }

   setOutputs(current=>
    current.map(item=>
     item._id===output._id
      ?data.data
      :item
    )
   );

   if(detail?._id===output._id){
    setDetail(data.data);
   }
  }catch(favoriteError){
   setError(favoriteError.message);
  }
 };

 const remove=async output=>{
  if(!window.confirm(`Delete ${output.outputId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/outputs/${output._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete output");
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
     Log in to manage outputs.
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
      7. Create Finished Work
     </p>

     <h1 className="mb-0">Outputs</h1>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>
     Add Output
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

   <div className="output-status-filter">
    <Form.Label htmlFor="output-status-filter">Show Outputs</Form.Label>
    <Form.Select id="output-status-filter" value={statusFilter} onChange={event=>changeStatusFilter(event.target.value)}>
     <option value="all">All statuses — drafts first</option>
     <option value="draft">Draft</option>
     <option value="active">Active</option>
     <option value="published">Published</option>
     <option value="archived">Archived</option>
    </Form.Select>
   </div>

   {!visibleOutputs.length?(
    <Alert variant="light">
     No {statusFilter==="all"?"outputs":`${statusFilter} outputs`} found.
    </Alert>
   ):(
    <KnowledgeWorkflowWorkspace eyebrow={statusFilter==="all"?"Finished work":`${statusFilter} outputs`} title="Outputs" records={visibleOutputs} selectedId={detail?._id} getRecordId={record=>record.outputId} getRecordTitle={record=>record.title||"Untitled"} isFavorite={record=>record.isFavorite} onSelect={openDetail} header={detail&&<><code>{detail.outputId}</code><h2>{detail.title||"Outputs"}</h2><p>{richTextToPlainText(detail.description)||richTextToPlainText(detail.purpose)||richTextToPlainText(detail.summary)||"Knowledge workflow record"}</p></>} actions={detail&&<ButtonGroup size="sm"><Button variant={detail.isFavorite?"primary":"outline-primary"} onClick={()=>toggleFavorite(detail)}>{detail.isFavorite?"Unfavorite":"Favorite"}</Button><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button><Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}>
     {detail&&<article className="record-detail workflow-record-detail output-record-detail">
      <dl className="workflow-record-meta">
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div>
       <div><dt>Projects</dt><dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd></div>
       <div><dt>Output Types</dt><dd>{displayValue(detail.outputTypes?.length?detail.outputTypes:detail.outputType)}</dd></div>
       <div className="workflow-record-summary">
        <div><dt>ID</dt><dd>{detail.outputId}</dd></div>
        <div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div>
       </div>
       <div className="workflow-record-list-value"><dt>Tags</dt><dd>{displayValue(detail.tags)}</dd></div>
       <div className="workflow-record-list-value output-stored-documents-meta">
        <dt>Stored Documents</dt>
        <dd>
         {detailAttachments.length?(
          <Table responsive size="sm" className="output-document-table mb-0">
           <thead><tr><th>Document</th><th>Type</th><th>Size</th></tr></thead>
           <tbody>{detailAttachments.map(attachment=><tr key={attachment._id}>
            <td><Button type="button" variant="link" className="p-0 text-start" onClick={()=>setPreviewAttachment(attachment)}>{attachment.originalName||attachment.fileName}</Button></td>
            <td>{attachment.fileType||attachment.mimeType||"File"}</td>
            <td>{attachment.size?`${Math.max(1,Math.round(attachment.size/1024))} KB`:"—"}</td>
           </tr>)}</tbody>
          </Table>
         ):<span className="text-muted">No stored documents.</span>}
        </dd>
       </div>
      </dl>

      <div className="workflow-record-content-grid output-record-content-grid">
       <section><h3>Description</h3><RichTextContent value={detail.description}/></section>

       <section>
        <h3>{documentExcerpt.isExcerpt?"Document Excerpt":"Document Content"}</h3>
        {documentExcerpt.isExcerpt?<p>{documentExcerpt.text}</p>:<RichTextContent value={documentContent}/>}
       </section>
      </div>
     </article>}
    </KnowledgeWorkflowWorkspace>
   )}

   <Modal
    className="workflow-modal"
    show={!!editing}
   onHide={()=>setEditing(null)}
   backdrop="static"
   keyboard={false}
    centered
    size="xl"
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?._id?`Edit Output — ${editing.title||"Untitled Output"}`:"Add Output"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <OutputForm
      form={form}
      setForm={setForm}
      userId={userId}
      projects={projects}
      outputTypes={outputTypes}
      onSubtypeCreated={created=>setOutputTypes(current=>[...current.filter(type=>type._id!==created._id),created].sort((a,b)=>a.name.localeCompare(b.name)))}
      zettels={zettels}
      sources={sources}
      entities={entities}
      structures={structures}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

   <Modal className="output-document-modal" show={!!previewAttachment} onHide={()=>setPreviewAttachment(null)} centered size="xl">
    <Modal.Header closeButton>
     <Modal.Title>{previewAttachment?.originalName||previewAttachment?.fileName||"Stored Document"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {previewAttachment&&isPreviewable(previewAttachment)?(
      <iframe className="output-document-frame" title={`Preview ${previewAttachment.originalName||previewAttachment.fileName}`} src={attachmentUrl(previewAttachment)}/>
     ):(
      <div className="output-native-document-message">
       <p>This document uses a native desktop format and cannot be rendered directly by the browser.</p>
       {previewAttachment&&<Button as="a" href={attachmentUrl(previewAttachment)} target="_blank" rel="noreferrer">Open Document</Button>}
      </div>
     )}
    </Modal.Body>
    <Modal.Footer>
     {previewAttachment&&<Button as="a" variant="outline-primary" href={attachmentUrl(previewAttachment)} target="_blank" rel="noreferrer">Open File</Button>}
     <Button variant="secondary" onClick={()=>setPreviewAttachment(null)}>Close</Button>
    </Modal.Footer>
   </Modal>

  </Container>
 );
}

export default OutputsPage;
