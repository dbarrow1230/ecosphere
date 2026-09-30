import Alert from "../../components/AppAlert.jsx";
//src/pages/admin/Holidays.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Table,Form,Card,Row,Col,Badge,ButtonGroup} from "react-bootstrap";
import HolidayForm from "../forms/admin/HolidayForm.jsx";
import {sortItems} from "../../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/businesses.css";
import "../../styles/Footers.css";

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
  loadPageData();
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
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={8}>
         <h3 className="mb-1">Holidays</h3>
         <div className="text-muted">Manage holidays for {businessLabel}.</div>
        </Col>
        <Col md={4} className="d-flex justify-content-md-end align-items-center gap-2">
         <Button type="button" onClick={()=>openAddModal()} disabled={!selectedBusinessId}>Add Holiday</Button>
         <Badge bg="primary">Total: {visibleHolidays.length}</Badge>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {error?<Col xs={12}><Alert variant="danger" className="mb-0" onClose={()=>setError("")}>{error}</Alert></Col>:null}
    {successMessage?<Col xs={12}><Alert variant="success" className="mb-0">{successMessage}</Alert></Col>:null}

    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3">
        <Col md={4}>
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
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    <Col xs={12}>
     <Card className="shadow-sm">
      <Card.Header>Holidays</Card.Header>
      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Season</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Recurring</th>
          <th>Status</th>
          <th>Notes</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>
        <tbody>
         {loading?(
          <tr><td colSpan="9" className="text-center py-4 text-muted">Loading holidays...</td></tr>
         ):null}

         {!loading&&visibleHolidays.length===0?(
          <tr><td colSpan="9" className="text-center py-4 text-muted">No holidays found.</td></tr>
         ):null}

         {visibleHolidays.map(holiday=>(
          <tr key={holiday._id} className={getId(holiday)===selectedId?"is-selected":""} onClick={()=>setSelectedId(getId(holiday))}>
           <td>{holiday.name||"-"}</td>
           <td>{holiday.code||"-"}</td>
           <td>{formatValue(holiday.seasonRef)}</td>
           <td>{formatDate(holiday.startDate)}</td>
           <td>{formatDate(holiday.endDate)}</td>
           <td>{holiday.isRecurringAnnual?"Yes":"No"}</td>
           <td><Badge bg={holiday.isActive?"success":"secondary"}>{holiday.isActive?"Active":"Inactive"}</Badge></td>
           <td>{holiday.notes||"-"}</td>
           <td className="text-end">
            <ButtonGroup size="sm">
             <Button type="button" variant="outline-primary" onClick={e=>{e.stopPropagation();openEditModal(holiday);}}>Edit</Button>
             <Button type="button" variant="outline-danger" onClick={e=>{e.stopPropagation();openDeleteModal(holiday);}}>Delete</Button>
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
