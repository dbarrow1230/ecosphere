import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Container,Modal,Spinner,Tab,Tabs} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import EntityForm from "./forms/EntityForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import {getEntityTemplate} from "../config/entityTemplates.js";
import "../styles/Entities.css";
import "../styles/RecordDetail.css";

const emptyEntity={
 entityId:"",
 domainId:"",
 domainCode:"",
 projectId:"",
 projectIds:[],
 name:"",
 entityType:"",
 code:"",
 description:"",
 roleUse:"",
 aliases:"",
 typeData:{},
 relatedSourceIds:[],
 linkedZettelIds:[],
 linkedOutputIds:[],
 linkedSources:[],
 linkedZettels:[],
 linkedOutputs:[],
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
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const textList=value=>{
 return Array.isArray(value)?value.join(", "):String(value||"");
};

const selectedIds=value=>{
 if(!Array.isArray(value))return [];
 return value.map(item=>getObjectId(item)).filter(Boolean);
};

const mergedIds=(...values)=>[...new Set(values.flatMap(selectedIds))];

const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value.map(item=>displayValue(item)).filter(item=>item!=="--");
  return labels.length?labels.join(", "):"--";
 }

 if(value&&typeof value==="object"){
  return(
   value.entityId||
   value.sourceId||
   value.zettelId||
   value.outputId||
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


const fetchList=async(url,required=false)=>{
 const response=await fetch(url,{credentials:"include"});
 const data=await response.json().catch(()=>null);

 if(!response.ok){
  if(required)throw new Error(data?.message||"Unable to load records");
  return [];
 }

 return Array.isArray(data?.data)?data.data:[];
};

function EntitiesPage(){
 const {id:routeId}=useParams();
 const navigate=useNavigate();
 const userId=getStoredUserId();

 const [entities,setEntities]=useState([]);
 const [projects,setProjects]=useState([]);
 const [sources,setSources]=useState([]);
 const [zettels,setZettels]=useState([]);
 const [outputs,setOutputs]=useState([]);
 const [entityTypes,setEntityTypes]=useState([]);
 const [form,setForm]=useState({...emptyEntity});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const load=useCallback(async({selectedId="",showSpinner=true}={})=>{
  if(!userId){
   setLoading(false);
   return;
  }

  try{
   if(showSpinner)setLoading(true);
   setError("");

   const query=`?userId=${encodeURIComponent(userId)}`;

   const [
    entityData,
    projectData,
    sourceData,
    zettelData,
    outputData,
    entityTypeData
   ]=await Promise.all([
    fetchList(`/api/entities${query}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/zettels${query}`),
    fetchList(`/api/outputs${query}`),
    fetchList(`/api/record-subtypes${query}&recordType=ENT&status=active`)
   ]);

   setEntities(entityData);
   setDetail(current=>entityData.find(entity=>getObjectId(entity)===selectedId)||entityData.find(entity=>getObjectId(entity)===getObjectId(current))||entityData[0]||null);
   setProjects(projectData);
   setSources(sourceData);
   setZettels(zettelData);
   setOutputs(outputData);
   setEntityTypes(entityTypeData);
  }catch(err){
   setError(err.message);
  }finally{
   if(showSpinner)setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const openCreate=()=>{
  setForm({
   ...emptyEntity,
   relatedSourceIds:[],
   linkedZettelIds:[],
   linkedOutputIds:[],
   linkedSources:[],
   linkedZettels:[],
   linkedOutputs:[]
  });

  setEditing({});
 };

 const openEdit=entity=>{
  setForm({
   entityId:entity.entityId||"",
   domainId:getObjectId(entity.domainId),
   domainCode:entity.domainId?.code||"",
   projectId:getObjectId(entity.projectId),
   projectIds:[...new Set([...(entity.projectIds||[]),entity.projectId].map(getObjectId).filter(Boolean))],
   name:entity.name||"",
   entityType:entity.entityType||"CONC",
   code:entity.code||"",
   description:entity.description||"",
   roleUse:entity.roleUse||"",
   aliases:textList(entity.aliases),
   typeData:{...(entity.typeData||{})},
   relatedSourceIds:mergedIds(entity.relatedSourceIds,entity.linkedSources),
   linkedZettelIds:mergedIds(entity.linkedZettelIds,entity.linkedZettels),
   linkedOutputIds:mergedIds(entity.linkedOutputIds,entity.linkedOutputs),
   linkedSources:[],
   linkedZettels:[],
   linkedOutputs:[],
   tags:textList(entity.tags),
   status:entity.status||"active"
  });

  setEditing(entity);
 };

 const openDetail=async entity=>{
  try{
   setError("");
   const entityId=getObjectId(entity);

   const response=await fetch(
    `/api/entities/${entityId}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load entity");
   }

   const selectedEntity=data?.data||entity;
   const selectedEntityId=getObjectId(selectedEntity)||entityId;

   setDetail(selectedEntity);

   if(selectedEntityId&&selectedEntityId!==routeId){
    navigate(`/entities/${selectedEntityId}`,{replace:true});
   }
  }catch(err){
   setError(err.message);
  }
 };

 const detailId=getObjectId(detail);
 const detailEntityType=detail?entityTypes.find(type=>type.code===detail.entityType):null;
 const savedDetailTemplate=Array.isArray(detailEntityType?.templateFields)?detailEntityType.templateFields:[];
 const detailTypeFields=detail?(savedDetailTemplate.length?savedDetailTemplate.map(field=>({...field,long:field.inputType==="richtext"})):getEntityTemplate(detail.entityType,detailEntityType?.name)).filter(field=>detail.typeData?.[field.key]):[];

 useEffect(()=>{
  const record=routeId&&entities.find(item=>getObjectId(item)===routeId);
  if(record&&detailId!==routeId)queueMicrotask(()=>setDetail(record));
 },[routeId,entities,detailId]);


 const save=async event=>{
 event.preventDefault();
  const savedScrollY=window.scrollY;
  setSaving(true);
  setError("");

  try{
   const id=editing?._id;

   const payload={
    userId,
    projectId:form.projectId||null,
    domainId:form.domainId||null,
    projectIds:form.projectIds,
    name:form.name,
    entityType:form.entityType,
    code:form.code,
    description:form.description,
    roleUse:form.roleUse,
    aliases:splitList(form.aliases),
    typeData:form.typeData||{},
    relatedSourceIds:form.relatedSourceIds,
    linkedZettelIds:form.linkedZettelIds,
    linkedOutputIds:form.linkedOutputIds,
    linkedSources:[],
    linkedZettels:[],
    linkedOutputs:[],
    tags:splitList(form.tags),
    status:form.status
   };

   const response=await fetch(
    id?`/api/entities/${id}`:"/api/entities",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to save entity");
   }

   const savedEntity=data?.data;
   const savedEntityId=getObjectId(savedEntity)||id;
   setEditing(null);
   setForm({...emptyEntity});
   await load({selectedId:savedEntityId,showSpinner:false});
   if(savedEntityId){
    navigate(`/entities/${savedEntityId}`,{replace:true});
   }
   window.requestAnimationFrame(()=>window.scrollTo({top:savedScrollY,left:0,behavior:"auto"}));
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async entity=>{
  try{
   setError("");

   const response=await fetch(
    `/api/entities/${entity._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive entity");
   }

   setDetail(null);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 const remove=async entity=>{
  if(!window.confirm(`Delete ${entity.entityId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/entities/${entity._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete entity");
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
    <Alert variant="info">Log in to manage entities.</Alert>
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
     <p className="dashboard-section-kicker mb-1">3. Reusable Subject Identities</p>
     <h1>Entities</h1>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>Add Entity</Button>
   </div>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>
     {error}
    </Alert>
   )}

   {entities.length&&detail?(
    <KnowledgeWorkflowWorkspace eyebrow="Identity index" title="Reusable entities" records={entities} selectedId={detail._id} getRecordId={entity=>entity.entityId} getRecordTitle={entity=>entity.name||"Untitled entity"} onSelect={openDetail} header={<><code>{detail.entityId}</code><h2>{detail.name||"Entity"}</h2><p>{richTextToPlainText(detail.description)||richTextToPlainText(detail.roleUse)||"Reusable subject identity"}</p></>} actions={<ButtonGroup size="sm"><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button><Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}>
     <article className="record-detail workflow-record-detail">
      <Tabs key={detailId} defaultActiveKey="overview" className="entity-detail-tabs">
       <Tab eventKey="overview" title="Overview">
      <dl className="workflow-record-meta">
       <div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div><div><dt>Projects</dt><dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd></div>
       <div className="workflow-record-summary">
        <div><dt>Entity Type</dt><dd>{detail.entityType||"--"}</dd></div>
        <div><dt>Code</dt><dd>{detail.code||"--"}</dd></div>
        <div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div>
       </div>
       <div className="workflow-record-list-value"><dt>Aliases</dt><dd>{displayValue(detail.aliases)}</dd></div>
      </dl>

      <div className="workflow-record-relationships">
       <section><h3>Sources</h3><LinkedRecordList records={[...(detail.relatedSourceIds||[]),...(detail.linkedSources||[])]} type="source"/></section>
       <section><h3>Zettels</h3><LinkedRecordList records={[...(detail.linkedZettelIds||[]),...(detail.linkedZettels||[])]} type="zettel"/></section>
       <section><h3>Outputs</h3><LinkedRecordList records={[...(detail.linkedOutputIds||[]),...(detail.linkedOutputs||[])]} type="output"/></section>
      </div>
       </Tab>
       <Tab eventKey="body" title="Body">
      <div className="workflow-record-content-grid">
       <section><h3>Description</h3><RichTextContent value={detail.description}/></section>
       <section><h3>Role / Use</h3><RichTextContent value={detail.roleUse}/></section>
      </div>

       </Tab>
       <Tab eventKey="development" title="Development">
      {detailTypeFields.length>0&&(
       <div className="workflow-record-content-grid entity-template-detail">
        {detailTypeFields.map(field=><section key={field.key}><h3>{field.label}</h3><RichTextContent value={detail.typeData[field.key]}/></section>)}
       </div>
      )}


        {!detailTypeFields.length&&<p className="text-muted">No type-specific details yet. Edit this entity to design its template and add details.</p>}
        <section><h3>Tags</h3><p>{displayValue(detail.tags)}</p></section>
       </Tab>
      </Tabs>
     </article>
    </KnowledgeWorkflowWorkspace>
   ):(
    <Alert variant="light">No entities yet.</Alert>
   )}

   <Modal className="entity-modal" show={!!editing} onHide={()=>setEditing(null)} centered size="xl" backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?._id?"Edit Entity":"Add Entity"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <EntityForm
      form={form}
      setForm={setForm}
      projects={projects}
      sources={sources}
      zettels={zettels}
      outputs={outputs}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default EntitiesPage;
