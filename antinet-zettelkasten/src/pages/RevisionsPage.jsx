import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Container,Form,Spinner} from "react-bootstrap";
import RichTextContent from "../components/RichTextContent.jsx";
import "../styles/Revisions.css";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.$oid||value._id?.$oid||value._id||value.id?.$oid||value.id||"";
};

const getStoredUserId=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
  try{
   const parsed=JSON.parse(localStorage.getItem(key)||sessionStorage.getItem(key)||"null");
   const user=parsed?.user||parsed?.data||parsed;
   const userId=getObjectId(user);
   if(userId)return userId;
  }catch{
   continue;
  }
 }
 return "";
};

const formatDate=value=>{
 const date=new Date(value);
 return value&&!Number.isNaN(date.getTime())?date.toLocaleString():"—";
};

const recordKey=revision=>`${revision.parentModel}:${getObjectId(revision.parentRecordId)}`;
const recordName=revision=>revision.title||revision.parentDisplayId||"Untitled record";

const snapshotContent=revision=>revision.content||revision.snapshot?.body||revision.snapshot?.mainIdea||revision.snapshot?.rawCapture||revision.snapshot?.copiedText||revision.snapshot?.description||"";

const changedFields=(revision,previous)=>{
 if(!previous)return [];
 const current=revision.snapshot||{};
 const before=previous.snapshot||{};
 return [...new Set([...Object.keys(before),...Object.keys(current)])]
  .filter(key=>!["updatedAt","createdAt","__v"].includes(key))
  .filter(key=>JSON.stringify(before[key])!==JSON.stringify(current[key]));
};

function RevisionsPage(){
 const userId=getStoredUserId();
 const [revisions,setRevisions]=useState([]);
 const [selectedRecordKey,setSelectedRecordKey]=useState("");
 const [selectedRevisionId,setSelectedRevisionId]=useState("");
 const [modelFilter,setModelFilter]=useState("all");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const load=useCallback(async()=>{
  if(!userId){setLoading(false);return;}
  try{
   setLoading(true);
   setError("");
   const response=await fetch(`/api/revisions?userId=${encodeURIComponent(userId)}`,{credentials:"include"});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to load revision history");
   setRevisions(Array.isArray(data?.data)?data.data:[]);
  }catch(loadError){
   setError(loadError.message);
  }finally{
   setLoading(false);
  }
 },[userId]);

 useEffect(()=>{queueMicrotask(load);},[load]);

 const models=useMemo(()=>[...new Set(revisions.map(item=>item.parentModel).filter(Boolean))].sort(),[revisions]);

 const recordGroups=useMemo(()=>{
  const groups=new Map();
  revisions.forEach(revision=>{
   if(modelFilter!=="all"&&revision.parentModel!==modelFilter)return;
   const key=recordKey(revision);
   if(!groups.has(key))groups.set(key,{key,model:revision.parentModel,name:recordName(revision),displayId:revision.parentDisplayId,versions:[]});
   groups.get(key).versions.push(revision);
  });
  return [...groups.values()]
   .map(group=>({...group,versions:group.versions.sort((a,b)=>b.version-a.version)}))
   .sort((a,b)=>new Date(b.versions[0]?.createdAt)-new Date(a.versions[0]?.createdAt));
 },[revisions,modelFilter]);

 const activeRecord=recordGroups.find(group=>group.key===selectedRecordKey)||recordGroups[0]||null;
 const activeRevision=activeRecord?.versions.find(item=>item._id===selectedRevisionId)||activeRecord?.versions[0]||null;
 const activeIndex=activeRecord?.versions.findIndex(item=>item._id===activeRevision?._id)??-1;
 const previousRevision=activeIndex>=0?activeRecord?.versions[activeIndex+1]||null:null;
 const changes=activeRevision?changedFields(activeRevision,previousRevision):[];

 if(!userId)return <Container className="py-5"><Alert variant="info">Log in to review revision history.</Alert></Container>;
 if(loading)return <Container className="py-5 text-center"><Spinner animation="border"/></Container>;

 return(
  <Container fluid className="revisions-page">
   <header className="revisions-page-header">
    <div><p className="dashboard-section-kicker">Review</p><h1>Revision History</h1><p>Review saved versions of records as they changed over time.</p></div>
    <dl className="revisions-summary"><div><dt>Records</dt><dd>{recordGroups.length}</dd></div><div><dt>Saved versions</dt><dd>{revisions.length}</dd></div></dl>
   </header>

   {error&&<Alert variant="danger">{error}</Alert>}
   {!error&&!revisions.length&&<Alert variant="light">No revisions have been recorded yet.</Alert>}

   {!error&&revisions.length>0&&(
    <section className="revisions-history">
     <div className="revisions-toolbar">
      <div><p className="dashboard-section-kicker">Saved history</p><h2>Record Versions</h2></div>
      <Form.Group><Form.Label>Record type</Form.Label><Form.Select value={modelFilter} onChange={event=>{setModelFilter(event.target.value);setSelectedRecordKey("");setSelectedRevisionId("");}}><option value="all">All record types</option>{models.map(model=><option key={model} value={model}>{model}</option>)}</Form.Select></Form.Group>
     </div>

     <div className="revisions-layout">
      <aside className="revision-records" aria-label="Records with saved revisions">
       {recordGroups.map(group=><button type="button" className={group.key===activeRecord?.key?"revision-record is-selected":"revision-record"} key={group.key} onClick={()=>{setSelectedRecordKey(group.key);setSelectedRevisionId("");}}><strong>{group.name}</strong><span>{group.model} · {group.versions.length} {group.versions.length===1?"version":"versions"}</span><code>{group.displayId}</code></button>)}
      </aside>

      {activeRecord&&activeRevision&&(
       <main className="revision-reader">
        <header className="revision-reader-header"><div><p className="dashboard-section-kicker">{activeRecord.model}</p><h2>{activeRecord.name}</h2><code>{activeRecord.displayId}</code></div></header>

        <nav className="revision-timeline" aria-label={`Versions of ${activeRecord.name}`}>
         {activeRecord.versions.map(revision=><button type="button" className={revision._id===activeRevision._id?"revision-version is-selected":"revision-version"} key={revision._id} onClick={()=>setSelectedRevisionId(revision._id)}><strong>Version {revision.version}</strong><span>{formatDate(revision.createdAt)}</span></button>)}
        </nav>

        <article className="revision-snapshot">
         <dl className="revision-meta"><div><dt>Version</dt><dd>{activeRevision.version}</dd></div><div><dt>Recorded</dt><dd>{formatDate(activeRevision.createdAt)}</dd></div><div><dt>Change</dt><dd>{activeRevision.changeNote||activeRevision.summary||"Saved revision"}</dd></div></dl>

         <section className="revision-changes"><h3>Changed Fields</h3>{previousRevision?(changes.length?<ul>{changes.map(field=><li key={field}>{field}</li>)}</ul>:<p>No changed fields were identified in the stored snapshot.</p>):<p>This is the earliest saved version for this record.</p>}</section>

         <section className="revision-content"><h3>Saved Content</h3>{snapshotContent(activeRevision)?<RichTextContent value={snapshotContent(activeRevision)}/>:<p>No text snapshot was stored for this revision.</p>}</section>
        </article>
       </main>
      )}
     </div>
    </section>
   )}
  </Container>
 );
}

export default RevisionsPage;
