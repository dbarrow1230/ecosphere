import {useEffect,useMemo,useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import {Alert,Button,Col,Form,Modal,Row,Spinner} from "react-bootstrap";
import DailyNoteForm from "./forms/studies/DailyNoteForm.jsx";
import "../styles/daily-notes.css";

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

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const candidates=[parsed,parsed?.user,parsed?.data,parsed?.data?.user,parsed?.profile,parsed?.authUser];
   const match=candidates.find(value=>getObjectId(value)||value?.username||value?.email);
   if(match)return match;
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }

 return null;
};

const getTodayValue=()=>{
 const date=new Date();
 const offset=date.getTimezoneOffset();
 return new Date(date.getTime()-offset*60000).toISOString().slice(0,10);
};

const getCalendarDate=value=>{
 if(!value)return "-";
 const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
 if(match){
  const year=Number(match[1]);
  const month=Number(match[2])-1;
  const day=Number(match[3]);

  return{
   date:new Date(year,month,day),
   year,
   month,
   day
  };
 }

 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "-";
 return{
  date,
  year:date.getFullYear(),
  month:date.getMonth(),
  day:date.getDate()
 };
};

const formatDate=value=>{
 const calendarDate=getCalendarDate(value);
 if(calendarDate==="-")return "-";
 return `${calendarDate.month+1}/${calendarDate.day}/${calendarDate.year}`;
};

const parseDateValue=value=>{
 if(!value)return null;
 const date=new Date(`${value}T00:00:00`);
 return Number.isNaN(date.getTime())?null:date;
};

const toDateValue=date=>{
 const offset=date.getTimezoneOffset();
 return new Date(date.getTime()-offset*60000).toISOString().slice(0,10);
};

const startOfDay=date=>new Date(date.getFullYear(),date.getMonth(),date.getDate());

const addDays=(date,days)=>new Date(date.getFullYear(),date.getMonth(),date.getDate()+days);

const getPeriodRange=(view,value)=>{
 const selectedDate=parseDateValue(value)||new Date();
 const day=startOfDay(selectedDate);

 if(view==="week"){
  const start=addDays(day,-day.getDay());
  return {start,end:addDays(start,7)};
 }

 if(view==="month"){
  const start=new Date(day.getFullYear(),day.getMonth(),1);
  return {start,end:new Date(day.getFullYear(),day.getMonth()+1,1)};
 }

 if(view==="year"){
  const start=new Date(day.getFullYear(),0,1);
  return {start,end:new Date(day.getFullYear()+1,0,1)};
 }

 return {start:day,end:addDays(day,1)};
};

const getPeriodLabel=(view,value)=>{
 const {start,end}=getPeriodRange(view,value);

 if(view==="day")return start.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
 if(view==="week"){
  const lastDay=addDays(end,-1);
  return `${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} - ${lastDay.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
 }
 if(view==="month")return start.toLocaleDateString(undefined,{month:"long",year:"numeric"});
 return start.toLocaleDateString(undefined,{year:"numeric"});
};

const shiftPeriod=(view,value,direction)=>{
 const selectedDate=parseDateValue(value)||new Date();
 if(view==="week")return toDateValue(addDays(selectedDate,7*direction));
 if(view==="month")return toDateValue(new Date(selectedDate.getFullYear(),selectedDate.getMonth()+direction,selectedDate.getDate()));
 if(view==="year")return toDateValue(new Date(selectedDate.getFullYear()+direction,selectedDate.getMonth(),selectedDate.getDate()));
 return toDateValue(addDays(selectedDate,direction));
};

const setDateYear=(value,year)=>{
 const selectedDate=parseDateValue(value)||new Date();
 return toDateValue(new Date(Number(year),selectedDate.getMonth(),selectedDate.getDate()));
};

const setDateMonth=(value,month)=>{
 const selectedDate=parseDateValue(value)||new Date();
 return toDateValue(new Date(selectedDate.getFullYear(),Number(month),selectedDate.getDate()));
};

const normalizeList=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 return [];
};

const getDailyNoteTitle=item=>item?.title||`Daily Note - ${formatDate(item?.journalDate)}`;

const getEntryNotes=entry=>{
 const notes=Array.isArray(entry.notes)?entry.notes:[];
 if(notes.length)return notes;
 if(entry.note){
  return [{
   text:entry.note
  }];
 }
 return [];
};

const formatRange=(start,end)=>{
 if(!start&&!end)return "-";
 if(start&&end)return `${start} - ${end}`;
 return start||end;
};

const splitPassageVerses=text=>{
 const value=String(text||"").trim();
 if(!value)return [];

 const normalized=value
  .replace(/\s+(?=(?:[1-3]\s)?[A-Z][A-Za-z]+(?:\s[A-Za-z]+)*\s+\d+:\d+\s*\([^)]+\))/g,"\n")
  .replace(/\s+(?=(?:[1-3]\s)?[A-Z][A-Za-z]+(?:\s[A-Za-z]+)*\s+\d+:\d+)/g,"\n");

 const lines=normalized.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 return lines.length>1?lines:[value];
};

const splitDisplayLines=text=>String(text||"").split(/\r?\n/).map(line=>line.trim()).filter(Boolean);

const getMonthLabel=value=>{
 const selectedDate=parseDateValue(value)||new Date();
 return selectedDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
};

function DailyNotePrintSection({title,children}){
 if(!children)return null;
 return(
  <section className="daily-note-print-section">
   <h3>{title}</h3>
   {children}
  </section>
 );
}

function DailyNotePrintDocument({note}){
 if(!note)return null;

 return(
  <article className="daily-note-print-sheet">
   <header className="daily-note-print-header">
    <h1>{getDailyNoteTitle(note)}</h1>
    <p>{formatDate(note.journalDate)}</p>
   </header>

   {note.summary?(
    <DailyNotePrintSection title="Summary">
     <p>{note.summary}</p>
    </DailyNotePrintSection>
   ):null}

   <DailyNotePrintSection title="Scripture Entries">
    {Array.isArray(note.entries)&&note.entries.length?note.entries.map((entry,index)=>(
     <div className="daily-note-print-entry" key={`print-entry-${index}`}>
      <h4>{entry.reference||entry.book||`Scripture ${index+1}`}</h4>
      <dl>
       {entry.translation?<div><dt>Translation</dt><dd>{entry.translation}</dd></div>:null}
       {entry.book?<div><dt>Book</dt><dd>{entry.book}</dd></div>:null}
       <div><dt>Chapter</dt><dd>{formatRange(entry.chapterStart,entry.chapterEnd)}</dd></div>
       <div><dt>Verse</dt><dd>{formatRange(entry.verseStart,entry.verseEnd)}</dd></div>
       <div><dt>Memorize</dt><dd>{entry.memorize?"Yes":"No"}</dd></div>
      </dl>

      {entry.passageText?(
       <div className="daily-note-print-subsection">
        <strong>Passage Text</strong>
        {splitPassageVerses(entry.passageText).map((line,lineIndex)=>(
         <p key={`print-entry-${index}-verse-${lineIndex}`}>{line}</p>
        ))}
       </div>
      ):null}

      <div className="daily-note-print-subsection">
       <strong>Daily Notes</strong>
       {getEntryNotes(entry).length?getEntryNotes(entry).map((entryNote,noteIndex)=>(
        <div className="daily-note-print-note" key={`print-entry-${index}-note-${noteIndex}`}>
         <span>Date: {formatDate(entryNote.notedAt)}</span>
         {splitDisplayLines(entryNote.text).map((line,lineIndex)=>(
          <p key={`print-entry-${index}-note-${noteIndex}-line-${lineIndex}`}>{line}</p>
         ))}
        </div>
       )):<p>No notes added for this scripture.</p>}
      </div>
     </div>
    )):<p>No scripture entries found.</p>}
   </DailyNotePrintSection>
  </article>
 );
}

function DailyNotesPage(){
 const navigate=useNavigate();
 const [searchParams]=useSearchParams();
 const returnToDashboard=searchParams.get("from")==="dashboard";
 const todayValue=getTodayValue();
 const todayDate=useMemo(()=>parseDateValue(todayValue)||new Date(),[todayValue]);

 const [dailyNotes,setDailyNotes]=useState([]);
 const [loadingData,setLoadingData]=useState(true);
 const [error,setError]=useState("");
 const [noteView,setNoteView]=useState("day");
 const [noteViewDate,setNoteViewDate]=useState(getTodayValue());
 const [leftDate,setLeftDate]=useState(getTodayValue());
 const [leftMonth,setLeftMonth]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [selectedNoteId,setSelectedNoteId]=useState("");
 const [showDetailModal,setShowDetailModal]=useState(false);
 const [detailNote,setDetailNote]=useState(null);
 const [printNote,setPrintNote]=useState(null);

 useEffect(()=>{
  if(!printNote)return undefined;

  document.body.classList.add("daily-note-print-preview-active");

  return()=>{
   document.body.classList.remove("daily-note-print-preview-active");
  };
 },[printNote]);

 const loadDailyNotes=async()=>{
  try{
   setLoadingData(true);
   setError("");

   const storedUser=getStoredUser();
   const storedUserId=getObjectId(storedUser);

   const [notesRes,userNotesRes]=await Promise.all([
    fetch("/api/studies/daily-notes"),
    storedUserId?fetch(`/api/studies/daily-notes?user=${encodeURIComponent(storedUserId)}`):Promise.resolve(null)
   ]);

   const [notesData,userNotesData]=await Promise.all([
    notesRes.ok?notesRes.json():Promise.resolve({data:[]}),
    userNotesRes?userNotesRes.ok?userNotesRes.json():Promise.resolve({data:[]}):Promise.resolve({data:[]})
   ]);

   const notesById=new Map();
   [...normalizeList(notesData),...normalizeList(userNotesData)].forEach(item=>{
    if(item?._id)notesById.set(String(item._id),item);
   });

   const notes=[...notesById.values()];
   setDailyNotes(notes);
   setDetailNote(prev=>prev?notes.find(item=>item._id===prev._id)||prev:null);
  }catch(err){
   setError(err.message||"Failed to load daily notes");
  }finally{
   setLoadingData(false);
  }
 };

 useEffect(()=>{
  const timer=window.setTimeout(loadDailyNotes,0);
  return()=>window.clearTimeout(timer);
 },[]);

 const leftSelectedDate=parseDateValue(leftDate)||todayDate;
 const leftYear=String(leftSelectedDate.getFullYear());

 const yearOptions=useMemo(()=>{
  const years=new Set([todayDate.getFullYear(),Number(leftYear)]);

 dailyNotes.forEach(item=>{
   const calendarDate=getCalendarDate(item.journalDate);
   if(calendarDate!=="-")years.add(calendarDate.year);
  });

  return [...years].sort((a,b)=>b-a);
 },[dailyNotes,leftYear,todayDate]);

 const openCreateForm=()=>{
  setSelectedNoteId("");
  setShowForm(true);
 };

 const openEditForm=id=>{
  setShowDetailModal(false);
  setSelectedNoteId(id);
  setShowForm(true);
 };

 const closeForm=()=>{
  setShowForm(false);
  setSelectedNoteId("");
 };

 const handleSaved=()=>{
  closeForm();
  loadDailyNotes();
 };

 const resetLeftFilters=()=>{
  setLeftDate(getTodayValue());
  setLeftMonth("");
 };

 const showNoteDetails=item=>{
  setDetailNote(item);
  setShowDetailModal(true);
 };

 const closeDetailModal=()=>{
  setShowDetailModal(false);
 };

 const openPrintPreview=note=>{
  setPrintNote(note);
  setShowDetailModal(false);
 };

 const closePrintPreview=()=>{
  setPrintNote(null);
  if(detailNote)setShowDetailModal(true);
 };

 const printDailyNote=()=>{
  window.setTimeout(()=>window.print(),50);
 };

 const leftNotes=dailyNotes.filter(item=>{
  const calendarDate=getCalendarDate(item.journalDate);
  if(calendarDate==="-")return false;

  if(calendarDate.year!==Number(leftYear))return false;
  if(leftMonth!==""&&calendarDate.month!==Number(leftMonth))return false;

  return true;
 }).sort((a,b)=>getCalendarDate(b.journalDate).date-getCalendarDate(a.journalDate).date);

 const filteredDailyNotes=dailyNotes.filter(item=>{
  const calendarDate=getCalendarDate(item.journalDate);
  if(calendarDate==="-")return false;
  const {start,end}=getPeriodRange(noteView,noteViewDate);
  return calendarDate.date>=start&&calendarDate.date<end;
 }).sort((a,b)=>getCalendarDate(b.journalDate).date-getCalendarDate(a.journalDate).date);

 const currentMonthNotes=dailyNotes.filter(item=>{
  const calendarDate=getCalendarDate(item.journalDate);
  if(calendarDate==="-")return false;
  return calendarDate.year===todayDate.getFullYear()&&calendarDate.month===todayDate.getMonth();
 }).sort((a,b)=>getCalendarDate(b.journalDate).date-getCalendarDate(a.journalDate).date);

 if(printNote){
  return(
   <main className="daily-note-print-preview-page">
    <div className="daily-note-print-toolbar no-print">
     <Button type="button" variant="secondary" onClick={printDailyNote}>Print Note</Button>
     <Button type="button" variant="primary" onClick={closePrintPreview}>Cancel</Button>
    </div>
    <DailyNotePrintDocument note={printNote}/>
   </main>
  );
 }

 return(
  <div className="container-fluid daily-notes-page py-4">
   <div className="daily-notes-header mb-3">
    <div>
     <h2 className="mb-1">Daily Notes</h2>
     <p className="mb-0">Journal the scriptures that stood out during daily reading.</p>
    </div>
    <div className="d-flex gap-2">
     {returnToDashboard?(
      <Button type="button" variant="secondary" onClick={()=>navigate("/dashboard")}>
       Back to Dashboard
      </Button>
     ):null}
     <Button type="button" onClick={openCreateForm}>
      Add Daily Note
     </Button>
    </div>
   </div>

   {error?<Alert variant="danger">{error}</Alert>:null}

   <Row className="g-3 align-items-start">
    <Col lg={3}>
     <section className="daily-note-left-panel">
      <div className="daily-note-panel-body">
       <div className="daily-note-panel-header">
        <div>
          <h3 className="daily-note-panel-title mb-1">All Notes</h3>
         <p className="mb-0">Defaulted to {todayDate.getFullYear()}.</p>
        </div>
       </div>

       <div className="daily-note-left-filters">
        <Form.Group className="mb-3">
         <Form.Label>Year</Form.Label>
         <Form.Select value={leftYear} onChange={event=>setLeftDate(prev=>setDateYear(prev,event.target.value))}>
          {yearOptions.map(year=>(
           <option key={year} value={year}>{year}</option>
          ))}
         </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
         <Form.Label>Month</Form.Label>
         <Form.Select value={leftMonth} onChange={event=>{
          setLeftMonth(event.target.value);
          if(event.target.value!=="")setLeftDate(prev=>setDateMonth(prev,event.target.value));
         }}>
          <option value="">All Months</option>
          <option value="0">January</option>
          <option value="1">February</option>
          <option value="2">March</option>
          <option value="3">April</option>
          <option value="4">May</option>
          <option value="5">June</option>
          <option value="6">July</option>
          <option value="7">August</option>
          <option value="8">September</option>
          <option value="9">October</option>
          <option value="10">November</option>
          <option value="11">December</option>
         </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
         <Form.Label>Date</Form.Label>
         <Form.Control type="date" value={leftDate} onChange={event=>setLeftDate(event.target.value)}/>
        </Form.Group>

        <Button type="button" variant="outline-primary" size="sm" onClick={resetLeftFilters}>
         Reset
        </Button>
       </div>

       {loadingData?(
        <div className="py-4 text-center">
         <Spinner animation="border"/>
        </div>
       ):(
        <div className="daily-note-left-scroll">
         {leftNotes.length?leftNotes.map(item=>(
         <button type="button" key={`left-note-${item._id}`} className="daily-note-side-item" onClick={()=>showNoteDetails(item)}>
           <span>{formatDate(item.journalDate)}</span>
           <strong>{getDailyNoteTitle(item)}</strong>
          </button>
         )):(
          <p className="mb-0">No notes found for the selected filters.</p>
         )}
        </div>
       )}
      </div>
     </section>
    </Col>

    <Col lg={6}>
     <section className="daily-note-center-panel">
      <div className="daily-note-panel-body">
       <div className="daily-note-list-filters">
        <Form.Group className="daily-note-list-filter">
         <Form.Label>View</Form.Label>
         <Form.Select value={noteView} onChange={event=>setNoteView(event.target.value)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
         </Form.Select>
        </Form.Group>

        <Form.Group className="daily-note-list-filter daily-note-list-date-filter">
         <Form.Label>Date</Form.Label>
         <Form.Control type="date" value={noteViewDate} onChange={event=>setNoteViewDate(event.target.value)}/>
        </Form.Group>

        <div className="daily-note-list-period">
         <Button type="button" variant="outline-primary" onClick={()=>setNoteViewDate(prev=>shiftPeriod(noteView,prev,-1))}>
          Previous
         </Button>
         <strong>{getPeriodLabel(noteView,noteViewDate)}</strong>
         <Button type="button" variant="outline-primary" onClick={()=>setNoteViewDate(prev=>shiftPeriod(noteView,prev,1))}>
          Next
         </Button>
        </div>
       </div>

       {loadingData?(
        <div className="py-4 text-center">
         <Spinner animation="border"/>
        </div>
       ):(
        <div className="table-wrap">
         <table>
          <thead>
           <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Scriptures</th>
            <th>Updated</th>
            <th>Actions</th>
           </tr>
          </thead>
          <tbody>
           {filteredDailyNotes.length?filteredDailyNotes.map(item=>(
            <tr key={item._id}>
             <td>{formatDate(item.journalDate)}</td>
             <td>{getDailyNoteTitle(item)}</td>
             <td>{Array.isArray(item.entries)?item.entries.length:0}</td>
             <td>{formatDate(item.updatedAt||item.createdAt)}</td>
             <td>
              <Button type="button" size="sm" variant="outline-primary" onClick={()=>showNoteDetails(item)}>
               View
              </Button>
             </td>
            </tr>
           )):(
            <tr>
             <td colSpan="5">No daily notes found for {getPeriodLabel(noteView,noteViewDate)}.</td>
            </tr>
           )}
          </tbody>
         </table>
        </div>
       )}
      </div>
     </section>
    </Col>

    <Col lg={3}>
     <section className="daily-note-right-panel">
      <div className="daily-note-panel-body">
       <div className="daily-note-panel-header">
        <div>
          <h3 className="daily-note-panel-title mb-1">Current Month Notes</h3>
         <p className="mb-0">{getMonthLabel(todayValue)}</p>
        </div>
       </div>

       {loadingData?(
        <div className="py-4 text-center">
         <Spinner animation="border"/>
        </div>
       ):(
        <div className="daily-note-month-scroll">
         {currentMonthNotes.length?currentMonthNotes.map(item=>(
         <button type="button" key={`month-note-${item._id}`} className="daily-note-side-item" onClick={()=>showNoteDetails(item)}>
           <span>{formatDate(item.journalDate)}</span>
           <strong>{getDailyNoteTitle(item)}</strong>
          </button>
         )):(
          <p className="mb-0">No daily notes found for {getMonthLabel(todayValue)}.</p>
         )}
        </div>
       )}
      </div>
     </section>
    </Col>
   </Row>

   <Modal show={showDetailModal} onHide={closeDetailModal} size="xl" centered scrollable dialogClassName="daily-note-detail-modal">
    <Modal.Header closeButton>
     <Modal.Title>
      {detailNote?(
       <span className="daily-note-detail-modal-title">
        <span>{getDailyNoteTitle(detailNote)}</span>
        <small>{formatDate(detailNote.journalDate)}</small>
       </span>
      ):"Daily Note Details"}
     </Modal.Title>
     {detailNote?(
      <div className="d-flex gap-2">
       <Button type="button" size="sm" variant="outline-primary" onClick={()=>openPrintPreview(detailNote)}>
        Print
       </Button>
       <Button type="button" size="sm" onClick={()=>openEditForm(detailNote._id)}>
        Edit
       </Button>
      </div>
     ):null}
    </Modal.Header>

    <Modal.Body>
     {detailNote?(
      <div className="daily-note-detail-card">
       {detailNote.summary?(
        <div className="daily-note-detail-section">
         <h4>Summary</h4>
         <div className="daily-note-detail-text-block">{detailNote.summary}</div>
        </div>
       ):null}

       <div className="daily-note-detail-section">
        <h4>Scripture Entries</h4>
        {Array.isArray(detailNote.entries)&&detailNote.entries.length?detailNote.entries.map((entry,index)=>(
         <div key={`detail-entry-${index}`} className="daily-note-detail-entry">
          <div className="daily-note-detail-entry-header">
           <div>
            <span>Scripture {index+1}</span>
            <h5>{entry.reference||entry.book||`Scripture ${index+1}`}</h5>
           </div>
           {entry.memorize?(
            <span className="daily-note-detail-pill">{entry.memorizationStatus||"memorize"}</span>
           ):null}
          </div>

          <dl className="daily-note-detail-meta">
           <div>
            <dt>Translation</dt>
            <dd>{entry.translation||"-"}</dd>
           </div>
           <div>
            <dt>Book</dt>
            <dd>{entry.book||"-"}</dd>
           </div>
           <div>
            <dt>Chapter</dt>
            <dd>{formatRange(entry.chapterStart,entry.chapterEnd)}</dd>
           </div>
           <div>
            <dt>Verse</dt>
            <dd>{formatRange(entry.verseStart,entry.verseEnd)}</dd>
           </div>
           <div>
            <dt>Memorize</dt>
            <dd>{entry.memorize?"Yes":"No"}</dd>
           </div>
          </dl>

          {entry.passageText?(
           <div className="daily-note-detail-subsection">
            <h6>Passage Text</h6>
            <div className="daily-note-detail-passage">
             {splitPassageVerses(entry.passageText).map((line,lineIndex)=>(
              <p key={`detail-entry-${index}-verse-${lineIndex}`}>{line}</p>
             ))}
            </div>
           </div>
          ):null}

          <div className="daily-note-detail-notes">
           <h6>Daily Notes</h6>
           {getEntryNotes(entry).length?getEntryNotes(entry).map((note,noteIndex)=>(
           <div className="daily-note-detail-note-item" key={`detail-entry-${index}-note-${noteIndex}`}>
             <span><strong>Date:</strong> {formatDate(note.notedAt)}</span>
             <div className="daily-note-detail-note-text">
              {splitDisplayLines(note.text).map((line,lineIndex)=>(
               <p key={`detail-entry-${index}-note-${noteIndex}-line-${lineIndex}`}>{line}</p>
              ))}
             </div>
            </div>
           )):(
           <p>No notes added for this scripture.</p>
           )}
          </div>
         </div>
        )):(
         <p>No scripture entries found.</p>
        )}
       </div>
      </div>
     ):null}
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="secondary" onClick={closeDetailModal}>
      Close
     </Button>
    </Modal.Footer>
   </Modal>

   <DailyNoteForm
    show={showForm}
    onHide={closeForm}
    noteId={selectedNoteId}
    onSaved={handleSaved}
   />
  </div>
 );
}

export default DailyNotesPage;
