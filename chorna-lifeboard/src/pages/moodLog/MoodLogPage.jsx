// src/pages/moodLog/MoodLogPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Modal,Table} from "react-bootstrap";
import {Smile,Laugh,Meh,Frown,Angry,Annoyed,Zap,BatteryLow,CloudRain,Heart,Brain} from "lucide-react";
import MoodLogForm from "./MoodLogForm.jsx";
import "../../styles/LifeboardPage.css";

function MoodLogPage(){

 const [records,setRecords]=useState([]);
 const [search,setSearch]=useState("");
 const [sourceFilter,setSourceFilter]=useState("all");
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [editingRecord,setEditingRecord]=useState(null);
 const [deletingRecord,setDeletingRecord]=useState(null);

 const moodStyles={
  energized:{icon:Zap,color:"#16a34a"},
  happy:{icon:Laugh,color:"#22c55e"},
  grateful:{icon:Heart,color:"#65a30d"},
  calm:{icon:Smile,color:"#84cc16"},
  neutral:{icon:Meh,color:"#ca8a04"},
  tired:{icon:BatteryLow,color:"#d97706"},
  sad:{icon:Frown,color:"#f97316"},
  depressed:{icon:CloudRain,color:"#ea580c"},
  anxious:{icon:Annoyed,color:"#dc2626"},
  stressed:{icon:Brain,color:"#b91c1c"},
  angry:{icon:Angry,color:"#991b1b"},
  joyful:{icon:Laugh,color:"#22c55e"},
  excited:{icon:Laugh,color:"#16a34a"},
  peaceful:{icon:Smile,color:"#84cc16"},
  okay:{icon:Meh,color:"#ca8a04"}
 };

 const getMoodStyle=mood=>{
  const key=String(mood||"").trim().toLowerCase();

  return moodStyles[key]||{icon:Smile,color:"#6b7280"};
 };

 const getToken=()=>{
  return localStorage.getItem("token")||sessionStorage.getItem("token")||"";
 };

 const getHeaders=()=>{
  const token=getToken();

  return {
   "Content-Type":"application/json",
   ...(token?{Authorization:`Bearer ${token}`}:{})
  };
 };

 const normalizeId=value=>{
  if(!value)return "";
  if(typeof value==="object"&&value?.$oid)return String(value.$oid);
  if(typeof value==="object"&&value?._id)return normalizeId(value._id);
  if(typeof value==="object"&&value?.id)return normalizeId(value.id);
  return String(value).trim();
 };

 const getRecordId=record=>{
  return normalizeId(record?._id)||normalizeId(record?.id);
 };

 const normalizeRecords=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.moodLogs))return data.moodLogs;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  return [];
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

 const setAutoNotice=message=>{
  setNotice(message);

  window.setTimeout(()=>{
   setNotice("");
  },5000);
 };

 const setAutoError=message=>{
  setError(message);

  window.setTimeout(()=>{
   setError("");
  },5000);
 };

 const loadRecords=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/mood-log",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to load mood logs");

   setRecords(normalizeRecords(data));
  }catch(err){
   setAutoError(err.message||"Failed to load mood logs");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadRecords();
 },[]);

 const filteredRecords=useMemo(()=>{
  return records.filter(record=>{
   const text=[
    formatDateDisplay(record.logDate),
    record.mood,
    record.energy,
    record.stress,
    record.sourceType,
    record.notes
   ].join(" ").toLowerCase();

   const matchesSearch=!search||text.includes(search.toLowerCase());
   const matchesSource=sourceFilter==="all"||record.sourceType===sourceFilter;

   return matchesSearch&&matchesSource;
  });
 },[records,search,sourceFilter]);

 const openAddModal=()=>{
  setEditingRecord(null);
  setError("");
  setShowFormModal(true);
 };

 const openEditModal=record=>{
  setEditingRecord(record);
  setError("");
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  setShowFormModal(false);
  setEditingRecord(null);
 };

 const handleSaved=async()=>{
  await loadRecords();
  closeFormModal();
  setAutoNotice(editingRecord?"Mood log updated successfully.":"Mood log created successfully.");
 };

 const openDeleteModal=record=>{
  setDeletingRecord(record);
  setError("");
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  setShowDeleteModal(false);
  setDeletingRecord(null);
 };

 const handleDelete=async()=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(deletingRecord);

   if(!recordId)throw new Error("Mood log ID is missing");

   const res=await fetch(`/api/mood-log/${recordId}`,{
    method:"DELETE",
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete mood log");

   await loadRecords();
   closeDeleteModal();
   setAutoNotice("Mood log deleted successfully.");
  }catch(err){
   setAutoError(err.message||"Failed to delete mood log");
  }finally{
   setSaving(false);
  }
 };

 const renderMood=record=>{
  const moodStyle=getMoodStyle(record.mood);
  const Icon=moodStyle.icon;

  return(
   <span className="d-inline-flex align-items-center gap-2">
    <span
     className="d-inline-flex align-items-center justify-content-center rounded-circle"
     style={{
      color:moodStyle.color,
      border:"1px solid "+moodStyle.color,
      backgroundColor:moodStyle.color+"18",
      width:"30px",
      height:"30px",
      flex:"0 0 30px"
     }}
    >
     <Icon size={18} strokeWidth={2.3}/>
    </span>

    <span>{record.mood||"-"}</span>
   </span>
  );
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Chorna Lifeboard</p>
     <h1 className="lifeboard-page-title">Mood Log</h1>
     <p className="lifeboard-page-text">Review mood, energy, stress, and source records over time.</p>
    </div>

    <button type="button" className="lifeboard-page-action" onClick={openAddModal}>
     Add Mood Log
    </button>
   </header>

   {notice&&(
    <Alert variant="success" dismissible onClose={()=>setNotice("")}>
     {notice}
    </Alert>
   )}

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>
     {error}
    </Alert>
   )}

   <section className="lifeboard-page-toolbar">
    <input
     className="lifeboard-page-search"
     type="text"
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     placeholder="Search records..."
    />

    <label className="lifeboard-page-filter">
     <span>Source</span>
     <select value={sourceFilter} onChange={(e)=>setSourceFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="manual">Manual</option>
      <option value="journal">Journal</option>
      <option value="mindfulness">Mindfulness</option>
     </select>
    </label>
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading mood logs...</div>
    ):filteredRecords.length?(
     <div className="lifeboard-table-wrap">
      <Table responsive className="lifeboard-table">
       <thead>
        <tr>
         <th>Date</th>
         <th>Mood</th>
         <th>Energy</th>
         <th>Stress</th>
         <th>Source</th>
         <th>Notes</th>
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {filteredRecords.map(record=>(
         <tr key={getRecordId(record)}>
          <td>{formatDateDisplay(record.logDate)}</td>
          <td>{renderMood(record)}</td>
          <td>{record.energy??"-"}</td>
          <td>{record.stress??"-"}</td>
          <td>{record.sourceType||"-"}</td>
          <td>{record.notes||"-"}</td>
          <td>
           <div className="lifeboard-table-actions">
            <Button size="sm" variant="outline-primary" type="button" onClick={()=>openEditModal(record)}>
             Edit
            </Button>

            <Button size="sm" variant="outline-danger" type="button" onClick={()=>openDeleteModal(record)}>
             Delete
            </Button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </Table>
     </div>
    ):(
     <div className="lifeboard-page-empty">No mood logs found.</div>
    )}
   </section>

   <Modal show={showFormModal} onHide={closeFormModal} size="lg" centered>
    <Modal.Header closeButton>
     <Modal.Title>{editingRecord?"Edit Mood Log":"Add Mood Log"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <MoodLogForm
      record={editingRecord}
      embedded={true}
      onCancel={closeFormModal}
      onSaved={handleSaved}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Mood Log</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <p>
      Are you sure you want to delete <strong>{deletingRecord?.mood||"this mood log"}</strong> from <strong>{formatDateDisplay(deletingRecord?.logDate)}</strong>?
     </p>

     <p className="text-muted mb-0">
      This action cannot be undone.
     </p>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="secondary" type="button" onClick={closeDeleteModal} disabled={saving}>
      Cancel
     </Button>

     <Button variant="danger" type="button" onClick={handleDelete} disabled={saving}>
      {saving?"Deleting...":"Delete Mood Log"}
     </Button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default MoodLogPage;