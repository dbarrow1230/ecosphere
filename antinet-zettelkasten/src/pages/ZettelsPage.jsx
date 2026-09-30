import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useState} from "react";
import {Alert,Button,ButtonGroup,Container,Modal,Spinner,Table} from "react-bootstrap";
import ZettelForm from "./forms/ZettelForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import "../styles/RecordDetail.css";

const emptyZettel={
 zettelId:"",
 projectIds:[],
 subtype:"",
 title:"",
 mainIdea:"",
 body:"",
 sourceIds:[],
 entityIds:[],
 originFleetingNoteId:"",
 futureUse:"",
 questions:"",
 tags:"",
 status:"draft",
 isFavorite:false
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

const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value.map(item=>displayValue(item)).filter(item=>item!=="--");
  return labels.length?labels.join(", "):"--";
 }

 if(value&&typeof value==="object"){
  return(
   value.zettelId||
   value.sourceId||
   value.entityId||
   value.fleetingNoteId||
   value.projectId||
   value.code||
   value.name||
   value.title||
   getObjectId(value)||
   "--"
  );
 }

 return value===null||value===undefined||value===""?"--":String(value);
};

const displaySubtype=value=>{
 if(!value)return "--";
 if(typeof value==="string")return value;
 return value.code||value.name||"--";
};

const formatDateTime=value=>{
 if(!value)return "--";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"--":date.toLocaleString();
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

function ZettelsPage(){
 const userId=getStoredUserId();

 const [zettels,setZettels]=useState([]);
 const [projects,setProjects]=useState([]);
 const [subtypes,setSubtypes]=useState([]);
 const [sources,setSources]=useState([]);
 const [entities,setEntities]=useState([]);
 const [fleetingNotes,setFleetingNotes]=useState([]);
 const [form,setForm]=useState({...emptyZettel});
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
    zettelData,
    projectData,
    subtypeData,
    sourceData,
    entityData,
    fleetingData
   ]=await Promise.all([
    fetchList(`/api/zettels${query}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/record-subtypes${query}&recordType=ZTL&status=active`,true),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/entities${query}`),
    fetchList(`/api/fleeting-notes${query}&includeProcessed=true`)
   ]);

   setZettels(zettelData);
   setProjects(projectData);
   setSubtypes(subtypeData);
   setSources(sourceData);
   setEntities(entityData);
   setFleetingNotes(fleetingData);
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
  setForm({
   ...emptyZettel,
   sourceIds:[],
   entityIds:[]
  });

  setEditing({});
 };

 const openEdit=zettel=>{
  setForm({
   zettelId:zettel.zettelId||"",
   domainId:getObjectId(zettel.domainId),
   domainCode:zettel.domainId?.code||"",
   projectIds:[...new Set([
    ...(Array.isArray(zettel.projectIds)?zettel.projectIds.map(getObjectId):[]),
    getObjectId(zettel.projectId)
   ].filter(Boolean))],
   subtype:getObjectId(Array.isArray(zettel.subtype)?zettel.subtype[0]:zettel.subtype),
   title:zettel.title||"",
   mainIdea:zettel.mainIdea||"",
   body:zettel.body||"",
   sourceIds:selectedIds(zettel.sourceIds),
   entityIds:selectedIds(zettel.entityIds),
   originFleetingNoteId:getObjectId(zettel.originFleetingNoteId),
   futureUse:textList(zettel.futureUse),
   questions:textList(zettel.questions),
   tags:textList(zettel.tags),
   status:zettel.status||"draft",
   isFavorite:Boolean(zettel.isFavorite)
  });

  setEditing(zettel);
 };

 const openDetail=async zettel=>{
  try{
   setError("");

   const response=await fetch(
    `/api/zettels/${zettel._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load zettel");
   }

   setDetail(data?.data||zettel);
  }catch(err){
   setError(err.message);
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
    subtype:form.subtype,
    title:form.title,
    mainIdea:form.mainIdea,
    body:form.body,
    sourceIds:form.sourceIds,
    entityIds:form.entityIds,
    originFleetingNoteId:form.originFleetingNoteId||null,
    futureUse:splitList(form.futureUse),
    questions:splitList(form.questions),
    tags:splitList(form.tags),
    status:form.status,
    isFavorite:form.isFavorite
   };

   const response=await fetch(
    id?`/api/zettels/${id}`:"/api/zettels",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to save zettel");
   }

   setEditing(null);
   setForm({...emptyZettel});
   await load();
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 const toggleFavorite=async zettel=>{
  try{
   setError("");

   const response=await fetch(
    `/api/zettels/${zettel._id}/favorite`,
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

   setDetail(current=>current?._id===zettel._id?data.data:current);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 const archive=async zettel=>{
  try{
   setError("");

   const response=await fetch(
    `/api/zettels/${zettel._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive zettel");
   }

   setDetail(null);
   await load();
  }catch(err){
   setError(err.message);
  }
 };

 const remove=async zettel=>{
  if(!window.confirm(`Delete ${zettel.zettelId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/zettels/${zettel._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete zettel");
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
    <Alert variant="info">Log in to manage zettels.</Alert>
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
     <p className="dashboard-section-kicker mb-1">4. Process One Useful Thought</p>
     <h1>Zettels</h1>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>Add Zettel</Button>
   </div>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>
     {error}
    </Alert>
   )}

   {zettels.length?(
    <Table responsive hover className="align-middle text-nowrap">
     <thead>
      <tr>
       <th>ID</th>
       <th>Project</th>
       <th>Title</th>
       <th>Main Idea</th>
       <th>Subtype</th>
       <th>Favorite</th>
       <th>Status</th>
       <th>Actions</th>
      </tr>
     </thead>

     <tbody>
      {zettels.map(zettel=>(
       <tr key={zettel._id}>
        <td className="workflow-id">
         <Button variant="link" className="p-0 text-decoration-none" onClick={()=>openDetail(zettel)}>
          <code>{zettel.zettelId}</code>
         </Button>
        </td>

        <td>{displayValue(zettel.projectIds?.length?zettel.projectIds:zettel.projectId)}</td>
        <td>{zettel.title||"--"}</td>
        <td>{zettel.mainIdea||"--"}</td>
        <td>{displaySubtype(zettel.subtype)}</td>
        <td>{zettel.isFavorite?"Yes":"No"}</td>
        <td>{zettel.status||"--"}</td>

        <td className="text-nowrap">
         <ButtonGroup size="sm">
          <Button
           variant={zettel.isFavorite?"primary":"outline-primary"}
           onClick={()=>toggleFavorite(zettel)}
          >
           {zettel.isFavorite?"Unfavorite":"Favorite"}
          </Button>

          <Button variant="outline-secondary" onClick={()=>openEdit(zettel)}>
           Edit
          </Button>

          <Button
           variant="outline-warning"
           disabled={zettel.status==="archived"}
           onClick={()=>archive(zettel)}
          >
           Archive
          </Button>

          <Button variant="outline-danger" onClick={()=>remove(zettel)}>
           Delete
          </Button>
         </ButtonGroup>
        </td>
       </tr>
      ))}
     </tbody>
    </Table>
   ):(
    <Alert variant="light">No zettels yet.</Alert>
   )}

   <Modal className="workflow-modal" show={!!editing} onHide={()=>setEditing(null)} centered size="xl" backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?._id?"Edit Zettel":"Add Zettel"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <ZettelForm
      form={form}
      setForm={setForm}
      projects={projects}
      subtypes={subtypes}
      sources={sources}
      entities={entities}
      fleetingNotes={fleetingNotes}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

   <Modal className="workflow-modal" show={!!detail} onHide={()=>setDetail(null)} centered size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{detail?.zettelId}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {detail&&(
      <article className="record-detail">
       <h2>{detail.title||"Zettel"}</h2>

       <dl>
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div>
        <div>
         <dt>Zettel ID</dt>
         <dd>{detail.zettelId||"--"}</dd>
        </div>

        <div>
         <dt>Project</dt>
         <dd>{displayValue(detail.projectIds?.length?detail.projectIds:detail.projectId)}</dd>
        </div>

        <div>
         <dt>Subtype</dt>
         <dd>{displaySubtype(detail.subtype)}</dd>
        </div>

        <div>
         <dt>Main Idea</dt>
         <dd><RichTextContent value={detail.mainIdea}/></dd>
        </div>

        <div>
         <dt>Body</dt>
         <dd><RichTextContent value={detail.body}/></dd>
        </div>

        <div>
         <dt>Sources</dt>
         <dd><LinkedRecordList records={detail.sourceIds} type="source"/></dd>
        </div>

        <div>
         <dt>Entities</dt>
         <dd><LinkedRecordList records={detail.entityIds} type="entity"/></dd>
        </div>

        <div>
         <dt>Origin Fleeting Note</dt>
         <dd>{displayValue(detail.originFleetingNoteId)}</dd>
        </div>

        <div>
         <dt>Future Use</dt>
         <dd>{displayValue(detail.futureUse)}</dd>
        </div>

        <div>
         <dt>Questions</dt>
         <dd>{displayValue(detail.questions)}</dd>
        </div>

        <div>
         <dt>Tags</dt>
         <dd>{displayValue(detail.tags)}</dd>
        </div>

        <div>
         <dt>Favorite</dt>
         <dd>{detail.isFavorite?"Yes":"No"}</dd>
        </div>

        <div>
         <dt>Status</dt>
         <dd>{detail.status||"--"}</dd>
        </div>

        <div>
         <dt>Created</dt>
         <dd>{formatDateTime(detail.createdAt)}</dd>
        </div>

        <div>
         <dt>Updated</dt>
         <dd>{formatDateTime(detail.updatedAt)}</dd>
        </div>
       </dl>
      </article>
     )}
    </Modal.Body>

    <Modal.Footer>
     <Button
      variant={detail?.isFavorite?"primary":"outline-primary"}
      onClick={()=>toggleFavorite(detail)}
     >
      {detail?.isFavorite?"Unfavorite":"Favorite"}
     </Button>

     <Button variant="outline-secondary" onClick={()=>{openEdit(detail);setDetail(null);}}>
      Edit
     </Button>

     <Button variant="secondary" onClick={()=>setDetail(null)}>
      Close
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default ZettelsPage;
