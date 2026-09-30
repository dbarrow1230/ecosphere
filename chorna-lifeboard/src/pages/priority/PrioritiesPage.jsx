// src/pages/priority/PrioritiesPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Button,Alert,Table,Badge} from "react-bootstrap";
import PriorityForm from "./PriorityForm.jsx";
import "../../styles/LifeboardPage.css";

function PrioritiesPage(){

 const [records,setRecords]=useState([]);
 const [search,setSearch]=useState("");
 const [priorityTypeFilter,setPriorityTypeFilter]=useState("all");
 const [priorityLevelFilter,setPriorityLevelFilter]=useState("all");
 const [statusFilter,setStatusFilter]=useState("all");
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [showDelete,setShowDelete]=useState(false);
 const [editingRecord,setEditingRecord]=useState(null);
 const [deleteRecord,setDeleteRecord]=useState(null);

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
  if(Array.isArray(data?.priorities))return data.priorities;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  return [];
 };

 const getValueByPath=(record,path)=>{
  return String(path||"").split(".").reduce((value,key)=>{
   if(value===null||value===undefined)return "";
   return value[key];
  },record);
 };

 const getRefLabel=value=>{
  if(!value)return "-";
  if(typeof value==="string")return "-";
  return value?.title||value?.name||value?.label||value?.message||value?.summary||"-";
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

 const getStatusVariant=status=>{
  if(status==="active")return "success";
  if(status==="completed")return "primary";
  if(status==="paused")return "warning";
  if(status==="cancelled")return "danger";
  if(status==="archived")return "secondary";
  return "secondary";
 };

 const getPriorityVariant=level=>{
  if(level==="urgent")return "danger";
  if(level==="high")return "warning";
  if(level==="medium")return "primary";
  if(level==="low")return "secondary";
  return "secondary";
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

   const res=await fetch("/api/priorities",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to load priorities");

   setRecords(normalizeRecords(data));
  }catch(err){
   setAutoError(err.message||"Failed to load priorities");
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
    record.title,
    record.description,
    record.notes,
    record.priorityType,
    record.priorityLevel,
    record.status,
    getRefLabel(record.lifeArea),
    getRefLabel(record.category),
    getRefLabel(record.linkedGoal),
    getRefLabel(record.linkedTask),
    getRefLabel(record.linkedHabit),
    getRefLabel(record.linkedRoutine),
    getRefLabel(record.linkedReminder),
    getRefLabel(record.linkedEvent),
    getRefLabel(record.linkedMilestone),
    getRefLabel(record.linkedJournal),
    getRefLabel(record.linkedNote),
    getRefLabel(record.linkedReview),
    getRefLabel(record.linkedLifeTheme),
    getRefLabel(record.linkedMemory),
    getRefLabel(record.linkedMindfulnessEntry),
    getRefLabel(record.linkedMoodLog),
    getRefLabel(record.linkedVisionBoard)
   ].join(" ").toLowerCase();

   const matchesSearch=!search||text.includes(search.toLowerCase());
   const matchesType=priorityTypeFilter==="all"||record.priorityType===priorityTypeFilter;
   const matchesLevel=priorityLevelFilter==="all"||record.priorityLevel===priorityLevelFilter;
   const matchesStatus=statusFilter==="all"||record.status===statusFilter;

   return matchesSearch&&matchesType&&matchesLevel&&matchesStatus;
  });
 },[records,search,priorityTypeFilter,priorityLevelFilter,statusFilter]);

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

 const handlePrioritySaved=async()=>{
  await loadRecords();
  closeFormModal();
  setAutoNotice(editingRecord?"Priority updated successfully.":"Priority created successfully.");
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

 const handleDelete=async()=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(deleteRecord);

   if(!recordId)throw new Error("Priority ID is missing");

   const res=await fetch(`/api/priorities/${recordId}`,{
    method:"DELETE",
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete priority");

   await loadRecords();
   closeDeleteModal();
   setAutoNotice("Priority deleted successfully.");
  }catch(err){
   setAutoError(err.message||"Failed to delete priority");
  }finally{
   setSaving(false);
  }
 };

 const columns=[
  {key:"title",label:"Title"},
  {key:"priorityType",label:"Type"},
  {key:"priorityLevel",label:"Level"},
  {key:"status",label:"Status"},
  {key:"dueDate",label:"Due Date",format:"date"},
  {key:"lifeArea.name",label:"Life Area"},
  {key:"category.name",label:"Category"},
  {key:"linkedGoal.title",label:"Goal"},
  {key:"linkedTask.title",label:"Task"},
  {key:"linkedHabit.title",label:"Habit"},
  {key:"linkedRoutine.title",label:"Routine"},
  {key:"linkedReminder.title",label:"Reminder"},
  {key:"linkedEvent.title",label:"Event"},
  {key:"linkedMilestone.title",label:"Milestone"},
  {key:"linkedJournal.title",label:"Journal"}
 ];

 const renderCell=(record,column)=>{
  const value=getValueByPath(record,column.key);

  if(column.format==="date")return formatDateDisplay(value);

  if(column.key==="priorityLevel"){
   return(
    <Badge bg={getPriorityVariant(record.priorityLevel)}>
     {record.priorityLevel||"-"}
    </Badge>
   );
  }

  if(column.key==="status"){
   return(
    <Badge bg={getStatusVariant(record.status)}>
     {record.status||"-"}
    </Badge>
   );
  }

  if(value===null||value===undefined||value==="")return "-";

  return value;
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Chorna Lifeboard</p>
     <h1 className="lifeboard-page-title">Priorities</h1>
     <p className="lifeboard-page-text">View what needs attention across your daily, weekly, monthly, and yearly planning.</p>
    </div>

    <button type="button" className="lifeboard-page-action" onClick={openCreateModal}>
     Add Priority
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
     placeholder="Search priorities..."
    />

    <label className="lifeboard-page-filter">
     <span>Type</span>
     <select value={priorityTypeFilter} onChange={(e)=>setPriorityTypeFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
     </select>
    </label>

    <label className="lifeboard-page-filter">
     <span>Level</span>
     <select value={priorityLevelFilter} onChange={(e)=>setPriorityLevelFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
     </select>
    </label>

    <label className="lifeboard-page-filter">
     <span>Status</span>
     <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="paused">Paused</option>
      <option value="cancelled">Cancelled</option>
      <option value="archived">Archived</option>
     </select>
    </label>
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading priorities...</div>
    ):filteredRecords.length?(
     <div className="lifeboard-table-wrap">
      <Table responsive className="lifeboard-table">
       <thead>
        <tr>
         {columns.map(column=>(
          <th key={column.key}>{column.label}</th>
         ))}
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {filteredRecords.map(record=>(
         <tr key={getRecordId(record)}>
          {columns.map(column=>(
           <td key={`${getRecordId(record)}-${column.key}`}>
            {renderCell(record,column)}
           </td>
          ))}

          <td>
           <div className="lifeboard-table-actions">
            <Button size="sm" variant="outline-primary" onClick={()=>openEditModal(record)}>
             Edit
            </Button>

            <Button size="sm" variant="outline-danger" onClick={()=>openDeleteModal(record)}>
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
     <div className="lifeboard-page-empty">No priorities found.</div>
    )}
   </section>

   <Modal show={showForm} onHide={closeFormModal} size="xl" centered>
    <Modal.Header closeButton>
     <Modal.Title>{editingRecord?"Edit Priority":"Add Priority"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <PriorityForm
      record={editingRecord}
      embedded={true}
      onCancel={closeFormModal}
      onSaved={handlePrioritySaved}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Priority</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error&&(
      <Alert variant="danger" dismissible onClose={()=>setError("")}>
       {error}
      </Alert>
     )}

     <p>
      Are you sure you want to delete <strong>{deleteRecord?.title||"this priority"}</strong>?
     </p>

     <p className="text-muted mb-0">
      This action cannot be undone.
     </p>
    </Modal.Body>

    <Modal.Footer>
     <Button variant="secondary" onClick={closeDeleteModal} disabled={saving}>
      Cancel
     </Button>

     <Button variant="danger" onClick={handleDelete} disabled={saving}>
      {saving?"Deleting...":"Delete Priority"}
     </Button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default PrioritiesPage;