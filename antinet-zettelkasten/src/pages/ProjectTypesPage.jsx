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
import ProjectTypeForm from "./forms/ProjectTypeForm.jsx";

const emptyProjectType={
 name:"",
 code:"",
 description:"",
 status:"active"
};

// Helper: normalize IDs from strings and stored user records
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

// Helper: format stored timestamps
const formatDateTime=value=>{
 if(!value)return "—";

 const date=new Date(value);

 return Number.isNaN(date.getTime())?"—":date.toLocaleString();
};

function ProjectTypesPage(){
 const userId=getStoredUserId();

 const [projectTypes,setProjectTypes]=useState([]);
 const [form,setForm]=useState({...emptyProjectType});
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

   const response=await fetch(
    `/api/project-types?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load project types"
    );
   }

   setProjectTypes(
    Array.isArray(data?.data)
     ?data.data
     :[]
   );
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
  setForm({...emptyProjectType});
  setEditing({});
 };

 const openEdit=projectType=>{
  setForm({
   name:projectType.name||"",
   code:projectType.code||"",
   description:projectType.description||"",
   status:projectType.status||"active"
  });

  setEditing(projectType);
 };

 const openDetail=async projectType=>{
  try{
   setError("");

   const response=await fetch(
    `/api/project-types/${projectType._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load project type"
    );
   }

   setDetail(data?.data||projectType);
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
    name:form.name,
    code:form.code,
    description:form.description,
    status:form.status
   };

   const response=await fetch(
    id
     ?`/api/project-types/${id}`
     :"/api/project-types",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify(payload)
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to save project type"
    );
   }

   setEditing(null);
   setForm({...emptyProjectType});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async projectType=>{
  try{
   setError("");

   const response=await fetch(
    `/api/project-types/${projectType._id}/archive`,
    {
     method:"PATCH",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({userId})
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to archive project type"
    );
   }

   setProjectTypes(current=>
    current.map(item=>
     item._id===projectType._id
      ?data.data
      :item
    )
   );

   if(detail?._id===projectType._id){
    setDetail(data.data);
   }
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const remove=async projectType=>{
  if(!window.confirm(`Delete ${projectType.name}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/project-types/${projectType._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to delete project type"
    );
   }

   setDetail(null);
   await load();
  }catch(deleteError){
   setError(deleteError.message);
  }
 };

 if(!userId){
  return(
   <Container className="py-5">
    <Alert variant="info">
     Log in to manage project types.
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
  <Container className="py-5">
   <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
    <div>
     <p className="dashboard-section-kicker mb-1">
      Project Configuration
     </p>

     <h1 className="mb-0">Project Types</h1>
    </div>

    <Button onClick={openCreate}>
     Add Project Type
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

   {!projectTypes.length?(
    <Alert variant="light">
     No project types yet.
    </Alert>
   ):(
    <Table responsive hover className="align-middle workflow-table">
     <thead>
      <tr>
       <th>Name</th>
       <th>Code</th>
       <th>Description</th>
       <th>Status</th>
       <th>Actions</th>
      </tr>
     </thead>

     <tbody>
      {projectTypes.map(projectType=>(
       <tr key={projectType._id}>
        <td>
         <Button
          variant="link"
          className="p-0 text-start text-decoration-none"
          onClick={()=>openDetail(projectType)}
         >
          {projectType.name||"—"}
         </Button>
        </td>

        <td>
         <code>{projectType.code||"—"}</code>
        </td>

        <td>{projectType.description||"—"}</td>
        <td>{projectType.status||"—"}</td>

        <td className="workflow-actions">
         <ButtonGroup size="sm">
          <Button
           variant="outline-secondary"
           onClick={()=>openEdit(projectType)}
          >
           Edit
          </Button>

          <Button
           variant="outline-warning"
           disabled={projectType.status==="archived"}
           onClick={()=>archive(projectType)}
          >
           Archive
          </Button>

          <Button
           variant="outline-danger"
           onClick={()=>remove(projectType)}
          >
           Delete
          </Button>
         </ButtonGroup>
        </td>
       </tr>
      ))}
     </tbody>
    </Table>
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
      {editing?._id
       ?"Edit Project Type"
       :"Add Project Type"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <ProjectTypeForm
      form={form}
      setForm={setForm}
      editing={editing}
      saving={saving}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

   <Modal
    className="workflow-modal"
    show={!!detail}
    onHide={()=>setDetail(null)}
    centered
    size="lg"
   >
    <Modal.Header closeButton>
     <Modal.Title>{detail?.name}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {detail&&(
      <article className="workflow-record-view">
       <h2>{detail.name||"Project Type"}</h2>

       <dl>
        <div>
         <dt>Code</dt>
         <dd>{detail.code||"—"}</dd>
        </div>

        <div>
         <dt>Status</dt>
         <dd>{detail.status||"—"}</dd>
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

       <section>
        <h3>Description</h3>

        <p style={{whiteSpace:"pre-wrap"}}>
         {detail.description||"—"}
        </p>
       </section>
      </article>
     )}
    </Modal.Body>

    <Modal.Footer>
     <Button
      variant="outline-primary"
      onClick={()=>{
       openEdit(detail);
       setDetail(null);
      }}
     >
      Edit
     </Button>

     <Button
      variant="secondary"
      onClick={()=>setDetail(null)}
     >
      Close
     </Button>
    </Modal.Footer>
   </Modal>
  </Container>
 );
}

export default ProjectTypesPage;
