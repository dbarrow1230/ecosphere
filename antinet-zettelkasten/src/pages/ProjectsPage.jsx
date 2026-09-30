import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useState} from "react";
import {
 Alert,
 Button,
 ButtonGroup,
 Container,
 Modal,
 Spinner,
 Table
} from "react-bootstrap";
import ProjectForm from "./forms/ProjectForm.jsx";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";

const emptyProject={
 title:"",
 code:"",
 typeId:"",
 description:"",
 tags:"",
 status:"active",
 isFavorite:false,
 isArchived:false
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

// Helper: display populated references and plain values
const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value
   .map(item=>displayValue(item))
   .filter(item=>item!=="—");

  return labels.length?labels.join(", "):"—";
 }

 if(value&&typeof value==="object"){
  return(
   value.projectTypeId||
   value.projectId||
   value.name||
   value.title||
   value.code||
   getObjectId(value)||
   "—"
  );
 }

 return value===null||value===undefined||value===""?"—":String(value);
};

const splitList=value=>{
 if(Array.isArray(value))return value.map(item=>String(item||"").trim()).filter(Boolean);
 return String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
};

const textList=value=>{
 return Array.isArray(value)?value.join(", "):String(value||"");
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

function ProjectsPage(){
 const userId=getStoredUserId();

 const [projects,setProjects]=useState([]);
 const [types,setTypes]=useState([]);
 const [form,setForm]=useState({...emptyProject});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [projectView,setProjectView]=useState("active");

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
    projectData,
    typeData
   ]=await Promise.all([
    fetchList(`/api/projects${query}&includeArchived=true`,true),
    fetchList(`/api/project-types${query}`)
   ]);

   setProjects(projectData);
   setDetail(current=>projectData.find(record=>record._id===current?._id)||projectData[0]||null);
   setTypes(typeData);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const openCreate=()=>{
  setForm({...emptyProject});
  setEditing({});
 };

 const openEdit=project=>{
  setForm({
   domainId:getObjectId(project.domainId),
   domainCode:project.domainId?.code||"",
   title:project.title||"",
   code:project.code||"",
   typeId:getObjectId(project.typeId),
   description:project.description||"",
   tags:textList(project.tags),
   status:project.status||"active",
   isFavorite:Boolean(project.isFavorite),
   isArchived:Boolean(
    project.isArchived||
    project.status==="archived"
   )
  });

  setEditing(project);
 };

 const openDetail=async project=>{
  try{
   setError("");

   const response=await fetch(
    `/api/projects/${project._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load project");
   }

   setDetail(data?.data||project);
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
    project:form.title,
    title:form.title,
    code:form.code,
    typeId:form.typeId||null,
    domainId:form.domainId||null,
    description:form.description,
    tags:splitList(form.tags),
    status:form.status,
    isFavorite:form.isFavorite,
    isArchived:
     form.isArchived||
     form.status==="archived"
   };

   const response=await fetch(
    id
     ?`/api/projects/${id}`
     :"/api/projects",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to save project");
   }

   setEditing(null);
   setForm({...emptyProject});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async project=>{
  try{
   setError("");

   const response=await fetch(
    `/api/projects/${project._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to archive project");
   }

   await load();
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const restore=async project=>{
  try{
   setError("");
   const response=await fetch(`/api/projects/${project._id}/restore`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({userId})
   });
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to restore project");
   await load();
  }catch(restoreError){
   setError(restoreError.message);
  }
 };

 const visibleProjects=projects.filter(project=>projectView==="archived"
  ?project.status==="archived"||project.isArchived
  :project.status!=="archived"&&!project.isArchived);

 const toggleFavorite=async project=>{
  try{
   setError("");

   const response=await fetch(
    `/api/projects/${project._id}/favorite`,
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

   setProjects(current=>
    current.map(item=>
     item._id===project._id
      ?data.data
      :item
    )
   );

   if(detail?._id===project._id){
    setDetail(data.data);
   }
  }catch(favoriteError){
   setError(favoriteError.message);
  }
 };

 const remove=async project=>{
  if(!window.confirm(`Delete ${project.projectId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/projects/${project._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to delete project");
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
     Log in to manage projects.
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
      Organization
     </p>

     <h1 className="mb-0">Projects</h1>
    </div>

    <Button size="sm" className="w-auto text-nowrap" onClick={openCreate}>
     Add Project
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

   <ButtonGroup size="sm" className="mb-3">
    <Button variant={projectView==="active"?"primary":"outline-primary"} onClick={()=>{setProjectView("active");setDetail(projects.find(project=>project.status!=="archived"&&!project.isArchived)||null);}}>Active Projects</Button>
    <Button variant={projectView==="archived"?"primary":"outline-primary"} onClick={()=>{setProjectView("archived");setDetail(projects.find(project=>project.status==="archived"||project.isArchived)||null);}}>Project Archive</Button>
   </ButtonGroup>

   {!visibleProjects.length?(
    <Alert variant="light">
     No {projectView} projects.
    </Alert>
   ):(
    <KnowledgeWorkflowWorkspace eyebrow={projectView==="archived"?"Project archive":"Work areas"} title="Projects / Collections" records={visibleProjects} selectedId={detail?._id} getRecordId={record=>record.projectId} getRecordTitle={record=>record.title||"Untitled"} isFavorite={record=>record.isFavorite} onSelect={openDetail} header={detail&&<><code>{detail.projectId}</code><h2>{detail.title||"Projects / Collections"}</h2><p>{detail.description||detail.purpose||detail.summary||"Knowledge workflow record"}</p></>} actions={detail&&<ButtonGroup size="sm"><Button variant={detail.isFavorite?"primary":"outline-primary"} onClick={()=>toggleFavorite(detail)}>{detail.isFavorite?"Unfavorite":"Favorite"}</Button><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button>{projectView==="archived"?<Button variant="outline-success" onClick={()=>restore(detail)}>Restore</Button>:<Button variant="outline-warning" onClick={()=>archive(detail)}>Archive</Button>}<Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}>
     {detail&&<article className="record-detail"><dl>
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div><div><dt>Project</dt><dd>{detail.title||"--"}</dd></div><div><dt>Code</dt><dd>{detail.code||"--"}</dd></div><div><dt>Project Type</dt><dd>{detail.typeId?.name||displayValue(detail.typeId)}</dd></div><div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div><div><dt>Tags</dt><dd>{displayValue(detail.tags)}</dd></div></dl><section><h3>Description</h3><p>{detail.description||"--"}</p></section></article>}
    </KnowledgeWorkflowWorkspace>
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
      {editing?._id?"Edit Project":"Add Project"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <ProjectForm
      form={form}
      setForm={setForm}
      types={types}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default ProjectsPage;
