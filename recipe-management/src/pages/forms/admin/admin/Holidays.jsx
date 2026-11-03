import Alert from "../../../../components/AppAlert.jsx";
//src/pages/admin/Holidays.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Table,Form,Card} from "react-bootstrap";
import HolidayForm from "./HolidayForm.jsx";
import {sortItems} from "../../../../utils/sortItems.js";
import "../../../../styles/businesses.css";
import "../../../../styles/Footers.css";

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

 const loadBusinesses=async()=>{
  const res=await fetch("/api/businesses",{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load businesses.");
  const data=await res.json();
  const rows=getRows(data);
  setBusinesses(rows);
  setSelectedBusinessId(prev=>{
   if(prev&&rows.some(item=>getId(item)===prev))return prev;
   const preferred=rows.find(item=>String(item.code||"").toLowerCase()==="garjou")||
    rows.find(item=>String(item.legalName||item.name||"").toLowerCase()==="gardening journal")||
    sortItems(rows,item=>item.legalName||item.name||item.code||"")[0];
   return getId(preferred);
  });
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

 const holidaysByBusiness=useMemo(()=>{
  const grouped={};

  holidays.forEach(holiday=>{
   const businessId=getId(holiday.business_id)||"unassigned";
   if(!grouped[businessId])grouped[businessId]=[];
   grouped[businessId].push(holiday);
  });

  return grouped;
 },[holidays]);

 const sortedBusinesses=useMemo(()=>{
  return sortItems(businesses,business=>business.legalName||business.name||business.code||"");
 },[businesses]);

 const selectedBusiness=useMemo(()=>{
  return sortedBusinesses.find(business=>getId(business)===selectedBusinessId)||null;
 },[sortedBusinesses,selectedBusinessId]);

 const businessSeasons=useMemo(()=>{
  return sortItems(seasons.filter(season=>{
   const seasonBusinessId=getId(season.business_id);
   return !selectedBusinessId||!seasonBusinessId||seasonBusinessId===selectedBusinessId;
  }),season=>season.name||season.title||season.code||"");
 },[seasons,selectedBusinessId]);

 const visibleHolidays=useMemo(()=>{
  return sortItems((holidaysByBusiness[selectedBusinessId]||[]).filter(holiday=>{
   return selectedSeasonId==="all"||getId(holiday.seasonRef)===selectedSeasonId;
  }),holiday=>holiday.startDate||holiday.name||holiday.code||"");
 },[holidaysByBusiness,selectedBusinessId,selectedSeasonId]);

 const handleBusinessChange=e=>{
  setSelectedBusinessId(e.target.value);
  setSelectedSeasonId("all");
  setSelectedId("");
 };

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
      <div className="businesses-subtitle">Manage holidays for the selected business and season.</div>
     </div>
     <div className="d-flex align-items-center gap-2">
      <Button type="button" onClick={()=>openAddModal()} disabled={!selectedBusinessId}>Add Holiday</Button>
      <Button type="button" variant="outline-primary" onClick={()=>openEditModal()} disabled={!selectedHoliday}>Edit Holiday</Button>
      <Button type="button" variant="outline-danger" onClick={()=>openDeleteModal()} disabled={!selectedHoliday}>Delete Holiday</Button>
      <div className="businesses-total">Showing: <strong>{visibleHolidays.length}</strong></div>
     </div>
    </div>

    {error?<Alert variant="danger" className="mb-3" onClose={()=>setError("")}>{error}</Alert>:null}
    {successMessage?<Alert variant="success" className="mb-3">{successMessage}</Alert>:null}

    {loading?(
     <div className="businesses-empty">Loading holidays...</div>
    ):(
     <div className="holidays-layout">
      <Card className="holidays-filter-card">
       <Card.Body>
        <div className="holidays-filter-grid">
         <Form.Group>
          <Form.Label>Business</Form.Label>
          <Form.Select value={selectedBusinessId} onChange={handleBusinessChange}>
           {sortedBusinesses.map(business=>(
            <option key={getId(business)} value={getId(business)}>
             {business.legalName||business.name||business.code||"Business"}
            </option>
           ))}
          </Form.Select>
         </Form.Group>

         <Form.Group>
          <Form.Label>Season</Form.Label>
          <Form.Select value={selectedSeasonId} onChange={e=>{setSelectedSeasonId(e.target.value);setSelectedId("");}}>
           <option value="all">All Seasons</option>
           {businessSeasons.map(season=>(
            <option key={getId(season)} value={getId(season)}>
             {season.name||season.title||season.code||"Season"}
            </option>
           ))}
          </Form.Select>
         </Form.Group>

         <div className="holidays-selected-summary">
          <strong>{selectedBusiness?.legalName||selectedBusiness?.name||"No business selected"}</strong>
          <span>{formatValue(selectedBusiness?.code)} • {visibleHolidays.length} holidays</span>
         </div>
        </div>
       </Card.Body>
      </Card>

      <div className="footers-table-wrap">
       <Table responsive className="footers-table holidays-table">
        <thead>
         <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Season</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Recurring</th>
          <th>Active</th>
          <th>Notes</th>
          <th>Actions</th>
         </tr>
        </thead>
        <tbody>
         {visibleHolidays.length>0?visibleHolidays.map(holiday=>(
          <tr key={holiday._id} className={getId(holiday)===selectedId?"is-selected":""} onClick={()=>setSelectedId(getId(holiday))}>
           <td>{holiday.name||"-"}</td>
           <td>{holiday.code||"-"}</td>
           <td>{formatValue(holiday.seasonRef)}</td>
           <td>{formatDate(holiday.startDate)}</td>
           <td>{formatDate(holiday.endDate)}</td>
           <td>{holiday.isRecurringAnnual?"Yes":"No"}</td>
           <td>{holiday.isActive?"Yes":"No"}</td>
           <td>{holiday.notes||"-"}</td>
           <td>
            <div className="footers-actions">
             <Button size="sm" className="footers-action-btn" onClick={e=>{e.stopPropagation();openEditModal(holiday);}}>Edit</Button>
             <Button size="sm" variant="danger" className="footers-delete-btn" onClick={e=>{e.stopPropagation();openDeleteModal(holiday);}}>Delete</Button>
            </div>
           </td>
          </tr>
         )):(
          <tr>
           <td colSpan="9" className="footers-empty-cell">No holidays for this business and season.</td>
          </tr>
         )}
        </tbody>
       </Table>
      </div>
     </div>
    )}

    {!loading&&businesses.length===0&&(
     <div className="businesses-empty">No businesses found.</div>
    )}

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
