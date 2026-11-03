import Alert from "../../components/AppAlert.jsx";
//src/pages/admin/Footers.jsx
import {useEffect,useRef,useState} from "react";
import {Modal,Button,Table,Card,Row,Col,Badge,ButtonGroup} from "react-bootstrap";
import FooterForm from "../forms/admin/FooterForm.jsx";
import {sortItems} from "../../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/Footers.css";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 name:"",
 lines:[""],
 showDate:true,
 showTime:true,
 showCashier:false,
 isDefault:false,
 isActive:true,
 notes:""
};

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.footers))return data.footers;
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

export default function Footers(){
 const [footers,setFooters]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [seasons,setSeasons]=useState([]);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [successMessage,setSuccessMessage]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [modalMode,setModalMode]=useState("add");
 const [formInitialData,setFormInitialData]=useState(defaultFormData);
 const [activeFooter,setActiveFooter]=useState(null);
 const successTimerRef=useRef(null);

 const clearSuccessTimer=()=>{
  if(successTimerRef.current){
   clearTimeout(successTimerRef.current);
   successTimerRef.current=null;
  }
 };

 const showTimedSuccess=msg=>{
  clearSuccessTimer();
  setSuccessMessage(msg);
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
  const res=await fetch(`/api/seasons${query}`);
  const data=await res.json();
  setSeasons(getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId));
 };

 const loadFooters=async(businessId=currentBusinessId)=>{
  const query=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";
  const res=await fetch(`/api/footers${query}`);
  const data=await res.json();
  setFooters(getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId));
 };

 useEffect(()=>{
  (async()=>{
   try{
    setLoading(true);
    setError("");
    const businessId=await loadBusiness();
    await Promise.all([loadSeasons(businessId),loadFooters(businessId)]);
   }catch{
    setError("Load failed");
   }finally{
    setLoading(false);
   }
  })();
  return()=>clearSuccessTimer();
 },[]);

 const openAdd=businessId=>{
  setModalMode("add");
  setActiveFooter(null);
  setFormInitialData({
   ...defaultFormData,
   business_id:businessId||currentBusinessId
  });
  setShowFormModal(true);
 };

 const openEdit=footer=>{
  if(!footer)return;
  setModalMode("edit");
  setActiveFooter(footer);
  setFormInitialData({
   ...defaultFormData,
   ...footer,
   business_id:getId(footer.business_id),
   seasonRef:getId(footer.seasonRef)
  });
  setShowFormModal(true);
 };

 const openDelete=footer=>{
  if(!footer)return;
  setActiveFooter(footer);
  setShowDeleteModal(true);
 };

 const save=async(payload)=>{
  try{
   setSaving(true);
   setError("");
   const isEdit=modalMode==="edit"&&activeFooter?._id;
   const url=isEdit?`/api/footers/${activeFooter._id}`:"/api/footers";
   const method=isEdit?"PUT":"POST";
   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   if(!res.ok)throw new Error("Save failed");
   await loadFooters(currentBusinessId);
   setShowFormModal(false);
   setActiveFooter(null);
   showTimedSuccess(isEdit?"Updated":"Created");
  }catch{
   setError("Save failed");
  }finally{
   setSaving(false);
  }
 };

 const remove=async()=>{
  if(!activeFooter?._id)return;
  try{
   setDeleting(true);
   setError("");
   const res=await fetch(`/api/footers/${activeFooter._id}`,{method:"DELETE"});
   if(!res.ok)throw new Error("Delete failed");
   await loadFooters(currentBusinessId);
   setShowDeleteModal(false);
   setActiveFooter(null);
   showTimedSuccess("Deleted");
  }catch{
   setError("Delete failed");
  }finally{
   setDeleting(false);
  }
 };

 const businessLabel=businesses[0]?.legalName||businesses[0]?.name||"current business";
 const visibleFooters=sortItems(footers,footer=>footer.name||footer.notes||"");

 return(
  <div className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={8}>
         <h3 className="mb-1">Footers</h3>
         <div className="text-muted">Manage footer records for {businessLabel}.</div>
        </Col>
        <Col md={4} className="d-flex justify-content-md-end align-items-center gap-2">
         <Button type="button" onClick={()=>openAdd(currentBusinessId)}>Add Footer</Button>
         <Badge bg="primary">Total: {visibleFooters.length}</Badge>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {error?<Col xs={12}><Alert variant="danger" className="mb-0" onClose={()=>setError("")}>{error}</Alert></Col>:null}
    {successMessage?<Col xs={12}><Alert variant="success" className="mb-0">{successMessage}</Alert></Col>:null}

    <Col xs={12}>
     <Card className="shadow-sm">
      <Card.Header>Footers</Card.Header>
      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Season</th>
          <th>Lines</th>
          <th>Show Date</th>
          <th>Show Time</th>
          <th>Show Cashier</th>
          <th>Default</th>
          <th>Status</th>
          <th>Notes</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>
        <tbody>
         {loading?(
          <tr><td colSpan="10" className="text-center py-4 text-muted">Loading footers...</td></tr>
         ):null}

         {!loading&&visibleFooters.length===0?(
          <tr><td colSpan="10" className="text-center py-4 text-muted">No footers found.</td></tr>
         ):null}

         {visibleFooters.map(footer=>(
          <tr key={footer._id}>
           <td>{footer.name||"-"}</td>
           <td>{formatValue(footer.seasonRef)}</td>
           <td>{Array.isArray(footer.lines)&&footer.lines.length>0?footer.lines.filter(Boolean).join(" | "):"-"}</td>
           <td>{footer.showDate?"Yes":"No"}</td>
           <td>{footer.showTime?"Yes":"No"}</td>
           <td>{footer.showCashier?"Yes":"No"}</td>
           <td><Badge bg={footer.isDefault?"primary":"secondary"}>{footer.isDefault?"Default":"Custom"}</Badge></td>
           <td><Badge bg={footer.isActive?"success":"secondary"}>{footer.isActive?"Active":"Inactive"}</Badge></td>
           <td>{footer.notes||"-"}</td>
           <td className="text-end">
            <ButtonGroup size="sm">
             <Button type="button" variant="outline-primary" onClick={()=>openEdit(footer)}>Edit</Button>
             <Button type="button" variant="outline-danger" onClick={()=>openDelete(footer)}>Delete</Button>
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

    <Modal show={showFormModal} onHide={()=>setShowFormModal(false)} size="xl" centered>
     <Modal.Body>
      <FooterForm
       initialData={formInitialData}
       onSubmit={save}
       loading={saving}
       businesses={businesses}
       seasons={seasons}
      />
     </Modal.Body>
    </Modal>

    <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
     <Modal.Body>Confirm delete?</Modal.Body>
     <Modal.Footer>
      <Button onClick={()=>setShowDeleteModal(false)}>Cancel</Button>
      <Button variant="danger" onClick={remove} disabled={deleting}>{deleting?"Deleting...":"Delete"}</Button>
     </Modal.Footer>
    </Modal>

  </div>
 );
}
