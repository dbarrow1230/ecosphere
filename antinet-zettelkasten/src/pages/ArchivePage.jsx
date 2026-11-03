import {useCallback,useEffect,useState} from "react";
import {Alert,Button,Container,Spinner} from "react-bootstrap";
import {Link} from "react-router-dom";
import "../styles/ArchivePage.css";
import KnowledgeWorkflowWorkspace from "../components/KnowledgeWorkflowWorkspace.jsx";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id?.$oid||value.id?.$oid||value._id||value.id||value.$oid||"";
};

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const user=parsed?.user||parsed?.data||parsed;
   const id=getObjectId(user);
   if(id)return id;
  }catch{
   continue;
  }
 }
 return "";
};

const definitions=[
 {key:"sources",label:"Sources",endpoint:"sources",dataKey:"sources",idField:"sourceId",titleField:"title",path:"/references",direct:true},
 {key:"entities",label:"Entities",endpoint:"entities",dataKey:"entities",idField:"entityId",titleField:"name",path:"/entities",direct:true},
 {key:"zettels",label:"Zettels",endpoint:"zettels",dataKey:"zettels",idField:"zettelId",titleField:"title",path:"/notes",direct:true},
 {key:"connections",label:"Connections",endpoint:"connections",dataKey:"connections",idField:"connectionId",titleField:"reason",path:"/links"},
 {key:"structures",label:"Structure Notes",endpoint:"structure-notes",dataKey:"structureNotes",idField:"structureNoteId",titleField:"title",path:"/structures",direct:true},
 {key:"outputs",label:"Outputs",endpoint:"outputs",dataKey:"outputs",idField:"outputId",titleField:"title",path:"/outputs",direct:true},
 {key:"projects",label:"Projects",endpoint:"projects",dataKey:"projects",idField:"projectId",titleField:"title",path:"/projects"}
];

function ArchivePage(){
 const userId=getStoredUserId();
 const [groups,setGroups]=useState({});
 const [selected,setSelected]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [category,setCategory]=useState("all");

 const load=useCallback(async()=>{
  if(!userId){setLoading(false);return;}
  setLoading(true);
  setError("");

  try{
   const results=await Promise.all(definitions.map(async definition=>{
    const params=new URLSearchParams({userId,status:"archived"});
    const response=await fetch(`/api/${definition.endpoint}?${params.toString()}`,{credentials:"include"});
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(data?.message||`Unable to load archived ${definition.label.toLowerCase()}`);
    return [definition.key,Array.isArray(data?.data)?data.data:[]];
   }));
   const loadedGroups=Object.fromEntries(results);
   const loadedRecords=definitions.flatMap(definition=>(loadedGroups[definition.key]||[]).map(record=>({...record,_archiveDefinition:definition})));
   setGroups(loadedGroups);
   setSelected(current=>loadedRecords.find(record=>getObjectId(record)===getObjectId(current))||loadedRecords[0]||null);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{queueMicrotask(load);},[load]);

 if(!userId)return <Container fluid className="archive-page"><Alert variant="info">Log in to view the archive.</Alert></Container>;
 if(loading)return <Container fluid className="archive-page archive-page-loading"><Spinner animation="border"/></Container>;

 const archivedCount=definitions.reduce((total,definition)=>total+(groups[definition.key]?.length||0),0);
 const populatedDefinitions=definitions.filter(definition=>(groups[definition.key]?.length||0)>0);
 const archivedRecords=populatedDefinitions
  .filter(definition=>category==="all"||definition.key===category)
  .flatMap(definition=>(groups[definition.key]||[]).map(record=>({...record,_archiveDefinition:definition})));

 const chooseCategory=nextCategory=>{
  setCategory(nextCategory);
  const nextRecords=populatedDefinitions
   .filter(definition=>nextCategory==="all"||definition.key===nextCategory)
   .flatMap(definition=>(groups[definition.key]||[]).map(record=>({...record,_archiveDefinition:definition})));
  setSelected(nextRecords[0]||null);
 };

 return(
  <Container fluid className="archive-page">
    <header className="archive-page-header">
     <div>
      <p className="archive-page-eyebrow">Review stored work</p>
      <h1 className="archive-page-title">Archive</h1>
      <p className="archive-page-lead">Find and review records moved out of your active workspace.</p>
     </div>
     <div className="archive-total" aria-label={`${archivedCount} archived records`}>
      <strong>{archivedCount}</strong>
      <span>{archivedCount===1?"archived record":"archived records"}</span>
     </div>
    </header>

    {error&&<Alert variant="danger">{error}</Alert>}

    {populatedDefinitions.length>1&&<div className="archive-summary" aria-label="Filter archived records by type">
     <button type="button" className={`archive-summary-card${category==="all"?" is-active":""}`} onClick={()=>chooseCategory("all")}>
      <span>All records</span><strong>{archivedCount}</strong>
     </button>
     {populatedDefinitions.map(definition=>{
      const count=groups[definition.key]?.length||0;
      return(
       <button type="button" className={`archive-summary-card${category===definition.key?" is-active":""}`} key={definition.key} onClick={()=>chooseCategory(definition.key)}>
        <span>{definition.label}</span>
        <strong>{count}</strong>
       </button>
      );
     })}
    </div>}

    <div className="archive-records">
     {selected&&(
      <KnowledgeWorkflowWorkspace eyebrow="Archive" title={category==="all"?"All archived records":selected._archiveDefinition.label} records={archivedRecords} selectedId={getObjectId(selected)} getRecordId={record=>record[record._archiveDefinition.idField]} getRecordTitle={record=>record[record._archiveDefinition.titleField]||"Archived record"} onSelect={setSelected} header={<><code>{selected[selected._archiveDefinition.idField]}</code><h2>{selected[selected._archiveDefinition.titleField]||"Archived record"}</h2><p>{selected.description||selected.summary||selected.reason||selected._archiveDefinition.label}</p></>} actions={<Button as={Link} to={selected._archiveDefinition.direct?`${selected._archiveDefinition.path}/${getObjectId(selected)}`:selected._archiveDefinition.path} size="sm" variant="outline-primary">Open record</Button>}>
       <article className="record-detail"><dl><div><dt>Record Type</dt><dd>{selected._archiveDefinition.label}</dd></div><div><dt>Status</dt><dd>{selected.status||"archived"}</dd></div><div><dt>Archived</dt><dd>{selected.updatedAt?new Date(selected.updatedAt).toLocaleString():"Date unavailable"}</dd></div>{selected.domainId&&<div><dt>Domain</dt><dd>{selected.domainId.name||selected.domainId.code||"--"}</dd></div>}</dl></article>
      </KnowledgeWorkflowWorkspace>
     )}

     {!error&&!archivedCount&&(
      <div className="archive-empty">
       <h2>Your archive is empty</h2>
       <p>Records you archive will be collected here by type.</p>
      </div>
     )}
    </div>
  </Container>
 );
}

export default ArchivePage;
