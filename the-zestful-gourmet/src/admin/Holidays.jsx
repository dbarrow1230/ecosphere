//src/pages/admin/Holidays.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert,Form,Badge,ButtonGroup} from "react-bootstrap";
import HolidayForm from "../forms/admin/HolidayForm.jsx";
import AdminCatalogWorkspace from "../components/AdminCatalogWorkspace.jsx";
import {sortItems} from "../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../utils/currentBusiness.js";

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
 return getObjectId(value);
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
 const [selectedBusinessId,setSelectedBusinessId]=useState("");
 const [selectedSeasonId,setSelectedSeasonId]=useState("all");
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

 const loadBusiness=async()=>{
  const business=await loadCurrentBusiness();
  const businessId=getId(business);
  setBusinesses([business]);
  setSelectedBusinessId(businessId);
  return businessId;
 };

 const loadSeasons=async(businessId=selectedBusinessId)=>{
  const query=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";
  const res=await fetch(`/api/seasons${query}`,{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load seasons.");
  const data=await res.json();
  setSeasons(getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId));
 };

 const loadHolidays=async(businessId=selectedBusinessId)=>{
  const query=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";
  const res=await fetch(`/api/holidays${query}`,{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load holidays.");
  const data=await res.json();
  const rows=getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId);
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
   const businessId=await loadBusiness();
   await Promise.all([loadSeasons(businessId),loadHolidays(businessId)]);
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
  queueMicrotask(loadPageData);
  return()=>clearSuccessTimer();
 },[]);

 const selectedHoliday=useMemo(()=>{
  return holidays.find(item=>String(item?._id||item?.id||"")===String(selectedId))||null;
 },[holidays,selectedId]);

 const businessSeasons=useMemo(()=>{
  return sortItems(seasons.filter(season=>{
   const seasonBusinessId=getId(season.business_id);
   return !selectedBusinessId||!seasonBusinessId||seasonBusinessId===selectedBusinessId;
  }),season=>season.name||season.title||season.code||"");
 },[seasons,selectedBusinessId]);

 const visibleHolidays=useMemo(()=>{
  return sortItems(holidays.filter(holiday=>{
   return selectedSeasonId==="all"||getId(holiday.seasonRef)===selectedSeasonId;
  }),holiday=>holiday.startDate||holiday.name||holiday.code||"");
 },[holidays,selectedSeasonId]);

 const openAddModal=(businessId="")=>{
  setModalMode("add");
  setSelectedId("");
  setFormInitialData({
   ...defaultFormData,
   business_id:businessId||selectedBusinessId,
   seasonRef:selectedSeasonId==="all"?"":selectedSeasonId
  });
  setShowFormModal(true);
 };

 const openEditModal=(holiday=selectedHoliday)=>{
  if(!holiday)return;
  setModalMode("edit");
  setSelectedId(getId(holiday));
  setFormInitialData({
   ...defaultFormData,
   ...holiday,
   business_id:getId(holiday?.business_id),
   seasonRef:getId(holiday?.seasonRef)
  });
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
 };

 const openDeleteModal=(holiday=selectedHoliday)=>{
  if(!holiday)return;
  setSelectedId(getId(holiday));
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

   await loadHolidays(selectedBusinessId);

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

   await loadHolidays(selectedBusinessId);

   setShowDeleteModal(false);
   if(String(selectedId)===String(deletedId))setSelectedId("");
   showTimedSuccess("Holiday deleted successfully.");
  }catch(err){
   setError(err.message||"Unable to delete holiday.");
  }finally{
   setDeleting(false);
  }
 };

 const businessLabel=businesses[0]?.legalName||businesses[0]?.name||"current business";

 return(
  <div className="py-4">
   {error?<Alert variant="danger">{error}</Alert>:null}{successMessage?<Alert variant="success">{successMessage}</Alert>:null}
   <div className="admin-catalog-context-filter"><Form.Select aria-label="Filter holidays by season" value={selectedSeasonId} onChange={e=>{setSelectedSeasonId(e.target.value);setSelectedId("");}}><option value="all">All seasons</option>{businessSeasons.map(season=><option key={getId(season)} value={getId(season)}>{season.name||season.title||season.code||"Season"}</option>)}</Form.Select></div>
   <AdminCatalogWorkspace title="Holidays" description={`Manage holidays for ${businessLabel}.`} records={visibleHolidays} selectedId={selectedId}
    onSelect={setSelectedId} onAdd={()=>openAddModal()} addLabel="Add Holiday" loading={loading} emptyMessage="No holidays found."
    searchPlaceholder="Search holidays..." getId={getId} getName={holiday=>holiday.name||"Unnamed holiday"} getCode={holiday=>holiday.code||"NO CODE"}
    getDescription={holiday=>holiday.notes||`${formatDate(holiday.startDate)} - ${formatDate(holiday.endDate)}`} isActive={holiday=>holiday.isActive}
    actions={selectedHoliday?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEditModal(selectedHoliday)}>Edit</Button><Button variant="outline-danger" onClick={()=>openDeleteModal(selectedHoliday)}>Delete</Button></ButtonGroup>:null}>
    {selectedHoliday?<><h2>{selectedHoliday.name}</h2><p className="text-muted">{selectedHoliday.notes||"No notes."}</p><div className="admin-catalog-detail-grid">
     <div><span>Code</span><strong>{selectedHoliday.code||"-"}</strong></div><div><span>Season</span><strong>{formatValue(selectedHoliday.seasonRef)}</strong></div>
     <div><span>Starts</span><strong>{formatDate(selectedHoliday.startDate)}</strong></div><div><span>Ends</span><strong>{formatDate(selectedHoliday.endDate)}</strong></div>
     <div><span>Recurring</span><strong>{selectedHoliday.isRecurringAnnual?"Yes":"No"}</strong></div><div><span>Status</span><Badge bg={selectedHoliday.isActive?"success":"secondary"}>{selectedHoliday.isActive?"Active":"Inactive"}</Badge></div>
    </div></>:null}
   </AdminCatalogWorkspace>

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
 );
}
