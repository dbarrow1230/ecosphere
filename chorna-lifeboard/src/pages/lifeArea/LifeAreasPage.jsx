// src/pages/lifeArea/LifeAreasPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Table} from "react-bootstrap";
import LifeAreaForm from "./LifeAreaForm.jsx";
import "../../styles/LifeboardPage.css";

function LifeAreasPage(){

 const [records,setRecords]=useState([]);
 const [search,setSearch]=useState("");
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
  if(Array.isArray(data?.lifeAreas))return data.lifeAreas;
  return [];
 };

 const isLifeAreaRecord=record=>{
  if(!record||typeof record!=="object")return false;
  if(!record.name||String(record.name).trim()===""||String(record.name).trim()==="-")return false;

  return true;
 };

 const getRecordId=record=>{
  return normalizeId(record?._id)||normalizeId(record?.id);
 };

 const getColorStyle=color=>{
  if(!color)return {};

  return {
   backgroundColor:color,
   borderColor:color,
   color:"var(--textInverse)"
  };
 };

 const cleanFileName=value=>{
  return String(value||"").split("/").filter(Boolean).pop()||"";
 };

 const isImageFile=value=>{
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(String(value||""));
 };

 const getIconSrc=icon=>{
  const fileName=cleanFileName(icon);

  if(!fileName||!isImageFile(fileName))return "";

  return `/icons/${fileName}`;
 };

 const renderIconDisplay=record=>{
  const icon=cleanFileName(record.icon);

  if(!icon)return "-";

  const iconSrc=getIconSrc(icon);

  if(iconSrc){
   return(
    <span className="lifeboard-icon-display">
     <span className="lifeboard-icon-thumb">
      <img src={iconSrc} alt={`${record.name} icon`}/>
     </span>
     <span className="lifeboard-icon-name">{icon}</span>
    </span>
   );
  }

  return(
   <span className="lifeboard-icon-display">
    <span className="lifeboard-icon-fallback">{icon.slice(0,1).toUpperCase()}</span>
    <span className="lifeboard-icon-name">{icon}</span>
   </span>
  );
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

   const res=await fetch("/api/life-areas",{
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to load life areas");

   setRecords(normalizeRecords(data).filter(isLifeAreaRecord));
  }catch(err){
   setError(err.message||"Failed to load life areas");
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
    record.name,
    record.description,
    record.color,
    record.icon,
    record.sortOrder,
    record.isActive===false?"inactive":"active"
   ].join(" ").toLowerCase();

   const matchesSearch=!search||text.includes(search.toLowerCase());
   const matchesStatus=statusFilter==="all"||
    (statusFilter==="active"&&record.isActive!==false)||
    (statusFilter==="inactive"&&record.isActive===false);

   return matchesSearch&&matchesStatus;
  });
 },[records,search,statusFilter]);

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

 const handleLifeAreaSaved=async()=>{
  await loadRecords();
  closeFormModal();
  setAutoNotice(editingRecord?"Life area updated successfully.":"Life area created successfully.");
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

 const handleToggleActive=async record=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(record);

   if(!recordId)throw new Error("Life area ID is missing");

   const res=await fetch(`/api/life-areas/${recordId}`,{
    method:"PUT",
    headers:getHeaders(),
    body:JSON.stringify({
     isActive:record.isActive===false
    })
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to update life area");

   await loadRecords();
   setAutoNotice(record.isActive===false?"Life area activated.":"Life area deactivated.");
  }catch(err){
   setError(err.message||"Failed to update life area");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  try{
   setSaving(true);
   setError("");

   const recordId=getRecordId(deleteRecord);

   if(!recordId)throw new Error("Life area ID is missing");

   const res=await fetch(`/api/life-areas/${recordId}`,{
    method:"DELETE",
    headers:getHeaders()
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to delete life area");

   await loadRecords();
   closeDeleteModal();
   setAutoNotice("Life area deleted successfully.");
  }catch(err){
   setError(err.message||"Failed to delete life area");
  }finally{
   setSaving(false);
  }
 };

 return(
  <section className="lifeboard-page">

   <header className="lifeboard-page-header">
    <div>
     <p className="lifeboard-page-eyebrow">Chorna Lifeboard</p>
     <h1 className="lifeboard-page-title">Life Areas</h1>
     <p className="lifeboard-page-text">Manage the major areas of life used to organize goals, habits, tasks, journal entries, notes, mindfulness, memories, and timeline records.</p>
    </div>

    <button type="button" className="lifeboard-page-action" onClick={openCreateModal}>
     Add Life Area
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
     placeholder="Search life areas..."
    />

    <label className="lifeboard-page-filter">
     <span>Status</span>
     <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
     </select>
    </label>
   </section>

   <section className="lifeboard-page-card">
    {loading?(
     <div className="lifeboard-page-empty">Loading life areas...</div>
    ):filteredRecords.length?(
     <div className="lifeboard-table-wrap">
      <Table responsive className="lifeboard-table">
       <thead>
        <tr>
         <th>Name</th>
         <th>Description</th>
         <th>Color</th>
         <th>Icon</th>
         <th>Sort</th>
         <th>Status</th>
         <th>Actions</th>
        </tr>
       </thead>

       <tbody>
        {filteredRecords.map(record=>(
         <tr key={getRecordId(record)}>
          <td>{record.name}</td>
          <td>{record.description||"-"}</td>
          <td>
           {record.color?(
            <span className="lifeboard-color-display">
             <span className="lifeboard-color-swatch" style={{backgroundColor:record.color}}></span>
             <span className="lifeboard-badge lifeboard-color-badge" style={getColorStyle(record.color)}>
              {record.color}
             </span>
            </span>
           ):(
            "-"
           )}
          </td>
          <td>{renderIconDisplay(record)}</td>
          <td>{record.sortOrder??0}</td>
          <td>
           <span className={`lifeboard-badge ${record.isActive===false?"lifeboard-badge-secondary":"lifeboard-badge-success"}`}>
            {record.isActive===false?"inactive":"active"}
           </span>
          </td>
          <td>
           <div className="lifeboard-table-actions">
            <button type="button" className={record.isActive===false?"lifeboard-action-button lifeboard-action-success":"lifeboard-action-button lifeboard-action-secondary"} onClick={()=>handleToggleActive(record)} disabled={saving}>
             {record.isActive===false?"Activate":"Deactivate"}
            </button>

            <button type="button" className="lifeboard-action-button lifeboard-action-primary" onClick={()=>openEditModal(record)}>
             Edit
            </button>

            <button type="button" className="lifeboard-action-button lifeboard-action-danger" onClick={()=>openDeleteModal(record)}>
             Delete
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </Table>
     </div>
    ):(
     <div className="lifeboard-page-empty">No life areas found.</div>
    )}
   </section>

   <Modal show={showForm} onHide={closeFormModal} size="lg" centered dialogClassName="lifeboard-task-modal">
    <Modal.Header closeButton>
     <Modal.Title>{editingRecord?"Edit Life Area":"Add Life Area"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <LifeAreaForm
      record={editingRecord}
      embedded={true}
      onCancel={closeFormModal}
      onSaved={handleLifeAreaSaved}
     />
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={closeDeleteModal} centered>
    <Modal.Header closeButton>
     <Modal.Title>Delete Life Area</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     {error&&<div className="lifeboard-page-error">{error}</div>}

     <p>
      Are you sure you want to delete <strong>{deleteRecord?.name||"this life area"}</strong>?
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
      {saving?"Deleting...":"Delete Life Area"}
     </button>
    </Modal.Footer>
   </Modal>

  </section>
 );
}

export default LifeAreasPage;