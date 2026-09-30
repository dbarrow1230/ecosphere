import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useState} from "react";
import {
 Alert,
 Button,
 ButtonGroup,
 Container,
 Modal,
 Nav,
 Spinner,
 Tab,
 Tabs
} from "react-bootstrap";
import {useParams} from "react-router-dom";
import StructureNoteForm from "./forms/StructureNoteForm.jsx";
import StructureWritingModal from "../components/StructureWritingModal.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import RecordPreviewPopover from "../components/RecordPreviewPopover.jsx";
import "../styles/RecordDetail.css";
import "../styles/StructureNotes.css";

const emptyStructure={
 projectId:"",
 projectIds:[],
 subjectCode:"",
 subtype:"STUDYMAP",
 title:"",
 purpose:"",
 summary:"",
 outline:"",
 zettelIds:[],
 pathEntries:[],
 sourceIds:[],
 entityIds:[],
 orderEntries:[],
 tags:"",
 status:"draft",
 isFavorite:false
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

// Helper: convert stored structure paths into editable ordered entries
const structurePathEntries=structure=>{
 if(Array.isArray(structure?.pathEntries)&&structure.pathEntries.length){
  return structure.pathEntries
   .map(entry=>({
    zettelId:getObjectId(entry?.zettelId),
    annotation:entry?.annotation||""
   }))
   .filter(entry=>entry.zettelId);
 }

 return selectedIds(structure?.zettelIds).map(zettelId=>({zettelId,annotation:""}));
};

const structureOrderEntries=structure=>{
 if(Array.isArray(structure?.orderEntries)&&structure.orderEntries.length){
  return structure.orderEntries.map(entry=>({recordType:entry?.recordType,recordId:getObjectId(entry?.recordId)})).filter(entry=>entry.recordType&&entry.recordId);
 }
 return [
  ...selectedIds(structure?.zettelIds).map(recordId=>({recordType:"zettel",recordId})),
  ...selectedIds(structure?.sourceIds).map(recordId=>({recordType:"source",recordId})),
  ...selectedIds(structure?.entityIds).map(recordId=>({recordType:"entity",recordId}))
 ];
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

const orderedRecordDetails=(structure,entry)=>{
 const field=entry.recordType==="zettel"?"zettelIds":entry.recordType==="source"?"sourceIds":"entityIds";
 const record=(structure?.[field]||[]).find(item=>getObjectId(item)===getObjectId(entry.recordId));
 return {
  type:entry.recordType,
  record,
  code:record?.zettelId||record?.sourceId||record?.entityId||getObjectId(entry.recordId),
  title:record?.title||record?.name||"Untitled record"
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

function StructureNotesPage(){
 const {id:routeId}=useParams();
 const userId=getStoredUserId();

 const [structures,setStructures]=useState([]);
 const [projects,setProjects]=useState([]);
 const [zettels,setZettels]=useState([]);
 const [sources,setSources]=useState([]);
 const [entities,setEntities]=useState([]);
 const [form,setForm]=useState({...emptyStructure});
 const [editing,setEditing]=useState(null);
 const [writingId,setWritingId]=useState("");
 const [detail,setDetail]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [createTab,setCreateTab]=useState("details");

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
    structureData,
    projectData,
    zettelData,
    sourceData,
    entityData
   ]=await Promise.all([
    fetchList(`/api/structure-notes${query}`,true),
    fetchList(`/api/projects${query}`),
    fetchList(`/api/zettels${query}`),
    fetchList(`/api/sources${query}`),
    fetchList(`/api/entities${query}`)
   ]);

   setStructures(structureData);
   setDetail(current=>structureData.find(record=>record._id===routeId)||structureData.find(record=>record._id===current?._id)||structureData[0]||null);
   setProjects(projectData);
   setZettels(zettelData);
   setSources(sourceData);
   setEntities(entityData);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId,routeId]);

 useEffect(()=>{
  queueMicrotask(load);
 },[load]);

 const openCreate=()=>{
  setCreateTab("details");
  setForm({...emptyStructure});
  setEditing({});
 };

 const openCreateFromNotes=()=>{
  setCreateTab("relationships");
  setForm({...emptyStructure});
  setEditing({});
 };

 const openEdit=structure=>{
  setForm({
   domainId:getObjectId(structure.domainId),
   domainCode:structure.domainId?.code||"",
   projectId:getObjectId(structure.projectId),
   projectIds:[...new Set([...(structure.projectIds||[]),structure.projectId].map(getObjectId).filter(Boolean))],
   subjectCode:"",
   subtype:structure.subtype||"STUDYMAP",
   title:structure.title||"",
   purpose:structure.purpose||"",
   summary:structure.summary||"",
   outline:structure.outline||"",
   zettelIds:selectedIds(structure.zettelIds),
   pathEntries:structurePathEntries(structure),
   sourceIds:selectedIds(structure.sourceIds),
   entityIds:selectedIds(structure.entityIds),
   orderEntries:structureOrderEntries(structure),
   tags:textList(structure.tags),
   status:structure.status||"draft",
   isFavorite:Boolean(structure.isFavorite)
  });

  setEditing(structure);
 };

 const openDetail=async structure=>{
  try{
   setError("");

   const response=await fetch(
    `/api/structure-notes/${structure._id}?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to load structure note"
    );
   }

   setDetail(data?.data||structure);
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
    projectId:form.projectId||null,
    domainId:form.domainId||null,
    projectIds:form.projectIds,
    subtype:form.subtype,
    title:form.title,
    purpose:form.purpose,
    summary:form.summary,
    outline:form.outline,
    zettelIds:form.zettelIds,
    pathEntries:form.pathEntries,
    sourceIds:form.sourceIds,
    entityIds:form.entityIds,
    orderEntries:form.orderEntries,
    tags:splitList(form.tags),
    status:form.status,
    isFavorite:form.isFavorite
   };

   if(!id){
    payload.subjectCode=form.subjectCode;
   }

   const response=await fetch(
    id
     ?`/api/structure-notes/${id}`
     :"/api/structure-notes",
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
     "Unable to save structure note"
    );
   }

   setEditing(null);
   setForm({...emptyStructure});
   await load();
  }catch(saveError){
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 const archive=async structure=>{
  try{
   setError("");

   const response=await fetch(
    `/api/structure-notes/${structure._id}/archive`,
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
     "Unable to archive structure note"
    );
   }

   setDetail(null);
   await load();
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 const toggleFavorite=async structure=>{
  try{
   setError("");

   const response=await fetch(
    `/api/structure-notes/${structure._id}/favorite`,
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
     "Unable to update favorite"
    );
   }

   setStructures(current=>
    current.map(item=>
     item._id===structure._id
      ?data.data
      :item
    )
   );

   if(detail?._id===structure._id){
    setDetail(data.data);
   }
  }catch(favoriteError){
   setError(favoriteError.message);
  }
 };

 const remove=async structure=>{
  if(!window.confirm(`Delete ${structure.structureNoteId}?`))return;

  try{
   setError("");

   const response=await fetch(
    `/api/structure-notes/${structure._id}?userId=${encodeURIComponent(userId)}`,
    {
     method:"DELETE",
     credentials:"include"
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(
     data?.message||
     "Unable to delete structure note"
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
   <Container fluid className="py-5 px-4">
    <Alert variant="info">
     Log in to manage structure notes.
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
      6. Arrange Zettels Into an Ordered Path
     </p>

     <h1 className="mb-0">Structure Notes</h1>
    </div>

    <ButtonGroup size="sm">
     <Button className="w-auto text-nowrap" onClick={openCreateFromNotes}>Create From Notes</Button>
     <Button variant="outline-primary" className="w-auto text-nowrap" onClick={openCreate}>Blank Structure Note</Button>
    </ButtonGroup>
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

   {!structures.length?(
    <Alert variant="light">
     No structure notes yet.
    </Alert>
   ):(
    <KnowledgeWorkflowWorkspace eyebrow="Knowledge maps" title="Structure notes" records={structures} selectedId={detail?._id} getRecordId={record=>record.structureNoteId} getRecordTitle={record=>record.title||"Untitled"} getSearchText={record=>[record.purpose,record.summary,record.outline,...(record.tags||[]),...(record.zettelIds||[]).map(note=>`${note.title||""} ${note.mainIdea||""}`)].map(richTextToPlainText).join(" ")} isFavorite={record=>record.isFavorite} onSelect={openDetail} header={detail&&<><h2 className="structure-reader-title"><span>{detail.title||"Structure notes"}</span><code>{detail.structureNoteId}</code></h2><p>{richTextToPlainText(detail.description)||richTextToPlainText(detail.purpose)||richTextToPlainText(detail.summary)||"Knowledge workflow record"}</p></>} actions={detail&&<ButtonGroup size="sm"><Button variant="primary" onClick={()=>setWritingId(detail._id)}>Start writing</Button><Button variant={detail.isFavorite?"primary":"outline-primary"} onClick={()=>toggleFavorite(detail)}>{detail.isFavorite?"Unfavorite":"Favorite"}</Button><Button variant="outline-secondary" onClick={()=>openEdit(detail)}>Edit</Button><Button variant="outline-warning" disabled={detail.status==="archived"} onClick={()=>archive(detail)}>Archive</Button><Button variant="outline-danger" onClick={()=>remove(detail)}>Delete</Button></ButtonGroup>}>
     {detail&&<Tabs defaultActiveKey="overview" className="structure-detail-tabs">
      <Tab eventKey="overview" title="Overview">
       <article className="record-detail structure-detail-panel">
        <dl>
<div><dt>Domain</dt><dd><DomainName domain={detail.domainId}/></dd></div>
         <div><dt>ID</dt><dd>{detail.structureNoteId}</dd></div>
         <div><dt>Subtype</dt><dd>{displayValue(detail.subtype)}</dd></div>
         <div><dt>Projects</dt><dd><ProjectRecordList projects={detail.projectIds} fallback={detail.projectId}/></dd></div>
         <div><dt>Status</dt><dd><WorkflowStatusBadge status={detail.status}/></dd></div>
         <div><dt>Tags</dt><dd>{displayValue(detail.tags)}</dd></div>
        </dl>

        <section>
         <h3>Purpose</h3>
         <RichTextContent value={detail.purpose}/>
        </section>

        <section>
         <h3>Summary</h3>
         <RichTextContent value={detail.summary}/>
        </section>

        <section>
         <h3>Outline</h3>
         <div style={{whiteSpace:"pre-wrap"}}>
          {detail.outline||"—"}
         </div>
        </section>
       </article>
      </Tab>

      <Tab eventKey="relationships" title="Sources & Links">
       <div className="structure-detail-panel">
        <Tab.Container defaultActiveKey="zettels">
         <div className="structure-relationship-layout">
          <Tab.Content>
           <Tab.Pane eventKey="zettels"><LinkedRecordList records={detail.zettelIds} type="zettel" previewOnly/></Tab.Pane>
           <Tab.Pane eventKey="sources"><LinkedRecordList records={detail.sourceIds} type="source" previewOnly/></Tab.Pane>
           <Tab.Pane eventKey="entities"><LinkedRecordList records={detail.entityIds} type="entity" previewOnly/></Tab.Pane>
          </Tab.Content>

          <Nav variant="tabs" className="flex-column structure-relationship-tabs">
           <Nav.Item className="structure-relationship-tab-item"><Nav.Link as="a" eventKey="zettels"><span className="structure-relationship-tab-label">Zettels</span></Nav.Link></Nav.Item>
           <Nav.Item className="structure-relationship-tab-item"><Nav.Link as="a" eventKey="sources"><span className="structure-relationship-tab-label">Sources</span></Nav.Link></Nav.Item>
           <Nav.Item className="structure-relationship-tab-item"><Nav.Link as="a" eventKey="entities"><span className="structure-relationship-tab-label">Entities</span></Nav.Link></Nav.Item>
          </Nav>
         </div>
        </Tab.Container>
       </div>
      </Tab>

      <Tab eventKey="order" title="Notes">
       <div className="structure-detail-panel">
        {structureOrderEntries(detail).length?(
         <ol className="structure-order-list structure-order-list-readonly">
          {structureOrderEntries(detail).map((entry,index)=>{
           const record=orderedRecordDetails(detail,entry);
           const pathEntry=entry.recordType==="zettel"
            ?structurePathEntries(detail).find(item=>getObjectId(item.zettelId)===getObjectId(entry.recordId))
            :null;

           return(
            <li className="structure-order-item" key={`${record.type}-${record.code}-${index}`}>
             <span className="structure-order-number">{index+1}</span>

             <span className="structure-order-record">
              <strong>{record.title}</strong>

              <RecordPreviewPopover
               record={record.record}
               code={record.code}
               title={record.title}
              />

              {pathEntry?.annotation&&(
               <p className="mb-0 mt-2">
                {pathEntry.annotation}
               </p>
              )}
             </span>
            </li>
           );
          })}
         </ol>
        ):(
         <p className="structure-order-empty">
          No records have been added to this structure note.
         </p>
        )}
       </div>
      </Tab>
     </Tabs>}
    </KnowledgeWorkflowWorkspace>
   )}

   {writingId&&<StructureWritingModal structureId={writingId} userId={userId} onClose={()=>setWritingId("")}/>}

   <Modal
    className="workflow-modal structure-note-modal"
    show={!!editing}
    onHide={()=>setEditing(null)}
    backdrop="static"
    keyboard={false}
    centered
    size="xl"
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?._id
       ?"Edit Structure Note"
       :"Add Structure Note"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <StructureNoteForm
      form={form}
      setForm={setForm}
      projects={projects}
      zettels={zettels}
      sources={sources}
      entities={entities}
      editing={editing}
      saving={saving}
      userId={userId}
      defaultTab={createTab}
      onSubmit={save}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default StructureNotesPage;
