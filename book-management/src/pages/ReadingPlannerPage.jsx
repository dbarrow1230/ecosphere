import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import "../styles/ReadingPlannerPage.css";

const DAYS=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

const emptyGoalForm=()=>{
 const now=new Date();
 return{
  name:"Monthly Reading Goal",
  period:"monthly",
  year:String(now.getFullYear()),
  month:String(now.getMonth()+1),
  targetBooks:"",
  targetPages:"",
  booksCompleted:"0",
  pagesRead:"0",
  status:"active",
  notes:""
 };
};

const emptyPlanForm=()=>({
 name:"Reading Session",
 book:"",
 subject:"",
 daysOfWeek:[],
 startDate:"",
 endDate:"",
 startPage:"0",
 targetPage:"",
 pagesPerSession:"",
 status:"active",
 notes:""
});

const normalizeBooks=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.books))return data.books;
 if(Array.isArray(data?.data))return data.data;
 return [];
};

const normalizeGoals=data=>Array.isArray(data?.goals)?data.goals:[];
const normalizePlans=data=>Array.isArray(data?.plans)?data.plans:[];

const formatDateInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":date.toISOString().slice(0,10);
};

const getBookId=book=>typeof book==="string"?book:book?._id||"";
const getBookTitle=book=>[book?.title,book?.subtitle].filter(Boolean).join(": ")||"Untitled Book";
const sortedDays=days=>DAYS.filter(day=>Array.isArray(days)&&days.includes(day));

const goalToForm=goal=>({
 name:goal?.name||"Reading Goal",
 period:goal?.period||"monthly",
 year:String(goal?.year||new Date().getFullYear()),
 month:String(goal?.month||new Date().getMonth()+1),
 targetBooks:String(goal?.targetBooks||""),
 targetPages:String(goal?.targetPages||""),
 booksCompleted:String(goal?.booksCompleted||0),
 pagesRead:String(goal?.pagesRead||0),
 status:goal?.status||"active",
 notes:goal?.notes||""
});

const planToForm=plan=>({
 name:plan?.name||"Reading Session",
 book:getBookId(plan?.book),
 subject:plan?.subject||"",
 daysOfWeek:sortedDays(plan?.daysOfWeek),
 startDate:formatDateInput(plan?.startDate),
 endDate:formatDateInput(plan?.endDate),
 startPage:String(plan?.startPage||0),
 targetPage:String(plan?.targetPage||""),
 pagesPerSession:String(plan?.pagesPerSession||""),
 status:plan?.status||"active",
 notes:plan?.notes||""
});

export default function ReadingPlannerPage(){
 const [books,setBooks]=useState([]);
 const [goals,setGoals]=useState([]);
 const [plans,setPlans]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [saving,setSaving]=useState("");
 const [goalForm,setGoalForm]=useState(emptyGoalForm);
 const [planForm,setPlanForm]=useState(emptyPlanForm);
 const [goalModal,setGoalModal]=useState({open:false,mode:"create",item:null});
 const [planModal,setPlanModal]=useState({open:false,mode:"create",item:null});
 const [confirmDelete,setConfirmDelete]=useState(null);

 const activeBooks=useMemo(()=>books.filter(book=>String(book?.reading?.status||"").toLowerCase()==="reading"),[books]);
 const bookOptions=activeBooks.length?activeBooks:books;

 const loadData=async()=>{
  try{
   setLoading(true);
   setError("");
   const [booksRes,goalsRes,plansRes]=await Promise.all([
    fetch("/api/books?limit=500&sort=title&order=asc",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/reading-goals?status=active",{headers:{"Content-Type":"application/json"}}),
    fetch("/api/reading-plans?status=active",{headers:{"Content-Type":"application/json"}})
   ]);
   const [booksData,goalsData,plansData]=await Promise.all([
    booksRes.ok?booksRes.json():Promise.resolve([]),
    goalsRes.ok?goalsRes.json():Promise.resolve({goals:[]}),
    plansRes.ok?plansRes.json():Promise.resolve({plans:[]})
   ]);
   setBooks(normalizeBooks(booksData));
   setGoals(normalizeGoals(goalsData));
   setPlans(normalizePlans(plansData));
  }catch(err){
   setError(err.message||"Failed to load reading planner");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadData();
 },[]);

 const openGoalModal=goal=>{
  setError("");
  setGoalForm(goal?goalToForm(goal):emptyGoalForm());
  setGoalModal({open:true,mode:goal?"edit":"create",item:goal||null});
 };

 const openPlanModal=plan=>{
  setError("");
  setPlanForm(plan?planToForm(plan):emptyPlanForm());
  setPlanModal({open:true,mode:plan?"edit":"create",item:plan||null});
 };

 const closeModals=()=>{
  setGoalModal(prev=>({...prev,open:false}));
  setPlanModal(prev=>({...prev,open:false}));
  setConfirmDelete(null);
 };

 const updateGoal=(field,value)=>setGoalForm(prev=>({...prev,[field]:value}));
 const updatePlan=(field,value)=>setPlanForm(prev=>({...prev,[field]:value}));

 const togglePlanDay=day=>{
  setPlanForm(prev=>({
   ...prev,
   daysOfWeek:prev.daysOfWeek.includes(day)?prev.daysOfWeek.filter(item=>item!==day):sortedDays([...prev.daysOfWeek,day])
  }));
 };

 const hasDuplicateGoal=()=>{
  const month=goalForm.period==="yearly"?null:Number(goalForm.month);
  return goals.some(goal=>
   goal._id!==goalModal.item?._id&&
   goal.period===goalForm.period&&
   Number(goal.year)===Number(goalForm.year)&&
   (goal.period==="yearly"||Number(goal.month)===month)&&
   goal.status===goalForm.status
  );
 };

 const hasDuplicatePlan=()=>{
  const days=sortedDays(planForm.daysOfWeek).join("|");
  return plans.some(plan=>
   plan._id!==planModal.item?._id&&
   getBookId(plan.book)===planForm.book&&
   String(plan.subject||"General").trim().toLowerCase()===String(planForm.subject||"General").trim().toLowerCase()&&
   sortedDays(plan.daysOfWeek).join("|")===days&&
   plan.status===planForm.status
  );
 };

 const saveGoal=async event=>{
  event.preventDefault();
  if(hasDuplicateGoal()){
   setError("An active reading goal already exists for this period.");
   return;
  }
  try{
   setSaving("goal");
   setError("");
   const isEdit=goalModal.mode==="edit";
   const res=await fetch(isEdit?`/api/reading-goals/${goalModal.item._id}`:"/api/reading-goals",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     ...goalForm,
     year:Number(goalForm.year),
     month:goalForm.period==="yearly"?null:Number(goalForm.month),
     targetBooks:Number(goalForm.targetBooks||0),
     targetPages:Number(goalForm.targetPages||0),
     booksCompleted:Number(goalForm.booksCompleted||0),
     pagesRead:Number(goalForm.pagesRead||0)
    })
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to save reading goal");
   setGoals(prev=>isEdit?prev.map(goal=>goal._id===data.goal._id?data.goal:goal):[data.goal,...prev]);
   closeModals();
  }catch(err){
   setError(err.message||"Failed to save reading goal");
  }finally{
   setSaving("");
  }
 };

 const savePlan=async event=>{
  event.preventDefault();
  if(!planForm.book){
   setError("Choose a book for the reading plan.");
   return;
  }
  if(hasDuplicatePlan()){
   setError("An active reading plan already exists for this book, subject, and days.");
   return;
  }
  try{
   setSaving("plan");
   setError("");
   const isEdit=planModal.mode==="edit";
   const res=await fetch(isEdit?`/api/reading-plans/${planModal.item._id}`:"/api/reading-plans",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     ...planForm,
     daysOfWeek:sortedDays(planForm.daysOfWeek),
     startPage:Number(planForm.startPage||0),
     targetPage:Number(planForm.targetPage||0),
     pagesPerSession:Number(planForm.pagesPerSession||0)
    })
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to save reading plan");
   setPlans(prev=>isEdit?prev.map(plan=>plan._id===data.plan._id?data.plan:plan):[data.plan,...prev]);
   closeModals();
  }catch(err){
   setError(err.message||"Failed to save reading plan");
  }finally{
   setSaving("");
  }
 };

 const deleteItem=async()=>{
  if(!confirmDelete)return;
  try{
   setSaving("delete");
   setError("");
   const endpoint=confirmDelete.type==="goal"?"/api/reading-goals":"/api/reading-plans";
   const res=await fetch(`${endpoint}/${confirmDelete.item._id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to delete item");
   if(confirmDelete.type==="goal")setGoals(prev=>prev.filter(goal=>goal._id!==confirmDelete.item._id));
   if(confirmDelete.type==="plan")setPlans(prev=>prev.filter(plan=>plan._id!==confirmDelete.item._id));
   closeModals();
  }catch(err){
   setError(err.message||"Failed to delete item");
  }finally{
   setSaving("");
  }
 };

 return(
  <div className="reading-planner-page">
   <div className="reading-planner-header">
    <div>
     <p>Reading System</p>
     <h1>Reading Planner</h1>
     <div>Set goals, assign books to study-style subjects, and plan reading days.</div>
    </div>
    <Link to="/dashboard">Back to dashboard</Link>
   </div>

   {loading?<div className="reading-planner-alert">Loading planner...</div>:null}
   {error?<div className="reading-planner-alert reading-planner-alert-danger">{error}</div>:null}

   <div className="reading-planner-lists">
    <section className="reading-planner-panel">
     <div className="reading-planner-panel-head reading-planner-panel-actions">
      <div><p>Saved</p><h2>Active Goals</h2></div>
      <button type="button" onClick={()=>openGoalModal(null)}>Add Goal</button>
     </div>
     {!goals.length?<div className="reading-planner-empty">No active goals saved.</div>:goals.map(goal=>(
      <div key={goal._id} className="reading-planner-list-row">
       <div>
        <strong>{goal.name}</strong>
        <span>{goal.period} - {goal.booksCompleted}/{goal.targetBooks||0} books - {goal.pagesRead}/{goal.targetPages||0} pages</span>
       </div>
       <div className="reading-planner-row-actions">
        <button type="button" onClick={()=>openGoalModal(goal)}>Edit</button>
        <button type="button" onClick={()=>setConfirmDelete({type:"goal",item:goal,label:goal.name})}>Delete</button>
       </div>
      </div>
     ))}
    </section>

    <section className="reading-planner-panel">
     <div className="reading-planner-panel-head reading-planner-panel-actions">
      <div><p>Saved</p><h2>Active Plans</h2></div>
      <button type="button" onClick={()=>openPlanModal(null)}>Add Plan</button>
     </div>
     {!plans.length?<div className="reading-planner-empty">No active plans saved.</div>:plans.map(plan=>(
      <div key={plan._id} className="reading-planner-list-row">
       <div>
        <strong>{plan.subject||"General"}: {plan.book?getBookTitle(plan.book):plan.name}</strong>
        <span>{Array.isArray(plan.daysOfWeek)&&plan.daysOfWeek.length?plan.daysOfWeek.join(", "):"Flexible"} - {plan.startPage||0} to {plan.targetPage||0}</span>
       </div>
       <div className="reading-planner-row-actions">
        <button type="button" onClick={()=>openPlanModal(plan)}>Edit</button>
        <button type="button" onClick={()=>setConfirmDelete({type:"plan",item:plan,label:plan.book?getBookTitle(plan.book):plan.name})}>Delete</button>
       </div>
      </div>
     ))}
    </section>
   </div>

   {goalModal.open?(
    <div className="reading-planner-modal-backdrop" role="presentation">
     <form className="reading-planner-modal" onSubmit={saveGoal}>
      <div className="reading-planner-modal-head">
       <div><p>Goal</p><h2>{goalModal.mode==="edit"?"Edit Goal":"Add Goal"}</h2></div>
       <button type="button" onClick={closeModals}>Close</button>
      </div>
      <label>Name<input value={goalForm.name} onChange={e=>updateGoal("name",e.target.value)} /></label>
      <div className="reading-planner-two">
       <label>Period<select value={goalForm.period} onChange={e=>updateGoal("period",e.target.value)}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label>
       <label>Year<input type="number" value={goalForm.year} onChange={e=>updateGoal("year",e.target.value)} /></label>
      </div>
      {goalForm.period==="monthly"?<label>Month<input type="number" min="1" max="12" value={goalForm.month} onChange={e=>updateGoal("month",e.target.value)} /></label>:null}
      <div className="reading-planner-two">
       <label>Books to read<input type="number" min="0" value={goalForm.targetBooks} onChange={e=>updateGoal("targetBooks",e.target.value)} /></label>
       <label>Pages to read<input type="number" min="0" value={goalForm.targetPages} onChange={e=>updateGoal("targetPages",e.target.value)} /></label>
      </div>
      <div className="reading-planner-two">
       <label>Books completed<input type="number" min="0" value={goalForm.booksCompleted} onChange={e=>updateGoal("booksCompleted",e.target.value)} /></label>
       <label>Pages read<input type="number" min="0" value={goalForm.pagesRead} onChange={e=>updateGoal("pagesRead",e.target.value)} /></label>
      </div>
      <label>Status<select value={goalForm.status} onChange={e=>updateGoal("status",e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
      <label>Notes<textarea value={goalForm.notes} onChange={e=>updateGoal("notes",e.target.value)} /></label>
      <div className="reading-planner-modal-actions">
       <button type="button" onClick={closeModals}>Cancel</button>
       <button type="submit" disabled={saving==="goal"}>{saving==="goal"?"Saving...":"Save Goal"}</button>
      </div>
     </form>
    </div>
   ):null}

   {planModal.open?(
    <div className="reading-planner-modal-backdrop" role="presentation">
     <form className="reading-planner-modal" onSubmit={savePlan}>
      <div className="reading-planner-modal-head">
       <div><p>Plan</p><h2>{planModal.mode==="edit"?"Edit Plan":"Add Plan"}</h2></div>
       <button type="button" onClick={closeModals}>Close</button>
      </div>
      <label>Name<input value={planForm.name} onChange={e=>updatePlan("name",e.target.value)} /></label>
      <label>Book<select value={planForm.book} onChange={e=>updatePlan("book",e.target.value)}><option value="">Choose a book</option>{bookOptions.map(book=><option key={book._id} value={book._id}>{getBookTitle(book)}</option>)}</select></label>
      <label>Subject<input value={planForm.subject} onChange={e=>updatePlan("subject",e.target.value)} placeholder="History, Bible study, writing craft..." /></label>
      <div className="reading-planner-days">
       {DAYS.map(day=><button key={day} type="button" className={planForm.daysOfWeek.includes(day)?"is-selected":""} onClick={()=>togglePlanDay(day)}>{day.slice(0,3)}</button>)}
      </div>
      <div className="reading-planner-two">
       <label>Start date<input type="date" value={planForm.startDate} onChange={e=>updatePlan("startDate",e.target.value)} /></label>
       <label>End date<input type="date" value={planForm.endDate} onChange={e=>updatePlan("endDate",e.target.value)} /></label>
      </div>
      <div className="reading-planner-three">
       <label>Start page<input type="number" min="0" value={planForm.startPage} onChange={e=>updatePlan("startPage",e.target.value)} /></label>
       <label>Target page<input type="number" min="0" value={planForm.targetPage} onChange={e=>updatePlan("targetPage",e.target.value)} /></label>
       <label>Pages/session<input type="number" min="0" value={planForm.pagesPerSession} onChange={e=>updatePlan("pagesPerSession",e.target.value)} /></label>
      </div>
      <label>Status<select value={planForm.status} onChange={e=>updatePlan("status",e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
      <label>Notes<textarea value={planForm.notes} onChange={e=>updatePlan("notes",e.target.value)} /></label>
      <div className="reading-planner-modal-actions">
       <button type="button" onClick={closeModals}>Cancel</button>
       <button type="submit" disabled={saving==="plan"}>{saving==="plan"?"Saving...":"Save Plan"}</button>
      </div>
     </form>
    </div>
   ):null}

   {confirmDelete?(
    <div className="reading-planner-modal-backdrop" role="presentation">
     <div className="reading-planner-modal reading-planner-confirm">
      <div className="reading-planner-modal-head">
       <div><p>Confirm</p><h2>Delete {confirmDelete.type==="goal"?"Goal":"Plan"}</h2></div>
      </div>
      <p>Delete "{confirmDelete.label}"? This cannot be undone.</p>
      <div className="reading-planner-modal-actions">
       <button type="button" onClick={()=>setConfirmDelete(null)}>Cancel</button>
       <button type="button" disabled={saving==="delete"} onClick={deleteItem}>{saving==="delete"?"Deleting...":"Delete"}</button>
      </div>
     </div>
    </div>
   ):null}
  </div>
 );
}
