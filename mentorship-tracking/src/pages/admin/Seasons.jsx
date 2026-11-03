//src/pages/admin/Seasons.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert} from "react-bootstrap";
import SeasonForm from "../forms/admin/SeasonForm.jsx";
import "../../styles/businesses.css";

const defaultFormData={
 business_id:"",
 name:"",
 code:"",
 description:"",
 startDate:"",
 endDate:"",
 isRecurringAnnual:false,
 isDefault:false,
 isActive:true,
 notes:""
};

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.seasons))return data.seasons;
 if(Array.isArray(data?.businesses))return data.businesses;
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

export default function Seasons(){
 const [seasons,setSeasons]=useState([]);
 const [businesses,setBusinesses]=useState([]);
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
  const rows=getRows(data);
  setSeasons(rows);
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
   await Promise.all([loadBusinesses(),loadSeasons()]);
  }catch(err){
   setError(err.message||"Unable to load seasons.");
   setSeasons([]);
   setBusinesses([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadPageData();
  return()=>clearSuccessTimer();
 },[]);

 const selectedSeason=useMemo(()=>{
  return seasons.find(item=>String(item?._id||item?.id||"")===String(selectedId))||null;
 },[seasons,selectedId]);

 const openAddModal=()=>{
  setModalMode("add");
  setFormInitialData(defaultFormData);
  setShowFormModal(true);
 };

 const openEditModal=()=>{
  if(!selectedSeason)return;
  setModalMode("edit");
  setFormInitialData({
   ...defaultFormData,
   ...selectedSeason,
   business_id:getId(selectedSeason?.business_id)
  });
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
 };

 const openDeleteModal=()=>{
  if(!selectedSeason)return;
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
   const isEdit=modalMode==="edit"&&selectedSeason?._id;
   const url=isEdit?`/api/seasons/${selectedSeason._id}`:"/api/seasons";
   const method=isEdit?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||`Failed to ${isEdit?"update":"create"} season.`);
   }

   const saved=await res.json().catch(()=>null);
   const savedId=String(saved?._id||saved?.data?._id||selectedSeason?._id||"");

   await loadSeasons();

   if(savedId)setSelectedId(savedId);
   setShowFormModal(false);
   showTimedSuccess(isEdit?"Season updated successfully.":"Season created successfully.");
  }catch(err){
   setError(err.message||"Unable to save season.");
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async()=>{
  if(!selectedSeason?._id)return;
  try{
   setDeleting(true);
   setError("");
   const res=await fetch(`/api/seasons/${selectedSeason._id}`,{
    method:"DELETE",
    headers:{"Content-Type":"application/json"}
   });

   if(!res.ok){
    const errData=await res.json().catch(()=>null);
    throw new Error(errData?.message||"Failed to delete season.");
   }

   const deletedId=selectedSeason._id;

   await loadSeasons();

   setShowDeleteModal(false);
   if(String(selectedId)===String(deletedId))setSelectedId("");
   showTimedSuccess("Season deleted successfully.");
  }catch(err){
   setError(err.message||"Unable to delete season.");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="businesses-page">
   <div className="businesses-wrap">
    <div className="businesses-topbar">
     <div>
      <h1 className="businesses-title">Seasons</h1>
      <div className="businesses-subtitle">Manage seasonal records and assign them to a business for scheduling, taglines, holidays, and occasions.</div>
     </div>
     <div className="d-flex align-items-center gap-2">
      <Button type="button" onClick={openAddModal}>Add Season</Button>
      <Button type="button" variant="outline-primary" onClick={openEditModal} disabled={!selectedSeason}>Edit Season</Button>
      <Button type="button" variant="outline-danger" onClick={openDeleteModal} disabled={!selectedSeason}>Delete Season</Button>
      <div className="businesses-total">Total: <strong>{seasons.length}</strong></div>
     </div>
    </div>

    {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}
    {successMessage?<Alert variant="success" className="mb-3">{successMessage}</Alert>:null}

    <div className="businesses-grid">
     <section className="businesses-card">
      <div className="businesses-card-header">Seasons</div>
      <div className="businesses-list">
       {loading?(
        <div className="businesses-empty">Loading seasons...</div>
       ):seasons.length===0?(
        <div className="businesses-empty">No seasons found.</div>
       ):(
        seasons.map(season=>{
         const id=String(season?._id||season?.id||"");
         const active=String(selectedId)===id;
         return(
          <button
           key={id}
           type="button"
           onClick={()=>setSelectedId(id)}
           className={`businesses-list-item${active?" active":""}`}
          >
           <div className="businesses-list-name">{formatValue(season.name)}</div>
           <div className="businesses-list-meta">
            <span>{formatValue(season.code)}</span>
            <span className={`businesses-status${season.isActive?" is-active":" is-inactive"}`}>{season.isActive?"Active":"Inactive"}</span>
           </div>
          </button>
         );
        })
       )}
      </div>
     </section>

     <section className="businesses-card">
      <div className="businesses-card-header">Details</div>
      {!selectedSeason?(
       <div className="businesses-empty">Select a season to view details.</div>
      ):(
       <div className="businesses-details">
        <div className="businesses-inline-list">
         <div className="businesses-inline-row"><span className="businesses-inline-label">Business:</span><span className="businesses-inline-value">{formatValue(selectedSeason.business_id)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Name:</span><span className="businesses-inline-value">{formatValue(selectedSeason.name)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Code:</span><span className="businesses-inline-value">{formatValue(selectedSeason.code)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Description:</span><span className="businesses-inline-value businesses-preline">{formatValue(selectedSeason.description)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Start Date:</span><span className="businesses-inline-value">{formatDate(selectedSeason.startDate)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">End Date:</span><span className="businesses-inline-value">{formatDate(selectedSeason.endDate)}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Recurring Annual:</span><span className="businesses-inline-value">{selectedSeason.isRecurringAnnual?"Yes":"No"}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Default:</span><span className="businesses-inline-value">{selectedSeason.isDefault?"Yes":"No"}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Active:</span><span className="businesses-inline-value">{selectedSeason.isActive?"Yes":"No"}</span></div>
         <div className="businesses-inline-row"><span className="businesses-inline-label">Notes:</span><span className="businesses-inline-value businesses-preline">{formatValue(selectedSeason.notes)}</span></div>
        </div>
       </div>
      )}
     </section>
    </div>

    <Modal show={showFormModal} onHide={closeFormModal} size="xl" centered backdrop="static">
     <Modal.Header closeButton>
      <Modal.Title>{modalMode==="edit"?"Edit Season":"Add Season"}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <SeasonForm
       initialData={formInitialData}
       onSubmit={handleSave}
       loading={saving}
       businesses={businesses}
      />
     </Modal.Body>
    </Modal>

    <Modal show={showDeleteModal} onHide={closeDeleteModal} centered backdrop="static">
     <Modal.Header closeButton>
      <Modal.Title>Delete Season</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      Are you sure you want to delete <strong>{formatValue(selectedSeason?.name)}</strong>?
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
