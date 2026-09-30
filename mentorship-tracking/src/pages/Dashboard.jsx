import {useEffect,useMemo,useRef,useState} from "react";
import {Modal} from "react-bootstrap";
import MenteeForm from "./forms/MenteeForm";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardMetrics from "../components/dashboard/DashboardMetrics";
import DashboardMenteeRoster from "../components/dashboard/DashboardMenteeRoster";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DashboardAttentionQueue from "../components/dashboard/DashboardAttentionQueue";
import DashboardDailyWork from "../components/dashboard/DashboardDailyWork";
import DashboardUpcomingSchedule from "../components/dashboard/DashboardUpcomingSchedule";
import "../styles/CalendarPage.css";
import "../styles/Dashboard.css";

const getItems=(payload,key)=>Array.isArray(payload)?payload:(Array.isArray(payload?.[key])?payload[key]:[]);
const getStatusCode=item=>{
 if(!item?.status)return"";
 if(typeof item.status==="string")return item.status.toLowerCase();
 return String(item.status.code||item.status.name||"").toLowerCase().replace(/\s+/g,"-");
};
const getStatusId=item=>{
 const value=typeof item?.status==="object"?item.status?._id:item?.status;
 return value?String(value):"";
};
const getMenteeId=item=>String(item?.mentee?._id||item?.mentee||item?.menteeId?._id||item?.menteeId||item?._id||"");
const getMenteeName=item=>{
 const source=item?.mentee&&typeof item.mentee==="object"?item.mentee:item;
 return source?.fullName||`${source?.firstName||""} ${source?.lastName||""}`.trim()||item?.menteeName||item?.title||"Mentee";
};
const meetingDayIndexes={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
const getMeetingMethodName=mentee=>mentee?.meetingMethod?.name||mentee?.meetingMethod?.label||mentee?.meetingMethod?.methodName||"Mentoring";
const buildLocalDate=value=>{
 if(!value)return null;
 const raw=String(value).slice(0,10);
 const [year,month,day]=raw.split("-").map(Number);
 if(!year||!month||!day)return null;
 const date=new Date(year,month-1,day);
 return Number.isNaN(date.getTime())?null:date;
};

function Dashboard({user}){
 const[data,setData]=useState({mentees:[],weeklySessions:[],timesheets:[],smartGoals:[],menteeFiles:[],calendarEvents:[],mentorNotes:[],statuses:[],tasks:[]});
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[showAddMenteeModal,setShowAddMenteeModal]=useState(false);
 const[menteeSearch,setMenteeSearch]=useState("");
 const[visibleStatusIds,setVisibleStatusIds]=useState([]);
 const[showFlagged,setShowFlagged]=useState(false);
 const statusFiltersInitialized=useRef(false);

 const loadDashboard=async()=>{
  const fetchJson=async(url,key)=>{
   const response=await fetch(url,{credentials:"include",headers:{"Content-Type":"application/json"}});
   if(!response.ok)throw new Error(`Failed to load ${key}`);
   return getItems(await response.json(),key);
  };
  try{
   setLoading(true);
   setError("");
   const userId=user?._id||user?.id||"";
   const[mentees,weeklySessions,timesheets,smartGoals,menteeFiles,calendarEvents,mentorNotes,statuses,tasks]=await Promise.all([
    fetchJson("/api/mentees","mentees"),
    fetchJson("/api/weekly-sessions/list","weeklySessions"),
    fetchJson("/api/timesheets/list","timesheets"),
    fetchJson("/api/smart-goals/list","smartGoals"),
    fetchJson("/api/mentee-files","menteeFiles"),
    fetchJson("/api/calendar-events/list","calendarEvents"),
    fetchJson("/api/mentor-notes/list","mentorNotes"),
    fetchJson("/api/statuses/list?type=mentee&isActive=true","statuses"),
    userId?fetchJson(`/api/tasks?user=${encodeURIComponent(userId)}`,"tasks"):Promise.resolve([])
   ]);
   setData({mentees,weeklySessions,timesheets,smartGoals,menteeFiles,calendarEvents,mentorNotes,statuses,tasks});
   if(!statusFiltersInitialized.current){
    setVisibleStatusIds(statuses.filter(status=>["incoming","active"].includes(String(status.code||"").toLowerCase())).map(status=>String(status._id)));
    statusFiltersInitialized.current=true;
   }
  }catch(err){
   setError(err.message||"Failed to load dashboard data");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{loadDashboard();},[]);

 const visibleMentees=useMemo(()=>{
  const query=menteeSearch.trim().toLowerCase();
  return data.mentees.filter(mentee=>{
   const statusMatch=visibleStatusIds.includes(getStatusId(mentee))||(showFlagged&&mentee.isFlagged);
   const searchMatch=!query||`${getMenteeName(mentee)} ${mentee.email||""} ${mentee.businessName||""}`.toLowerCase().includes(query);
   return statusMatch&&searchMatch;
  }).sort((a,b)=>getMenteeName(a).localeCompare(getMenteeName(b)));
 },[data.mentees,visibleStatusIds,showFlagged,menteeSearch]);

 const statusFor=mentee=>data.statuses.find(item=>String(item._id)===getStatusId(mentee));
 const incomingMentees=data.mentees.filter(mentee=>String(statusFor(mentee)?.code||"").toLowerCase()==="incoming");
 const activeMentees=data.mentees.filter(mentee=>String(statusFor(mentee)?.code||"").toLowerCase()==="active");
 const scheduledEvents=useMemo(()=>data.calendarEvents.map(event=>{
  const start=new Date(event.start);
  const end=new Date(event.end);
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return null;
  return{
   id:String(event._id),
   title:event.title||getMenteeName(event),
   start,
   end,
   allDay:false,
   resource:{
    menteeId:getMenteeId(event),
    menteeName:getMenteeName(event),
    eventType:event.eventType||"session",
    notes:Array.isArray(event.notes)?event.notes:(event.notes?[event.notes]:[]),
    status:"scheduled"
   }
  };
 }).filter(Boolean),[data.calendarEvents]);

 const sessionEvents=useMemo(()=>data.weeklySessions.map(session=>{
  if(["completed","missed","cancelled"].includes(getStatusCode(session)))return null;
  const alreadyScheduled=data.calendarEvents.some(event=>String(event?.weeklySession?._id||event?.weeklySession||"")===String(session._id));
  if(alreadyScheduled)return null;
  const start=new Date(session.sessionDate);
  if(Number.isNaN(start.getTime()))return null;
  const end=new Date(start.getTime()+30*60000);
  return{
   id:`session-${session._id}`,
   title:`Session · ${getMenteeName(session)}`,
   start,
   end,
   allDay:false,
   resource:{
    sourceType:"weeklySession",
    sourceId:String(session._id),
    menteeId:getMenteeId(session),
    menteeName:getMenteeName(session),
    eventType:"mentee session",
    notes:session.notes?[session.notes]:[],
    status:getStatusCode(session)||"scheduled"
   }
  };
 }).filter(Boolean),[data.weeklySessions,data.calendarEvents]);

 const taskEvents=useMemo(()=>data.tasks.map(task=>{
  if(!task.dueDate||["done","completed","cancelled"].includes(String(task.status||"").toLowerCase()))return null;
  const start=new Date(task.dueDate);
  if(Number.isNaN(start.getTime()))return null;
  const hasTime=start.getHours()!==0||start.getMinutes()!==0;
  return{
   id:`task-${task._id}`,
   title:`Task · ${task.name}`,
   start,
   end:new Date(start.getTime()+(hasTime?30*60000:24*60*60000)),
   allDay:!hasTime,
   resource:{
    sourceType:"task",
    sourceId:String(task._id),
    eventType:"task",
    notes:task.description?[task.description]:[],
    status:task.status||"Open"
   }
  };
 }).filter(Boolean),[data.tasks]);

 const recurringMenteeSessions=useMemo(()=>data.mentees.flatMap(mentee=>{
  const menteeStatus=data.statuses.find(status=>String(status._id)===getStatusId(mentee));
  if(!["incoming","active"].includes(String(menteeStatus?.code||"").toLowerCase()))return[];
  const startDate=buildLocalDate(mentee.externshipStartDate);
  const endDate=buildLocalDate(mentee.externshipEndDate);
  const meetingDay=meetingDayIndexes[String(mentee.preferredMeetingDay||"").toLowerCase()];
  if(!startDate||!endDate||meetingDay===undefined||!mentee.preferredMeetingTime)return[];

  const firstMeeting=new Date(startDate);
  firstMeeting.setDate(firstMeeting.getDate()+(meetingDay-firstMeeting.getDay()+7)%7);
  const [hours,minutes]=String(mentee.preferredMeetingTime).split(":").map(Number);
  firstMeeting.setHours(Number.isFinite(hours)?hours:0,Number.isFinite(minutes)?minutes:0,0,0);
  const durationMinutes=Number(mentee.meetingDuration)||30;
  const occurrences=[];

  for(let week=0;week<6;week+=1){
   const occurrenceStart=new Date(firstMeeting);
   occurrenceStart.setDate(firstMeeting.getDate()+week*7);
   if(occurrenceStart>endDate)break;

   const menteeId=String(mentee._id);
   const isDuplicate=[...data.calendarEvents,...data.weeklySessions].some(item=>{
    if(getMenteeId(item)!==menteeId)return false;
    const itemDate=new Date(item.start||item.sessionDate);
    return !Number.isNaN(itemDate.getTime())&&itemDate.toDateString()===occurrenceStart.toDateString();
   });
   if(isDuplicate)continue;

   const method=getMeetingMethodName(mentee);
   occurrences.push({
    id:`mentee-schedule-${menteeId}-${occurrenceStart.toISOString()}`,
    title:`${method} · ${getMenteeName(mentee)}`,
    start:occurrenceStart,
    end:new Date(occurrenceStart.getTime()+durationMinutes*60000),
    allDay:false,
    resource:{
     sourceType:"menteeSchedule",
     menteeId,
     menteeName:getMenteeName(mentee),
     eventType:`${method} session`,
     notes:[`Weekly ${method} meeting from the mentee schedule.`],
     status:"scheduled"
    }
   });
  }
  return occurrences;
 }),[data.mentees,data.statuses,data.calendarEvents,data.weeklySessions]);

 const now=new Date();
 const calendarEvents=useMemo(
  ()=>[...scheduledEvents,...sessionEvents,...recurringMenteeSessions,...taskEvents].sort((a,b)=>a.start-b.start),
  [scheduledEvents,sessionEvents,recurringMenteeSessions,taskEvents]
 );
 const upcomingSessions=[...scheduledEvents,...sessionEvents,...recurringMenteeSessions].filter(event=>new Date(event.start)>=now);
 const pendingTimesheets=data.timesheets.filter(item=>getStatusCode(item)==="pending");
 const goalsNeedingWork=data.smartGoals.filter(item=>["not-started","revised","at-risk"].includes(getStatusCode(item)));
 const flaggedNotes=data.mentorNotes.filter(item=>item.isFlagged||item.followUpRequired);
 const todayKey=new Date().toLocaleDateString("en-CA");
 const notesTakenToday=data.mentorNotes.filter(item=>{
  if(!item.createdAt)return false;
  return new Date(item.createdAt).toLocaleDateString("en-CA")===todayKey;
 }).map(note=>({...note,menteeName:getMenteeName(note)}));
 const flaggedMentees=data.mentees.filter(item=>item.isFlagged);
 const agreementsInProgress=data.mentees.filter(item=>{
  const stage=String(item.mentorAgreementStatus||"not-started").toLowerCase();
  return stage!=="not-started"&&stage!=="signed";
 });
 const weekEnd=new Date(); weekEnd.setDate(weekEnd.getDate()+7);
 const meetingsNextSevenDays=upcomingSessions.filter(item=>new Date(item.start)<=weekEnd);
 const metrics=[
  {label:"Incoming Mentees",value:incomingMentees.length,to:"/mentees?filter=incoming",tone:"incoming"},
  {label:"Active Mentees",value:activeMentees.length,to:"/mentees?filter=active",tone:"active"},
  {label:"Scheduled - Next 7 Days",value:meetingsNextSevenDays.length,to:"#upcoming-schedule",tone:"scheduled"},
  {label:"Pending Timesheets",value:pendingTimesheets.length,to:"/timesheets",tone:"pending"},
  {label:"Goals Needing Work",value:goalsNeedingWork.length,to:"/mentees?filter=active",tone:"warning"},
  {label:"Follow-ups",value:flaggedNotes.length,to:"/mentees?filter=flagged",tone:"danger"}
 ];

 if(loading)return <section className="mentor-dashboard"><div className="mentor-dashboard-message">Loading mentor dashboard…</div></section>;
 if(error)return <section className="mentor-dashboard"><div className="mentor-dashboard-message mentor-dashboard-error">{error}</div></section>;

 return(
  <>
   <section className="mentor-dashboard">
    <DashboardHeader onAddMentee={()=>setShowAddMenteeModal(true)}/>
    <DashboardMetrics metrics={metrics}/>
    <div className="mentor-dashboard-workspace">
     <div className="mentor-dashboard-people">
      <DashboardMenteeRoster
       statuses={data.statuses}
       visibleStatusIds={visibleStatusIds}
       showFlagged={showFlagged}
       search={menteeSearch}
       mentees={visibleMentees}
       getStatusId={getStatusId}
       getMenteeName={getMenteeName}
       onToggleStatus={statusId=>setVisibleStatusIds(current=>current.includes(statusId)?current.filter(item=>item!==statusId):[...current,statusId])}
       onToggleFlagged={setShowFlagged}
       onSearch={setMenteeSearch}
       onClear={()=>{
        setVisibleStatusIds([]);
        setShowFlagged(false);
        setMenteeSearch("");
       }}
      />
     </div>
     <DashboardDailyWork user={user} notes={notesTakenToday} tasks={data.tasks}/>
     <DashboardUpcomingSchedule events={meetingsNextSevenDays}/>
     <DashboardCalendar events={calendarEvents} mentees={[...incomingMentees,...activeMentees]} user={user} onChanged={loadDashboard}/>
     <DashboardAttentionQueue
      pendingTimesheets={pendingTimesheets.length}
      flaggedMentees={flaggedMentees.length}
      goalsNeedingWork={goalsNeedingWork.length}
      flaggedNotes={flaggedNotes.length}
      agreementsInProgress={agreementsInProgress.length}
     />
    </div>
   </section>
   <Modal show={showAddMenteeModal} onHide={()=>setShowAddMenteeModal(false)} backdrop="static" keyboard={false} centered size="xl">
    <Modal.Header closeButton><Modal.Title>Add Mentee</Modal.Title></Modal.Header>
    <Modal.Body className="p-0">
     <MenteeForm user={user} mode="add" onSuccess={async()=>{setShowAddMenteeModal(false);await loadDashboard();}} onCancel={()=>setShowAddMenteeModal(false)}/>
    </Modal.Body>
   </Modal>
  </>
 );
}

export default Dashboard;
