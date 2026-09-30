// src/pages/BookDashboard.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Button,Form,Modal} from "react-bootstrap";
import {Link,useNavigate,useParams} from "react-router-dom";
import {
 BookOpen,
 CalendarDays,
 CheckCircle2,
 Clock,
 FileText,
 Layers,
 PenLine,
 Search,
 Target,
 Users
} from "lucide-react";
import {plannerWorkflowSections} from "../data/plannerWorkflowSections.js";
import BookDashboardCalendar from "../components/booksdashboard/BookDashboardCalendar.jsx";
import BookDashboardHeader from "../components/booksdashboard/BookDashboardHeader.jsx";
import BookQuickAccess from "../components/booksdashboard/BookQuickAccess.jsx";
import "../styles/BookDashboard.css";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }
 return "";
};

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;
   const parsed=JSON.parse(raw);
   const user=parsed?.user||parsed?.data||parsed;
   if(user&&typeof user==="object")return user;
  }catch{
   // Ignore bad auth cache values.
  }
 }

 return null;
};

const getBusinessId=()=>{
 const user=getStoredUser();
 return getObjectId(user?.currentBusiness)||getObjectId(user?.business)||getObjectId(user?.business_id)||getObjectId(user?.businessRef);
};

const defaultBookForm={
 title:"",
 subtitle:"",
 genre:"",
 status:"Planning",
 logline:"",
 notes:""
};

const defaultGoalForm={
 title:"Writing Goal",
 goalType:"Word Count",
 targetValue:80000,
 currentValue:0,
 dueDate:"",
 notes:""
};

const defaultDeadlineForm={
 title:"Draft Deadline",
 deadlineType:"Draft",
 deadlineDate:"",
 notes:""
};

function BookDashboard(){
 const {bookId}=useParams();
 const navigate=useNavigate();
 const [books,setBooks]=useState([]);
 const [activeBook,setActiveBook]=useState(null);
 const [showBookModal,setShowBookModal]=useState(false);
 const [showGoalModal,setShowGoalModal]=useState(false);
 const [showDeadlineModal,setShowDeadlineModal]=useState(false);
 const [bookForm,setBookForm]=useState(defaultBookForm);
 const [goalForm,setGoalForm]=useState(defaultGoalForm);
 const [deadlineForm,setDeadlineForm]=useState(defaultDeadlineForm);
 const [activeGoal,setActiveGoal]=useState(null);
 const [activeDeadline,setActiveDeadline]=useState(null);
 const [sessionCount,setSessionCount]=useState(0);
 const [error,setError]=useState("");
 const [modalNotice,setModalNotice]=useState("");
 const [loading,setLoading]=useState(false);
 const closeTimerRef=useRef(null);

 const businessId=useMemo(()=>getBusinessId(),[]);

 const displayBook=activeBook||{
  title:"Current Book Workspace",
  status:"Create or select a book",
  genre:"",
  targetWords:80000,
  currentWords:0,
  deadline:null,
  logline:"Track this book’s progress, chapters, characters, plot, writing goals, research, and deadlines."
 };

 const targetWords=Number(activeGoal?.targetValue||displayBook.targetWords||80000);
 const currentWords=Number(activeGoal?.currentValue||displayBook.currentWords||0);
 const progress=targetWords>0?Math.min(100,Math.round((currentWords/targetWords)*100)):0;
 const remainingWords=Math.max(targetWords-currentWords,0);
 const plannerBase=activeBook?`/books/${activeBook._id}`:"";

 const workflowCards=plannerWorkflowSections.slice(0,6);
 const storyDatabases=[
  {title:"Chapters",icon:<BookOpen size={18}/>,count:0,text:"Draft, revise, and track chapter status."},
  {title:"Scenes",icon:<Layers size={18}/>,count:0,text:"Scene cards, order, purpose, and notes."},
  {title:"Characters",icon:<Users size={18}/>,count:0,text:"Profiles, arcs, relationships, and roles."},
  {title:"Research",icon:<Search size={18}/>,count:0,text:"Sources, questions, inspiration, and references."}
 ];

 const loadBooks=async()=>{
  if(!businessId){
   setBooks([]);
   return;
  }

  setLoading(true);
  setError("");

  try{
   const res=await fetch(`/api/planner/books?business_id=${encodeURIComponent(businessId)}&isActive=true`);
   if(!res.ok)throw new Error("Books could not load.");
   const data=await res.json();
   setBooks(Array.isArray(data)?data:[]);
  }catch(err){
   setError(err.message||"Books could not load.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadBooks();
 },[businessId]);

 useEffect(()=>()=>{
  if(closeTimerRef.current)window.clearTimeout(closeTimerRef.current);
 },[]);

 const scheduleModalClose=callback=>{
  if(closeTimerRef.current)window.clearTimeout(closeTimerRef.current);
  closeTimerRef.current=window.setTimeout(()=>{
   callback();
   setModalNotice("");
   closeTimerRef.current=null;
  },5000);
 };

 useEffect(()=>{
  if(!books.length){
   setActiveBook(null);
   return;
  }

  const routeBook=books.find(book=>getObjectId(book._id)===bookId);
  const storedBook=(()=>{
   try{
    const raw=localStorage.getItem("activePlannerBook");
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    return books.find(book=>getObjectId(book._id)===getObjectId(parsed?._id||parsed?.id));
   }catch{
    return null;
   }
  })();

  const selected=routeBook||storedBook||books[0];
  setActiveBook(selected);
  localStorage.setItem("activePlannerBook",JSON.stringify(selected));
 },[bookId,books]);

 useEffect(()=>{
  if(!activeBook?._id){
   setSessionCount(0);
   setActiveGoal(null);
   setActiveDeadline(null);
   return;
  }

  let ignore=false;

  const loadBookRecords=async()=>{
   try{
    const [goalsRes,deadlinesRes,sessionsRes]=await Promise.all([
     fetch(`/api/planner/book-goals?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}&isActive=true`),
     fetch(`/api/planner/book-deadlines?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}&isActive=true`),
     fetch(`/api/planner/book-sessions?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}`)
    ]);

    const goals=goalsRes.ok?await goalsRes.json():[];
    const deadlines=deadlinesRes.ok?await deadlinesRes.json():[];
    const sessions=sessionsRes.ok?await sessionsRes.json():[];

    if(ignore)return;

    setActiveGoal(Array.isArray(goals)?goals[0]||null:null);
    setActiveDeadline(Array.isArray(deadlines)?deadlines[0]||null:null);
    setSessionCount(Array.isArray(sessions)?sessions.length:0);
   }catch{
    if(!ignore){
     setActiveGoal(null);
     setActiveDeadline(null);
     setSessionCount(0);
    }
   }
  };

  loadBookRecords();

  return()=>{
   ignore=true;
  };
 },[activeBook?._id,businessId]);

 const openBook=book=>{
  setActiveBook(book);
  localStorage.setItem("activePlannerBook",JSON.stringify(book));
  window.scrollTo({top:0,left:0,behavior:"smooth"});
  navigate(`/books/${book._id}/dashboard`);
 };

 const openCreateBookModal=()=>{
  setModalNotice("");
  setBookForm(defaultBookForm);
  setShowBookModal(true);
 };

 const handleBookChange=event=>{
  const {name,value}=event.target;
  setBookForm(prev=>({...prev,[name]:value}));
  setError("");
 };

 const handleGoalChange=event=>{
  const {name,value}=event.target;
  setGoalForm(prev=>({...prev,[name]:value}));
  setError("");
 };

 const handleDeadlineChange=event=>{
  const {name,value}=event.target;
  setDeadlineForm(prev=>({...prev,[name]:value}));
  setError("");
 };

 const handleBookSubmit=async event=>{
  event.preventDefault();

  if(!businessId){
   setError("Your account needs a business before a book can be saved.");
   return;
  }

  if(!bookForm.title.trim()){
   setError("Book title is required.");
   return;
  }

  try{
   const payload={
    ...bookForm,
    business_id:businessId
   };

   const res=await fetch("/api/planner/books",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok)throw new Error("Book could not save.");

   const savedBook=await res.json();

   setBooks(prev=>[savedBook,...prev]);
   setActiveBook(savedBook);
   localStorage.setItem("activePlannerBook",JSON.stringify(savedBook));
   setBookForm(defaultBookForm);
   setModalNotice("Book saved. This form will close in 5 seconds.");

   scheduleModalClose(()=>{
    setShowBookModal(false);
    window.scrollTo({top:0,left:0,behavior:"smooth"});
    navigate(`/books/${savedBook._id}/dashboard`);
   });
  }catch(err){
   setError(err.message||"Book could not save.");
  }
 };

 const openGoalModal=()=>{
  setModalNotice("");
  setGoalForm(activeGoal?{
   title:activeGoal.title||"Writing Goal",
   goalType:activeGoal.goalType||"Word Count",
   targetValue:activeGoal.targetValue||0,
   currentValue:activeGoal.currentValue||0,
   dueDate:activeGoal.dueDate?String(activeGoal.dueDate).slice(0,10):"",
   notes:activeGoal.notes||""
  }:defaultGoalForm);
  setShowGoalModal(true);
 };

 const openDeadlineModal=()=>{
  setModalNotice("");
  setDeadlineForm(activeDeadline?{
   title:activeDeadline.title||"Draft Deadline",
   deadlineType:activeDeadline.deadlineType||"Draft",
   deadlineDate:activeDeadline.deadlineDate?String(activeDeadline.deadlineDate).slice(0,10):"",
   notes:activeDeadline.notes||""
  }:defaultDeadlineForm);
  setShowDeadlineModal(true);
 };

 const handleGoalSubmit=async event=>{
  event.preventDefault();
  if(!businessId)return setError("Your account needs a business before a goal can be saved.");

  try{
   const payload={
    ...goalForm,
    business_id:businessId,
    book_id:activeBook?._id||null,
    targetValue:Number(goalForm.targetValue)||0,
    currentValue:Number(goalForm.currentValue)||0
   };

   const res=await fetch(activeGoal?`/api/planner/book-goals/${activeGoal._id}`:"/api/planner/book-goals",{
    method:activeGoal?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok)throw new Error("Goal could not save.");

   const savedGoal=await res.json();
   setActiveGoal(savedGoal);
   setModalNotice("Goal saved. This form will close in 5 seconds.");
   scheduleModalClose(()=>setShowGoalModal(false));
  }catch(err){
   setError(err.message||"Goal could not save.");
  }
 };

 const handleDeadlineSubmit=async event=>{
  event.preventDefault();
  if(!businessId)return setError("Your account needs a business before a deadline can be saved.");

  try{
   const payload={
    ...deadlineForm,
    business_id:businessId,
    book_id:activeBook?._id||null
   };

   const res=await fetch(activeDeadline?`/api/planner/book-deadlines/${activeDeadline._id}`:"/api/planner/book-deadlines",{
    method:activeDeadline?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok)throw new Error("Deadline could not save.");

   const savedDeadline=await res.json();
   setActiveDeadline(savedDeadline);
   setModalNotice("Deadline saved. This form will close in 5 seconds.");
   scheduleModalClose(()=>setShowDeadlineModal(false));
  }catch(err){
   setError(err.message||"Deadline could not save.");
  }
 };

 return(
  <main className="book-desk-page book-dashboard-page">

   {error?<Alert variant="warning" className="book-desk-alert">{error}</Alert>:null}

   <BookDashboardHeader
    title={displayBook.title}
    text={displayBook.logline||"A focused writing desk for one novel: manuscript progress, chapters, goals, deadlines, characters, plot, research, and its linked planner."}
    activeBook={activeBook}
    onCreateBook={openCreateBookModal}
   />

   <section className="notion-dashboard">
    <aside className="notion-sidebar">
     <section className="notion-panel">
      <div className="notion-panel-head">
       <p>Your Books</p>
       <h2>Active Projects</h2>
      </div>

      {loading?<p className="notion-muted">Loading books...</p>:null}
      {!loading&&!books.length?<p className="notion-muted">No books yet. Create the first book.</p>:null}

      <div className="notion-book-list">
       {books.map(book=>(
        <button
         type="button"
         className={`notion-book-row${activeBook?._id===book._id?" active":""}`}
         key={book._id}
         onClick={()=>openBook(book)}
        >
         <span>{book.title}</span>
         <small>{book.genre||"Genre not set"}</small>
         <b>{book.status||"Planning"}</b>
        </button>
       ))}
      </div>
     </section>

     <section className="notion-panel notion-mini-stack">
      <div>
       <p className="notion-label">Sessions</p>
       <strong>{sessionCount}</strong>
       <span>logged writing sessions</span>
      </div>
      <div>
       <p className="notion-label">Status</p>
       <strong>{activeBook?.status||"Unset"}</strong>
       <span>current book phase</span>
      </div>
     </section>
    </aside>

    <section className="notion-main">
     <section className="notion-command-center">
      <div className="notion-command-copy">
       <p className="notion-label">Current Manuscript</p>
       <h2>{displayBook.title}</h2>
       <p>{displayBook.logline||"Use this workspace to move the book from planning to draft, revision, and completion."}</p>
      </div>

      <div className="notion-command-stats">
       <div>
        <PenLine size={18}/>
        <strong>{currentWords.toLocaleString()}</strong>
        <span>words written</span>
       </div>
       <div>
        <Target size={18}/>
        <strong>{targetWords.toLocaleString()}</strong>
        <span>target words</span>
       </div>
       <div>
        <CheckCircle2 size={18}/>
        <strong>{progress}%</strong>
        <span>draft complete</span>
       </div>
       <div>
        <Clock size={18}/>
        <strong>{remainingWords.toLocaleString()}</strong>
        <span>words remaining</span>
       </div>
      </div>

      <div className="notion-progress">
       <div style={{width:`${progress}%`}}></div>
      </div>
     </section>

     <section className="notion-section">
      <div className="notion-section-title">
       <p>Writing Control</p>
       <h2>Goals, deadlines, and next action</h2>
      </div>

      <div className="notion-control-row">
       <article className="notion-control-block">
        <Target size={20}/>
        <p>Writing Goal</p>
        <h3>{activeGoal?`${Number(activeGoal.targetValue||0).toLocaleString()} ${activeGoal.goalType||"Goal"}`:"Set Goal"}</h3>
        <span>{activeGoal?.notes||"Create a daily, weekly, monthly, or full manuscript goal."}</span>
        <button type="button" onClick={openGoalModal}>{activeGoal?"Edit Goal":"Set Goal"}</button>
       </article>

       <article className="notion-control-block">
        <CalendarDays size={20}/>
        <p>Deadline</p>
        <h3>{activeDeadline?.deadlineDate?new Date(activeDeadline.deadlineDate).toLocaleDateString():"No deadline set"}</h3>
        <span>{activeDeadline?.notes||"Add draft, revision, publishing, or milestone deadlines."}</span>
        <button type="button" onClick={openDeadlineModal}>{activeDeadline?"Edit Deadline":"Set Deadline"}</button>
       </article>

       <article className="notion-control-block notion-next-action">
        <FileText size={20}/>
        <p>Next Action</p>
        <h3>{activeBook?"Open Planner":"Create a book"}</h3>
        <span>Continue the connected planning workflow for this manuscript.</span>
        {activeBook?(
         <Link to={`${plannerBase}/planner/project-overview`}>Start Planning</Link>
        ):(
         <button type="button" onClick={openCreateBookModal}>Create Book</button>
        )}
       </article>
      </div>
     </section>

     <section className="notion-section">
      <div className="notion-section-title">
       <p>Story Databases</p>
       <h2>Build the manuscript like linked Notion tables</h2>
      </div>

      <div className="notion-database-list">
       {storyDatabases.map(item=>(
        <article className="notion-database-row" key={item.title}>
         <div className="notion-db-icon">{item.icon}</div>
         <div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
         </div>
         <strong>{item.count}</strong>
        </article>
       ))}
      </div>
     </section>

     <section className="notion-section">
      <div className="notion-section-title">
       <p>Planner Workflow</p>
       <h2>{activeBook?"Open the next database section":"Create or select a book first"}</h2>
      </div>

      <div className="notion-workflow-list">
       {workflowCards.map(section=>(
        activeBook?(
         <Link className="notion-workflow-row" to={`${plannerBase}${section.path}`} key={section.path}>
          <span><FileText size={18}/></span>
          <div>
           <h3>{section.label}</h3>
           <p>{section.items.length} linked planner pages for {activeBook.title}.</p>
          </div>
          <strong>{section.items.length}</strong>
         </Link>
        ):(
         <article className="notion-workflow-row disabled" key={section.path}>
          <span><FileText size={18}/></span>
          <div>
           <h3>{section.label}</h3>
           <p>Create or select a book first.</p>
          </div>
          <strong>{section.items.length}</strong>
         </article>
        )
       ))}
      </div>
     </section>
    </section>

    <aside className="notion-rightbar">
     <BookQuickAccess book={activeBook} plannerBase={plannerBase}/>
     <BookDashboardCalendar book={activeBook} deadline={activeDeadline} goal={activeGoal}/>

     <section className="notion-panel">
      <div className="notion-panel-head">
       <p>Quick Snapshot</p>
       <h2>Book Health</h2>
      </div>

      <div className="notion-snapshot-list">
       <div><span>Chapters</span><strong>0</strong></div>
       <div><span>Characters</span><strong>0</strong></div>
       <div><span>Research Notes</span><strong>0</strong></div>
       <div><span>Open Questions</span><strong>0</strong></div>
      </div>
     </section>
    </aside>
   </section>

   <Modal show={showBookModal} onHide={()=>{setModalNotice("");setShowBookModal(false);}} centered size="lg" className="book-desk-book-modal">
    <Modal.Header closeButton>
     <Modal.Title>Create Book</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {modalNotice?<Alert variant="success">{modalNotice}</Alert>:null}

     <Form onSubmit={handleBookSubmit} data-skip-bootstrap-validation="true">
      <Form.Group className="mb-3">
       <Form.Label>Book Title</Form.Label>
       <Form.Control name="title" value={bookForm.title} onChange={handleBookChange} autoFocus/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Subtitle</Form.Label>
       <Form.Control name="subtitle" value={bookForm.subtitle} onChange={handleBookChange}/>
      </Form.Group>

      <div className="book-desk-form-grid">
       <Form.Group className="mb-3">
        <Form.Label>Genre</Form.Label>
        <Form.Control name="genre" value={bookForm.genre} onChange={handleBookChange}/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select name="status" value={bookForm.status} onChange={handleBookChange}>
         <option>Planning</option>
         <option>Drafting</option>
         <option>Revising</option>
         <option>Complete</option>
        </Form.Select>
       </Form.Group>
      </div>

      <Form.Group className="mb-3">
       <Form.Label>Logline</Form.Label>
       <Form.Control as="textarea" rows={3} name="logline" value={bookForm.logline} onChange={handleBookChange}/>
      </Form.Group>

      <Form.Group className="mb-3">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={3} name="notes" value={bookForm.notes} onChange={handleBookChange}/>
      </Form.Group>

      <div className="book-desk-modal-actions">
       <Button type="button" variant="outline-secondary" onClick={()=>{setModalNotice("");setShowBookModal(false);}}>Cancel</Button>
       <Button type="submit">Create Book</Button>
      </div>
     </Form>
    </Modal.Body>
   </Modal>

   <Modal show={showGoalModal} onHide={()=>setShowGoalModal(false)} centered className="book-desk-book-modal">
    <Modal.Header closeButton>
     <Modal.Title>{activeGoal?"Edit Goal":"Set Goal"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {modalNotice?<Alert variant="success">{modalNotice}</Alert>:null}

     <Form onSubmit={handleGoalSubmit} data-skip-bootstrap-validation="true">
      <Form.Group className="mb-3">
       <Form.Label>Goal Title</Form.Label>
       <Form.Control name="title" value={goalForm.title} onChange={handleGoalChange} autoFocus/>
      </Form.Group>

      <div className="book-desk-form-grid">
       <Form.Group className="mb-3">
        <Form.Label>Goal Type</Form.Label>
        <Form.Control name="goalType" value={goalForm.goalType} onChange={handleGoalChange}/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Target Value</Form.Label>
        <Form.Control type="number" name="targetValue" value={goalForm.targetValue} onChange={handleGoalChange}/>
       </Form.Group>
      </div>

      <div className="book-desk-form-grid">
       <Form.Group className="mb-3">
        <Form.Label>Current Value</Form.Label>
        <Form.Control type="number" name="currentValue" value={goalForm.currentValue} onChange={handleGoalChange}/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Due Date</Form.Label>
        <Form.Control type="date" name="dueDate" value={goalForm.dueDate} onChange={handleGoalChange}/>
       </Form.Group>
      </div>

      <Form.Group className="mb-3">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={4} name="notes" value={goalForm.notes} onChange={handleGoalChange}/>
      </Form.Group>

      <div className="book-desk-modal-actions">
       <Button type="button" variant="outline-secondary" onClick={()=>{setModalNotice("");setShowGoalModal(false);}}>Cancel</Button>
       <Button type="submit">Save Goal</Button>
      </div>
     </Form>
    </Modal.Body>
   </Modal>

   <Modal show={showDeadlineModal} onHide={()=>setShowDeadlineModal(false)} centered className="book-desk-book-modal">
    <Modal.Header closeButton>
     <Modal.Title>{activeDeadline?"Edit Deadline":"Set Deadline"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {modalNotice?<Alert variant="success">{modalNotice}</Alert>:null}

     <Form onSubmit={handleDeadlineSubmit} data-skip-bootstrap-validation="true">
      <Form.Group className="mb-3">
       <Form.Label>Deadline Title</Form.Label>
       <Form.Control name="title" value={deadlineForm.title} onChange={handleDeadlineChange} autoFocus/>
      </Form.Group>

      <div className="book-desk-form-grid">
       <Form.Group className="mb-3">
        <Form.Label>Deadline Type</Form.Label>
        <Form.Control name="deadlineType" value={deadlineForm.deadlineType} onChange={handleDeadlineChange}/>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Deadline Date</Form.Label>
        <Form.Control type="date" name="deadlineDate" value={deadlineForm.deadlineDate} onChange={handleDeadlineChange}/>
       </Form.Group>
      </div>

      <Form.Group className="mb-3">
       <Form.Label>Notes</Form.Label>
       <Form.Control as="textarea" rows={4} name="notes" value={deadlineForm.notes} onChange={handleDeadlineChange}/>
      </Form.Group>

      <div className="book-desk-modal-actions">
       <Button type="button" variant="outline-secondary" onClick={()=>{setModalNotice("");setShowDeadlineModal(false);}}>Cancel</Button>
       <Button type="submit">Save Deadline</Button>
      </div>
     </Form>
    </Modal.Body>
   </Modal>
  </main>
 );
}

export default BookDashboard;