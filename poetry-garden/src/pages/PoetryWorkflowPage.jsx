import {useEffect,useMemo,useState} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {Alert,Button,Card,Spinner,Table} from "react-bootstrap";
import "../styles/PoetryWorkflow.css";

const pageConfig={
 drafts:{
  eyebrow:"Draft Workflow",
  title:"Drafts Needing Work",
  description:"Review poems that are marked as draft, revision, in progress, or needing work.",
  empty:"No drafts need work right now.",
  primaryAction:{to:"/poems?modal=new",label:"New Poem"}
 },
 plannedPublications:{
  eyebrow:"Publication Planning",
  title:"Planned Publications",
  description:"Track poems that are unpublished, connected to a publisher, or have publishing follow-ups scheduled.",
  empty:"No planned publication items found yet.",
  primaryAction:{to:"/reminders",label:"Add Publication Reminder"}
 },
 recentPoems:{
  eyebrow:"Recently Added",
  title:"New Poems",
  description:"Review recently added poems and continue editing or publishing work from this list.",
  empty:"No poems found.",
  primaryAction:{to:"/poems?modal=new",label:"New Poem"}
 },
 followUps:{
  eyebrow:"Writing Follow-Ups",
  title:"Writing Tasks",
  description:"Review open writing reminders and follow-ups tied to poetry work.",
  empty:"No open writing follow-ups found.",
  primaryAction:{to:"/reminders",label:"Open Reminders"}
 }
};

const getPoemDate=poem=>{
 const rawDate=poem?.copyright||poem?.writtenAt||poem?.completedAt||poem?.publishedAt||poem?.createdAt||poem?.dateCreated||poem?.created_at||poem?.addedAt;
 const date=new Date(rawDate);
 return Number.isNaN(date.getTime())?null:date;
};

const getReminderDate=reminder=>{
 const date=new Date(reminder?.sendAt||reminder?.nextRunAt||reminder?.dueDate||reminder?.date);
 return Number.isNaN(date.getTime())?null:date;
};

const formatDate=value=>{
 const date=value instanceof Date?value:new Date(value);
 if(Number.isNaN(date.getTime()))return "No date";
 return new Intl.DateTimeFormat("en-US",{
  month:"short",
  day:"numeric",
  year:"numeric"
 }).format(date);
};

const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());

const startOfWeek=date=>{
 const start=startOfDay(date);
 start.setDate(start.getDate()-start.getDay());
 return start;
};

const endOfWeek=date=>{
 const end=startOfWeek(date);
 end.setDate(end.getDate()+6);
 end.setHours(23,59,59,999);
 return end;
};

const isDateInRange=(date,start,end)=>date>=start&&date<=end;

const isDateInWorkflowRange=(date,range)=>{
 if(!date)return false;

 if(range.view==="daily"){
  return startOfDay(date).getTime()===startOfDay(range.selectedDate).getTime();
 }

 if(range.view==="weekly"){
  return isDateInRange(date,startOfWeek(range.selectedDate),endOfWeek(range.selectedDate));
 }

 if(range.view==="yearly"){
  return range.year==="all"||date.getFullYear()===Number(range.year);
 }

 const yearMatches=range.year==="all"||date.getFullYear()===Number(range.year);
 const monthMatches=range.month==="all"||date.getMonth()===Number(range.month);
 return yearMatches&&monthMatches;
};

const authorName=poem=>poem?.author?.displayName||`${poem?.author?.firstName||""} ${poem?.author?.lastName||""}`.trim()||"Unknown Author";

const isDraftPoem=poem=>{
 const status=String(poem?.status||poem?.stage||poem?.draftStatus||poem?.publicationStatus||"").trim().toLowerCase();
 return Boolean(poem?.isDraft)||["draft","revision","revising","in-progress","incomplete","needs-work","needs work"].includes(status);
};

const isPublicationReminder=reminder=>{
 const text=`${reminder?.title||""} ${reminder?.message||""}`.toLowerCase();
 return ["publish","publication","publisher","submit","submission","release"].some(term=>text.includes(term));
};

const isWritingReminder=reminder=>{
 const text=`${reminder?.title||""} ${reminder?.message||""}`.toLowerCase();
 return reminder?.status!=="sent"&&["poem","poetry","write","writing","draft","revision","publish","submit"].some(term=>text.includes(term));
};

const sortByDateDesc=(a,b)=>{
 const first=(a.kind==="reminder"?getReminderDate(a.raw):getPoemDate(a.raw))?.getTime()||0;
 const second=(b.kind==="reminder"?getReminderDate(b.raw):getPoemDate(b.raw))?.getTime()||0;
 return second-first;
};

const poemRow=(poem,type="Poem")=>({
 id:poem?._id,
 kind:"poem",
 raw:poem,
 title:poem?.title||"Untitled Poem",
 type,
 status:poem?.isPublished?"Published":poem?.status||poem?.stage||"Draft",
 group:poem?.genre?.name||poem?.genre||"Poetry",
 owner:authorName(poem),
 date:getPoemDate(poem),
 link:poem?._id?`/poems?edit=${poem._id}`:"/poems"
});

const reminderRow=(reminder,type="Writing Follow-Up")=>({
 id:reminder?._id,
 kind:"reminder",
 raw:reminder,
 title:reminder?.title||"Untitled Reminder",
 type,
 status:reminder?.status||"pending",
 group:reminder?.isRecurring?reminder?.recurrenceRule||"Recurring":"One-time",
 owner:reminder?.audienceType||"selected",
 date:getReminderDate(reminder),
 link:"/reminders"
});

function PoetryWorkflowPage({mode="drafts"}){
 const config=pageConfig[mode]||pageConfig.drafts;
 const [searchParams]=useSearchParams();
 const [poems,setPoems]=useState([]);
 const [reminders,setReminders]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let ignore=false;

  const loadWorkflow=async()=>{
   try{
    setLoading(true);
    setError("");

    const [poemRes,reminderRes]=await Promise.all([
     fetch("/api/poems?sort=createdAt&order=desc"),
     fetch("/api/reminders")
    ]);

    const poemData=await poemRes.json().catch(()=>[]);
    const reminderData=await reminderRes.json().catch(()=>[]);

    if(!poemRes.ok)throw new Error(poemData?.message||"Failed to load poems");

    if(!ignore){
     setPoems(Array.isArray(poemData)?poemData:poemData?.poems||[]);
     setReminders(reminderRes.ok?(reminderData?.reminders||reminderData?.data||reminderData||[]):[]);
    }
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load workflow data");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadWorkflow();

  return()=>{
   ignore=true;
  };
 },[]);

 const activeRange=useMemo(()=>{
  const selectedDate=new Date(searchParams.get("date")||new Date());
  return {
   view:searchParams.get("view")||"all",
   year:searchParams.get("year")||"all",
   month:searchParams.get("month")||"all",
   selectedDate:Number.isNaN(selectedDate.getTime())?new Date():selectedDate
  };
 },[searchParams]);

 const rows=useMemo(()=>{
  const filterRowsToRange=items=>{
   if(activeRange.view==="all")return items;
   return items.filter(row=>isDateInWorkflowRange(row.date,activeRange));
  };

  if(mode==="drafts"){
   return filterRowsToRange(poems.filter(isDraftPoem).map(poem=>poemRow(poem,"Draft")));
  }

  if(mode==="plannedPublications"){
   const plannedPoems=poems
    .filter(poem=>!poem?.isPublished||poem?.publisher)
    .map(poem=>poemRow(poem,poem?.publisher?"Publisher Plan":"Publication Plan"));
   const publicationReminders=reminders
    .filter(isPublicationReminder)
    .map(reminder=>reminderRow(reminder,"Publication Follow-Up"));

   return filterRowsToRange([...plannedPoems,...publicationReminders]).sort(sortByDateDesc);
  }

  if(mode==="followUps"){
   return filterRowsToRange(reminders.filter(isWritingReminder).map(reminder=>reminderRow(reminder)));
  }

  return filterRowsToRange(poems.map(poem=>poemRow(poem,"Poem"))).sort(sortByDateDesc);
 },[mode,poems,reminders,activeRange]);

 return(
  <section className="poetry-workflow-page">
   <div className="poetry-workflow-header">
    <div>
     <p className="poetry-workflow-eyebrow">{config.eyebrow}</p>
     <h1>{config.title}</h1>
     <p>{config.description}</p>
    </div>

    <div className="poetry-workflow-actions">
     <Button as={Link} to="/dashboard" variant="outline-secondary">Dashboard</Button>
     <Button as={Link} to={config.primaryAction.to}>{config.primaryAction.label}</Button>
    </div>
   </div>

   {error?<Alert variant="danger">{error}</Alert>:null}

   <Card className="poetry-workflow-card">
    <Card.Body>
     {loading?(
      <div className="poetry-workflow-loading">
       <Spinner animation="border" role="status"/>
      </div>
     ):(
      <div className="table-responsive">
       <Table hover responsive className="poetry-workflow-table align-middle mb-0">
        <thead>
         <tr>
          <th>Work</th>
          <th>Type</th>
          <th>Status</th>
          <th>Group</th>
          <th>Owner</th>
          <th>Date</th>
          <th>Action</th>
         </tr>
        </thead>
        <tbody>
         {rows.length?rows.map(row=>(
          <tr key={`${row.kind}-${row.id}`}>
           <td>
            <strong>{row.title}</strong>
           </td>
           <td>{row.type}</td>
           <td>{row.status}</td>
           <td>{row.group}</td>
           <td>{row.owner}</td>
           <td>{formatDate(row.date)}</td>
           <td>
            <Button as={Link} to={row.link} variant="outline-primary" size="sm">
             Open
            </Button>
           </td>
          </tr>
         )):(
          <tr>
           <td colSpan="7" className="text-center py-4">{config.empty}</td>
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

export default PoetryWorkflowPage;
