import Alert from "../../../../components/AppAlert.jsx";
//src/pages/admin/Seasons.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Table,Accordion} from "react-bootstrap";
import SeasonForm from "./SeasonForm.jsx";
import {sortItems} from "../../../../utils/sortItems.js";
import "../../../../styles/businesses.css";
import "../../../../styles/Footers.css";

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

 const seasonsByBusiness=useMemo(()=>{
  const grouped={};

  seasons.forEach(season=>{
   const businessId=getId(season.business_id)||"unassigned";
   if(!grouped[businessId])grouped[businessId]=[];
   grouped[businessId].push(season);
  });

  return grouped;
 },[seasons]);

 const sortedBusinesses=useMemo(()=>{
  return sortItems(businesses,business=>business.legalName||business.name||business.code||"");
 },[businesses]);

 const openAddModal=(businessId="")=>{
  setModalMode("add");
  setSelectedId("");
  setFormInitialData({
   ...defaultFormData,
   business_id:businessId
  });
  setShowFormModal(true);
 };

 const openEditModal=(season=selectedSeason)=>{
  if(!season)return;
  setModalMode("edit");
  setSelectedId(getId(season));
  setFormInitialData({
   ...defaultFormData,
   ...season,
   business_id:getId(season?.business_id)
  });
  setShowFormModal(true);
 };

 const closeFormModal=()=>{
  if(saving)return;
  setShowFormModal(false);
 };

 const openDeleteModal=(season=selectedSeason)=>{
  if(!season)return;
  setSelectedId(getId(season));
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
      <Button type="button" variant="outline-primary" onClick={()=>openEditModal()} disabled={!selectedSeason}>Edit Season</Button>
      <Button type="button" variant="outline-danger" onClick={()=>openDeleteModal()} disabled={!selectedSeason}>Delete Season</Button>
      <div className="businesses-total">Total: <strong>{seasons.length}</strong></div>
     </div>
    </div>

    {error?<Alert variant="danger" className="mb-3" onClose={()=>setError("")}>{error}</Alert>:null}
    {successMessage?<Alert variant="success" className="mb-3">{successMessage}</Alert>:null}

    {loading?(
     <div className="businesses-empty">Loading seasons...</div>
    ):(
     <Accordion alwaysOpen className="footers-accordion">
      {sortedBusinesses.map((business,index)=>{
       const businessId=getId(business);
       const businessSeasons=sortItems(seasonsByBusiness[businessId]||[],season=>season.name||season.code||"");

       return(
        <Accordion.Item eventKey={String(index)} key={businessId} className="footers-accordion-item">
         <Accordion.Header>
          <div className="footers-business-heading">
           <div className="footers-business-title">{business.legalName||business.name||"Business"}</div>
           <div className="footers-business-code">{formatValue(business.code)}</div>
          </div>
         </Accordion.Header>

         <Accordion.Body>
          <div className="footers-business-toolbar">
           <Button className="footers-action-btn" onClick={()=>openAddModal(businessId)}>Add Season</Button>
          </div>

          <div className="footers-table-wrap">
           <Table responsive className="footers-table">
            <thead>
             <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Recurring Annual</th>
              <th>Default</th>
              <th>Active</th>
              <th>Notes</th>
              <th>Actions</th>
             </tr>
            </thead>
            <tbody>
             {businessSeasons.length>0?businessSeasons.map(season=>(
              <tr key={season._id}>
               <td>{season.name||"-"}</td>
               <td>{season.code||"-"}</td>
               <td>{formatDate(season.startDate)}</td>
               <td>{formatDate(season.endDate)}</td>
               <td>{season.isRecurringAnnual?"Yes":"No"}</td>
               <td>{season.isDefault?"Yes":"No"}</td>
               <td>{season.isActive?"Yes":"No"}</td>
               <td>{season.notes||"-"}</td>
               <td>
                <div className="footers-actions">
                 <Button size="sm" className="footers-action-btn" onClick={()=>openEditModal(season)}>Edit</Button>
                 <Button size="sm" variant="danger" className="footers-delete-btn" onClick={()=>openDeleteModal(season)}>Delete</Button>
                </div>
               </td>
              </tr>
             )):(
              <tr>
               <td colSpan="9" className="footers-empty-cell">No seasons for this business.</td>
              </tr>
             )}
            </tbody>
           </Table>
          </div>
         </Accordion.Body>
        </Accordion.Item>
       );
      })}
     </Accordion>
    )}

    {!loading&&businesses.length===0&&(
     <div className="businesses-empty">No businesses found.</div>
    )}

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
