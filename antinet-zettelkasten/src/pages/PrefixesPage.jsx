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
import PrefixForm from "./forms/PrefixForm.jsx";

const emptyPrefix={
 recordType:"",
 name:"",
 code:"",
 description:"",
 isActive:true
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

function PrefixesPage(){
 const userId=getStoredUserId();

 const [prefixes,setPrefixes]=useState([]);
 const [form,setForm]=useState({...emptyPrefix});
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
    `/api/prefixes?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load prefixes"
    );
   }

   setPrefixes(
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
  setForm({...emptyPrefix});
  setEditing({});
 };

 const openEdit=prefix=>{
  setForm({
   recordType:prefix.recordType||"",
   name:prefix.name||"",
   code:prefix.code||"",
   description:prefix.description||"",
   isActive:prefix.isActive!==false
  });

  setEditing(prefix);
 };

 const openDetail=async prefix=>{
  try{
   setError("");

   const response=await fetch(
    `/api/prefixes/${prefix._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load prefix"
    );
   }

   setDetail(data?.data||prefix);
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
    recordType:form.recordType,
    name:form.name,
    code:form.code,
    description:form.description,
    isActive:form.isActive
   };

   const response=await fetch(
    id
     ?`/api/prefixes/${id}`
     :"/api/prefixes",
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
     "Unable to save prefix"
    );
   }

   setEditing(null);
   setForm({...emptyPrefix});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const toggleActive=async prefix=>{
  try{
   setError("");

   const response=await fetch(
    `/api/prefixes/${prefix._id}`,
    {
     method:"PUT",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({
      userId,
      isActive:prefix.isActive===false
     })
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to update prefix"
    );
   }

   setPrefixes(current=>
    current.map(item=>
     item._id===prefix._id
      ?data.data
      :item
    )
   );

   if(detail?._id===prefix._id){
    setDetail(data.data);
   }
  }catch(updateError){
   setError(updateError.message);
  }
 };

 const remove=async prefix=>{
  if(!window.confirm(`Delete ${prefix.name||prefix.code}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/prefixes/${prefix._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to delete prefix"
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
     Log in to manage prefixes.
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
      Record ID Configuration
     </p>

     <h1 className="mb-0">Prefixes</h1>
    </div>

    <Button onClick={openCreate}>
     Add Prefix
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

   {!prefixes.length?(
    <Alert variant="light">
     No prefixes yet.
    </Alert>
   ):(
    <Table responsive hover className="align-middle workflow-table">
     <thead>
      <tr>
       <th>Record Type</th>
       <th>Prefix</th>
       <th>Name</th>
       <th>Description</th>
       <th>Active</th>
       <th>Actions</th>
      </tr>
     </thead>

     <tbody>
      {prefixes.map(prefix=>(
       <tr key={prefix._id}>
        <td>
         <code>{prefix.recordType||"—"}</code>
        </td>

        <td>
         <Button
          variant="link"
          className="p-0 text-decoration-none"
          onClick={()=>openDetail(prefix)}
         >
          <code>{prefix.code||"—"}</code>
         </Button>
        </td>

        <td>{prefix.name||"—"}</td>
        <td>{prefix.description||"—"}</td>
        <td>{prefix.isActive===false?"No":"Yes"}</td>

        <td className="workflow-actions">
         <ButtonGroup size="sm">
          <Button
           variant="outline-secondary"
           onClick={()=>openEdit(prefix)}
          >
           Edit
          </Button>

          <Button
           variant={
            prefix.isActive===false
             ?"outline-success"
             :"outline-warning"
           }
           onClick={()=>toggleActive(prefix)}
          >
           {prefix.isActive===false
            ?"Activate"
            :"Deactivate"}
          </Button>

          <Button
           variant="outline-danger"
           onClick={()=>remove(prefix)}
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
       ?"Edit Prefix"
       :"Add Prefix"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <PrefixForm
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
       <h2>{detail.name||"Prefix"}</h2>

       <dl>
        <div>
         <dt>Record Type</dt>
         <dd>{detail.recordType||"—"}</dd>
        </div>

        <div>
         <dt>Prefix Code</dt>
         <dd>{detail.code||"—"}</dd>
        </div>

        <div>
         <dt>Active</dt>
         <dd>{detail.isActive===false?"No":"Yes"}</dd>
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

export default PrefixesPage;
