import {useCallback,useEffect,useState} from "react";
import {
 Alert,
 Button,
 ButtonGroup,
 Container,
 Modal,
 Spinner,
 Tab,
 Tabs,
 Table
} from "react-bootstrap";
import RecordSubtypeForm from "./RecordSubtypeForm.jsx";

const emptyRecordSubtype={
 recordType:"",
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

function RecordSubtypesPage(){
 const userId=getStoredUserId();

 const [recordSubtypes,setRecordSubtypes]=useState([]);
 const [form,setForm]=useState({...emptyRecordSubtype});
 const [editing,setEditing]=useState(null);
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const recordTypeLabels={
  ENT:"Entities",
  FLT:"Fleeting Notes",
  OUT:"Outputs",
  SRC:"Sources",
  STR:"Structure Notes",
  ZTL:"Zettels",
  PRJ:"Projects",
  LNK:"Connections",
  ATT:"Attachments"
 };

 const load=useCallback(async()=>{
  if(!userId){
   setLoading(false);
   return;
  }

  try{
   setLoading(true);
   setError("");

   const response=await fetch(
    `/api/record-subtypes?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load record subtypes"
    );
   }

   setRecordSubtypes(
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
  setForm({...emptyRecordSubtype});
  setEditing({});
 };

 const openEdit=recordSubtype=>{
  setForm({
   recordType:recordSubtype.recordType||"",
   name:recordSubtype.name||"",
   code:recordSubtype.code||"",
   description:recordSubtype.description||"",
   status:recordSubtype.status||"active"
  });

  setEditing(recordSubtype);
 };

 const openDetail=async recordSubtype=>{
  try{
   setError("");

   const response=await fetch(
    `/api/record-subtypes/${recordSubtype._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load record subtype"
    );
   }

   setDetail(data?.data||recordSubtype);
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
    status:form.status
   };

   const response=await fetch(
    id
     ?`/api/record-subtypes/${id}`
     :"/api/record-subtypes",
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
     "Unable to save record subtype"
    );
   }

   setEditing(null);
   setForm({...emptyRecordSubtype});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async recordSubtype=>{
  try{
   setError("");

   const response=await fetch(
    `/api/record-subtypes/${recordSubtype._id}/archive`,
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
     "Unable to archive record subtype"
    );
   }

   setRecordSubtypes(current=>
    current.map(item=>
     item._id===recordSubtype._id
      ?data.data
      :item
    )
   );

   if(detail?._id===recordSubtype._id){
    setDetail(data.data);
   }
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const remove=async recordSubtype=>{
  if(!window.confirm(
   `Delete ${recordSubtype.recordType} - ${recordSubtype.name}?`
  ))return;

  try{
   setError("");

   const response=await fetch(
    `/api/record-subtypes/${recordSubtype._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to delete record subtype"
    );
   }

   setDetail(null);
   await load();
  }catch(deleteError){
   setError(deleteError.message);
  }
 };

 const recordTypeGroups=[...new Set(recordSubtypes.map(item=>item.recordType).filter(Boolean))]
  .sort()
  .map(recordType=>({
   recordType,
   records:recordSubtypes.filter(item=>item.recordType===recordType)
  }));

 const renderSubtypeTable=records=>(
  <Table responsive hover className="align-middle workflow-table mb-0">
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
    {records.map(recordSubtype=>(
     <tr key={recordSubtype._id}>
      <td>
       <Button variant="link" className="p-0 text-decoration-none" onClick={()=>openDetail(recordSubtype)}>
        <code>{recordSubtype.code||"—"}</code>
       </Button>
      </td>
      <td>{recordSubtype.name||"—"}</td>
      <td>{recordSubtype.description||"—"}</td>
      <td>{recordSubtype.status||"—"}</td>
      <td className="workflow-actions">
       <ButtonGroup size="sm">
        <Button variant="outline-secondary" onClick={()=>openEdit(recordSubtype)}>Edit</Button>
        <Button variant="outline-warning" disabled={recordSubtype.status==="archived"} onClick={()=>archive(recordSubtype)}>Archive</Button>
        <Button variant="outline-danger" onClick={()=>remove(recordSubtype)}>Delete</Button>
       </ButtonGroup>
      </td>
     </tr>
    ))}
   </tbody>
  </Table>
 );

 if(!userId){
  return(
   <Container fluid className="py-5 px-4">
    <Alert variant="info">
     Log in to manage record subtypes.
    </Alert>
   </Container>
  );
 }

 if(loading){
  return(
   <Container fluid className="py-5 px-4 text-center">
    <Spinner animation="border"/>
   </Container>
  );
 }

 return(
  <Container fluid className="py-5 px-4">
   <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
    <div>
     <p className="dashboard-section-kicker mb-1">
      Record Configuration
     </p>

     <h1 className="mb-0">Record Subtypes</h1>
    </div>

    <Button onClick={openCreate}>
     Add Record Subtype
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

   {!recordSubtypes.length?(
    <Alert variant="light">
     No record subtypes yet.
    </Alert>
   ):(
    <Tabs defaultActiveKey={recordTypeGroups[0]?.recordType} className="mb-3" mountOnEnter>
     {recordTypeGroups.map(group=>(
      <Tab
       key={group.recordType}
       eventKey={group.recordType}
       title={`${recordTypeLabels[group.recordType]||group.recordType} (${group.records.length})`}
      >
       {renderSubtypeTable(group.records)}
      </Tab>
     ))}
    </Tabs>
   )}

   <Modal
    className="workflow-modal"
    show={!!editing}
    onHide={()=>setEditing(null)}
    centered
    size="lg"
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?._id
       ?"Edit Record Subtype"
       :"Add Record Subtype"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <RecordSubtypeForm
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
     <Modal.Title>
      {detail?.recordType} - {detail?.code}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {detail&&(
      <article className="workflow-record-view">
       <h2>{detail.name||"Record Subtype"}</h2>

       <dl>
        <div>
         <dt>Record Type</dt>
         <dd>{detail.recordType||"—"}</dd>
        </div>

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

export default RecordSubtypesPage;
