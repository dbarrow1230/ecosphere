//src/pages/admin/Footers.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert,Badge,ButtonGroup} from "react-bootstrap";
import FooterForm from "../forms/admin/FooterForm.jsx";
import AdminCatalogWorkspace from "../components/AdminCatalogWorkspace.jsx";
import {sortItems} from "../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../utils/currentBusiness.js";

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
  const rows=getRows(data).filter(item=>!businessId||getId(item.business_id)===businessId);
  setFooters(rows);
  setSelectedId(current=>rows.some(item=>getId(item)===current)?current:getId(rows[0]));
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
 const selectedFooter=useMemo(()=>footers.find(footer=>getId(footer)===selectedId)||null,[footers,selectedId]);

 return(
  <div className="py-4">
   {error?<Alert variant="danger">{error}</Alert>:null}
   {successMessage?<Alert variant="success">{successMessage}</Alert>:null}
   <AdminCatalogWorkspace title="Footers" description={`Manage footer records for ${businessLabel}.`}
    records={visibleFooters} selectedId={selectedId} onSelect={setSelectedId}
    onAdd={()=>openAdd(currentBusinessId)} addLabel="Add Footer" loading={loading}
    emptyMessage="No footers found." searchPlaceholder="Search footers..."
    getId={getId} getName={footer=>footer.name||"Unnamed footer"}
    getCode={footer=>formatValue(footer.seasonRef)}
    getDescription={footer=>footer.notes||footer.lines?.filter(Boolean).join(" | ")||"No footer text."}
    isActive={footer=>footer.isActive}
    actions={selectedFooter?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEdit(selectedFooter)}>Edit</Button><Button variant="outline-danger" onClick={()=>openDelete(selectedFooter)}>Delete</Button></ButtonGroup>:null}>
    {selectedFooter?<><h2>{selectedFooter.name}</h2><p className="text-muted">{selectedFooter.notes||"No notes."}</p>
     <div className="admin-catalog-detail-grid">
      <div><span>Season</span><strong>{formatValue(selectedFooter.seasonRef)}</strong></div>
      <div><span>Status</span><Badge bg={selectedFooter.isActive?"success":"secondary"}>{selectedFooter.isActive?"Active":"Inactive"}</Badge></div>
      <div><span>Show date</span><strong>{selectedFooter.showDate?"Yes":"No"}</strong></div>
      <div><span>Show time</span><strong>{selectedFooter.showTime?"Yes":"No"}</strong></div>
      <div><span>Show cashier</span><strong>{selectedFooter.showCashier?"Yes":"No"}</strong></div>
      <div><span>Default</span><strong>{selectedFooter.isDefault?"Yes":"No"}</strong></div>
     </div><h3>Footer lines</h3>{selectedFooter.lines?.filter(Boolean).map((line,index)=><p key={`${line}-${index}`}>{line}</p>)}</>:null}
   </AdminCatalogWorkspace>

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
