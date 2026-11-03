import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Spinner} from "react-bootstrap";
import {Download,FileBarChart,Printer,RefreshCw} from "lucide-react";
import "../styles/Reports.css";

const reportTypes=[
 {value:"progress",label:"Mentee Progress Summary"},
 {value:"complete",label:"Complete Mentorship Record"},
 {value:"sessions",label:"Sessions and Meetings"},
 {value:"timesheets",label:"Hours and Timesheets"},
 {value:"goals",label:"SMART Goals"},
 {value:"notes",label:"Mentor Notes and Flags"},
 {value:"files",label:"Images and Documents"},
 {value:"agreement",label:"Mentoring Agreement Record"},
 {value:"resources",label:"Resources Given to Mentees"}
];

const agreementStatusLabel=item=>{
 const value=item.mentorAgreementCompleted?"signed":(item.mentorAgreementStatus||"not-started");
 return({
  "not-started":"Not Started",
  "waiting-for-mentee-signature":"Waiting for Mentee Signature",
  "waiting-for-career-services":"Waiting for Career Services",
  "waiting-for-mentor-signature":"Waiting for Mentor Signature",
  signed:"Signed / Complete"
 })[value]||"Not Started";
};

const getItems=(payload,key)=>Array.isArray(payload)?payload:Array.isArray(payload?.[key])?payload[key]:[];
const getStatus=item=>typeof item?.status==="string"?item.status:String(item?.status?.code||item?.status?.name||"");
const getMenteeId=item=>String(item?.mentee?._id||item?.mentee||item?.menteeId?._id||item?.menteeId||"");
const getName=item=>{
 const source=item?.mentee&&typeof item.mentee==="object"?item.mentee:item;
 return source?.fullName||`${source?.firstName||""} ${source?.lastName||""}`.trim()||item?.menteeName||"—";
};
const getDateValue=item=>item?.sessionDate||item?.weekStarting||item?.targetDate||item?.givenDate||item?.sharedDate||item?.date||item?.createdAt||item?.updatedAt||"";
const formatDate=value=>{
 if(!value)return"—";
 const normalized=typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)?`${value}T00:00:00`:value;
 const date=new Date(normalized);
 return Number.isNaN(date.getTime())?"—":date.toLocaleDateString();
};
const toDateInput=value=>{
 if(!value)return"";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toISOString().slice(0,10);
};
const text=value=>{
 if(value===null||value===undefined||value==="")return"—";
 if(typeof value==="object")return value.name||value.label||value.title||value.fileName||"—";
 return String(value);
};

function Reports(){
 const[data,setData]=useState({
  mentees:[],
  sessions:[],
  timesheets:[],
  goals:[],
  notes:[],
  files:[],
  resources:[]
 });
 const[loading,setLoading]=useState(true);
 const[error,setError]=useState("");
 const[scope,setScope]=useState("overall");
 const[selectedMenteeId,setSelectedMenteeId]=useState("");
 const[menteeSearch,setMenteeSearch]=useState("");
 const[reportType,setReportType]=useState("progress");
 const[dateMode,setDateMode]=useState("all");
 const[startDate,setStartDate]=useState("");
 const[endDate,setEndDate]=useState("");
 const[generated,setGenerated]=useState(null);

 useEffect(()=>{
  const fetchJson=async(url,key)=>{
   const response=await fetch(url,{credentials:"include"});
   if(!response.ok)throw new Error(`Failed to load ${key}`);
   return getItems(await response.json(),key);
  };

  const load=async()=>{
   try{
    setLoading(true);
    setError("");
    const[mentees,sessions,timesheets,goals,notes,files,resources]=await Promise.all([
     fetchJson("/api/mentees","mentees"),
     fetchJson("/api/weekly-sessions/list","weeklySessions"),
     fetchJson("/api/timesheets/list","timesheets"),
     fetchJson("/api/smart-goals/list","smartGoals"),
     fetchJson("/api/mentor-notes/list","mentorNotes"),
     fetchJson("/api/mentee-files","menteeFiles"),
     fetchJson("/api/resources/given","resources")
    ]);
    setData({mentees,sessions,timesheets,goals,notes,files,resources});
   }catch(err){
    setError(err.message||"Failed to load report data.");
   }finally{
    setLoading(false);
   }
  };

  load();
 },[]);

 const sortedMentees=useMemo(
  ()=>[...data.mentees].sort((a,b)=>getName(a).localeCompare(getName(b))),
  [data.mentees]
 );
 const visibleMentees=useMemo(()=>{
  const query=menteeSearch.trim().toLowerCase();
  if(!query)return sortedMentees;
  return sortedMentees.filter(item=>`${getName(item)} ${item.email||""} ${item.businessName||""}`.toLowerCase().includes(query));
 },[sortedMentees,menteeSearch]);

 const selectedMentee=sortedMentees.find(item=>String(item._id)===selectedMenteeId)||null;
 const menteeStartDate=toDateInput(selectedMentee?.externshipStartDate);
 const effectiveStartDate=dateMode==="lifecycle"?menteeStartDate:dateMode==="custom"?startDate:"";
 const effectiveEndDate=dateMode==="all"?"":endDate;

 const inDateRange=item=>{
  if(!effectiveStartDate&&!effectiveEndDate)return true;
  const value=getDateValue(item);
  if(!value)return false;
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return false;
  if(effectiveStartDate&&date<new Date(`${effectiveStartDate}T00:00:00`))return false;
  if(effectiveEndDate&&date>new Date(`${effectiveEndDate}T23:59:59`))return false;
  return true;
 };

 const inScope=item=>scope==="overall"||getMenteeId(item)===selectedMenteeId;
 const filterRecords=items=>items.filter(item=>inScope(item)&&inDateRange(item));

 const buildProgressRows=()=>{
  const mentees=scope==="mentee"?sortedMentees.filter(item=>String(item._id)===selectedMenteeId):sortedMentees;
  return mentees.map(mentee=>{
   const id=String(mentee._id);
   const sessions=filterRecords(data.sessions).filter(item=>getMenteeId(item)===id);
   const timesheets=filterRecords(data.timesheets).filter(item=>getMenteeId(item)===id);
   const goals=filterRecords(data.goals).filter(item=>getMenteeId(item)===id);
   const notes=filterRecords(data.notes).filter(item=>getMenteeId(item)===id);
   const hours=timesheets.reduce((total,item)=>total+Number(item.hours||0),0);
   return{
    Mentee:getName(mentee),
    Status:text(getStatus(mentee)),
    Business:text(mentee.businessName),
    "Hours Logged":hours,
    "Hours Needed":Number(mentee.hoursNeeded||0),
    Sessions:sessions.length,
    "Open Goals":goals.filter(item=>!["completed","achieved"].includes(getStatus(item).toLowerCase())).length,
    Flags:Number(Boolean(mentee.isFlagged))+notes.filter(item=>item.isFlagged||item.followUpRequired).length
   };
  });
 };

 const buildCompleteRows=()=>{
  const rows=[];
  const add=(section,items,description)=>items.forEach(item=>rows.push({
   Section:section,
   Date:formatDate(getDateValue(item)),
   Mentee:getName(item),
   Status:text(getStatus(item)),
   Details:description(item)
  }));
  add("Session",filterRecords(data.sessions),item=>item.competencyDiscussed||item.notes||`Week ${item.weekNumber||"—"}`);
  add("Timesheet",filterRecords(data.timesheets),item=>`${item.hours||0} hours - Week ${item.weekNumber||"—"}${item.notes?` - ${item.notes}`:""}`);
  add("SMART Goal",filterRecords(data.goals),item=>`${item.specific||"Goal"} - ${item.progressPercent||0}%`);
 add("Mentor Note",filterRecords(data.notes),item=>item.note||"Note");
 add("File",filterRecords(data.files),item=>item.fileName||item.title||"File");
  add("Resource Given",filterRecords(data.resources),item=>item.resource?.title||"Resource");
  const agreementMentees=scope==="mentee"?sortedMentees.filter(item=>String(item._id)===selectedMenteeId):sortedMentees;
  agreementMentees.forEach(item=>rows.push({
   Section:"Mentoring Agreement",
   Date:formatDate(item.mentorAgreementCompletedDate),
   Mentee:getName(item),
   Status:agreementStatusLabel(item),
   Details:"Escoffier mentoring agreement record"
  }));
  return rows.sort((a,b)=>String(b.Date).localeCompare(String(a.Date)));
 };

 const buildRows=type=>{
  if(type==="progress")return buildProgressRows();
  if(type==="complete")return buildCompleteRows();
  if(type==="sessions")return filterRecords(data.sessions).map(item=>({
   Date:formatDate(item.sessionDate),Mentee:getName(item),Week:text(item.weekNumber),Status:text(getStatus(item)),
   Method:text(item.sessionType),"Competency Discussed":text(item.competencyDiscussed),"Action Plan":text(item.actionPlanStep)
  }));
  if(type==="timesheets")return filterRecords(data.timesheets).map(item=>({
   "Week Starting":formatDate(item.weekStarting),Mentee:getName(item),Week:text(item.weekNumber),Hours:Number(item.hours||0),
   Status:text(getStatus(item)),Source:text(item.source),Notes:text(item.notes)
  }));
  if(type==="goals")return filterRecords(data.goals).map(item=>({
   Mentee:getName(item),Week:text(item.weekNumber),Goal:text(item.specific),"Progress %":Number(item.progressPercent||0),
   Status:text(getStatus(item)),"Target Date":formatDate(item.targetDate),"Mentor Comments":text(item.mentorComments)
  }));
  if(type==="notes")return filterRecords(data.notes).map(item=>({
   Date:formatDate(item.createdAt),Mentee:getName(item),Week:text(item.weekNumber),Category:text(item.category),
   Risk:text(item.riskLevel),Flagged:item.isFlagged?"Yes":"No","Follow-up":item.followUpRequired?"Yes":"No",Note:text(item.note)
  }));
  if(type==="files")return filterRecords(data.files).map(item=>({
   Date:formatDate(item.createdAt),Mentee:getName(item),Week:text(item.weekNumber),File:text(item.fileName||item.title),
   Type:text(item.fileType||item.category),Description:text(item.description)
  }));
  if(type==="agreement"){
   const mentees=scope==="mentee"?sortedMentees.filter(item=>String(item._id)===selectedMenteeId):sortedMentees;
   return mentees.map(item=>({
    Mentee:getName(item),Status:text(getStatus(item)),"Agreement Status":agreementStatusLabel(item),
    "Completion Date":formatDate(item.mentorAgreementCompletedDate),"Externship Start":formatDate(item.externshipStartDate),
    "Externship End":formatDate(item.externshipEndDate),Program:Array.isArray(item.programs)?item.programs.map(program=>program.courseName||program.name).filter(Boolean).join(", "):"—"
   }));
  }
  if(type==="resources")return filterRecords(data.resources).map(item=>({
   "Date Given":formatDate(item.givenDate),Mentee:getName(item),Resource:text(item.resource?.title),Category:text(item.resource?.category),
   Type:item.resource?.links?.map(link=>link.resourceType).filter(Boolean).join(", ")||"—","Follow-up":item.followUpNeeded?"Yes":"No",
   "Follow-up Date":formatDate(item.followUpDate),Notes:text(item.notes)
  }));
  return[];
 };

 const generateReport=()=>{
  if(scope==="mentee"&&!selectedMenteeId){
   setError("Select a mentee before generating a per-mentee report.");
   return;
  }
  setError("");
  setGenerated({
   title:reportTypes.find(item=>item.value===reportType)?.label||"Report",
   scope:scope==="overall"?"All Mentees":getName(selectedMentee),
   period:dateMode==="lifecycle"
    ?`${effectiveStartDate?formatDate(effectiveStartDate):"Start date not recorded"} through ${effectiveEndDate?formatDate(effectiveEndDate):"Present"}`
    :dateMode==="custom"
     ?`${effectiveStartDate?formatDate(effectiveStartDate):"Beginning"} through ${effectiveEndDate?formatDate(effectiveEndDate):"Present"}`
     :"All Dates",
   periodRule:dateMode==="lifecycle"?"Mentee lifecycle":dateMode==="custom"?"Custom range":"All dates",
   createdAt:new Date(),
   rows:buildRows(reportType)
  });
 };

 const downloadCsv=()=>{
  if(!generated?.rows.length)return;
  const columns=Object.keys(generated.rows[0]);
  const escape=value=>`"${String(value??"").replace(/"/g,'""')}"`;
  const csv=[columns.map(escape).join(","),...generated.rows.map(row=>columns.map(column=>escape(row[column])).join(","))].join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.download=`${generated.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
 };

 const columns=generated?.rows.length?Object.keys(generated.rows[0]):[];

 return(
  <main className="report-workspace">
   <header className="report-header">
    <div><p>Reporting</p><h1>Mentorship Report Generator</h1><span>Configure the report you need, generate it, then print or export the results.</span></div>
   </header>

   {error?<Alert variant="danger" className="mb-0">{error}</Alert>:null}

   {loading?<div className="report-loading"><Spinner animation="border"/>Loading report records…</div>:(
    <>
     <section className="report-builder">
      <div className="report-inline-field">
       <label htmlFor="report-scope">Scope:</label>
       <select id="report-scope" value={scope} onChange={event=>{
        const nextScope=event.target.value;
        setScope(nextScope);
        setDateMode(nextScope==="mentee"?"lifecycle":"all");
        setGenerated(null);
       }}>
        <option value="overall">Overall - All Mentees</option>
        <option value="mentee">One Mentee</option>
       </select>
      </div>

      {scope==="mentee"?(
       <>
        <div className="report-inline-field">
         <label htmlFor="report-mentee-search">Find:</label>
         <input id="report-mentee-search" type="search" value={menteeSearch} onChange={event=>setMenteeSearch(event.target.value)} placeholder="Search name, email, or business"/>
        </div>
        <div className="report-inline-field">
         <label htmlFor="report-mentee">Mentee:</label>
         <select id="report-mentee" value={selectedMenteeId} onChange={event=>{
          setSelectedMenteeId(event.target.value);
          setDateMode("lifecycle");
          setGenerated(null);
         }}>
          <option value="">Choose a mentee</option>
          {visibleMentees.map(item=><option key={item._id} value={item._id}>{getName(item)} - {getStatus(item)||"No status"}</option>)}
         </select>
        </div>
       </>
      ):null}

      <div className="report-inline-field">
       <label htmlFor="report-type">Report:</label>
       <select id="report-type" value={reportType} onChange={event=>setReportType(event.target.value)}>
        {reportTypes.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </div>

      <div className="report-inline-field">
       <label htmlFor="report-period">Period:</label>
       <select id="report-period" value={dateMode} onChange={event=>{setDateMode(event.target.value);setGenerated(null);}}>
        {scope==="mentee"?<option value="lifecycle">Mentee lifecycle</option>:null}
        <option value="all">All dates</option>
        <option value="custom">Custom range</option>
       </select>
      </div>

      {dateMode==="lifecycle"?(
       <>
        <div className="report-inline-field">
         <label htmlFor="report-lifecycle-start">From:</label>
         <input id="report-lifecycle-start" type="date" value={menteeStartDate} readOnly title="Automatically supplied from the mentee profile"/>
        </div>
        <div className="report-inline-field">
         <label htmlFor="report-lifecycle-end">Through (optional):</label>
         <input id="report-lifecycle-end" type="date" value={endDate} min={menteeStartDate||undefined} onChange={event=>setEndDate(event.target.value)}/>
        </div>
       </>
      ):null}

      {dateMode==="custom"?(
       <>
        <div className="report-inline-field">
         <label htmlFor="report-start">From (optional):</label>
         <input id="report-start" type="date" value={startDate} onChange={event=>setStartDate(event.target.value)}/>
        </div>
        <div className="report-inline-field">
         <label htmlFor="report-end">Through (optional):</label>
         <input id="report-end" type="date" value={endDate} min={startDate||undefined} onChange={event=>setEndDate(event.target.value)}/>
        </div>
       </>
      ):null}

      <Button onClick={generateReport}><FileBarChart size={17}/>Generate Report</Button>
      <Button variant="outline-secondary" onClick={()=>{setStartDate("");setEndDate("");setDateMode(scope==="mentee"?"lifecycle":"all");setGenerated(null);}}><RefreshCw size={16}/>Clear</Button>
     </section>

     {generated?(
      <section className="generated-report">
       <header>
        <div>
         <p>Generated {generated.createdAt.toLocaleString()}</p>
         <h2>{generated.title}</h2>
         <div className="generated-report-facts">
          <span>Scope: <strong>{generated.scope}</strong></span>
          <span>Period rule: <strong>{generated.periodRule}</strong></span>
          <span>Period: <strong>{generated.period}</strong></span>
          <span>Records: <strong>{generated.rows.length}</strong></span>
         </div>
        </div>
        <div className="report-output-actions">
         <Button variant="outline-dark" onClick={()=>window.print()}><Printer size={16}/>Print</Button>
         <Button variant="outline-dark" onClick={downloadCsv} disabled={!generated.rows.length}><Download size={16}/>Export CSV</Button>
        </div>
       </header>

       {generated.rows.length?(
        <div className="report-table-wrap">
         <table>
          <thead><tr>{columns.map(column=><th key={column}>{column}</th>)}</tr></thead>
          <tbody>{generated.rows.map((row,index)=>(
           <tr key={`${index}-${columns.map(column=>row[column]).join("-")}`}>
            {columns.map(column=><td key={column}>{text(row[column])}</td>)}
           </tr>
          ))}</tbody>
         </table>
        </div>
       ):<div className="report-empty">No records match the selected scope, report type, and date range.</div>}
      </section>
     ):(
      <section className="report-empty">Choose the scope, report type, and period, then select Generate Report.</section>
     )}
    </>
   )}
  </main>
 );
}

export default Reports;
