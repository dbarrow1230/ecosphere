//src/pages/admin/Taglines.jsx
import {useEffect,useRef,useState} from "react";
import {Modal,Button,Alert,Badge,ButtonGroup} from "react-bootstrap";
import TaglineForm from "../forms/admin/TaglineForm.jsx";
import AdminCatalogWorkspace from "../../components/AdminCatalogWorkspace.jsx";
import {sortItems} from "../../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";

const defaultFormData={business_id:"",seasonRef:"",occasionRef:"",name:"",text:"",isActive:true,notes:""};
const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.taglines)?d.taglines:Array.isArray(d?.businesses)?d.businesses:Array.isArray(d?.seasons)?d.seasons:Array.isArray(d?.occasions)?d.occasions:[];
const getId=v=>getObjectId(v);
const formatValue=v=>v==null||v===""?"-":typeof v==="object"?(v?.name||v?.legalName||v?.code||v?._id||"-"):String(v);

export default function Taglines(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]),[seasons,setSeasons]=useState([]),[occasions,setOccasions]=useState([]);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [selectedId,setSelectedId]=useState("");
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);
 const [showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[activeRow,setActiveRow]=useState(null);
 const [error,setError]=useState(""),[success,setSuccess]=useState(""); const t=useRef(null);

 const clear=()=>{if(t.current){clearTimeout(t.current);t.current=null}};
 const ok=m=>{clear();setSuccess(m);t.current=setTimeout(()=>{setSuccess("");t.current=null},2500)};

 const loadBusiness=async()=>{const business=await loadCurrentBusiness();const businessId=getId(business);setCurrentBusinessId(businessId);setBusinesses([business]);return businessId};
 const loadSeasons=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/seasons${q}`);if(!r.ok)throw new Error("Unable to load reference records.");const d=await r.json();setSeasons(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};
 const loadOccasions=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/occasions${q}`);if(!r.ok)throw new Error("Unable to load reference records.");const d=await r.json();setOccasions(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};
 const loadTaglines=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/taglines${q}`);if(!r.ok)throw new Error("Unable to load reference records.");const d=await r.json();const items=getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId);setRows(items);setSelectedId(current=>items.some(item=>getId(item)===current)?current:getId(items[0]))};

 useEffect(()=>{(async()=>{try{setLoading(true);setError("");const businessId=await loadBusiness();await Promise.all([loadSeasons(businessId),loadOccasions(businessId),loadTaglines(businessId)])}catch{setError("Load failed")}finally{setLoading(false)}})();return clear},[]);

 const openAdd=businessId=>{setMode("add");setActiveRow(null);setInitial({...defaultFormData,business_id:businessId||currentBusinessId});setShowForm(true)};
 const openEdit=row=>{if(!row)return;setMode("edit");setActiveRow(row);setInitial({...defaultFormData,...row,business_id:getId(row.business_id),seasonRef:getId(row.seasonRef),occasionRef:getId(row.occasionRef)});setShowForm(true)};
 const openDelete=row=>{if(!row)return;setActiveRow(row);setShowDelete(true)};

 const save=async(p)=>{
  try{
   setSaving(true);
   setError("");
   const isEdit=mode==="edit"&&activeRow?._id;
   const res=await fetch(isEdit?`/api/taglines/${activeRow._id}`:"/api/taglines",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(p)
   });
   if(!res.ok)throw new Error("Save failed");
   await loadTaglines(currentBusinessId);
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
   const res=await fetch(`/api/taglines/${activeRow._id}`,{method:"DELETE"});
   if(!res.ok)throw new Error("Delete failed");
   await loadTaglines(currentBusinessId);
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
 const visibleRows=sortItems(rows,row=>row.name||row.text||"");
 const selectedRow=rows.find(row=>getId(row)===selectedId)||null;

 return(
  <div className="py-4">
   {error?<Alert variant="danger">{error}</Alert>:null}{success?<Alert variant="success">{success}</Alert>:null}
   <AdminCatalogWorkspace title="Taglines" description={`Manage tagline records for ${businessLabel}.`} records={visibleRows} selectedId={selectedId}
    onSelect={setSelectedId} onAdd={()=>openAdd(currentBusinessId)} addLabel="Add Tagline" loading={loading} emptyMessage="No taglines found."
    searchPlaceholder="Search taglines..." getId={getId} getName={row=>row.name||"Unnamed tagline"} getCode={row=>row.text||"NO TEXT"}
    getDescription={row=>row.notes||row.text||"No notes."} isActive={row=>row.isActive}
    actions={selectedRow?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>openEdit(selectedRow)}>Edit</Button><Button variant="outline-danger" onClick={()=>openDelete(selectedRow)}>Delete</Button></ButtonGroup>:null}>
    {selectedRow?<><h2>{selectedRow.name}</h2><p className="admin-catalog-feature-text">{selectedRow.text||"No tagline text."}</p><div className="admin-catalog-detail-grid">
     <div><span>Season</span><strong>{formatValue(selectedRow.seasonRef)}</strong></div><div><span>Occasion</span><strong>{formatValue(selectedRow.occasionRef)}</strong></div>
     <div><span>Status</span><Badge bg={selectedRow.isActive?"success":"secondary"}>{selectedRow.isActive?"Active":"Inactive"}</Badge></div>
    </div>{selectedRow.notes?<><h3>Notes</h3><p>{selectedRow.notes}</p></>:null}</>:null}
   </AdminCatalogWorkspace>

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl" centered>
    <Modal.Body>
     <TaglineForm initialData={initial} onSubmit={save} loading={saving} businesses={businesses} seasons={seasons} occasions={occasions}/>
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
