// src/pages/BookDashboard.jsx
import {useEffect,useRef,useState} from "react";
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
import {loadCurrentBusiness} from "../utils/currentBusiness.js";
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
 subgenre:"",
 genres:[],
 subgenres:[],
 genreSubgenres:[],
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
 const [editingBook,setEditingBook]=useState(null);
 const [showGoalModal,setShowGoalModal]=useState(false);
 const [showDeadlineModal,setShowDeadlineModal]=useState(false);
 const [showDailyModal,setShowDailyModal]=useState(false);
 const [dailyEntry,setDailyEntry]=useState({dateDay:new Date().toISOString().slice(0,10),wordsWritten:"",dailyNote:""});
 const [dailySaving,setDailySaving]=useState(false);
 const [bookForm,setBookForm]=useState(defaultBookForm);
 const [genreCatalog,setGenreCatalog]=useState([]);
 const [genreManagerOpen,setGenreManagerOpen]=useState(false);
 const [genreManagerMode,setGenreManagerMode]=useState("genre");
 const [newGenre,setNewGenre]=useState("");
 const [genreSearch,setGenreSearch]=useState("");
 const [subgenreSearch,setSubgenreSearch]=useState("");
 const [subgenrePickerOpen,setSubgenrePickerOpen]=useState(false);
 const [goalForm,setGoalForm]=useState(defaultGoalForm);
 const [deadlineForm,setDeadlineForm]=useState(defaultDeadlineForm);
 const [activeGoal,setActiveGoal]=useState(null);
 const [activeDeadline,setActiveDeadline]=useState(null);
 const [sessionCount,setSessionCount]=useState(0);
 const [plannerWordTotal,setPlannerWordTotal]=useState(null);
 const [error,setError]=useState("");
 const [modalNotice,setModalNotice]=useState("");
 const [loading,setLoading]=useState(false);
 const closeTimerRef=useRef(null);

 const [businessId,setBusinessId]=useState(()=>new URLSearchParams(window.location.search).get("business_id")||getBusinessId());
 const [businessLoading,setBusinessLoading]=useState(!(new URLSearchParams(window.location.search).get("business_id")||getBusinessId()));

 useEffect(()=>{
  if(!businessId){setGenreCatalog([]);return;}
  fetch(`/api/planner/genre-catalog?business_id=${encodeURIComponent(businessId)}`)
   .then(response=>response.ok?response.json():[])
   .then(items=>setGenreCatalog(Array.isArray(items)?items:[]))
   .catch(()=>setGenreCatalog([]));
 },[businessId]);

 const openGenreManager=mode=>{setGenreManagerMode(mode);setNewGenre("");setGenreManagerOpen(true);};
 const visibleGenres=genreCatalog.filter(item=>item.genre.toLowerCase().includes(genreSearch.trim().toLowerCase()));
 const visibleSubgenres=genreCatalog.filter(item=>item.genre.toLowerCase().includes(subgenreSearch.trim().toLowerCase()));
 const saveGenre=async()=>{
  if(!newGenre.trim()||!businessId)return;
  const response=await fetch("/api/planner/genre-catalog",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business_id:businessId,genre:newGenre})});
  if(!response.ok)return;
  const item=await response.json();
  setGenreCatalog(items=>[...items,item].sort((a,b)=>a.genre.localeCompare(b.genre)));
  setBookForm(form=>genreManagerMode==="subgenre"
   ?({...form,subgenres:[...(form.subgenres||[]),item.genre],subgenre:item.genre})
   :({...form,genres:[...(form.genres||[]),item.genre],genre:item.genre}));
  setNewGenre("");setGenreManagerOpen(false);
 };

 useEffect(()=>{
  if(businessId){
   setBusinessLoading(false);
   return;
  }

  let ignore=false;

  const resolveBusiness=async()=>{
   try{
    const business=await loadCurrentBusiness();
    const resolvedBusinessId=getObjectId(business);

    if(!resolvedBusinessId)throw new Error("Current business is not configured.");
    if(ignore)return;

    setBusinessId(resolvedBusinessId);

    for(const storage of [localStorage,sessionStorage]){
     for(const key of ["userInfo","user","authUser","currentUser"]){
      try{
       const raw=storage.getItem(key);
       if(!raw)continue;
       const parsed=JSON.parse(raw);
       const storedUser=parsed?.user||parsed?.data||parsed;
       if(!storedUser||typeof storedUser!=="object")continue;
       const updatedUser={...storedUser,currentBusiness:resolvedBusinessId};

       if(parsed?.user)storage.setItem(key,JSON.stringify({...parsed,user:updatedUser}));
       else if(parsed?.data)storage.setItem(key,JSON.stringify({...parsed,data:updatedUser}));
       else storage.setItem(key,JSON.stringify(updatedUser));
      }catch{
       // Ignore an invalid cached auth entry and continue checking the others.
      }
     }
    }
   }catch(err){
    if(!ignore)setError(err.message||"Current business could not load.");
   }finally{
    if(!ignore)setBusinessLoading(false);
   }
  };

  resolveBusiness();

  return()=>{
   ignore=true;
  };
 },[businessId]);

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
 const currentWords=plannerWordTotal===null?Number(activeGoal?.currentValue||displayBook.currentWords||0):plannerWordTotal;
 const progress=targetWords>0?Math.min(100,Math.round((currentWords/targetWords)*100)):0;
 const remainingWords=Math.max(targetWords-currentWords,0);
 const plannerBase=activeBook?`/books/${activeBook._id}`:"";

 const storyDatabases=[
  {title:"Chapters",icon:<BookOpen size={18}/>,count:0,text:"Draft, revise, and track chapter status.",path:"/planner/chapters-scenes/chapter-list"},
  {title:"Scenes",icon:<Layers size={18}/>,count:0,text:"Scene cards, order, purpose, and notes.",path:"/planner/chapters-scenes/scene-dashboard"},
  {title:"Characters",icon:<Users size={18}/>,count:0,text:"Profiles, arcs, relationships, and roles.",path:"/planner/characters/character-profiles"},
  {title:"Research",icon:<Search size={18}/>,count:0,text:"Sources, questions, inspiration, and references.",path:"/planner/research-inspiration/research-notes"}
 ];

 const loadBooks=async()=>{
  if(!businessId||businessLoading){
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
 },[businessId,businessLoading]);

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
   setPlannerWordTotal(null);
   setActiveGoal(null);
   setActiveDeadline(null);
   return;
  }

  let ignore=false;

  const loadBookRecords=async()=>{
   try{
    const [goalsRes,deadlinesRes,sessionsRes,plannerRes]=await Promise.all([
     fetch(`/api/planner/book-goals?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}&isActive=true`),
     fetch(`/api/planner/book-deadlines?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}&isActive=true`),
     fetch(`/api/planner/book-sessions?business_id=${encodeURIComponent(businessId)}&book_id=${encodeURIComponent(activeBook._id)}`),
     fetch(`/api/planner/project-overview-development?business_id=${encodeURIComponent(businessId)}&user_id=${encodeURIComponent(getObjectId(getStoredUser()))}&book_id=${encodeURIComponent(activeBook._id)}`)
    ]);

    const goals=goalsRes.ok?await goalsRes.json():[];
    const deadlines=deadlinesRes.ok?await deadlinesRes.json():[];
    const sessions=sessionsRes.ok?await sessionsRes.json():[];
    const plannerPayload=plannerRes.ok?await plannerRes.json():null;
    const tracker=plannerPayload?.data?.wordCountGoalTracker?.wordCountTracker;
    setPlannerWordTotal(Array.isArray(tracker)?tracker.reduce((total,row)=>total+Number(row?.wordsWritten||0),0):null);

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
  setError("");
  setModalNotice("");
  setEditingBook(null);
  setBookForm(defaultBookForm);
  setShowBookModal(true);
 };

 const openEditBookModal=()=>{
  if(!activeBook)return;

  setError("");
  setModalNotice("");
  setEditingBook(activeBook);
 setBookForm({
   title:activeBook.title||"",
   subtitle:activeBook.subtitle||"",
   genre:activeBook.genre||"",
   subgenre:activeBook.subgenre||"",
   genres:Array.isArray(activeBook.genres)&&activeBook.genres.length?activeBook.genres:(activeBook.genre?[activeBook.genre]:[]),
   subgenres:Array.isArray(activeBook.subgenres)&&activeBook.subgenres.length?activeBook.subgenres:(activeBook.subgenre?[activeBook.subgenre]:[]),
   genreSubgenres:Array.isArray(activeBook.genreSubgenres)?activeBook.genreSubgenres:[],
   status:activeBook.status||"Planning",
   revisionNumber:activeBook.statusHistory?.length?activeBook.statusHistory[activeBook.statusHistory.length-1].revisionNumber||1:1,
   logline:activeBook.logline||"",
   notes:activeBook.notes||""
 });
  setShowBookModal(true);
 };

 const handleBookChange=event=>{
  const {name,value}=event.target;
  if(name==="genres"){
   const values=[...event.target.selectedOptions].map(option=>option.value);
   setBookForm(prev=>({...prev,genres:values,genre:values[0]||"",genreSubgenres:prev.genreSubgenres.filter(item=>values.includes(item.genre))}));
   setError("");
   return;
  }
  if(name==="subgenres"){
   const values=[...event.target.selectedOptions].map(option=>option.value);
   setBookForm(prev=>({...prev,subgenres:values,subgenre:values[0]||""}));
   setError("");
   return;
  }
  setBookForm(prev=>({...prev,[name]:value}));
  setError("");
 };

 const toggleGenre=genre=>{
  setBookForm(prev=>{const genres=prev.genres.includes(genre)?prev.genres.filter(value=>value!==genre):[...prev.genres,genre];return {...prev,genres,genre:genres[0]||""};});
 };

 const toggleSubgenre=subgenre=>{
  setBookForm(prev=>{const subgenres=prev.subgenres.includes(subgenre)?prev.subgenres.filter(value=>value!==subgenre):[...prev.subgenres,subgenre];return {...prev,subgenres,subgenre:subgenres[0]||""};});
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

 const openDailyEntry=()=>{
  setDailyEntry({dateDay:new Date().toISOString().slice(0,10),wordsWritten:"",dailyNote:""});
  setShowDailyModal(true);
 };

 const saveDailyEntry=async event=>{
  event.preventDefault();
  if(!activeBook?._id||!businessId)return;
  setDailySaving(true);
  try{
   const userId=getObjectId(getStoredUser());
   const params=new URLSearchParams({business_id:businessId,user_id:userId,book_id:activeBook._id});
   const loaded=await fetch(`/api/planner/project-overview-development?${params.toString()}`);
   const payload=await loaded.json();
   if(!loaded.ok||!payload?.data)throw new Error("Set the word-count goals before logging today’s words.");
   const record=payload.data;
   const sectionData={...(record.wordCountGoalTracker||{})};
   const tracker=Array.isArray(sectionData.wordCountTracker)?[...sectionData.wordCountTracker]:[];
   const row={dateDay:dailyEntry.dateDay,wordsWritten:Number(dailyEntry.wordsWritten)||0,dailyNote:dailyEntry.dailyNote||""};
   const existing=tracker.findIndex(item=>String(item.dateDay||"").slice(0,10)===dailyEntry.dateDay);
   if(existing>=0)tracker[existing]={...tracker[existing],...row};else tracker.push(row);
   sectionData.wordCountTracker=tracker;
   const body={...record,wordCountGoalTracker:sectionData,business_id:businessId,user_id:userId,book_id:activeBook._id,updatedBy:userId};
   ["_id","id","__v","createdAt","updatedAt"].forEach(key=>delete body[key]);
   const saved=await fetch(`/api/planner/project-overview-development/${record._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   if(!saved.ok)throw new Error("Today’s writing entry could not be saved.");
   setPlannerWordTotal(tracker.reduce((total,item)=>total+Number(item?.wordsWritten||0),0));
   setShowDailyModal(false);
  }catch(err){setError(err.message||"Today’s writing entry could not be saved.");}
  finally{setDailySaving(false);}
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
    genres:bookForm.genres?.length?bookForm.genres:(bookForm.genre?[bookForm.genre]:[]),
    subgenres:bookForm.subgenres?.length?bookForm.subgenres:(bookForm.subgenre?[bookForm.subgenre]:[]),
    genreSubgenres:bookForm.genreSubgenres||[],
    business_id:businessId,
    user_id:getObjectId(getStoredUser()),
    createdBy:getObjectId(getStoredUser()),
    updatedBy:getObjectId(getStoredUser())
   };

   const isEditing=!!editingBook?._id;
   const res=await fetch(isEditing?`/api/planner/books/${editingBook._id}`:"/api/planner/books",{
    method:isEditing?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok)throw new Error("Book could not save.");

   const savedBook=await res.json();

   setBooks(prev=>isEditing
    ?prev.map(book=>book._id===savedBook._id?savedBook:book)
    :[savedBook,...prev]
   );
   setActiveBook(savedBook);
   localStorage.setItem("activePlannerBook",JSON.stringify(savedBook));
   setEditingBook(savedBook);
   setModalNotice(isEditing?"Book changes saved.":"Book created.");
   scheduleModalClose(()=>{
    setShowBookModal(false);
    setEditingBook(null);
    setBookForm(defaultBookForm);
    window.scrollTo({top:0,left:0,behavior:"smooth"});
    navigate(`/books/${savedBook._id}/dashboard`);
   });
  }catch(err){
   setError(err.message||"Book could not save.");
  }
 };

 const openGoalModal=()=>{
  setError("");
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
  setError("");
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
  if(!activeBook?._id)return setError("Select or create a book before saving a writing goal.");

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
   setModalNotice("Goal saved.");
   scheduleModalClose(()=>setShowGoalModal(false));
  }catch(err){
   setError(err.message||"Goal could not save.");
  }
 };

 const handleDeadlineSubmit=async event=>{
  event.preventDefault();
  if(!businessId)return setError("Your account needs a business before a deadline can be saved.");
  if(!activeBook?._id)return setError("Select or create a book before saving a deadline.");

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
   setModalNotice("Deadline saved.");
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
    onEditBook={openEditBookModal}
   />

   <section className="notion-dashboard">
    <aside className="notion-sidebar">
     <section className="notion-panel">
      <div className="notion-panel-head">
       <p>Your Books</p>
       <h2>Active Projects</h2>
      </div>

      {loading?<p className="notion-muted">Loading books...</p>:null}
      {!loading&&!businessLoading&&!books.length?<p className="notion-muted">No books yet. Create the first book.</p>:null}

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

     <BookDashboardCalendar book={activeBook} deadline={activeDeadline} goal={activeGoal}/>

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
        <button type="button" onClick={openGoalModal} disabled={!activeBook}>{activeGoal?"Edit Goal":"Set Goal"}</button>
       </article>

       <article className="notion-control-block">
        <CalendarDays size={20}/>
        <p>Deadline</p>
        <h3>{activeDeadline?.deadlineDate?new Date(activeDeadline.deadlineDate).toLocaleDateString():"No deadline set"}</h3>
        <span>{activeDeadline?.notes||"Add draft, revision, publishing, or milestone deadlines."}</span>
        <button type="button" onClick={openDeadlineModal} disabled={!activeBook}>{activeDeadline?"Edit Deadline":"Set Deadline"}</button>
       </article>

       <article className="notion-control-block notion-next-action">
        <FileText size={20}/>
        <p>Next Action</p>
        <h3>{activeBook?"Open Planner":"Create a book"}</h3>
        <span>Continue the connected planning workflow for this manuscript.</span>
       {activeBook?(
         <div className="notion-next-action-links">
          <button type="button" onClick={openDailyEntry}>Log Daily Words</button>
          <Link to={`${plannerBase}/planner/project-overview`}>Start Planning</Link>
         </div>
        ):(
         <button type="button" onClick={openCreateBookModal}>Create Book</button>
        )}
       </article>
      </div>
     </section>

    </section>

    <aside className="notion-rightbar">
     <BookQuickAccess book={activeBook} plannerBase={plannerBase}/>

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

     <section className="notion-panel">
      <div className="notion-panel-head"><p>Story Data</p><h2>Quick Entry</h2></div>
      <div className="notion-database-list">
       {storyDatabases.map(item=>(
        <Link className="notion-database-row" to={activeBook?`${plannerBase}${item.path}`:"#"} key={item.title} onClick={event=>{if(!activeBook)event.preventDefault();}}>
         <div className="notion-db-icon">{item.icon}</div>
         <div><h3>{item.title}</h3><p>{item.text}</p></div>
         <strong>{item.count}</strong>
        </Link>
       ))}
      </div>
     </section>
    </aside>
   </section>

   <Modal show={showBookModal} onHide={()=>{setModalNotice("");setEditingBook(null);setShowBookModal(false);}} centered size="lg" className="book-desk-book-modal">
    <Modal.Header closeButton>
     <Modal.Title>{editingBook?"Edit Book":"Create Book"}</Modal.Title>
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

      <Form.Group className="mb-3 book-status-field">
       <Form.Label>Status</Form.Label>
       <Form.Select name="status" value={bookForm.status} onChange={handleBookChange}>
        <option>Planning</option><option>Drafting</option><option>Revising</option><option>Complete</option>
       </Form.Select>
       {bookForm.status==="Revising"||bookForm.status==="Drafting"?<div className="book-inline-control book-revision-control"><Form.Label>{bookForm.status==="Revising"?"Revision #":"Draft #"}</Form.Label><Form.Control type="number" min="1" name="revisionNumber" value={bookForm.revisionNumber||1} onChange={handleBookChange}/></div>:null}
      </Form.Group>

      <div className="book-genre-fields">
       <Form.Group className="mb-3 book-inline-field">
        <Form.Label>Genres</Form.Label>
        <div className="book-choice-picker">
         <Form.Control className="book-choice-search" size="sm" placeholder="Search genres" value={genreSearch} onChange={event=>setGenreSearch(event.target.value)}/>
         <div className="book-choice-list">
          {visibleGenres.map(item=><label className="book-choice-item" key={item._id}><input type="checkbox" checked={(bookForm.genres||[]).includes(item.genre)} onChange={()=>toggleGenre(item.genre)}/><span>{item.genre}</span></label>)}
          {!genreCatalog.length?<span className="book-choice-empty">No genres have been added for this application yet.</span>:null}
          {genreCatalog.length&&!visibleGenres.length?<span className="book-choice-empty">No matching genres.</span>:null}
         </div>
         <Button type="button" variant="outline-primary" size="sm" onClick={()=>openGenreManager("genre")}>Add</Button>
        </div>
       </Form.Group>

       <Form.Group className="mb-3 book-inline-field">
        <Form.Label>Sub-Genres</Form.Label>
        {!subgenrePickerOpen?<Button type="button" variant="outline-primary" size="sm" onClick={()=>setSubgenrePickerOpen(true)}>Add Sub-Genre</Button>:<div className="book-subgenre-picker"><Form.Control className="book-choice-search" size="sm" placeholder="Search sub-genres" value={subgenreSearch} onChange={event=>setSubgenreSearch(event.target.value)}/><div className="book-choice-list">{visibleSubgenres.map(item=><label className="book-choice-item" key={`sub-${item._id}`}><input type="checkbox" checked={(bookForm.subgenres||[]).includes(item.genre)} onChange={()=>toggleSubgenre(item.genre)}/><span>{item.genre}</span></label>)}{!genreCatalog.length?<span className="book-choice-empty">No genres have been added for this application yet.</span>:null}{genreCatalog.length&&!visibleSubgenres.length?<span className="book-choice-empty">No matching sub-genres.</span>:null}</div><Button type="button" variant="outline-primary" size="sm" onClick={()=>openGenreManager("subgenre")}>Add Sub-Genre</Button></div>}
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
       <Button type="button" variant="outline-secondary" onClick={()=>{setModalNotice("");setEditingBook(null);setShowBookModal(false);}}>Cancel</Button>
       <Button type="submit">{editingBook?"Save Changes":"Create Book"}</Button>
      </div>
      </Form>
      <Modal show={genreManagerOpen} onHide={()=>setGenreManagerOpen(false)} centered>
       <Modal.Header closeButton><Modal.Title>{genreManagerMode==="subgenre"?"Add Sub-Genre":"Add Genre"}</Modal.Title></Modal.Header>
       <Modal.Body>
        <Form.Group className="mb-3"><Form.Label>Genre</Form.Label><Form.Control value={newGenre} onChange={event=>setNewGenre(event.target.value)} /></Form.Group>
       </Modal.Body>
       <Modal.Footer><Button variant="secondary" onClick={()=>setGenreManagerOpen(false)}>Cancel</Button><Button variant="primary" onClick={saveGenre}>Save {genreManagerMode==="subgenre"?"Sub-Genre":"Genre"}</Button></Modal.Footer>
      </Modal>
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
   <Modal show={showDailyModal} onHide={()=>!dailySaving&&setShowDailyModal(false)} centered className="book-desk-book-modal">
    <Modal.Header closeButton={!dailySaving}><Modal.Title>Log Today’s Writing</Modal.Title></Modal.Header>
    <Modal.Body>
     <Form onSubmit={saveDailyEntry}>
      <div className="book-desk-form-grid">
       <Form.Group><Form.Label>Date</Form.Label><Form.Control type="date" value={dailyEntry.dateDay} readOnly/></Form.Group>
       <Form.Group><Form.Label>Words Written</Form.Label><Form.Control autoFocus inputMode="numeric" value={dailyEntry.wordsWritten} onChange={event=>setDailyEntry(current=>({...current,wordsWritten:event.target.value.replace(/[^0-9]/g,"")}))}/></Form.Group>
      </div>
      <Form.Group><Form.Label>Daily Note</Form.Label><Form.Control as="textarea" rows={3} value={dailyEntry.dailyNote} onChange={event=>setDailyEntry(current=>({...current,dailyNote:event.target.value}))}/></Form.Group>
      <div className="book-desk-modal-actions"><Button type="button" variant="outline-secondary" onClick={()=>setShowDailyModal(false)}>Cancel</Button><Button type="submit" disabled={dailySaving}>{dailySaving?"Saving...":"Save Today"}</Button></div>
     </Form>
    </Modal.Body>
   </Modal>
  </main>
 );
}

export default BookDashboard;
