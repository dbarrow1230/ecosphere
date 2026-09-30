import {useEffect,useMemo,useState} from "react";
import {Alert,Button,ButtonGroup,Card,Spinner,Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import "../styles/PoemStatusPage.css";

const normalizePoems=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.poems))return data.poems;
 if(Array.isArray(data?.items))return data.items;
 return [];
};

const getAuthorName=poem=>poem?.author?.displayName||`${poem?.author?.firstName||""} ${poem?.author?.lastName||""}`.trim()||"Unknown Author";

const getPoemDate=poem=>{
 const rawDate=poem?.copyright||poem?.writtenAt||poem?.completedAt||poem?.publishedAt||poem?.createdAt;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const formatDate=value=>{
 if(value===null||value===undefined||value==="")return "-";
 const date=value instanceof Date?value:new Date(value);
 if(Number.isNaN(date.getTime()))return "-";
 return new Intl.DateTimeFormat("en-US",{
  month:"short",
  day:"numeric",
  year:"numeric"
 }).format(date);
};

const toDateInputValue=value=>{
 if(value===null||value===undefined||value==="")return "";
 const date=value instanceof Date?value:new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().split("T")[0];
};

function PoemStatusPage({statusType="featured"}){
 const isFeatured=statusType==="featured";
 const field=isFeatured?"isFeatured":"isPublished";
 const title=isFeatured?"Featured Poems":"Published Poems";
 const eyebrow=isFeatured?"Feature Management":"Publication Status";
 const activeLabel=isFeatured?"Featured":"Published";
 const inactiveLabel=isFeatured?"Not Featured":"Unpublished";
 const [poems,setPoems]=useState([]);
 const [loading,setLoading]=useState(true);
 const [savingId,setSavingId]=useState("");
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [filter,setFilter]=useState("active");
 const [featuredDateDrafts,setFeaturedDateDrafts]=useState({});

 useEffect(()=>{
  let active=true;

  (async()=>{
   try{
    const response=await fetch("/api/poems?sort=title&order=asc");
    const data=await response.json().catch(()=>null);

    if(!response.ok)throw new Error(data?.message||"Failed to load poems");
    if(active){
     const loadedPoems=normalizePoems(data);
     setPoems(loadedPoems);
     setFeaturedDateDrafts(loadedPoems.reduce((drafts,poem)=>{
      if(poem?._id)drafts[poem._id]=toDateInputValue(poem.featuredAt);
      return drafts;
     },{}));
    }
   }catch(err){
    if(active)setError(err.message||"Failed to load poems");
   }finally{
    if(active)setLoading(false);
   }
  })();

  return()=>{
   active=false;
  };
 },[]);

 const filteredPoems=useMemo(()=>{
  return poems
   .filter(poem=>{
    if(filter==="active")return Boolean(poem?.[field]);
    if(filter==="inactive")return !poem?.[field];
    return true;
   })
   .sort((a,b)=>{
    if(Boolean(a?.[field])!==Boolean(b?.[field]))return Boolean(b?.[field])-Boolean(a?.[field]);
    return (getPoemDate(b)?.getTime()||0)-(getPoemDate(a)?.getTime()||0);
   });
 },[poems,field,filter]);

 const activeCount=useMemo(()=>poems.filter(poem=>Boolean(poem?.[field])).length,[poems,field]);
 const inactiveCount=poems.length-activeCount;

 const updateSavedPoem=savedPoem=>{
  setPoems(prev=>prev.map(item=>item._id===savedPoem._id?savedPoem:item));
  if(savedPoem?._id){
   setFeaturedDateDrafts(prev=>({
    ...prev,
    [savedPoem._id]:toDateInputValue(savedPoem.featuredAt)
   }));
  }
 };

 const togglePoemStatus=async poem=>{
  if(!poem?._id||savingId)return;

  const nextValue=!poem[field];

  try{
   setSavingId(poem._id);
   setError("");
   setSuccess("");

   const payload={
    [field]:nextValue
   };

   if(isFeatured&&nextValue){
    payload.featuredAt=featuredDateDrafts[poem._id]||toDateInputValue(poem.featuredAt)||new Date().toISOString().split("T")[0];
   }

   const response=await fetch(`/api/poems/${poem._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||`Failed to update ${title.toLowerCase()}`);

   const savedPoem=data?.poem||data;
   updateSavedPoem(savedPoem);
   setSuccess(`${savedPoem?.title||poem.title} is now ${nextValue?activeLabel.toLowerCase():inactiveLabel.toLowerCase()}.`);
  }catch(err){
   setError(err.message||"Failed to update poem");
  }finally{
   setSavingId("");
  }
 };

 const saveFeaturedDate=async poem=>{
  if(!isFeatured||!poem?._id||savingId)return;

  try{
   setSavingId(poem._id);
   setError("");
   setSuccess("");

   const nextDate=featuredDateDrafts[poem._id]||null;
   const response=await fetch(`/api/poems/${poem._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     featuredAt:nextDate
    })
   });
   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||"Failed to update featured date");

   const savedPoem=data?.poem||data;
   updateSavedPoem(savedPoem);
   setSuccess(`${savedPoem?.title||poem.title} featured date was updated.`);
  }catch(err){
   setError(err.message||"Failed to update featured date");
  }finally{
   setSavingId("");
  }
 };

 return(
  <section className="poem-status-page">
   <div className="poem-status-header">
    <div>
     <p className="poem-status-eyebrow">{eyebrow}</p>
     <h1>{title}</h1>
     <p>Review poems and toggle {activeLabel.toLowerCase()} status without searching through the full poem archive.</p>
    </div>

    <Button as={Link} to="/dashboard" variant="outline-secondary">Dashboard</Button>
   </div>

   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   {success?<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>:null}

   <Card className="poem-status-card">
    <Card.Body>
     <div className="poem-status-toolbar">
      <ButtonGroup>
       <Button variant={filter==="active"?"primary":"outline-primary"} onClick={()=>setFilter("active")}>
        {activeLabel} ({activeCount})
       </Button>
       <Button variant={filter==="inactive"?"primary":"outline-primary"} onClick={()=>setFilter("inactive")}>
        {inactiveLabel} ({inactiveCount})
       </Button>
       <Button variant={filter==="all"?"primary":"outline-primary"} onClick={()=>setFilter("all")}>
        All ({poems.length})
       </Button>
      </ButtonGroup>
     </div>

     {loading?(
      <div className="poem-status-loading">
       <Spinner animation="border" role="status"/>
      </div>
     ):(
      <div className="table-responsive">
       <Table hover responsive className="poem-status-table align-middle mb-0">
        <thead>
         <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Genre</th>
          <th>Date</th>
          <th>Status</th>
          {isFeatured?<th>Featured Date</th>:null}
          <th>Action</th>
         </tr>
        </thead>
        <tbody>
         {filteredPoems.length?filteredPoems.map(poem=>(
          <tr key={poem._id}>
           <td><strong>{poem.title||"Untitled Poem"}</strong></td>
           <td>{getAuthorName(poem)}</td>
           <td>{poem?.genre?.name||poem?.genre||"-"}</td>
           <td>{formatDate(getPoemDate(poem))}</td>
           <td>
            <span className={poem?.[field]?"poem-status-pill is-active":"poem-status-pill"}>
             {poem?.[field]?activeLabel:inactiveLabel}
            </span>
           </td>
           {isFeatured?(
            <td>
             <div className="poem-feature-date-control">
              <input
               type="date"
               value={featuredDateDrafts[poem._id]||""}
               onChange={event=>setFeaturedDateDrafts(prev=>({
                ...prev,
                [poem._id]:event.target.value
               }))}
               aria-label={`Featured date for ${poem.title||"poem"}`}
              />
              <span>{formatDate(featuredDateDrafts[poem._id]||poem.featuredAt)}</span>
             </div>
            </td>
           ):null}
           <td>
            <div className="poem-status-actions">
             {isFeatured?(
              <Button
               type="button"
               variant="outline-secondary"
               size="sm"
               onClick={()=>saveFeaturedDate(poem)}
               disabled={savingId===poem._id}
              >
               Save Date
              </Button>
             ):null}
             <Button
              type="button"
              variant={poem?.[field]?"outline-danger":"outline-primary"}
              size="sm"
              onClick={()=>togglePoemStatus(poem)}
              disabled={savingId===poem._id}
             >
              {savingId===poem._id?"Saving...":poem?.[field]?`Disable ${activeLabel}`:`Enable ${activeLabel}`}
             </Button>
            </div>
           </td>
          </tr>
         )):(
          <tr>
           <td colSpan={isFeatured?7:6} className="text-center py-4">No poems found for this view.</td>
          </tr>
         )}
        </tbody>
       </Table>
      </div>
     )}
    </Card.Body>
   </Card>
  </section>
 );
}

export default PoemStatusPage;
