// src/pages/habit/HabitsPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Button,Form,Row,Col,Alert,Table,Badge,ProgressBar} from "react-bootstrap";
import HabitForm from "./HabitForm.jsx";
import "../../styles/LifeboardPage.css";

function HabitsPage(){

 const [records,setRecords]=useState([]);
 const [habitLogs,setHabitLogs]=useState([]);
 const [lifeAreas,setLifeAreas]=useState([]);
 const [categories,setCategories]=useState([]);
 const [tags,setTags]=useState([]);
 const [search,setSearch]=useState("");
 const [frequencyFilter,setFrequencyFilter]=useState("all");
 const [statusFilter,setStatusFilter]=useState("all");
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [showDelete,setShowDelete]=useState(false);
 const [showLog,setShowLog]=useState(false);
 const [editingRecord,setEditingRecord]=useState(null);
 const [deleteRecord,setDeleteRecord]=useState(null);
 const [logRecord,setLogRecord]=useState(null);

 const emptyLogForm={
  user:"",
  habit:"",
  logDate:"",
  completedCount:0,
  targetCount:1,
  unit:"times",
  isCompleted:false,
  notes:"",
  mood:"",
  energy:"",
  isSkipped:false,
  skipReason:""
 };

 const [logForm,setLogForm]=useState(emptyLogForm);

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getStoredUser=()=>{
  const keys=["user","userInfo","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const currentUser=getStoredUser();
 const userId=normalizeId(currentUser?._id)||normalizeId(currentUser?.id);

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const normalizeRecords=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  if(Array.isArray(data?.habits))return data.habits;
  if(Array.isArray(data?.habitLogs))return data.habitLogs;
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  if(Array.isArray(data?.categories))return data.categories;
  if(Array.isArray(data?.tags))return data.tags;
  return [];
 };

 const getRefName=value=>{
  if(!value)return "-";

  if(typeof value==="string"){
   const lifeArea=lifeAreas.find(item=>normalizeId(item._id)===value||normalizeId(item.id)===value);
   const category=categories.find(item=>normalizeId(item._id)===value||normalizeId(item.id)===value);
   const tag=tags.find(item=>normalizeId(item._id)===value||normalizeId(item.id)===value);

   return lifeArea?.name||category?.name||tag?.name||"-";
  }

  return value?.name||value?.title||value?.label||"-";
 };

 const getRecordId=record=>{
  return normalizeId(record?._id)||normalizeId(record?.id);
 };

 const formatDateForInput=value=>{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toISOString().slice(0,10);
 };

 const getTodayInputDate=()=>{
  const today=new Date();
  const offset=today.getTimezoneOffset();
  const localDate=new Date(today.getTime()-offset*60*1000);
  return localDate.toISOString().slice(0,10);
 };

 const formatDateDisplay=value=>{
  if(!value)return "-";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "-";

  return new Intl.DateTimeFormat("en-US",{
   month:"2-digit",
   day:"2-digit",
   year:"numeric"
  }).format(date);
 };

 const formatTimeDisplay=value=>{
  if(!value)return "-";

  const [hour,minute]=String(value).split(":");
  const date=new Date();

  date.setHours(Number(hour||0),Number(minute||0),0,0);

  if(Number.isNaN(date.getTime()))return "-";

  return new Intl.DateTimeFormat("en-US",{
   hour:"numeric",
   minute:"2-digit"
  }).format(date);
 };

 const formatTimeSlotsDisplay=record=>{
  if(record?.allDay)return "All Day";

  const slots=Array.isArray(record?.timeSlots)?record.timeSlots:[];

  if(slots.length){
   return slots
    .filter(slot=>slot?.startTime||slot?.endTime)
    .map((slot,index)=>`${index+1}. ${formatTimeDisplay(slot.startTime)} - ${formatTimeDisplay(slot.endTime)}`)
    .join(" | ")||"-";
  }

  if(record?.startTime||record?.endTime){
   return `${formatTimeDisplay(record.startTime)} - ${formatTimeDisplay(record.endTime)}`;
  }

  return "-";
 };

 const getLogDateKey=value=>{
  return formatDateForInput(value);
 };

 const getTodayLogForHabit=habit=>{
  const habitId=getRecordId(habit);
  const todayKey=getTodayInputDate();

  return habitLogs.find(log=>{
   const logHabitId=normalizeId(log.habit)||normalizeId(log.habit?._id)||normalizeId(log.habit?.id);
   return logHabitId===habitId&&getLogDateKey(log.logDate)===todayKey;
  });
 };

 const getProgressForHabit=habit=>{
  const target=Number(habit?.targetCount||1);
  const log=getTodayLogForHabit(habit);
  const completed=Number(log?.completedCount||0);
  const percent=target>0?Math.min(100,Math.round((completed/target)*100)):0;

  return {
   log,
   completed,
   target,
   percent,
   isCompleted:log?.isCompleted===true||percent>=100
  };
 };

 const setAutoNotice=message=>{
  setNotice(message);

  window.setTimeout(()=>{
   setNotice("");
  },5000);
 };

 const loadRecords=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/habits",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to load habits");

   setRecords(normalizeRecords(data));
  }catch(err){
   setError(err.message||"Failed to load habits");
  }finally{
   setLoading(false);
  }
 };

 const loadHabitLogs=async()=>{
  try{
   const res=await fetch("/api/habit-logs",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok){
    console.error("Failed to load habit logs",data);
    setHabitLogs([]);
    return;
   }

   setHabitLogs(normalizeRecords(data));
  }catch(err){
   console.error("Failed to load habit logs",err);
   setHabitLogs([]);
  }
 };

 const loadReferences=async()=>{
  try{
   const headers=getHeaders();

   const [lifeAreaRes,categoryRes,tagRes]=await Promise.all([
    fetch("/api/life-areas",{headers}),
    fetch("/api/categories",{headers}),
    fetch("/api/tags",{headers}).catch(()=>null)
   ]);

   const lifeAreaData=lifeAreaRes?await lifeAreaRes.json().catch(()=>({})):{};
   const categoryData=categoryRes?await categoryRes.json().catch(()=>({})):{};
   const tagData=tagRes?await tagRes.json().catch(()=>({})):{};

   setLifeAreas(normalizeRecords(lifeAreaData));
   setCategories(normalizeRecords(categoryData));
   setTags(normalizeRecords(tagData));
  }catch(err){
   console.error("Failed to load habit references",err);
  }
 };

 useEffect(()=>{
  loadRecords();
  loadHabitLogs();
  loadReferences();
 },[]);

 const filteredRecords=useMemo(()=>{
  return records.filter(record=>{
   const timeSlotText=Array.isArray(record.timeSlots)?record.timeSlots.map(slot=>`${slot.startTime||""} ${slot.endTime||""}`).join(" "):"";

   const text=[
    record.title,
    record.description,
    record.frequency,
    record.status,
    record.unit,
    timeSlotText,
    record.startTime,
    record.endTime,
    getRefName(record.lifeArea),
    getRefName(record.category)
   ].join(" ").toLowerCase();

   const matchesSearch=!search||text.includes(search.toLowerCase());
   const matchesFrequency=frequencyFilter==="all"||record.frequency===frequencyFilter;
   const matchesStatus=statusFilter==="all"||record.status===statusFilter;

   return matchesSearch&&matchesFrequency&&matchesStatus;
  });
 },[records,search,frequencyFilter,statusFilter,lifeAreas,categories,tags]);

 const updateLogField=(name,value)=>{
  setLogForm(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const openCreateModal=()=>{
  setEditingRecord(null);
  setError("");
  setShowForm(true);
 };

 const openEditModal=record=>{
  setEditingRecord(record);
  setError("");
  setShowForm(true);
 };

 const closeFormModal=()=>{
  setShowForm(false);
  setEditingRecord(null);
 };

 const handleHabitSaved=async()=>{
  await loadRecords();
  await loadReferences();
  closeFormModal();
  setAutoNotice(editingRecord?"Habit updated successfully.":"Habit created successfully.");
 };

 const openLogModal=record=>{
  const progress=getProgressForHabit(record);
  const existingLog=progress.log;

  setLogRecord(record);
  setError("");

  setLogForm({
   user:userId,
   habit:getRecordId(record),
   logDate:existingLog?formatDateForInput(existingLog.logDate):getTodayInputDate(),
   completedCount:existingLog?.completedCount??0,
   targetCount:existingLog?.targetCount??record.targetCount??1,
   unit:existingLog?.unit||record.unit||"times",
   isCompleted:existingLog?.isCompleted===true,
   notes:existingLog?.notes||"",
   mood:existingLog?.mood||"",
   energy:existingLog?.energy??"",
   isSkipped:existingLog?.isSkipped===true,
   skipReason:existingLog?.skipReason||""
  });

  setShowLog(true);
 };

 const closeLogModal=()=>{
  setShowLog(false);
  setLogRecord(null);
  setLogForm(emptyLogForm);
 };

 const openDeleteModal=record=>{
  setDeleteRecord(record);
  setError("");
  setShowDelete(true);
 };

 const closeDeleteModal=()=>{
  setDeleteRecord(null);
  setShowDelete(false);
 };

 const cleanOptionalNumber=value=>{
  if(value===""||value===null||value===undefined)return undefined;

  const numberValue=Number(value);

  return Number.isNaN(numberValue)?undefined:numberValue;
 };

 const cleanPayload=payload=>{
  const cleaned={
   ...payload,
   tags:Array.isArray(payload.tags)?payload.tags.filter(Boolean):[],
   repeatDays:Array.isArray(payload.repeatDays)?payload.repeatDays.filter(Boolean):[]
  };

  if(cleaned.frequency!=="weekly"){
   cleaned.repeatDays=[];
  }

  if(cleaned.frequency!=="monthly"){
   delete cleaned.repeatDayOfMonth;
  }else{
   cleaned.repeatDayOfMonth=cleanOptionalNumber(cleaned.repeatDayOfMonth);
  }

  if(cleaned.frequency!=="yearly"){
   delete cleaned.repeatMonth;
   delete cleaned.repeatDayOfYear;
  }else{
   cleaned.repeatMonth=cleanOptionalNumber(cleaned.repeatMonth);
   cleaned.repeatDayOfYear=cleanOptionalNumber(cleaned.repeatDayOfYear);
  }

  Object.keys(cleaned).forEach(key=>{
   if(cleaned[key]==="")delete cleaned[key];
   if(cleaned[key]===undefined)delete cleaned[key];
   if(Array.isArray(cleaned[key]))cleaned[key]=cleaned[key].filter(Boolean);
  });

  return cleaned;
 };

 const handleLogSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const existingLog=getTodayLogForHabit(logRecord);
   const existingLogId=getRecordId(existingLog);

   const completedCount=Number(logForm.completedCount||0);
   const targetCount=Number(logForm.targetCount||1);

   const payload=cleanPayload({
    ...logForm,
    user:logForm.user||userId,
    habit:logForm.habit||getRecordId(logRecord),
    completedCount,
    targetCount,
    isCompleted:logForm.isCompleted||completedCount>=targetCount,
    isSkipped:!!logForm.isSkipped,
    energy:logForm.energy===""?null:Number(logForm.energy)
   });

   if(!payload.user)throw new Error("User is required");
   if(!payload.habit)throw new Error("Habit is required");
   if(!payload.logDate)throw new Error("Log date is required");

   const res=await fetch(existingLogId?`/api/habit-logs/${existingLogId}`:"/api/habit-logs",{
    method:existingLogId?"PUT":"POST",
    headers:getHeaders(),
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save habit log");

   await loadHabitLogs();
   closeLogModal();
   setAutoNotice("Habit progress logged successfully.");
  }catch(err){
   setError(err.message||"Failed to save habit log");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(deleteRecord);

   if(!recordId)throw new Error("Habit ID is missing");

   const res=await fetch(`/api/habits/${recordId}`,{
    method:"DELETE",
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete habit");

   await loadRecords();
   closeDeleteModal();
   setAutoNotice("Habit deleted successfully.");
  }catch(err){
   setError(err.message||"Failed to delete habit");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Chorna Lifeboard</p>
     <h1 className="lifeboard-page-title">Habits</h1>
     <p className="lifeboard-page-text">Track active habits, frequency, targets, consistency, life areas, categories, tags, and progress logs.</p>
    </div>

    <button type="button" className="lifeboard-page-action" onClick={openCreateModal}>
     Add Habit
    </button>
   </header>

   {notice&&<Alert variant="success">{notice}</Alert>}
   {error&&<Alert variant="danger">{error}</Alert>}

   <section className="lifeboard-page-toolbar">
    <input
     className="lifeboard-page-search"
     type="text"
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     placeholder="Search records..."
    />

    <label className="lifeboard-page-filter">
     <span>Frequency</span>
     <select value={frequencyFilter} onChange={(e)=>setFrequencyFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
     </select>
    </label>

    <label className="lifeboard-page-filter">
     <span>Status</span>
     <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="paused">Paused</option>
      <option value="completed">Completed</option>
      <option value="archived">Archived</option>
     </select>
    </label>
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading habits...</div>
    ):filteredRecords.length?(
     <div className="lifeboard-table-wrap">
      <Table responsive className="lifeboard-table">
       <thead>
        <tr>
         <th>Title</th>
         <th>Frequency</th>
         <th>Progress Today</th>
         <th>Target</th>
         <th>Time</th>
         <th>Status</th>
         <th>Life Area</th>
         <th>Category</th>
         <th>Start Date</th>
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {filteredRecords.map(record=>{
         const progress=getProgressForHabit(record);

         return(
          <tr key={getRecordId(record)}>
           <td>{record.title}</td>
           <td>{record.frequency||"-"}</td>
           <td>
            <div className="lifeboard-progress-cell">
             <ProgressBar now={progress.percent} label={`${progress.percent}%`}/>
             <small>{progress.completed} / {progress.target} {record.unit||"times"}</small>
            </div>
           </td>
           <td>{record.targetCount??"-"}</td>
           <td>{formatTimeSlotsDisplay(record)}</td>
           <td>
            <Badge bg={record.status==="active"?"success":record.status==="paused"?"warning":record.status==="completed"?"primary":"secondary"}>
             {record.status||"-"}
            </Badge>
           </td>
           <td>{getRefName(record.lifeArea)}</td>
           <td>{getRefName(record.category)}</td>
           <td>{formatDateDisplay(record.startDate)}</td>
           <td>
            <div className="lifeboard-table-actions">
             <Button size="sm" variant="success" onClick={()=>openLogModal(record)}>
              Log
             </Button>

             <Button size="sm" variant="outline-primary" onClick={()=>openEditModal(record)}>
              Edit
             </Button>

             <Button size="sm" variant="outline-danger" onClick={()=>openDeleteModal(record)}>
              Delete
             </Button>
            </div>
           </td>
          </tr>
         );
        })}
       </tbody>
      </Table>
     </div>
    ):(
     <div className="lifeboard-page-empty">No habits found.</div>
    )}
   </section>

   <Modal show={showForm} onHide={closeFormModal} size="lg" centered>
    <Modal.Header closeButton>
     <Modal.Title>{editingRecord?"Edit Habit":"Add Habit"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <HabitForm
      record={editingRecord}
      embedded={true}
      onCancel={closeFormModal}
      onSaved={handleHabitSaved}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showLog} onHide={closeLogModal} size="lg" centered>
    <Form onSubmit={handleLogSubmit}>
     <Modal.Header closeButton>
      <Modal.Title>Log Habit Progress</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      {error&&<Alert variant="danger">{error}</Alert>}

      <p className="mb-3">
       <strong>{logRecord?.title||"Habit"}</strong>
      </p>

      <Row className="g-3">
       <Col md={6}>
        <Form.Group>
         <Form.Label>Log Date</Form.Label>
         <Form.Control type="date" value={logForm.logDate} onChange={(e)=>updateLogField("logDate",e.target.value)} required/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Completed Count</Form.Label>
         <Form.Control type="number" min="0" value={logForm.completedCount} onChange={(e)=>updateLogField("completedCount",e.target.value)}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Target Count</Form.Label>
         <Form.Control type="number" min="1" value={logForm.targetCount} onChange={(e)=>updateLogField("targetCount",e.target.value)}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Unit</Form.Label>
         <Form.Control type="text" value={logForm.unit} onChange={(e)=>updateLogField("unit",e.target.value)}/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Mood</Form.Label>
         <Form.Control type="text" value={logForm.mood} onChange={(e)=>updateLogField("mood",e.target.value)} placeholder="Focused, tired, calm..."/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Group>
         <Form.Label>Energy</Form.Label>
         <Form.Control type="number" min="1" max="10" value={logForm.energy} onChange={(e)=>updateLogField("energy",e.target.value)} placeholder="1-10"/>
        </Form.Group>
       </Col>

       <Col md={6}>
        <Form.Check type="checkbox" label="Completed" checked={!!logForm.isCompleted} onChange={(e)=>updateLogField("isCompleted",e.target.checked)}/>
       </Col>

       <Col md={6}>
        <Form.Check type="checkbox" label="Skipped" checked={!!logForm.isSkipped} onChange={(e)=>updateLogField("isSkipped",e.target.checked)}/>
       </Col>

       {logForm.isSkipped&&(
        <Col md={12}>
         <Form.Group>
          <Form.Label>Skip Reason</Form.Label>
          <Form.Control type="text" value={logForm.skipReason} onChange={(e)=>updateLogField("skipReason",e.target.value)}/>
         </Form.Group>
        </Col>
       )}

       <Col md={12}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={4} value={logForm.notes} onChange={(e)=>updateLogField("notes",e.target.value)}/>
        </Form.Group>
       </Col>
      </Row>
     </Modal.Body>

     <Modal.Footer>
      <Button variant="secondary" onClick={closeLogModal} disabled={saving}>Cancel</Button>
      <Button type="submit" variant="success" disabled={saving}>{saving?"Saving...":"Save Progress"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>

   <Modal show={showDelete} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Habit</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error&&<Alert variant="danger">{error}</Alert>}

     <p>
      Are you sure you want to delete <strong>{deleteRecord?.title||"this habit"}</strong>?
     </p>

     <p className="text-muted mb-0">
      This action cannot be undone.
     </p>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={saving}>Cancel</Button>
     <Button variant="danger" onClick={handleDelete} disabled={saving}>{saving?"Deleting...":"Delete Habit"}</Button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default HabitsPage;