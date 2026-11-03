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
import RelationTypeForm from "./forms/RelationTypeForm.jsx";

const emptyRelationType={
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

 return Number.isNaN(date.getTime())
  ?"—"
  :date.toLocaleString();
};

function RelationTypesPage(){
 const userId=getStoredUserId();

 const [relationTypes,setRelationTypes]=useState([]);
 const [form,setForm]=useState({...emptyRelationType});
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
    `/api/relation-types?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load relation types"
    );
   }

   setRelationTypes(
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
  setForm({...emptyRelationType});
  setEditing({});
 };

 const openEdit=relationType=>{
  setForm({
   name:relationType.name||"",
   code:relationType.code||"",
   description:relationType.description||"",
   status:relationType.status||"active"
  });

  setEditing(relationType);
 };

 const openDetail=async relationType=>{
  try{
   setError("");

   const response=await fetch(
    `/api/relation-types/${relationType._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load relation type"
    );
   }

   setDetail(data?.data||relationType);
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
     ?`/api/relation-types/${id}`
     :"/api/relation-types",
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
     "Unable to save relation type"
    );
   }

   setEditing(null);
   setForm({...emptyRelationType});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async relationType=>{
  try{
   setError("");

   const response=await fetch(
    `/api/relation-types/${relationType._id}/archive`,
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
     "Unable to archive relation type"
    );
   }

   setRelationTypes(current=>
    current.map(item=>
     item._id===relationType._id
      ?data.data
      :item
    )
   );

   if(detail?._id===relationType._id){
    setDetail(data.data);
   }
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const remove=async relationType=>{
  if(!window.confirm(`Delete ${relationType.name}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/relation-types/${relationType._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to delete relation type"
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
     Log in to manage relation types.
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
      Connection Configuration
     </p>

     <h1 className="mb-0">Relation Types</h1>
    </div>

    <Button onClick={openCreate}>
     Add Relation Type
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

   {!relationTypes.length?(
    <Alert variant="light">
     No relation types yet.
    </Alert>
   ):(
    <Table responsive hover className="align-middle workflow-table">
     <thead>
      <tr>
       <th>Code</th>
       <th>Name</th>
       <th>Description</th>
       <th>Status</th>
       <th>Actions</th>
      </tr>
     </thead>

     <tbody>
      {relationTypes.map(relationType=>(
       <tr key={relationType._id}>
        <td>
         <Button
          variant="link"
          className="p-0 text-decoration-none"
          onClick={()=>openDetail(relationType)}
         >
          <code>{relationType.code||"—"}</code>
         </Button>
        </td>

        <td>{relationType.name||"—"}</td>
        <td>{relationType.description||"—"}</td>
        <td>{relationType.status||"—"}</td>

        <td className="workflow-actions">
         <ButtonGroup size="sm">
          <Button
           variant="outline-secondary"
           onClick={()=>openEdit(relationType)}
          >
           Edit
          </Button>

          <Button
           variant="outline-warning"
           disabled={relationType.status==="archived"}
           onClick={()=>archive(relationType)}
          >
           Archive
          </Button>

          <Button
           variant="outline-danger"
           onClick={()=>remove(relationType)}
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
       ?"Edit Relation Type"
       :"Add Relation Type"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <RelationTypeForm
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
     <Modal.Title>{detail?.code}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {detail&&(
      <article className="workflow-record-view">
       <h2>{detail.name||"Relation Type"}</h2>

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

export default RelationTypesPage;
