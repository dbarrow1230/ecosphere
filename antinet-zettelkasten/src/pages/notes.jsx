import DomainName from "../components/DomainName.jsx";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Alert,Badge,Button,ButtonGroup,Container,Form,InputGroup,Modal,Spinner} from "react-bootstrap";
import LinkedRecordList from "../components/LinkedRecordList.jsx";
import SortedList from "../components/SortedList.jsx";
import SortedSelect from "../components/SortedSelect.jsx";
import ProjectRecordList from "../components/ProjectRecordList.jsx";
import WorkflowStatusBadge from "../components/WorkflowStatusBadge.jsx";
import NoteForm from "./forms/NoteForm.jsx";
import RichTextContent from "../components/RichTextContent.jsx";
import {richTextToPlainText} from "../utils/richText.js";
import "../styles/ZettelsIndex.css";
import "../styles/ZettelSections.css";

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

const formatDateTime=value=>{
 if(!value)return "—";

 const date=new Date(value);

 return Number.isNaN(date.getTime())?"—":date.toLocaleString();
};

const displayValue=value=>{
 if(Array.isArray(value)){
  const labels=value
   .map(item=>displayValue(item))
   .filter(item=>item!=="—");

  return labels.length?labels.join(", "):"—";
 }

 if(value&&typeof value==="object"){
  return(
   value.zettelId||
   value.sourceId||
   value.entityId||
   value.projectId||
   value.fleetingNoteId||
   value.title||
   value.name||
   value.code||
   value.recordType||
   getObjectId(value)||
   "—"
  );
 }

 return value===null||value===undefined||value===""?"—":String(value);
};

const asTextList=value=>{
 if(Array.isArray(value)){
  return value
   .map(item=>displayValue(item))
   .filter(item=>item!=="—");
 }

 const text=displayValue(value);

 return text==="—"?[]:[text];
};

const TextListSection=({title,values})=>{
 const items=asTextList(values);

 if(!items.length)return null;

 return(
  <section className={`zettel-development-section zettel-development-${title.toLowerCase().replace(/\s+/g,"-")}`}>
   <h3>{title}</h3>

   <ul className="zettel-detail-list">
    {items.map((item,index)=>(
     <li key={`${title}-${index}`}>{item}</li>
    ))}
   </ul>
  </section>
 );
};

const sortOptions=[
 {value:"title-asc",label:"Title A–Z"},
 {value:"title-desc",label:"Title Z–A"},
 {value:"updated-desc",label:"Recently updated"},
 {value:"updated-asc",label:"Oldest updated"},
 {value:"id-asc",label:"Zettel ID A–Z"}
];
const alphabetTabs=["ALL",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ","#"];

const compareText=(left,right)=>String(left||"").localeCompare(
 String(right||""),undefined,{sensitivity:"base",numeric:true}
);

const noteSearchText=zettel=>[
 zettel.title,
 zettel.zettelId,
 zettel.subjectCode,
 zettel.status,
 richTextToPlainText(zettel.mainIdea),
 richTextToPlainText(zettel.body),
 ...asTextList(zettel.tags),
 ...asTextList(zettel.futureUse),
 ...asTextList(zettel.questions)
].join(" ").toLocaleLowerCase();

function Notes(){
 const [searchParams,setSearchParams]=useSearchParams();
 const [zettels,setZettels]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [editing,setEditing]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [viewing,setViewing]=useState(null);
 const [activeTab,setActiveTab]=useState("overview");
 const [noteSearch,setNoteSearch]=useState("");
 const [sortMode,setSortMode]=useState("title-asc");
 const [letterFilter,setLetterFilter]=useState("ALL");

 const userId=getStoredUserId();

 const visibleZettels=useMemo(()=>{
  const search=noteSearch.trim().toLocaleLowerCase();
  return zettels.filter(zettel=>{
   if(search&&!noteSearchText(zettel).includes(search))return false;
   if(letterFilter==="ALL")return true;
   const first=String(zettel.title||"").trim().charAt(0).toUpperCase();
   return letterFilter==="#"?!/[A-Z]/.test(first):first===letterFilter;
  });
 },[letterFilter,noteSearch,zettels]);

 const sortZettels=useCallback((left,right)=>{
  switch(sortMode){
   case "title-desc":return compareText(right.title,left.title);
   case "updated-desc":return new Date(right.updatedAt||0)-new Date(left.updatedAt||0);
   case "updated-asc":return new Date(left.updatedAt||0)-new Date(right.updatedAt||0);
   case "id-asc":return compareText(left.zettelId,right.zettelId);
   default:return compareText(left.title,right.title);
  }
 },[sortMode]);

 const loadZettels=useCallback(async(preferredId="",showLoading=true)=>{
  if(!userId){
   setZettels([]);
   setLoading(false);
   return;
  }

  try{
   if(showLoading)setLoading(true);
   setError("");

   const response=await fetch(
    `/api/zettels?userId=${encodeURIComponent(userId)}`,
    {credentials:"include"}
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok){
    throw new Error(data?.message||"Unable to load zettels");
   }

   const loadedZettels=Array.isArray(data?.data)?data.data:[];
   setZettels(loadedZettels);
   setViewing(current=>{
    if(preferredId)return loadedZettels.find(item=>item._id===preferredId)||current||loadedZettels[0]||null;
    if(!current)return loadedZettels[0]||null;
    return loadedZettels.find(item=>item._id===current._id)||loadedZettels[0]||null;
   });
  }catch(loadError){
   setError(loadError.message);
  }finally{
   if(showLoading)setLoading(false);
  }
 },[userId]);

 useEffect(()=>{
  queueMicrotask(loadZettels);
 },[loadZettels]);

 useEffect(()=>{
  const editId=searchParams.get("edit");

  if(!editId||!zettels.length)return;

  const match=zettels.find(zettel=>zettel._id===editId);

  if(match){
   queueMicrotask(()=>{
    setEditing(match);
    setShowForm(true);
   });
  }
 },[searchParams,zettels]);

 const closeForm=()=>{
  setShowForm(false);
  setEditing(null);
  setSearchParams({});
 };

 const openCreate=()=>{
  setEditing(null);
  setShowForm(true);
 };

 const openEdit=zettel=>{
  setEditing(zettel);
  setShowForm(true);
 };

const openDetail=async zettel=>{
  setViewing(zettel);
  setActiveTab("overview");

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

   setViewing(data?.data||zettel);
  }catch(viewError){
   setError(viewError.message);
  }
 };

 const remove=async zettel=>{
  if(!window.confirm(`Delete “${zettel.title}”?`))return;

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

   setViewing(null);
   setZettels(current=>current.filter(item=>item._id!==zettel._id));
  }catch(deleteError){
   setError(deleteError.message);
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

   setZettels(current=>
    current.map(item=>
     item._id===zettel._id
      ?data.data
      :item
    )
   );

   if(viewing?._id===zettel._id){
    setViewing(data.data);
   }
  }catch(favoriteError){
   setError(favoriteError.message);
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

   setZettels(current=>
    current.map(item=>
     item._id===zettel._id
      ?data.data
      :item
    )
   );

   if(viewing?._id===zettel._id){
    setViewing(data.data);
   }
  }catch(archiveError){
   setError(archiveError.message);
  }
 };

 if(!userId){
  return(
   <Container fluid className="py-5 px-4">
    <Alert variant="info">
     Log in to view and create zettels.
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
  <Container fluid className="zettels-index-page">
   <div className="zettels-index-header">
    <div className="zettels-index-heading">
     <p className="dashboard-section-kicker mb-1">
      4. Process One Permanent Thought
     </p>

     <h1 className="mb-0">Zettels</h1>
     <p className="mb-0">
      Permanent ideas shaped for connection, reuse, and future writing.
     </p>
    </div>

    <Button onClick={openCreate}>
     Add Zettel
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

   {!zettels.length?(
    <Alert variant="light">
     No zettels yet. Capture your first processed thought to start the slip-box.
    </Alert>
   ):(
    <section className="zettels-index-card" aria-label="Permanent notes">
     <div className="zettels-index-card-header">
      <div>
       <span className="zettels-index-eyebrow">Slip-box</span>
       <h2>Permanent notes</h2>
      </div>

      <span className="zettels-index-count">
       {noteSearch.trim()?`${visibleZettels.length} of ${zettels.length}`:zettels.length} {zettels.length===1?"zettel":"zettels"}
      </span>
     </div>

     <div className="zettels-workspace">
      <aside className="zettels-record-index" aria-label="Zettel index">
       <div className="zettels-record-tools">
        <InputGroup className="zettels-record-search">
         <Form.Control
          type="search"
          value={noteSearch}
          onChange={event=>setNoteSearch(event.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
         />
         <Button
          type="button"
          variant="outline-secondary"
          onClick={()=>setNoteSearch("")}
          disabled={!noteSearch}
          aria-label="Clear note search"
         >
          Clear
         </Button>
        </InputGroup>
        <SortedSelect
         value={sortMode}
         onChange={event=>setSortMode(event.target.value)}
         options={sortOptions}
         getValue={option=>option.value}
         getLabel={option=>option.label}
         sort={false}
         includePlaceholder={false}
         aria-label="Sort notes"
        />
       </div>

       <nav className="zettels-alphabet-tabs" aria-label="Filter Zettels by first letter">
        {alphabetTabs.map(letter=>{
         const count=zettels.filter(zettel=>{
          if(letter==="ALL")return true;
          const first=String(zettel.title||"").trim().charAt(0).toUpperCase();
          return letter==="#"?!/[A-Z]/.test(first):first===letter;
         }).length;
         return <button type="button" key={letter} className={letterFilter===letter?"is-active":""} disabled={!count} onClick={()=>setLetterFilter(letter)} aria-pressed={letterFilter===letter}>{letter==="ALL"?"All":letter}</button>;
        })}
       </nav>

       <SortedList
        className="zettels-record-list"
        items={visibleZettels}
        getKey={zettel=>zettel._id}
        getLabel={zettel=>zettel.title||zettel.zettelId}
        customSort={sortZettels}
        wrapItems={false}
        renderItem={zettel=>(
         <button
          type="button"
          className={`zettels-record-item${viewing?._id===zettel._id?" is-selected":""}`}
          onClick={()=>openDetail(zettel)}
          aria-current={viewing?._id===zettel._id?"true":undefined}
         >
          <span className="zettels-record-title-row">
           <span className="zettels-record-title">{zettel.title||"Untitled zettel"}</span>
           {zettel.isFavorite&&<b aria-label="Favorite">★</b>}
          </span>
          <code>{zettel.zettelId}</code>
         </button>
        )}
       >
        <div className="zettels-record-empty">No notes match this search or letter.</div>
       </SortedList>
      </aside>

      <article className="zettels-reader">
       {viewing&&(
        <>
         <header className="zettels-reader-header">
          <div>
           <code>{viewing.zettelId}</code>
           <h2>{viewing.title}</h2>
           <RichTextContent className="zettels-reader-main-idea" value={viewing.mainIdea}/>
          </div>

          <ButtonGroup size="sm" className="zettels-reader-actions">
           <Button variant="outline-primary" onClick={()=>openEdit(viewing)}>Edit</Button>
           <Button variant="outline-warning" onClick={()=>toggleFavorite(viewing)}>
            {viewing.isFavorite?"Unfavorite":"Favorite"}
           </Button>
           <Button variant="outline-secondary" disabled={viewing.status==="archived"} onClick={()=>archive(viewing)}>
            Archive
           </Button>
           <Button variant="outline-danger" onClick={()=>remove(viewing)}>Delete</Button>
          </ButtonGroup>
         </header>

         <nav className="zettels-reader-tabs" aria-label="Zettel content">
          <button type="button" className={activeTab==="overview"?"is-active":""} onClick={()=>setActiveTab("overview")}>Overview</button>
          <button type="button" className={activeTab==="body"?"is-active":""} onClick={()=>setActiveTab("body")}>Body</button>
          <button type="button" className={activeTab==="development"?"is-active":""} onClick={()=>setActiveTab("development")}>Development</button>
         </nav>

         <div className="zettels-reader-content">
          {activeTab==="overview"&&(
           <>
            <dl className="zettels-reader-meta">
<div className="workflow-domain"><dt>Domain</dt><dd><DomainName domain={viewing.domainId}/></dd></div>
             <div className="zettels-meta-record-details">
              <div><dt>Prefix</dt><dd>ZTL</dd></div>
              <div><dt>Subject</dt><dd>{viewing.subjectCode||"—"}</dd></div>
              <div><dt>Status</dt><dd><WorkflowStatusBadge status={viewing.status}/></dd></div>
              <div><dt>Updated</dt><dd>{formatDateTime(viewing.updatedAt)}</dd></div>
             </div>
             <div className="zettels-meta-projects"><dt>Projects</dt><dd><ProjectRecordList projects={viewing.projectIds} fallback={viewing.projectId}/></dd></div>
             <div className="zettels-meta-subtypes">
              <dt>Subtypes</dt>
              <dd>
               {(Array.isArray(viewing.subtype)?viewing.subtype:[viewing.subtype]).filter(Boolean).map((subtype,index)=>(
                <Badge bg="secondary" key={getObjectId(subtype)||`${displayValue(subtype)}-${index}`}>
                 {displayValue(subtype)}
                </Badge>
               ))}
              </dd>
             </div>
            </dl>

            <div className="zettels-overview-links">
             <section className="zettels-linked-section">
              <h3>Sources</h3>
              <LinkedRecordList records={viewing.sourceIds} type="source"/>
             </section>

             <section className="zettels-linked-section">
              <h3>Entities</h3>
              <LinkedRecordList records={viewing.entityIds} type="entity"/>
             </section>
            </div>
           </>
          )}

          {activeTab==="body"&&(
           <section className="zettels-body-tab">
            <RichTextContent value={viewing.body} empty="No body content has been written yet."/>
           </section>
          )}

          {activeTab==="development"&&(
           <div className="zettels-development-tab">
            <TextListSection title="Future Use" values={viewing.futureUse}/>
            <TextListSection title="Questions" values={viewing.questions}/>
            <TextListSection title="Tags" values={viewing.tags}/>
           </div>
          )}
         </div>
        </>
       )}
      </article>
     </div>
    </section>
   )}

   <Modal
    className="workflow-modal"
    show={showForm}
    onHide={closeForm}
    backdrop="static"
    keyboard={false}
    centered
    size="xl"
   >
    <Modal.Header closeButton>
     <Modal.Title>
      {editing?`Edit Zettel — ${editing.title||"Untitled Zettel"}`:"Add Zettel"}
     </Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <NoteForm
      note={editing}
      userId={userId}
      autoFocusTitle
      onSuccess={savedZettel=>{
       closeForm();
       loadZettels(savedZettel?._id||"",false);
      }}
     />
    </Modal.Body>
   </Modal>

  </Container>
 );
}

export default Notes;
