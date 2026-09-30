//src/pages/admin/Occasions.jsx
import {useEffect,useRef,useState} from "react";
import {Modal,Button,Alert,Badge,ButtonGroup} from "react-bootstrap";
import OccasionForm from "../forms/admin/OccasionForm.jsx";
import AdminCatalogWorkspace from "../components/AdminCatalogWorkspace.jsx";
import {sortItems} from "../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../utils/currentBusiness.js";

const defaultFormData={business_id:"",seasonRef:"",name:"",code:"",startDate:"",endDate:"",isRecurringAnnual:false,isActive:true,notes:""};
const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.occasions)?d.occasions:Array.isArray(d?.businesses)?d.businesses:Array.isArray(d?.seasons)?d.seasons:[];
const getId=v=>getObjectId(v);
const formatValue=v=>v==null||v===""?"-":typeof v==="object"?(v?.name||v?.legalName||v?.code||v?._id||"-"):String(v);
const formatDate=v=>!v?"-":(d=>isNaN(d.getTime())?"-":d.toLocaleDateString())(new Date(v));

export default function Occasions(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]),[seasons,setSeasons]=useState([]);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [selectedId,setSelectedId]=useState("");
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);
 const [error,setError]=useState(""),[success,setSuccess]=useState(""),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[activeRow,setActiveRow]=useState(null); const t=useRef(null);

 const clear=()=>{if(t.current){clearTimeout(t.current);t.current=null}};
 const ok=m=>{clear();setSuccess(m);t.current=setTimeout(()=>{setSuccess("");t.current=null},2500)};

 const loadBusiness=async()=>{const business=await loadCurrentBusiness();const businessId=getId(business);setCurrentBusinessId(businessId);setBusinesses([business]);return businessId};
 const loadSeasons=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/seasons${q}`),d=await r.json();setSeasons(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};
 const loadOccasions=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/occasions${q}`),d=await r.json();const items=getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId);setRows(items);setSelectedId(current=>items.some(item=>getId(item)===current)?current:getId(items[0]))};

 useEffect(()=>{(async()=>{try{setLoading(true);setError("");const businessId=await loadBusiness();await Promise.all([loadSeasons(businessId),loadOccasions(businessId)])}catch{setError("Load failed")}finally{setLoading(false)}})();return clear},[]);

 const openAdd=businessId=>{setMode("add");setActiveRow(null);setInitial({...defaultFormData,business_id:businessId||currentBusinessId});setShowForm(true)};
 const openEdit=row=>{if(!row)return;setMode("edit");setActiveRow(row);setInitial({...defaultFormData,...row,business_id:getId(row.business_id),seasonRef:getId(row.seasonRef)});setShowForm(true)};
 const openDelete=row=>{if(!row)return;setActiveRow(row);setShowDelete(true)};

 const save=async(p)=>{
  try{
   setSaving(true);
   setError("");
   const isEdit=mode==="edit"&&activeRow?._id;
   const res=await fetch(isEdit?`/api/occasions/${activeRow._id}`:"/api/occasions",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(p)
   });
   if(!res.ok)throw new Error("Save failed");
   await loadOccasions(currentBusinessId);
   setShowForm(false);
   setActiveRow(null);
   ok(isEdit?"Updated":"Created");
  }catch{
   setError("Save failed");
  }finally{
   setSaving(false);
  }
 };

 const remove=async()=>{
  if(!activeRow?._id)return;
  try{
   setDeleting(true);
   setError("");
   const res=await fetch(`/api/occasions/${activeRow._id}`,{method:"DELETE"});
   if(!res.ok)throw new Error("Delete failed");
   await loadOccasions(currentBusinessId);
   setShowDelete(false);
   setActiveRow(null);
   ok("Deleted");
  }catch{
   setError("Delete failed");
  }finally{
   setDeleting(false);
  }
 };

 const businessLabel=businesses[0]?.legalName||businesses[0]?.name||"current business";
 const visibleRows=sortItems(rows,row=>row.name||row.code||"");
 const selectedRow=rows.find(row=>getId(row)===selectedId)||null;

 return(
  <div className="py-4">
   {error?<Alert variant="danger">{error}</Alert>:null}{success?<Alert variant="success">{success}</Alert>:null}
   <AdminCatalogWorkspace title="Occasions" description={`Manage occasion records for ${businessLabel}.`} records={visibleRows}
    selectedId={selectedId} onSelect={setSelectedId} onAdd={()=>openAdd(currentBusinessId)} addLabel="Add Occasion" loading={loading}
    emptyMessage="No occasions found." searchPlaceholder="Search occasions..." getId={getId} getName={row=>row.name||"Unnamed occasion"}
    getCode={row=>row.code||"NO CODE"} getDescription={row=>row.notes||"No notes."} isActive={row=>row.isActive}
    actions={selectedRow?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEdit(selectedRow)}>Edit</Button><Button variant="outline-danger" onClick={()=>openDelete(selectedRow)}>Delete</Button></ButtonGroup>:null}>
    {selectedRow?<><h2>{selectedRow.name}</h2><p className="text-muted">{selectedRow.notes||"No notes."}</p><div className="admin-catalog-detail-grid">
     <div><span>Code</span><strong>{selectedRow.code||"-"}</strong></div><div><span>Season</span><strong>{formatValue(selectedRow.seasonRef)}</strong></div>
     <div><span>Starts</span><strong>{formatDate(selectedRow.startDate)}</strong></div><div><span>Ends</span><strong>{formatDate(selectedRow.endDate)}</strong></div>
     <div><span>Recurring</span><strong>{selectedRow.isRecurringAnnual?"Yes":"No"}</strong></div><div><span>Status</span><Badge bg={selectedRow.isActive?"success":"secondary"}>{selectedRow.isActive?"Active":"Inactive"}</Badge></div>
    </div></>:null}
   </AdminCatalogWorkspace>

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered>
    <Modal.Body>
     <OccasionForm initialData={initial} onSubmit={save} loading={saving} businesses={businesses} seasons={seasons}/>
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={()=>setShowDelete(false)} centered>
    <Modal.Body>Delete?</Modal.Body>
    <Modal.Footer>
     <Button onClick={()=>setShowDelete(false)}>Cancel</Button>
     <Button variant="danger" onClick={remove} disabled={deleting}>{deleting?"Deleting...":"Delete"}</Button>
    </Modal.Footer>
   </Modal>

  </div>
 );
}
