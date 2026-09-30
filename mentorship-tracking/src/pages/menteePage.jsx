// src/pages/menteePage.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {useLocation,useNavigate,useSearchParams} from "react-router-dom";
import axios from "axios";
import {Badge,Button,ButtonGroup,Card,Col,Container,Form,Image,InputGroup,Modal,Row,Spinner,Table,Alert} from "react-bootstrap";
import MenteeForm from "./forms/MenteeForm";
import TimeSheetForm from "./forms/TimeSheetForm";
import WeeklySessionForm from "./forms/WeeklySessionForm";
import MentorNoteForm from "./forms/MentorNoteForm";
import SmartGoalForm from "./forms/SmartGoalsForm";
import ReminderForm from "./forms/ReminderForm";
import "../styles/mentee-details.css";

const statusOptions=[
 {key:"active",label:"Active"},
 {key:"incoming",label:"Incoming"},
 {key:"completed",label:"Completed"},
 {key:"dropped",label:"Dropped"},
 {key:"paused",label:"Paused"},
 {key:"flagged",label:"Flagged"},
 {key:"all",label:"All"}
];

const agreementStages=[
 {value:"not-started",label:"Not Started"},
 {value:"waiting-for-mentee-signature",label:"Waiting for Mentee Signature"},
 {value:"waiting-for-career-services",label:"Waiting for Career Services"},
 {value:"waiting-for-mentor-signature",label:"Waiting for Mentor Signature"},
 {value:"signed",label:"Signed / Complete"}
];

const getAgreementStatus=mentee=>mentee?.mentorAgreementCompleted?"signed":(mentee?.mentorAgreementStatus||"not-started");
const getAgreementLabel=mentee=>agreementStages.find(stage=>stage.value===getAgreementStatus(mentee))?.label||"Not Started";
const getTodayInput=()=>{
 const today=new Date();
 today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
 return today.toISOString().slice(0,10);
};

function MenteesPage({user}){
 const navigate=useNavigate();
 const location=useLocation();
 const [searchParams,setSearchParams]=useSearchParams();
 const requestedFilter=(searchParams.get("filter")||"active").toLowerCase();
 const allowedFilters=statusOptions.map(item=>item.key);
 const initialFilter=allowedFilters.includes(requestedFilter)?requestedFilter:"active";

 const [mentees,setMentees]=useState([]);
 const [statuses,setStatuses]=useState([]);
 const [filter,setFilter]=useState(initialFilter);
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selectedMentee,setSelectedMentee]=useState(null);
 const [showViewModal,setShowViewModal]=useState(false);
 const [showFormModal,setShowFormModal]=useState(false);
 const [showTimesheetModal,setShowTimesheetModal]=useState(false);
 const [timesheetModalMode,setTimesheetModalMode]=useState("view");
 const [showSessionModal,setShowSessionModal]=useState(false);
 const [showNoteModal,setShowNoteModal]=useState(false);
 const [showGoalModal,setShowGoalModal]=useState(false);
 const [showReminderModal,setShowReminderModal]=useState(false);
 const [showAgreementModal,setShowAgreementModal]=useState(false);
 const [showAgreementEditModal,setShowAgreementEditModal]=useState(false);
 const [agreementDraft,setAgreementDraft]=useState({status:"not-started",signedDate:""});
 const [agreementSaving,setAgreementSaving]=useState(false);
 const [agreementError,setAgreementError]=useState("");
 const [reminderMode,setReminderMode]=useState("add");
 const [selectedReminder,setSelectedReminder]=useState(null);
 const handledDashboardAction=useRef("");
 const [formMode,setFormMode]=useState("create");
 const [timesheets,setTimesheets]=useState([]);
 const [timesheetLoading,setTimesheetLoading]=useState(false);
 const [timesheetError,setTimesheetError]=useState("");
 const [mentorNotes,setMentorNotes]=useState([]);
 const [mentorNotesLoading,setMentorNotesLoading]=useState(false);
 const [mentorNotesError,setMentorNotesError]=useState("");
 const [smartGoals,setSmartGoals]=useState([]);
 const [selectedGoal,setSelectedGoal]=useState(null);
 const [goalDeleteTarget,setGoalDeleteTarget]=useState(null);
 const [smartGoalsLoading,setSmartGoalsLoading]=useState(false);
 const [smartGoalsError,setSmartGoalsError]=useState("");
 const [reminderSuccess,setReminderSuccess]=useState("");
 const [reminders,setReminders]=useState([]);

 useEffect(()=>{
  const nextFilter=(searchParams.get("filter")||"active").toLowerCase();
  setFilter(allowedFilters.includes(nextFilter)?nextFilter:"active");
 },[searchParams]);

 useEffect(()=>{
  if(!reminderSuccess)return;
  const timer=setTimeout(()=>{
   setReminderSuccess("");
  },5000);
  return()=>clearTimeout(timer);
 },[reminderSuccess]);

 const setPageFilter=value=>{
  setFilter(value);
  setSearchParams(prev=>{
   const next=new URLSearchParams(prev);
   next.set("filter",value);
   return next;
  });
 };

 const sortTimesheets=list=>{
  return [...list].sort((a,b)=>{
   const aWeek=Number(a?.weekNumber)||0;
   const bWeek=Number(b?.weekNumber)||0;
   return aWeek-bWeek;
  });
 };

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");
   const [menteesRes,statusesRes,remindersRes]=await Promise.all([
    axios.get("/api/mentees/list"),
    axios.get("/api/statuses/list"),
    axios.get("/api/reminders/mine",{params:{user:user?._id||""}})
   ]);
   setMentees(Array.isArray(menteesRes.data)?menteesRes.data:menteesRes.data?.mentees||[]);
   setStatuses(Array.isArray(statusesRes.data)?statusesRes.data:statusesRes.data?.statuses||[]);
   setReminders(Array.isArray(remindersRes.data?.reminders)?remindersRes.data.reminders:[]);
  }catch(err){
   setError(err.response?.data?.message||"Failed to load mentees.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchData();
 },[]);

 const getStatusCode=mentee=>{
  if(mentee?.isFlagged)return"flagged";
  if(typeof mentee?.status==="string"){
   const matchedStatus=statuses.find(status=>status?._id===mentee.status);
   if(matchedStatus?.code)return String(matchedStatus.code).toLowerCase();
   if(matchedStatus?.name)return String(matchedStatus.name).toLowerCase().replace(/\s+/g,"-");
   return"unknown";
  }
  if(mentee?.status?.code)return String(mentee.status.code).toLowerCase();
  if(mentee?.status?.name)return String(mentee.status.name).toLowerCase().replace(/\s+/g,"-");
  return"unknown";
 };

 const activeMentees=useMemo(()=>mentees.filter(mentee=>getStatusCode(mentee)==="active"),[mentees,statuses]);
 const incomingMentees=useMemo(()=>mentees.filter(mentee=>getStatusCode(mentee)==="incoming"),[mentees,statuses]);
 const completedMentees=useMemo(()=>mentees.filter(mentee=>getStatusCode(mentee)==="completed"),[mentees,statuses]);
 const droppedMentees=useMemo(()=>mentees.filter(mentee=>getStatusCode(mentee)==="dropped"),[mentees,statuses]);
 const pausedMentees=useMemo(()=>mentees.filter(mentee=>getStatusCode(mentee)==="paused"),[mentees,statuses]);
 const flaggedMentees=useMemo(()=>mentees.filter(mentee=>mentee.isFlagged),[mentees]);

 const menteeGroups=useMemo(()=>({
  active:activeMentees,
  incoming:incomingMentees,
  completed:completedMentees,
  dropped:droppedMentees,
  paused:pausedMentees,
  flagged:flaggedMentees,
  all:mentees
 }),[activeMentees,incomingMentees,completedMentees,droppedMentees,pausedMentees,flaggedMentees,mentees]);

 const filteredMentees=useMemo(()=>{
  const list=menteeGroups[filter]||[];
  const term=search.trim().toLowerCase();
  if(!term)return list;
  return list.filter(mentee=>{
   const fullName=`${mentee.firstName||""} ${mentee.lastName||""}`.trim().toLowerCase();
   const email=(mentee.email||"").toLowerCase();
   const phone=(mentee.phone||"").toLowerCase();
   const businessName=(mentee.businessName||"").toLowerCase();
   return fullName.includes(term)||email.includes(term)||phone.includes(term)||businessName.includes(term);
  });
 },[menteeGroups,filter,search]);

 const goalInitialData=useMemo(
  ()=>selectedGoal||{mentee:selectedMentee?._id||""},
  [selectedGoal,selectedMentee?._id]
 );

 const formatDate=value=>{
  if(!value)return"—";
  const calendarDate=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date=calendarDate
   ?new Date(Number(calendarDate[1]),Number(calendarDate[2])-1,Number(calendarDate[3]))
   :new Date(value);
  if(Number.isNaN(date.getTime()))return"—";
  return date.toLocaleDateString();
 };

 const formatPhone=value=>{
  if(!value)return"—";
  const digits=String(value).replace(/\D/g,"");
  if(digits.length===10)return`(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  if(digits.length===11&&digits.startsWith("1"))return`+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  return String(value);
 };

 const getWebsiteUrl=value=>{
  const website=String(value||"").trim();
  if(!website)return"";
  return/^https?:\/\//i.test(website)?website:`https://${website}`;
 };

 const getProgramNames=mentee=>{
  const assignedPrograms=Array.isArray(mentee?.programs)?mentee.programs:[];
  const names=assignedPrograms.map(program=>program?.courseName||program?.name||program?.title).filter(Boolean);
  return names.length?names.join(" · "):"—";
 };

 const getFullName=mentee=>`${mentee?.firstName||""} ${mentee?.lastName||""}`.trim();
 const canAddMentorshipWork=mentee=>["incoming","active"].includes(getStatusCode(mentee));

 const getReminderForMentee=mentee=>{
  return reminders.find(item=>String(item?.mentee?._id||item?.mentee||"")===String(mentee?._id||""))||null;
 };

 const loadMentorNotes=async menteeId=>{
  if(!menteeId){
   setMentorNotes([]);
   setMentorNotesError("");
   return;
  }

  try{
   setMentorNotesLoading(true);
   setMentorNotesError("");

   const res=await axios.get(`/api/mentor-notes/mentee/${menteeId}`);
   const list=Array.isArray(res.data)
    ?res.data
    :Array.isArray(res.data?.notes)
     ?res.data.notes
     :Array.isArray(res.data?.mentorNotes)
      ?res.data.mentorNotes
      :[];

   setMentorNotes(list);
  }catch(err){
   setMentorNotes([]);
   setMentorNotesError(err.response?.data?.message||"Failed to load mentor notes.");
  }finally{
   setMentorNotesLoading(false);
  }
 };

 const handleView=mentee=>{
  setSelectedMentee(mentee);
  setShowViewModal(true);
 };

 const handleAdd=()=>{
  setSelectedMentee(null);
  setFormMode("create");
  setShowFormModal(true);
 };

 const handleEdit=mentee=>{
  setSelectedMentee(mentee);
  setFormMode("edit");
  setShowFormModal(true);
 };

 const handleResourcePage=mentee=>{
  navigate(`/resources?mentee=${mentee._id}`);
 };

 const handleMentorAgreement=mentee=>{
  setSelectedMentee(mentee);
  setAgreementDraft({
   status:getAgreementStatus(mentee),
   signedDate:mentee.mentorAgreementCompletedDate?new Date(mentee.mentorAgreementCompletedDate).toISOString().slice(0,10):""
  });
  setAgreementError("");
  setShowAgreementModal(true);
 };

 const handleCloseAgreement=()=>{
  setShowAgreementModal(false);
  setSelectedMentee(null);
  returnFromDashboardAction();
 };

 const handleSaveAgreement=async()=>{
  if(agreementDraft.status==="signed"&&!agreementDraft.signedDate){
   setAgreementError("Enter the date the agreement was signed.");
   return;
  }
  try{
   setAgreementSaving(true);
   setAgreementError("");
   const response=await axios.patch(`/api/mentees/${selectedMentee._id}/agreement`,{
    mentorAgreementStatus:agreementDraft.status,
    mentorAgreementCompleted:agreementDraft.status==="signed",
    mentorAgreementCompletedDate:agreementDraft.status==="signed"?agreementDraft.signedDate:null
   });
   const updated=response.data?.mentee||response.data?.data||response.data;
   setSelectedMentee(updated);
   await fetchData();
   setShowAgreementEditModal(false);
   setShowAgreementModal(true);
  }catch(err){
   setAgreementError(err.response?.data?.error||err.response?.data?.message||"Failed to update agreement.");
  }finally{
   setAgreementSaving(false);
  }
 };

 const handleAddTimesheet=async mentee=>{
  try{
   setTimesheetModalMode("add");
   setSelectedMentee(mentee);
   setTimesheets([]);
   setTimesheetError("");
   setTimesheetLoading(true);

   const res=await axios.get(`/api/timesheets/mentee/${mentee._id}`);
   const existingTimesheets=Array.isArray(res.data?.timesheets)?res.data.timesheets:[];
   setTimesheets(sortTimesheets(existingTimesheets));
   setShowTimesheetModal(true);
  }catch(err){
   setTimesheetError(err.response?.data?.message||"Failed to load timesheets.");
   setShowTimesheetModal(true);
  }finally{
   setTimesheetLoading(false);
  }
 };

 const handleAddSession=mentee=>{
  if(!canAddMentorshipWork(mentee)){
   navigate(`/mentees/${mentee._id}/sessions`);
   return;
  }
  setSelectedMentee(mentee);
  setShowSessionModal(true);
 };

 const handleViewTimesheets=async mentee=>{
  try{
   setTimesheetModalMode("view");
   setSelectedMentee(mentee);
   setTimesheets([]);
   setTimesheetError("");
   setTimesheetLoading(true);

   const res=await axios.get(`/api/timesheets/mentee/${mentee._id}`);
   const existingTimesheets=Array.isArray(res.data?.timesheets)?res.data.timesheets:[];
   setTimesheets(sortTimesheets(existingTimesheets));
   setShowTimesheetModal(true);
  }catch(err){
   setTimesheetError(err.response?.data?.message||"Failed to load timesheets.");
   setShowTimesheetModal(true);
  }finally{
   setTimesheetLoading(false);
  }
 };

 const handleAddNote=async mentee=>{
  setSelectedMentee(mentee);
  setShowNoteModal(true);
  await loadMentorNotes(mentee?._id);
 };

 const loadSmartGoals=async menteeId=>{
  if(!menteeId){
   setSmartGoals([]);
   return;
  }

  try{
   setSmartGoalsLoading(true);
   setSmartGoalsError("");
   const res=await axios.get(`/api/smart-goals/mentee/${menteeId}`);
   setSmartGoals(Array.isArray(res.data?.smartGoals)?res.data.smartGoals:[]);
  }catch(err){
   setSmartGoals([]);
   setSmartGoalsError(err.response?.data?.message||"Failed to load SMART goals.");
  }finally{
   setSmartGoalsLoading(false);
  }
 };

 const handleAddGoal=async mentee=>{
  setSelectedMentee(mentee);
  setSelectedGoal(null);
  setShowGoalModal(true);
  await loadSmartGoals(mentee?._id);
 };

 const handleAddReminder=mentee=>{
  setSelectedMentee(mentee);
  setSelectedReminder(null);
  setReminderMode("add");
  setShowReminderModal(true);
 };

 const handleEditReminder=mentee=>{
  setSelectedMentee(mentee);
  setSelectedReminder(getReminderForMentee(mentee));
  setReminderMode("edit");
  setShowReminderModal(true);
 };

 const returnFromDashboardAction=()=>{
  if(!location.state?.fromDashboard)return;
  navigate("/dashboard");
 };

 const handleCloseView=()=>{
  setShowViewModal(false);
  setSelectedMentee(null);
  returnFromDashboardAction();
 };

 const handleCloseForm=()=>{
  setShowFormModal(false);
  setSelectedMentee(null);
  returnFromDashboardAction();
 };

 const handleCloseTimesheet=()=>{
  setShowTimesheetModal(false);
  setSelectedMentee(null);
  setTimesheets([]);
  setTimesheetError("");
  setTimesheetLoading(false);
  returnFromDashboardAction();
 };

 const handleCloseSession=()=>{
  setShowSessionModal(false);
  setSelectedMentee(null);
  returnFromDashboardAction();
 };

 const handleCloseNote=()=>{
  setShowNoteModal(false);
  setSelectedMentee(null);
  setMentorNotes([]);
  setMentorNotesError("");
  setMentorNotesLoading(false);
  returnFromDashboardAction();
 };

 const handleCloseGoal=()=>{
 setShowGoalModal(false);
  setSelectedMentee(null);
  setSelectedGoal(null);
  setGoalDeleteTarget(null);
  setSmartGoals([]);
  setSmartGoalsError("");
  returnFromDashboardAction();
 };

 const handleCloseReminder=()=>{
  setShowReminderModal(false);
  setSelectedMentee(null);
  setSelectedReminder(null);
  setReminderMode("add");
  returnFromDashboardAction();
 };

 const handleFormSuccess=async()=>{
  setShowFormModal(false);
  setSelectedMentee(null);
  await fetchData();
 };

 const handleTimesheetSubmit=async payload=>{
  const {_id:timesheetId,...timesheetPayload}=payload;
  const res=timesheetId
   ?await axios.put(`/api/timesheets/${timesheetId}`,timesheetPayload)
   :await axios.post("/api/timesheets/create",payload);

  const savedTimesheet=res.data?.timesheet||res.data?.data||res.data;

  if(savedTimesheet?._id){
   setTimesheets(prev=>{
    const exists=prev.some(item=>String(item._id)===String(savedTimesheet._id));
    const nextList=exists?prev.map(item=>String(item._id)===String(savedTimesheet._id)?savedTimesheet:item):[...prev,savedTimesheet];
    return sortTimesheets(nextList);
   });
  }

  await fetchData();

  return savedTimesheet;
 };

 const handleSessionSuccess=async()=>{
  setShowSessionModal(false);
  setSelectedMentee(null);
  await fetchData();
  returnFromDashboardAction();
 };

 const handleNoteSubmit=async payload=>{
  if(payload._id){
   const {_id,...updatePayload}=payload;
   await axios.put(`/api/mentor-notes/${_id}`,updatePayload);
  }else{
   await axios.post("/api/mentor-notes/create",payload);
  }
  await loadMentorNotes(payload.mentee);
  await fetchData();
 };

 const handleNoteDelete=async noteId=>{
  await axios.delete(`/api/mentor-notes/${noteId}`);
  await loadMentorNotes(selectedMentee?._id);
  await fetchData();
 };

 const handleGoalSubmit=async payload=>{
  if(payload._id){
   const {_id,...updatePayload}=payload;
   await axios.put(`/api/smart-goals/${_id}`,updatePayload);
  }else{
   await axios.post("/api/smart-goals/create",payload);
  }
  await loadSmartGoals(payload.mentee);
  setSelectedGoal(null);
  await fetchData();
 };

 const handleGoalDelete=async goalId=>{
  await axios.delete(`/api/smart-goals/${goalId}`);
  await loadSmartGoals(selectedMentee?._id);
  setSelectedGoal(null);
  setGoalDeleteTarget(null);
  await fetchData();
 };

 const handleReminderSubmit=async payload=>{
  if(payload._id){
   await axios.put(`/api/reminders/${payload._id}/update`,payload);
   setReminderSuccess("Reminder updated successfully.");
  }else{
   await axios.post("/api/reminders/create-from-mentee",payload);
   setReminderSuccess("Reminder created successfully.");
  }
  setShowReminderModal(false);
  setSelectedMentee(null);
  setSelectedReminder(null);
  setReminderMode("add");
  await fetchData();
  returnFromDashboardAction();
 };

 useEffect(()=>{
  const focusId=searchParams.get("focus")||"";
  const action=searchParams.get("action")||"";
  const actionKey=`${focusId}:${action}`;
  if(!focusId||!action||handledDashboardAction.current===actionKey||!mentees.length)return;

  const focusedMentee=mentees.find(item=>String(item._id)===String(focusId));
  if(!focusedMentee)return;

  handledDashboardAction.current=actionKey;

  if(action==="view")handleView(focusedMentee);
  if(action==="session")handleAddSession(focusedMentee);
  if(action==="timesheet")handleAddTimesheet(focusedMentee);
  if(action==="note")handleAddNote(focusedMentee);
  if(action==="goal"&&canAddMentorshipWork(focusedMentee))handleAddGoal(focusedMentee);
  if(action==="reminder"&&canAddMentorshipWork(focusedMentee))handleAddReminder(focusedMentee);
  if(action==="agreement")handleMentorAgreement(focusedMentee);
  if(action==="edit")handleEdit(focusedMentee);
 },[mentees,searchParams]);

 return(
  <Container fluid className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col lg={5}>
         <h3 className="mb-1">Mentees</h3>
         <div className="text-muted">Active mentees show by default. Use the filters to view the others.</div>
        </Col>
        <Col lg={3} className="text-lg-center">
         <Button variant="dark" onClick={handleAdd}>Add Mentee</Button>
        </Col>
        <Col lg={4}>
         <InputGroup>
          <Form.Control
           type="text"
           value={search}
           placeholder="Search mentees..."
           onChange={e=>setSearch(e.target.value)}
          />
         </InputGroup>
        </Col>
       </Row>

       <Row className="g-2 mt-3">
        <Col xs={12}>
         <ButtonGroup className="flex-wrap">
          {statusOptions.map(option=>(
           <Button
            key={option.key}
            variant={filter===option.key?"dark":"outline-dark"}
            onClick={()=>setPageFilter(option.key)}
           >
            {option.label} <Badge bg={filter===option.key?"light":"dark"} text={filter===option.key?"dark":"light"}>{(menteeGroups[option.key]||[]).length}</Badge>
           </Button>
          ))}
         </ButtonGroup>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {reminderSuccess&&(
     <Col xs={12}>
      <Alert variant="success" className="mb-0" onClose={()=>setReminderSuccess("")} dismissible>
       {reminderSuccess}
      </Alert>
     </Col>
    )}

    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-0">
       {loading?(
        <div className="py-5 text-center">
         <Spinner animation="border" />
        </div>
       ):error?(
        <div className="py-5 text-center text-danger">{error}</div>
       ):(
        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Mentee</th>
            <th>Business</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Hours</th>
            <th>Start</th>
            <th>End</th>
            <th>Risk</th>
            <th>Agreement</th>
            <th className="text-end">Actions</th>
           </tr>
          </thead>
          <tbody>
           {filteredMentees.length?filteredMentees.map(mentee=>{
            const statusCode=getStatusCode(mentee);
            const fullName=getFullName(mentee);
            const existingReminder=getReminderForMentee(mentee);
            return(
             <tr key={mentee._id}>
              <td>
               <div className="d-flex align-items-center gap-3">
                {mentee.image?(
                 <Image
                  src={mentee.image}
                  alt={fullName}
                  roundedCircle
                  width={44}
                  height={44}
                  style={{objectFit:"cover"}}
                 />
                ):(
                 <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-semibold"
                  style={{width:"44px",height:"44px"}}
                 >
                  {`${mentee.firstName?.[0]||""}${mentee.lastName?.[0]||""}`.toUpperCase()}
                 </div>
                )}
                <div>
                 <button type="button" className="mentee-name-link" onClick={()=>handleView(mentee)}>
                  {fullName||"Unnamed Mentee"}
                 </button>
                 {mentee.website?(
                  <a className="mentee-website-link" href={getWebsiteUrl(mentee.website)} target="_blank" rel="noopener noreferrer">{mentee.website}</a>
                 ):<div className="text-muted small">—</div>}
                </div>
               </div>
              </td>
              <td>{mentee.businessName||"—"}</td>
              <td>
               <div>{mentee.email?<a className="mentee-email-link" href={`mailto:${mentee.email}`}>{mentee.email}</a>:"—"}</div>
               <div className="text-muted small">{formatPhone(mentee.phone)}</div>
              </td>
              <td>
               <div className="d-flex flex-wrap gap-2">
                <span className={`app-status-badge status-${statusCode||"unknown"}`}>{statusCode||"unknown"}</span>
                {mentee.isFlagged?<span className="app-status-badge status-flagged">flagged</span>:null}
               </div>
              </td>
              <td>{mentee.hoursNeeded??0}</td>
              <td>{formatDate(mentee.externshipStartDate)}</td>
              <td>{formatDate(mentee.externshipEndDate)}</td>
              <td className="text-capitalize">{mentee.riskLevel||"low"}</td>
              <td>
               <Badge bg={mentee.mentorAgreementCompleted?"success":"secondary"}>
                {getAgreementLabel(mentee)}
               </Badge>
              </td>
              <td className="text-end">
               <div className="d-flex justify-content-end gap-2 flex-wrap">
                <Button size="sm" variant="outline-secondary" onClick={()=>handleEdit(mentee)}>Edit</Button>
                {canAddMentorshipWork(mentee)?<Button size="sm" variant="outline-success" onClick={()=>handleAddSession(mentee)}>Session</Button>:null}
                {existingReminder
                 ?<Button size="sm" variant="outline-danger" onClick={()=>handleEditReminder(mentee)}>Edit Reminder</Button>
                 :canAddMentorshipWork(mentee)?<Button size="sm" variant="outline-danger" onClick={()=>handleAddReminder(mentee)}>Reminder</Button>:null
                }
               </div>
              </td>
             </tr>
            );
           }):(
            <tr>
             <td colSpan="10" className="text-center py-5 text-muted">No mentees found.</td>
            </tr>
           )}
          </tbody>
         </Table>
        </div>
       )}
      </Card.Body>
     </Card>
    </Col>
   </Row>

   <Modal show={showViewModal} onHide={handleCloseView} size="xl" centered dialogClassName="mentee-details-modal">
    <Modal.Header closeButton>
     <Modal.Title>Mentee Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {selectedMentee?(
      <div className="mentee-details-layout">
       <aside className="mentee-details-identity">
        {selectedMentee.image?(
         <Image
          src={selectedMentee.image}
          alt={getFullName(selectedMentee)}
          roundedCircle
          fluid
          className="mentee-details-avatar"
         />
        ):(
         <div className="mentee-details-avatar mentee-details-initials">
          {`${selectedMentee.firstName?.[0]||""}${selectedMentee.lastName?.[0]||""}`.toUpperCase()}
         </div>
        )}
        <div className="mentee-details-name">
         <h4 className="mb-1">{getFullName(selectedMentee)||"Unnamed Mentee"}</h4>
         <div className="d-flex flex-wrap gap-2">
          <span className={`app-status-badge status-${getStatusCode(selectedMentee)||"unknown"}`}>
           {getStatusCode(selectedMentee)||"unknown"}
          </span>
          {selectedMentee.isFlagged?<Badge bg="danger">flagged</Badge>:null}
         </div>
        </div>
       </aside>
       <section className="mentee-details-fields">
        <div className="mentee-detail-row"><span>Email:</span><strong>{selectedMentee.email?<a className="mentee-email-link" href={`mailto:${selectedMentee.email}`}>{selectedMentee.email}</a>:"—"}</strong></div>
        <div className="mentee-detail-row"><span>Phone:</span><strong>{formatPhone(selectedMentee.phone)}</strong></div>
        <div className="mentee-detail-row mentee-detail-wide"><span>Business:</span><strong>{selectedMentee.businessName||"—"}</strong></div>
        <div className="mentee-detail-row mentee-detail-wide"><span>Website:</span><strong>{selectedMentee.website?<a className="mentee-website-link" href={getWebsiteUrl(selectedMentee.website)} target="_blank" rel="noopener noreferrer">{selectedMentee.website}</a>:"—"}</strong></div>
        <div className="mentee-detail-row mentee-detail-wide">
         <span>Address:</span>
         <strong>
          {[selectedMentee.address1,selectedMentee.address2,[selectedMentee.city,selectedMentee.postalCode].filter(Boolean).join(", ")].filter(Boolean).join(" · ")||"—"}
         </strong>
        </div>
        <div className="mentee-detail-row"><span>Hours Needed:</span><strong>{selectedMentee.hoursNeeded??0}</strong></div>
        <div className="mentee-detail-row"><span>Risk Level:</span><strong className="text-capitalize">{selectedMentee.riskLevel||"low"}</strong></div>
        <div className="mentee-detail-row"><span>Start Date:</span><strong>{formatDate(selectedMentee.externshipStartDate)}</strong></div>
        <div className="mentee-detail-row"><span>End Date:</span><strong>{formatDate(selectedMentee.externshipEndDate)}</strong></div>
        <div className="mentee-detail-row"><span>Meeting Day:</span><strong>{selectedMentee.preferredMeetingDay||"—"}</strong></div>
        <div className="mentee-detail-row"><span>Meeting Time:</span><strong>{selectedMentee.preferredMeetingTime||"—"}</strong></div>
        <div className="mentee-detail-row"><span>Duration:</span><strong>{selectedMentee.meetingDuration?`${selectedMentee.meetingDuration} minutes`:"—"}</strong></div>
        <div className="mentee-detail-row"><span>Frequency:</span><strong>{selectedMentee.meetingFrequency||"—"}</strong></div>
        <div className="mentee-detail-row"><span>Meeting Method:</span><strong>{selectedMentee.meetingMethod?.name||selectedMentee.meetingMethod?.label||selectedMentee.meetingMethod?.methodName||"—"}</strong></div>
        <div className="mentee-detail-row mentee-detail-wide"><span>Mentoring Agreement:</span><strong>{getAgreementLabel(selectedMentee)}</strong></div>
        <div className="mentee-detail-row mentee-detail-wide"><span>Flag Reason:</span><strong>{selectedMentee.flagReason||"—"}</strong></div>
       </section>
      </div>
     ):null}
    </Modal.Body>
    <Modal.Footer className="mentee-details-actions">
     <div className="mentee-details-action-group">
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       handleViewTimesheets(selectedMentee);
      }}>View Timesheets</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       navigate(`/mentees/${selectedMentee._id}/sessions`);
      }}>View Sessions</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       handleAddNote(selectedMentee);
      }}>View Notes</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       handleAddGoal(selectedMentee);
      }}>View Goals</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       handleResourcePage(selectedMentee);
      }}>View Resources</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       handleMentorAgreement(selectedMentee);
      }}>View Agreement</Button>
      <Button className="mentee-workflow-button" onClick={()=>{
       setShowViewModal(false);
       navigate(`/mentees/${selectedMentee._id}/tracker`);
      }}>View Mentor Tracker</Button>
      {getReminderForMentee(selectedMentee)
       ?<Button className="mentee-workflow-button" onClick={()=>{
         setShowViewModal(false);
         handleEditReminder(selectedMentee);
        }}>View Reminder</Button>
       :canAddMentorshipWork(selectedMentee)?<Button className="mentee-workflow-button" onClick={()=>{
         setShowViewModal(false);
         handleAddReminder(selectedMentee);
        }}>View Reminders</Button>:null
      }
     </div>
     <div className="mentee-details-action-group mentee-details-primary-actions">
      <Button variant="secondary" onClick={handleCloseView}>Close</Button>
      <Button variant="dark" onClick={()=>{
       setShowViewModal(false);
       handleEdit(selectedMentee);
      }}>Edit</Button>
     </div>
    </Modal.Footer>
   </Modal>

   <Modal show={showAgreementModal} onHide={handleCloseAgreement} size="xl" centered dialogClassName="mentorship-agreement-modal">
    <Modal.Header closeButton>
     <Modal.Title>Mentorship Agreement</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {selectedMentee?(
      <article className="mentorship-agreement">
       <header className="mentorship-agreement-heading">
        <div>
         <p>Mentor and Mentee Record</p>
         <h2>{getFullName(selectedMentee)}</h2>
        </div>
        <span className={`app-status-badge status-${getAgreementStatus(selectedMentee)}`}>
         {getAgreementLabel(selectedMentee)}
        </span>
       </header>

       <section className="mentorship-agreement-terms">
        <div><strong>Mentee:</strong><span>{getFullName(selectedMentee)||"—"}</span></div>
        <div><strong>Business:</strong><span>{selectedMentee.businessName||"—"}</span></div>
        <div><strong>Program:</strong><span>{getProgramNames(selectedMentee)}</span></div>
        <div><strong>Required Hours:</strong><span>{selectedMentee.hoursNeeded??0}</span></div>
        <div><strong>Mentorship Start:</strong><span>{formatDate(selectedMentee.externshipStartDate)}</span></div>
        <div><strong>Mentorship End:</strong><span>{formatDate(selectedMentee.externshipEndDate)}</span></div>
        <div><strong>Meeting Schedule:</strong><span>{[selectedMentee.preferredMeetingDay,selectedMentee.preferredMeetingTime].filter(Boolean).join(" at ")||"—"}</span></div>
        <div><strong>Meeting Frequency:</strong><span>{selectedMentee.meetingFrequency||"—"}</span></div>
        <div><strong>Meeting Duration:</strong><span>{selectedMentee.meetingDuration?`${selectedMentee.meetingDuration} minutes`:"—"}</span></div>
        <div><strong>Meeting Method:</strong><span>{selectedMentee.meetingMethod?.name||selectedMentee.meetingMethod?.label||selectedMentee.meetingMethod?.methodName||"—"}</span></div>
       </section>

       <section className="mentorship-agreement-progress" aria-label="Agreement progress">
        {agreementStages.map((stage,index)=>{
         const currentIndex=agreementStages.findIndex(item=>item.value===getAgreementStatus(selectedMentee));
         const state=index<currentIndex?"is-complete":index===currentIndex?"is-current":"";
         return(
          <div className={state} key={stage.value}>
           <span>{index+1}</span>
           <strong>{stage.label}</strong>
          </div>
         );
        })}
       </section>

       <section className="mentorship-agreement-signature">
        <div><strong>Current Stage:</strong><span>{getAgreementLabel(selectedMentee)}</span></div>
        {selectedMentee.mentorAgreementCompleted?(
         <div><strong>Date Signed:</strong><span>{formatDate(selectedMentee.mentorAgreementCompletedDate)}</span></div>
        ):null}
       </section>
      </article>
     ):null}
    </Modal.Body>
    <Modal.Footer>
     <Button type="button" onClick={()=>{
      setShowAgreementModal(false);
      setShowAgreementEditModal(true);
     }}>Edit Agreement Status</Button>
     <Button variant="secondary" onClick={handleCloseAgreement}>Close</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showAgreementEditModal} onHide={()=>{
    setShowAgreementEditModal(false);
    setShowAgreementModal(true);
   }} centered dialogClassName="mentorship-agreement-edit-modal" backdrop="static" keyboard={false}>
    <Modal.Header closeButton><Modal.Title>Edit Agreement Status</Modal.Title></Modal.Header>
    <Modal.Body>
     <div className="mentorship-agreement-edit">
      <label>Status:
       <select
        value={agreementDraft.status}
        onChange={event=>setAgreementDraft(current=>({
         status:event.target.value,
         signedDate:event.target.value==="signed"?(current.signedDate||getTodayInput()):""
        }))}
       >
        {agreementStages.map(stage=><option key={stage.value} value={stage.value}>{stage.label}</option>)}
       </select>
      </label>
      {agreementDraft.status==="signed"?(
       <label>Date Signed:
        <input
         type="date"
         value={agreementDraft.signedDate}
         onChange={event=>setAgreementDraft(current=>({...current,signedDate:event.target.value}))}
        />
       </label>
      ):null}
     </div>
     {agreementError?<p className="mentorship-agreement-error">{agreementError}</p>:null}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>{
      setShowAgreementEditModal(false);
      setShowAgreementModal(true);
     }}>Cancel</Button>
     <Button type="button" onClick={handleSaveAgreement} disabled={agreementSaving}>
      {agreementSaving?"Saving…":"Save Agreement"}
     </Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showFormModal} onHide={handleCloseForm} size="xl" centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>{formMode==="edit"?"Edit Mentee":"Add Mentee"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <MenteeForm
      mode={formMode}
      isEditMode={formMode==="edit"}
      mentee={selectedMentee}
      initialData={selectedMentee}
      onSuccess={handleFormSuccess}
      onCancel={handleCloseForm}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showTimesheetModal} onHide={handleCloseTimesheet} size="xl" centered backdrop="static" keyboard={false} dialogClassName="timesheet-history-modal">
    <Modal.Header closeButton>
     <Modal.Title>{timesheetModalMode==="add"?"Add Timesheet":"Timesheets"}{selectedMentee?` - ${getFullName(selectedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {timesheetLoading?(
      <div className="py-5 text-center">
       <Spinner animation="border" />
      </div>
     ):(
      <>
       {timesheetError&&<Alert variant="danger" className="mb-3">{timesheetError}</Alert>}
       <TimeSheetForm
        mode="add"
        initialData={{
         mentee:selectedMentee?._id||"",
         hoursNeeded:selectedMentee?.hoursNeeded||0,
         weeks:timesheets
        }}
        lockedMentee={selectedMentee}
        allowCreate={canAddMentorshipWork(selectedMentee)}
        allowEdit={canAddMentorshipWork(selectedMentee)}
        allowDelete={canAddMentorshipWork(selectedMentee)}
        currentUser={user}
        onSubmit={handleTimesheetSubmit}
       />
      </>
     )}
    </Modal.Body>
   </Modal>

   <Modal show={showSessionModal} onHide={handleCloseSession} size="xl" centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>Add Session{selectedMentee?` - ${getFullName(selectedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <WeeklySessionForm
      mode="create"
      menteeId={selectedMentee?._id||""}
      mentee={selectedMentee}
      session={null}
      user={user}
      onSuccess={handleSessionSuccess}
      onCancel={handleCloseSession}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showNoteModal} onHide={handleCloseNote} size="lg" centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>Mentor Notes{selectedMentee?` - ${getFullName(selectedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {mentorNotesLoading?(
      <div className="py-5 text-center">
       <Spinner animation="border" />
      </div>
     ):(
      <>
       {mentorNotesError&&<Alert variant="danger" className="mb-3">{mentorNotesError}</Alert>}
       <MentorNoteForm
        mode="add"
        initialData={{
         mentee:selectedMentee?._id||""
        }}
         lockedMentee={selectedMentee}
         allowCreate={canAddMentorshipWork(selectedMentee)}
         allowDelete={canAddMentorshipWork(selectedMentee)}
        currentUser={user}
        notes={mentorNotes}
        onSubmit={handleNoteSubmit}
        onDelete={handleNoteDelete}
       />
      </>
     )}
    </Modal.Body>
   </Modal>

   <Modal show={showGoalModal} onHide={handleCloseGoal} size="xl" centered backdrop="static" keyboard={false} dialogClassName="smart-goals-modal" contentClassName="smart-goals-modal-content">
    <Modal.Header closeButton>
     <Modal.Title>SMART Goals{selectedMentee?` - ${getFullName(selectedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {smartGoalsError?<Alert variant="danger">{smartGoalsError}</Alert>:null}

     <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Saved Goals</h5>
      <Button variant="outline-primary" size="sm" onClick={()=>setSelectedGoal(null)}>Add New Goal</Button>
     </div>

     {smartGoalsLoading?(
      <div className="py-3 text-center"><Spinner animation="border" size="sm"/></div>
     ):(
      <Table responsive hover size="sm" className="align-middle">
       <thead>
        <tr>
         <th>Week</th>
         <th>Specific Goal</th>
         <th>Progress</th>
         <th>Status</th>
         <th className="text-end">Actions</th>
        </tr>
       </thead>
       <tbody>
        {smartGoals.length?smartGoals.map(goal=>(
         <tr key={goal._id}>
          <td>{goal.weekNumber}</td>
          <td>{goal.specific}</td>
          <td>{goal.progressPercent??0}%</td>
          <td>{goal.status?.name||goal.status?.code||"—"}</td>
          <td className="text-end">
           <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" size="sm" onClick={()=>setSelectedGoal(goal)}>Edit</Button>
            <Button variant="outline-danger" size="sm" onClick={()=>setGoalDeleteTarget(goal)}>Delete</Button>
           </div>
          </td>
         </tr>
        )):(
         <tr><td colSpan="5" className="text-center text-muted py-3">No SMART goals saved.</td></tr>
        )}
       </tbody>
      </Table>
     )}

     <SmartGoalForm
      mode={selectedGoal?"edit":"add"}
      initialData={goalInitialData}
      lockedMentee={selectedMentee}
      currentUser={user}
      users={user?[user]:[]}
      statuses={statuses.filter(status=>status?.type==="smartGoal")}
      onSubmit={handleGoalSubmit}
     />
    </Modal.Body>
   </Modal>

   <Modal show={!!goalDeleteTarget} onHide={()=>setGoalDeleteTarget(null)} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete SMART Goal</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     Are you sure you want to delete the Week {goalDeleteTarget?.weekNumber} SMART goal?
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setGoalDeleteTarget(null)}>Cancel</Button>
     <Button variant="danger" onClick={()=>handleGoalDelete(goalDeleteTarget?._id)}>Delete</Button>
    </Modal.Footer>
   </Modal>

   <Modal show={showReminderModal} onHide={handleCloseReminder} size="lg" centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
     <Modal.Title>{reminderMode==="edit"?"Edit Reminder":"Add Reminder"}{selectedMentee?` - ${getFullName(selectedMentee)}`:""}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <ReminderForm
      mode={reminderMode}
      lockedMentee={selectedMentee}
      currentUser={user}
      initialData={selectedReminder||{}}
      onSubmit={handleReminderSubmit}
      onCancel={handleCloseReminder}
     />
    </Modal.Body>
   </Modal>
  </Container>
 );
}

export default MenteesPage
