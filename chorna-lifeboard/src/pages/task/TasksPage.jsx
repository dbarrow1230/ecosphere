// src/pages/task/TasksPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Table} from "react-bootstrap";
import TaskForm from "./TaskForm.jsx";
import "../../styles/LifeboardPage.css";

function TasksPage(){

 const [records,setRecords]=useState([]);
 const [lifeAreas,setLifeAreas]=useState([]);
 const [categories,setCategories]=useState([]);
 const [tags,setTags]=useState([]);
 const [search,setSearch]=useState("");
 const [taskTypeFilter,setTaskTypeFilter]=useState("all");
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

 const normalizeRecords=data=>{
  if(Array.isArray(data))return data;
  if(Array.isArray(data?.data))return data.data;
  if(Array.isArray(data?.records))return data.records;
  if(Array.isArray(data?.tasks))return data.tasks;
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  if(Array.isArray(data?.categories))return data.categories;
  if(Array.isArray(data?.tags))return data.tags;
  return [];
 };

 const isTaskRecord=record=>{
  if(!record||typeof record!=="object")return false;
  if(!record.title||String(record.title).trim()===""||String(record.title).trim()==="-")return false;

  return record.taskType!==undefined||
   record.priority!==undefined||
   record.status!==undefined||
   record.dueDate!==undefined||
   record.description!==undefined||
   record.notes!==undefined;
 };

 const getRecordId=record=>{
  return normalizeId(record?._id)||normalizeId(record?.id);
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

 const getTagRecord=value=>{
  if(!value)return null;

  if(typeof value==="object"){
   return value;
  }

  const tagId=normalizeId(value);

  return tags.find(item=>normalizeId(item._id)===tagId||normalizeId(item.id)===tagId)||null;
 };

 const getTagRecords=record=>{
  if(!Array.isArray(record?.tags)||record.tags.length===0)return [];

  return record.tags
   .map(item=>getTagRecord(item))
   .filter(Boolean);
 };

 const getTagName=tag=>{
  return tag?.name||tag?.title||tag?.label||"";
 };

 const getTagBadgeStyle=tag=>{
  const color=tag?.color||"";

  if(!color)return {};

  return {
   backgroundColor:color,
   borderColor:color,
   color:"var(--textInverse)"
  };
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

 const getStatusClass=status=>{
  if(status==="completed")return "lifeboard-badge-success";
  if(status==="in-progress")return "lifeboard-badge-info";
  if(status==="cancelled")return "lifeboard-badge-danger";
  if(status==="archived")return "lifeboard-badge-secondary";
  return "lifeboard-badge-warning";
 };

 const getPriorityClass=priority=>{
  if(priority==="urgent")return "lifeboard-badge-danger";
  if(priority==="high")return "lifeboard-badge-danger";
  if(priority==="medium")return "lifeboard-badge-warning";
  if(priority==="low")return "lifeboard-badge-secondary";
  return "lifeboard-badge-secondary";
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

   const res=await fetch("/api/tasks",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to load tasks");

   setRecords(normalizeRecords(data).filter(isTaskRecord));
  }catch(err){
   setError(err.message||"Failed to load tasks");
  }finally{
   setLoading(false);
  }
 };

 const loadReferences=async()=>{
  try{
   const headers=getHeaders();

   const [lifeAreaRes,categoryRes,tagRes]=await Promise.all([
    fetch("/api/life-areas",{headers}),
    fetch("/api/categories?categoryType=task",{headers}),
    fetch("/api/tags",{headers}).catch(()=>null)
   ]);

   const lifeAreaData=lifeAreaRes?await lifeAreaRes.json().catch(()=>({})):{};
   const categoryData=categoryRes?await categoryRes.json().catch(()=>({})):{};
   const tagData=tagRes?await tagRes.json().catch(()=>({})):{};

   setLifeAreas(normalizeRecords(lifeAreaData));
   setCategories(normalizeRecords(categoryData));
   setTags(normalizeRecords(tagData));
  }catch(err){
   console.error("Failed to load task references",err);
  }
 };

 useEffect(()=>{
  loadRecords();
  loadReferences();
 },[]);

 const filteredRecords=useMemo(()=>{
  return records.filter(record=>{
   const tagText=getTagRecords(record).map(tag=>getTagName(tag)).join(" ");

   const text=[
    record.title,
    record.description,
    record.notes,
    record.taskType,
    record.priority,
    record.status,
    getRefName(record.lifeArea),
    getRefName(record.category),
    tagText
   ].join(" ").toLowerCase();

   const matchesSearch=!search||text.includes(search.toLowerCase());
   const matchesType=taskTypeFilter==="all"||record.taskType===taskTypeFilter;
   const matchesStatus=statusFilter==="all"||record.status===statusFilter;

   return matchesSearch&&matchesType&&matchesStatus;
  });
 },[records,search,taskTypeFilter,statusFilter,lifeAreas,categories,tags]);

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

 const handleTaskSaved=async()=>{
  await loadRecords();
  await loadReferences();
  closeFormModal();
  setAutoNotice(editingRecord?"Task updated successfully.":"Task created successfully.");
 };

 const handleReferencesChanged=async(nextReferences={})=>{
  if(nextReferences.lifeArea){
   setLifeAreas(prev=>[...prev,nextReferences.lifeArea]);
  }

  if(nextReferences.category){
   setCategories(prev=>[...prev,nextReferences.category]);
  }

  if(nextReferences.tag){
   setTags(prev=>[...prev,nextReferences.tag]);
  }
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

 const handleQuickStatus=async(record,status)=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(record);

   if(!recordId)throw new Error("Task ID is missing");

   const res=await fetch(`/api/tasks/${recordId}`,{
    method:"PUT",
    headers:getHeaders(),
    body:JSON.stringify({status})
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to update task");

   await loadRecords();
   setAutoNotice(status==="completed"?"Task marked completed.":"Task status updated.");
  }catch(err){
   setError(err.message||"Failed to update task");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(deleteRecord);

   if(!recordId)throw new Error("Task ID is missing");

   const res=await fetch(`/api/tasks/${recordId}`,{
    method:"DELETE",
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete task");

   await loadRecords();
   closeDeleteModal();
   setAutoNotice("Task deleted successfully.");
  }catch(err){
   setError(err.message||"Failed to delete task");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Chorna Lifeboard</p>
     <h1 className="lifeboard-page-title">Tasks</h1>
     <p className="lifeboard-page-text">View, create, edit, complete, and organize daily, weekly, monthly, and yearly tasks.</p>
    </div>

    <button type="button" className="lifeboard-page-action" onClick={openCreateModal}>
     Add Task
    </button>
   </header>

   {notice&&<div className="lifeboard-page-notice">{notice}</div>}
   {error&&<div className="lifeboard-page-error">{error}</div>}

   <section className="lifeboard-page-toolbar">
    <input
     className="lifeboard-page-search"
     type="text"
     value={search}
     onChange={(e)=>setSearch(e.target.value)}
     placeholder="Search records..."
    />

    <label className="lifeboard-page-filter">
     <span>Task Type</span>
     <select value={taskTypeFilter} onChange={(e)=>setTaskTypeFilter(e.target.value)}>
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
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
      <option value="archived">Archived</option>
     </select>
    </label>
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading tasks...</div>
    ):filteredRecords.length?(
     <div className="lifeboard-table-wrap">
      <Table responsive className="lifeboard-table">
       <thead>
        <tr>
         <th>Title</th>
         <th>Type</th>
         <th>Priority</th>
         <th>Status</th>
         <th>Due Date</th>
         <th>Life Area</th>
         <th>Category</th>
         <th>Tags</th>
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {filteredRecords.map(record=>{
         const tagRecords=getTagRecords(record);

         return(
          <tr key={getRecordId(record)}>
           <td>{record.title}</td>
           <td>{record.taskType||"-"}</td>
           <td>
            <span className={`lifeboard-badge ${getPriorityClass(record.priority)}`}>
             {record.priority||"medium"}
            </span>
           </td>
           <td>
            <span className={`lifeboard-badge ${getStatusClass(record.status)}`}>
             {record.status||"pending"}
            </span>
           </td>
           <td>{formatDateDisplay(record.dueDate)}</td>
           <td>{getRefName(record.lifeArea)}</td>
           <td>{getRefName(record.category)}</td>
           <td>
            {tagRecords.length?(
             <div className="lifeboard-tag-list">
              {tagRecords.map(tag=>(
               <span
                key={`${getRecordId(record)}-${normalizeId(tag._id)||normalizeId(tag.id)||getTagName(tag)}`}
                className="lifeboard-badge lifeboard-tag-badge"
                style={getTagBadgeStyle(tag)}
               >
                {getTagName(tag)}
               </span>
              ))}
             </div>
            ):(
             "-"
            )}
           </td>
           <td>
            <div className="lifeboard-table-actions">
             {record.status!=="completed"&&(
              <button type="button" className="lifeboard-action-button lifeboard-action-success" onClick={()=>handleQuickStatus(record,"completed")} disabled={saving}>
               Complete
              </button>
             )}

             <button type="button" className="lifeboard-action-button lifeboard-action-primary" onClick={()=>openEditModal(record)}>
              Edit
             </button>

             <button type="button" className="lifeboard-action-button lifeboard-action-danger" onClick={()=>openDeleteModal(record)}>
              Delete
             </button>
            </div>
           </td>
          </tr>
         );
        })}
       </tbody>
      </Table>
     </div>
    ):(
     <div className="lifeboard-page-empty">No tasks found.</div>
    )}
   </section>

   <Modal show={showForm} onHide={closeFormModal} size="xl" centered dialogClassName="lifeboard-task-modal">
    <Modal.Header closeButton>
     <Modal.Title>{editingRecord?"Edit Task":"Add Task"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <TaskForm
      record={editingRecord}
      embedded={true}
      lifeAreas={lifeAreas}
      categories={categories}
      tags={tags}
      onCancel={closeFormModal}
      onSaved={handleTaskSaved}
      onReferencesChanged={handleReferencesChanged}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Task</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error&&<div className="lifeboard-page-error">{error}</div>}

     <p>
      Are you sure you want to delete <strong>{deleteRecord?.title||"this task"}</strong>?
     </p>

     <p className="lifeboard-muted-text">
      This action cannot be undone.
     </p>
    </Modal.Body>

    <Modal.Footer>
     <button type="button" className="lifeboard-action-button lifeboard-action-secondary" onClick={closeDeleteModal} disabled={saving}>
      Cancel
     </button>

     <button type="button" className="lifeboard-action-button lifeboard-action-danger" onClick={handleDelete} disabled={saving}>
      {saving?"Deleting...":"Delete Task"}
     </button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default TasksPage;