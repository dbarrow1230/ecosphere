import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Button,Modal,Spinner} from "react-bootstrap";
import {useParams} from "react-router-dom";
import {Check,X} from "lucide-react";
import WeeklySessionForm from "./forms/WeeklySessionForm";
import "../styles/MenteeSessionsPage.css";

const normalizeCollection=(payload,key)=>Array.isArray(payload)?payload:(Array.isArray(payload?.[key])?payload[key]:[]);
const fullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim()||mentee?.fullName||"Unnamed Mentee";
const menteeIdFromSession=session=>String(session?.mentee?._id||session?.mentee||"");
const menteeStatusId=mentee=>String(typeof mentee?.status==="object"?mentee.status?._id||"":mentee?.status||"");
const menteeStatusCode=(mentee,statuses)=>{
 const direct=mentee?.status?.code||mentee?.status?.name||mentee?.status?.label;
 if(direct)return String(direct).trim().toLowerCase();
 const status=statuses.find(item=>String(item._id)===menteeStatusId(mentee));
 return String(status?.code||status?.name||status?.label||"").trim().toLowerCase();
};
const localDate=value=>{
 const date=new Date(value);
 return Number.isNaN(date.getTime())?null:date;
};
const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];

function MenteeSessionsPage({user,view="all"}){
 const {id}=useParams();
 const today=new Date();
 const[mentees,setMentees]=useState([]);
 const[statuses,setStatuses]=useState([]);
 const[visibleStatusIds,setVisibleStatusIds]=useState([]);
 const[sessions,setSessions]=useState([]);
 const[selectedMenteeId,setSelectedMenteeId]=useState(id||"");
 const[selectedSession,setSelectedSession]=useState(null);
 const[activeTab,setActiveTab]=useState("sessions");
 const[year,setYear]=useState(today.getFullYear());
 const[month,setMonth]=useState(today.getMonth());
 const[day,setDay]=useState("");
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[success,setSuccess]=useState("");
 const[showForm,setShowForm]=useState(false);
 const[formMode,setFormMode]=useState("create");
 const[showDelete,setShowDelete]=useState(false);
 const[deleting,setDeleting]=useState(false);
 const filtersInitialized=useRef(false);

 const fetchJson=async(url,key)=>{
  const response=await fetch(url,{credentials:"include"});
  const payload=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(payload?.message||`Failed to load ${key}`);
  return normalizeCollection(payload,key);
 };

 const load=async()=>{
  try{
   setLoading(true);
   setError("");
   const[menteeRows,sessionRows,statusRows]=await Promise.all([
    fetchJson("/api/mentees/list","mentees"),
    fetchJson("/api/weekly-sessions/list","weeklySessions"),
    fetchJson("/api/statuses/list?type=mentee&isActive=true","statuses")
   ]);
   const sortedMentees=[...menteeRows].sort((a,b)=>fullName(a).localeCompare(fullName(b)));
   setMentees(sortedMentees);
   setSessions(sessionRows);
   setStatuses(statusRows);
   if(!filtersInitialized.current){
    const defaultIds=statusRows
     .filter(status=>["incoming","active"].includes(String(status.code||"").toLowerCase()))
     .map(status=>String(status._id));
    if(id){
     const routeMentee=sortedMentees.find(item=>String(item._id)===String(id));
     const routeStatusId=menteeStatusId(routeMentee);
     if(routeStatusId&&!defaultIds.includes(routeStatusId))defaultIds.push(routeStatusId);
    }
    setVisibleStatusIds(defaultIds);
    filtersInitialized.current=true;
   }
   setSelectedMenteeId(current=>{
    if(id&&sortedMentees.some(item=>String(item._id)===String(id)))return String(id);
    if(current&&sortedMentees.some(item=>String(item._id)===String(current)))return current;
    return sortedMentees[0]?._id?String(sortedMentees[0]._id):"";
   });
  }catch(err){
   setError(err.message||"Failed to load weekly sessions.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{load();},[id]);

 const selectedMentee=useMemo(
  ()=>mentees.find(item=>String(item._id)===String(selectedMenteeId))||null,
  [mentees,selectedMenteeId]
 );
 const canAddSession=["incoming","active"].includes(menteeStatusCode(selectedMentee,statuses));
 const completedMentee=menteeStatusCode(selectedMentee,statuses)==="completed";
 const visibleMentees=useMemo(
  ()=>mentees.filter(item=>visibleStatusIds.includes(menteeStatusId(item))),
  [mentees,visibleStatusIds]
 );

 useEffect(()=>{
  if(!visibleMentees.length){
   setSelectedMenteeId("");
   setSelectedSession(null);
   setActiveTab("sessions");
   return;
  }
  if(!visibleMentees.some(item=>String(item._id)===String(selectedMenteeId))){
   setSelectedMenteeId(String(visibleMentees[0]._id));
   setSelectedSession(null);
   setActiveTab("sessions");
  }
 },[visibleMentees,selectedMenteeId]);

 const years=useMemo(()=>{
  const values=new Set([today.getFullYear()]);
  sessions.forEach(session=>{
   const date=localDate(session.sessionDate);
   if(date)values.add(date.getFullYear());
  });
  return [...values].sort((a,b)=>b-a);
 },[sessions]);

 const visibleSessions=useMemo(()=>sessions.filter(session=>{
  if(menteeIdFromSession(session)!==String(selectedMenteeId))return false;
  const date=localDate(session.sessionDate);
  if(!date)return false;
  if(view==="upcoming"&&date<today)return false;
  if(date.getFullYear()!==Number(year)||date.getMonth()!==Number(month))return false;
  if(day!==""&&date.getDate()!==Number(day))return false;
  return true;
 }).sort((a,b)=>new Date(a.sessionDate)-new Date(b.sessionDate)),[sessions,selectedMenteeId,view,year,month,day]);

 const openAdd=()=>{
  if(!selectedMenteeId||!canAddSession)return;
  setSelectedSession(null);
  setFormMode("create");
  setShowForm(true);
 };
 const openEdit=session=>{
  setSelectedSession(session);
  setFormMode("edit");
  setShowForm(true);
 };
 const closeForm=()=>{
  setShowForm(false);
  setSelectedSession(null);
 };
 const handleFormSuccess=async()=>{
  setSuccess(formMode==="edit"?"Session updated successfully.":"Session created successfully.");
  closeForm();
  await load();
 };
 const handleDelete=async()=>{
  if(!selectedSession?._id)return;
  try{
   setDeleting(true);
   const response=await fetch(`/api/weekly-sessions/${selectedSession._id}`,{method:"DELETE",credentials:"include"});
   const payload=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(payload?.message||"Failed to delete session.");
   setShowDelete(false);
   setSelectedSession(null);
   setActiveTab("sessions");
   setSuccess("Session deleted successfully.");
   await load();
  }catch(err){
   setError(err.message||"Failed to delete session.");
  }finally{
   setDeleting(false);
  }
 };
 const showDetails=session=>{
  setSelectedSession(session);
  setActiveTab("details");
 };
 const methodName=value=>typeof value==="object"?(value?.name||value?.label||value?.methodName||"—"):(value||"—");
 const dateTime=value=>{
  const date=localDate(value);
  return date?`${date.toLocaleDateString()} ${date.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}`:"—";
 };

 if(loading)return <main className="session-browser session-loading"><Spinner animation="border"/></main>;

 return(
  <main className="session-browser">
   <header className="session-browser-header">
    <div><h1>Weekly Sessions</h1><p>Select a mentee, then review sessions for the selected date period.</p></div>
    {canAddSession?<Button onClick={openAdd}>Add Session</Button>:null}
   </header>

   {error?<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>:null}
   {success?<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>:null}

   <section className="session-status-filter" aria-label="Filter mentees by status">
    <strong>Show mentees:</strong>
    {statuses.map(status=>{
     const checked=visibleStatusIds.includes(String(status._id));
     const code=String(status.code||status.name||"unknown").toLowerCase().replace(/\s+/g,"-");
     return(
      <label className={`session-filter-${code}`} key={status._id}>
       <input
        type="checkbox"
        checked={checked}
        onChange={()=>setVisibleStatusIds(current=>checked?current.filter(value=>value!==String(status._id)):[...current,String(status._id)])}
       />
       <span aria-hidden="true">{checked?<Check size={14}/>:<X size={14}/>}</span>
       {status.name}
      </label>
     );
    })}
   </section>

   <div className="session-browser-layout">
    <aside className="session-mentee-column">
     <h2>Mentees</h2>
     <div className="session-mentee-list">
      {visibleMentees.map(item=>(
       <button
        type="button"
        className={String(item._id)===String(selectedMenteeId)?"selected":""}
        key={item._id}
        onClick={()=>{
         setSelectedMenteeId(String(item._id));
         setSelectedSession(null);
         setActiveTab("sessions");
        }}
       >
        <span>{fullName(item)}</span>
       </button>
      ))}
      {!visibleMentees.length?<p className="session-no-mentees">No mentees match the selected statuses.</p>:null}
     </div>
    </aside>

    <section className="session-detail-column">
     <div className="session-detail-heading">
      <h2>{selectedMentee?fullName(selectedMentee):"Select a mentee"}</h2>
      <nav className="session-tabs" aria-label="Session view">
       <button type="button" className={activeTab==="sessions"?"active":""} onClick={()=>setActiveTab("sessions")}>Sessions</button>
       <button type="button" className={activeTab==="details"?"active":""} disabled={!selectedSession} onClick={()=>setActiveTab("details")}>Details &amp; Notes</button>
      </nav>
     </div>

     {activeTab==="sessions"?(
      <>
       <div className="session-date-filters">
        <label>Month:
         <select value={month} onChange={event=>{setMonth(Number(event.target.value));setDay("");}}>
          {monthNames.map((name,index)=><option value={index} key={name}>{name}</option>)}
         </select>
        </label>
        <label>Day:
         <select value={day} onChange={event=>setDay(event.target.value)}>
          <option value="">All days</option>
          {Array.from({length:31},(_,index)=><option value={index+1} key={index+1}>{index+1}</option>)}
         </select>
        </label>
        <label>Year:
         <select value={year} onChange={event=>setYear(Number(event.target.value))}>
          {years.map(value=><option value={value} key={value}>{value}</option>)}
         </select>
        </label>
       </div>

       <div className="session-table-scroll">
        <table className="session-table">
         <thead><tr><th>Week</th><th>Date</th><th>Type</th><th>Competency</th><th>Action Plan</th><th>How / When Completed</th><th>Status</th><th>Actions</th></tr></thead>
         <tbody>
          {visibleSessions.length?visibleSessions.map(session=>(
           <tr key={session._id} onClick={()=>showDetails(session)}>
            <td>{session.weekNumber??"—"}</td>
            <td>{dateTime(session.sessionDate)}</td>
            <td>{methodName(session.sessionType)}</td>
            <td>{session.competencyDiscussed||"—"}</td>
            <td>{session.actionPlanStep||"—"}</td>
            <td>{session.howWhenCompleted||"—"}</td>
            <td><span className={`app-status-badge status-${session.status||"unknown"}`}>{session.status||"—"}</span></td>
            <td>
             <div className="session-row-actions">
              <button type="button" onClick={event=>{event.stopPropagation();openEdit(session);}}>Edit</button>
              {!completedMentee?<button type="button" onClick={event=>{event.stopPropagation();setSelectedSession(session);setShowDelete(true);}}>Delete</button>:null}
             </div>
            </td>
           </tr>
          )):<tr><td colSpan="8" className="session-empty">No sessions for this mentee in the selected period.</td></tr>}
         </tbody>
        </table>
       </div>
      </>
     ):(
      <div className="session-record-details">
       <div><strong>Week:</strong><span>{selectedSession?.weekNumber??"—"}</span></div>
       <div><strong>Date:</strong><span>{dateTime(selectedSession?.sessionDate)}</span></div>
       <div><strong>Type:</strong><span>{methodName(selectedSession?.sessionType)}</span></div>
       <div><strong>Status:</strong><span className={`app-status-badge status-${selectedSession?.status||"unknown"}`}>{selectedSession?.status||"—"}</span></div>
       <div className="wide"><strong>Competency:</strong><span>{selectedSession?.competencyDiscussed||"—"}</span></div>
       <div className="wide"><strong>Action Plan:</strong><span>{selectedSession?.actionPlanStep||"—"}</span></div>
       <div className="wide"><strong>How / When Completed:</strong><span>{selectedSession?.howWhenCompleted||"—"}</span></div>
       <div className="wide session-notes"><strong>Notes:</strong><span>{selectedSession?.notes||"—"}</span></div>
       <div className="session-detail-actions">
        <button type="button" onClick={()=>openEdit(selectedSession)}>Edit Session</button>
        <button type="button" onClick={()=>setActiveTab("sessions")}>Return to Sessions</button>
       </div>
      </div>
     )}
    </section>
   </div>

   <Modal show={showForm} onHide={closeForm} size="lg" centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton><Modal.Title>{formMode==="edit"?"Edit Session":"Add Session"}</Modal.Title></Modal.Header>
    <Modal.Body>
     <WeeklySessionForm mode={formMode} menteeId={selectedSession?._id?menteeIdFromSession(selectedSession):selectedMenteeId} mentee={formMode==="create"?selectedMentee:null} session={selectedSession} user={user} onSuccess={handleFormSuccess} onCancel={closeForm}/>
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={()=>!deleting&&setShowDelete(false)} centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton={!deleting}><Modal.Title>Delete Session</Modal.Title></Modal.Header>
    <Modal.Body>Are you sure you want to delete this session?</Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowDelete(false)} disabled={deleting}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting?"Deleting…":"Delete"}</Button>
    </Modal.Footer>
   </Modal>
  </main>
 );
}

export default MenteeSessionsPage;
