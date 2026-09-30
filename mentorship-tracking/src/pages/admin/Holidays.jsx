//src/pages/admin/Holidays.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert} from "react-bootstrap";
import HolidayForm from "../forms/admin/HolidayForm.jsx";
import "../../styles/businesses.css";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 name:"",
 code:"",
 startDate:"",
 endDate:"",
 isRecurringAnnual:false,
 isActive:true,
 notes:""
};

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.holidays))return data.holidays;
 if(Array.isArray(data?.businesses))return data.businesses;
 if(Array.isArray(data?.seasons))return data.seasons;
 return [];
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||"");
 return "";
};

const formatValue=value=>{
 if(value===null||value===undefined||value==="")return "-";
 if(typeof value==="object")return value?.name||value?.legalName||value?.code||value?._id||"-";
 return String(value);
};

const formatDate=value=>{
 if(!value)return "-";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "-";
 return date.toLocaleString();
};

export default function Holidays(){
 const [holidays,setHolidays]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [seasons,setSeasons]=useState([]);
 const [selectedId,setSelectedId]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [successMessage,setSuccessMessage]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [modalMode,setModalMode]=useState("add");
 const [formInitialData,setFormInitialData]=useState(defaultFormData);
 const successTimerRef=useRef(null);

 const clearSuccessTimer=()=>{
  if(successTimerRef.current){
   clearTimeout(successTimerRef.current);
   successTimerRef.current=null;
  }
 };

 const showTimedSuccess=message=>{
  clearSuccessTimer();
  setSuccessMessage(message);
  successTimerRef.current=setTimeout(()=>{
   setSuccessMessage("");
   successTimerRef.current=null;
  },2500);
 };

 const loadBusinesses=async()=>{
  const res=await fetch("/api/businesses",{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load businesses.");
  const data=await res.json();
  setBusinesses(getRows(data));
 };

 const loadSeasons=async()=>{
  const res=await fetch("/api/seasons",{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load seasons.");
  const data=await res.json();
  setSeasons(getRows(data));
 };

 const loadHolidays=async()=>{
  const res=await fetch("/api/holidays",{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load holidays.");
  const data=await res.json();
  const rows=getRows(data);
  setHolidays(rows);
  if(rows.length>0){
   const hasSelected=rows.some(item=>String(item?._id||item?.id||"")===String(selectedId));
   if(!hasSelected)setSelectedId(String(rows[0]?._id||rows[0]?.id||""));
  }else{
   setSelectedId("");
  }
 };

 const loadPageData=async()=>{
  try{
   setLoading(true);
   setError("");
   await Promise.all([loadBusinesses(),loadSeasons(),loadHolidays()]);
  }catch(err){
   setError(err.message||"Unable to load holidays.");
   setHolidays([]);
   setBusinesses([]);
   setSeasons([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadPageData();
  return()=>clearSuccessTimer();
 },[]);

 const selectedHoliday=useMemo(()=>{
  return holidays.find(item=>String(item?._id||item?.id||"")===String(selectedId))||null;
 },[holidays,selectedId]);

 const openAddModal=()=>{
  setModalMode("add");
  setFormInitialData(defaultFormData);
  setShowFormModal(true);
 };

 const openEditModal=()=>{
  if(!selectedHoliday)return;
  setModalMode("edit");
  setFormInitialData({
   ...defaultFormData,
   ...selectedHoliday,
   business_id:getId(selectedHoliday?.business_id),
   seasonRef:getId(selectedHoliday?.seasonRef)
  });
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
 };

 const openDeleteModal=()=>{
  if(!selectedHoliday)return;
  setShowDeleteModal(true);
 };

 const closeDeleteModal=()=>{
  if(deleting)return;
  setShowDeleteModal(false);
 };

 const handleSave=async(payload)=>{
  try{
   setSaving(true);
   setError("");
   const isEdit=modalMode==="edit"&&selectedHoliday?._id;
   const url=isEdit?`/api/holidays/${selectedHoliday._id}`:"/api/holidays";
   const method=isEdit?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||`Failed to ${isEdit?"update":"create"} holiday.`);
   }

   const saved=await res.json().catch(()=>null);
   const savedId=String(saved?._id||saved?.data?._id||selectedHoliday?._id||"");

   await loadHolidays();

   if(savedId)setSelectedId(savedId);
   setShowFormModal(false);
   showTimedSuccess(isEdit?"Holiday updated successfully.":"Holiday created successfully.");
  }catch(err){
   setError(err.message||"Unable to save holiday.");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  if(!selectedHoliday?._id)return;
  try{
   setDeleting(true);
   setError("");
   const res=await fetch(`/api/holidays/${selectedHoliday._id}`,{
    method:"DELETE",
    headers:{"Content-Type":"application/json"}
   });

   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||"Failed to delete holiday.");
   }

   const deletedId=selectedHoliday._id;

   await loadHolidays();

   setShowDeleteModal(false);
   if(String(selectedId)===String(deletedId))setSelectedId("");
   showTimedSuccess("Holiday deleted successfully.");
  }catch(err){
   setError(err.message||"Unable to delete holiday.");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="businesses-page">
   <div className="businesses-wrap">
    <div className="businesses-topbar">
     <div>
      <h1 className="businesses-title">Holidays</h1>
      <div className="businesses-subtitle">Manage holidays by business and season.</div>
     </div>
     <div className="d-flex align-items-center gap-2">
      <Button type="button" onClick={openAddModal}>Add Holiday</Button>
      <Button type="button" variant="outline-primary" onClick={openEditModal} disabled={!selectedHoliday}>Edit Holiday</Button>
      <Button type="button" variant="outline-danger" onClick={openDeleteModal} disabled={!selectedHoliday}>Delete Holiday</Button>
      <div className="businesses-total">Total: <strong>{holidays.length}</strong></div>
     </div>
    </div>

    {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}
    {successMessage?<Alert variant="success" className="mb-3">{successMessage}</Alert>:null}

    <div className="businesses-grid">
     <section className="businesses-card">
      <div className="businesses-card-header">Holidays</div>
      <div className="businesses-list">
       {loading?(
        <div className="businesses-empty">Loading holidays...</div>
       ):holidays.length===0?(
        <div className="businesses-empty">No holidays found.</div>
       ):(
        holidays.map(holiday=>{
         const id=String(holiday?._id||holiday?.id||"");
         const active=String(selectedId)===id;
         return(
          <button
           key={id}
           type="button"
           onClick={()=>setSelectedId(id)}
           className={`businesses-list-item${active?" active":""}`}
          >
           <div className="businesses-list-name">{formatValue(holiday.name)}</div>
           <div className="businesses-list-meta">
            <span>{formatValue(holiday.code)}</span>
            <span className={`businesses-status${holiday.isActive?" is-active":" is-inactive"}`}>{holiday.isActive?"Active":"Inactive"}</span>
           </div>
          </button>
         );
        })
       )}
      </div>
     </section>

     <section className="businesses-card">
      <div className="businesses-card-header">Details</div>
      {!selectedHoliday?(
       <div className="businesses-empty">Select a holiday to view details.</div>
      ):(
       <div className="businesses-details">
        <div className="businesses-inline-list">
         <div className="businesses-inline-row"><span className="businesses-inline-label">Business:</span><span className="businesses-inline-value">{formatValue(selectedHoliday.business_id)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Season:</span><span className="businesses-inline-value">{formatValue(selectedHoliday.seasonRef)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Name:</span><span className="businesses-inline-value">{formatValue(selectedHoliday.name)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Code:</span><span className="businesses-inline-value">{formatValue(selectedHoliday.code)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Start Date:</span><span className="businesses-inline-value">{formatDate(selectedHoliday.startDate)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">End Date:</span><span className="businesses-inline-value">{formatDate(selectedHoliday.endDate)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Recurring Annual:</span><span className="businesses-inline-value">{selectedHoliday.isRecurringAnnual?"Yes":"No"}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Active:</span><span className="businesses-inline-value">{selectedHoliday.isActive?"Yes":"No"}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Notes:</span><span className="businesses-inline-value businesses-preline">{formatValue(selectedHoliday.notes)}</span></div>
        </div>
       </div>
      )}
     </section>
    </div>

    <Modal show={showFormModal} onHide={closeFormModal} size="xl" centered backdrop="static">
     <Modal.Header closeButton>
      <Modal.Title>{modalMode==="edit"?"Edit Holiday":"Add Holiday"}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <HolidayForm
       initialData={formInitialData}
       onSubmit={handleSave}
       loading={saving}
       businesses={businesses}
       seasons={seasons}
      />
     </Modal.Body>
    </Modal>

    <Modal show={showDeleteModal} onHide={closeDeleteModal} centered backdrop="static">
     <Modal.Header closeButton>
      <Modal.Title>Delete Holiday</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      Are you sure you want to delete <strong>{formatValue(selectedHoliday?.name)}</strong>?
     </Modal.Body>
     <Modal.Footer>
      <Button variant="secondary" onClick={closeDeleteModal} disabled={deleting}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete} disabled={deleting}>
       {deleting?"Deleting...":"Delete"}
      </Button>
     </Modal.Footer>
    </Modal>
   </div>
  </div>
 );
}
