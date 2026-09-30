import Alert from "../../components/AppAlert.jsx";
//src/pages/admin/Seasons.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Table,Card,Row,Col,Badge,ButtonGroup} from "react-bootstrap";
import SeasonForm from "../forms/admin/SeasonForm.jsx";
import {sortItems} from "../../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/businesses.css";
import "../../styles/Footers.css";

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

export default function Seasons(){
 const [seasons,setSeasons]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
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
  setCurrentBusinessId(businessId);
  setBusinesses([business]);
  return businessId;
 };

 const loadSeasons=async(businessId=currentBusinessId)=>{
  const query=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";
  const res=await fetch(`/api/seasons${query}`,{headers:{"Content-Type":"application/json"}});
  if(!res.ok)throw new Error("Failed to load seasons.");
  const data=await res.json();
  const rows=getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId);
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
   const businessId=await loadBusiness();
   await loadSeasons(businessId);
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

 const openAddModal=(businessId="")=>{
  setModalMode("add");
  setSelectedId("");
  setFormInitialData({
   ...defaultFormData,
   business_id:businessId||currentBusinessId
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

   await loadSeasons(currentBusinessId);

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

   await loadSeasons(currentBusinessId);

   setShowDeleteModal(false);
   if(String(selectedId)===String(deletedId))setSelectedId("");
   showTimedSuccess("Season deleted successfully.");
  }catch(err){
   setError(err.message||"Unable to delete season.");
  }finally{
   setDeleting(false);
  }
 };

 const businessLabel=businesses[0]?.legalName||businesses[0]?.name||"current business";
 const visibleSeasons=sortItems(seasons,season=>season.name||season.code||"");

 return(
  <div className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={8}>
         <h3 className="mb-1">Seasons</h3>
         <div className="text-muted">Manage seasonal records for {businessLabel}.</div>
        </Col>

        <Col md={4} className="d-flex justify-content-md-end gap-2">
         <Button type="button" onClick={()=>openAddModal(currentBusinessId)}>Add Season</Button>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {error?(
     <Col xs={12}><Alert variant="danger" className="mb-0" onClose={()=>setError("")}>{error}</Alert></Col>
    ):null}

    {successMessage?(
     <Col xs={12}><Alert variant="success" className="mb-0">{successMessage}</Alert></Col>
    ):null}

    <Col xs={12}>
     <Card className="shadow-sm">
      <Card.Header>Seasons</Card.Header>
      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Recurring</th>
          <th>Default</th>
          <th>Status</th>
          <th>Notes</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>
        <tbody>
         {loading?(
          <tr><td colSpan="9" className="text-center py-4 text-muted">Loading seasons...</td></tr>
         ):null}

         {!loading&&visibleSeasons.length===0?(
          <tr><td colSpan="9" className="text-center py-4 text-muted">No seasons found.</td></tr>
         ):null}

         {visibleSeasons.map(season=>(
          <tr key={season._id}>
           <td>{season.name||"-"}</td>
           <td>{season.code||"-"}</td>
           <td>{formatDate(season.startDate)}</td>
           <td>{formatDate(season.endDate)}</td>
           <td>{season.isRecurringAnnual?"Yes":"No"}</td>
           <td><Badge bg={season.isDefault?"primary":"secondary"}>{season.isDefault?"Default":"Custom"}</Badge></td>
           <td><Badge bg={season.isActive?"success":"secondary"}>{season.isActive?"Active":"Inactive"}</Badge></td>
           <td>{season.notes||"-"}</td>
           <td className="text-end">
            <ButtonGroup size="sm">
             <Button type="button" variant="outline-primary" onClick={()=>openEditModal(season)}>Edit</Button>
             <Button type="button" variant="outline-danger" onClick={()=>openDeleteModal(season)}>Delete</Button>
            </ButtonGroup>
           </td>
          </tr>
         ))}
        </tbody>
       </Table>
      </Card.Body>
     </Card>
    </Col>
   </Row>

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
 );
}
