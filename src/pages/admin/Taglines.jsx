//src/pages/admin/Taglines.jsx
import {useEffect,useRef,useState} from "react";
import {Modal,Button,Alert,Table,Card,Row,Col,Badge,ButtonGroup} from "react-bootstrap";
import TaglineForm from "../forms/admin/TaglineForm.jsx";
import {sortItems} from "../../utils/sortItems.js";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/Taglines.css";

const defaultFormData={business_id:"",seasonRef:"",occasionRef:"",name:"",text:"",isActive:true,notes:""};
const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.taglines)?d.taglines:Array.isArray(d?.businesses)?d.businesses:Array.isArray(d?.seasons)?d.seasons:Array.isArray(d?.occasions)?d.occasions:[];
const getId=v=>getObjectId(v);
const formatValue=v=>v==null||v===""?"-":typeof v==="object"?(v?.name||v?.legalName||v?.code||v?._id||"-"):String(v);

export default function Taglines(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]),[seasons,setSeasons]=useState([]),[occasions,setOccasions]=useState([]);
 const [currentBusinessId,setCurrentBusinessId]=useState("");
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);
 const [showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[activeRow,setActiveRow]=useState(null);
 const [error,setError]=useState(""),[success,setSuccess]=useState(""); const t=useRef(null);

 const clear=()=>{if(t.current){clearTimeout(t.current);t.current=null}};
 const ok=m=>{clear();setSuccess(m);t.current=setTimeout(()=>{setSuccess("");t.current=null},2500)};

 const loadBusiness=async()=>{const business=await loadCurrentBusiness();const businessId=getId(business);setCurrentBusinessId(businessId);setBusinesses([business]);return businessId};
 const loadSeasons=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/seasons${q}`),d=await r.json();setSeasons(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};
 const loadOccasions=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/occasions${q}`),d=await r.json();setOccasions(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};
 const loadTaglines=async(businessId=currentBusinessId)=>{const q=businessId?`?business_id=${encodeURIComponent(businessId)}`:"";const r=await fetch(`/api/taglines${q}`),d=await r.json();setRows(getRows(d).filter(row=>!businessId||getId(row.business_id)===businessId))};

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

 return(
  <div className="py-4">
   <Row className="g-4">
    <Col xs={12}>
     <Card className="shadow-sm border-0">
      <Card.Body>
       <Row className="g-3 align-items-center">
        <Col md={8}>
         <h3 className="mb-1">Taglines</h3>
         <div className="text-muted">Manage tagline records for {businessLabel}.</div>
        </Col>
        <Col md={4} className="d-flex justify-content-md-end align-items-center gap-2">
         <Button type="button" onClick={()=>openAdd(currentBusinessId)}>Add Tagline</Button>
         <Badge bg="primary">Total: {visibleRows.length}</Badge>
        </Col>
       </Row>
      </Card.Body>
     </Card>
    </Col>

    {error?<Col xs={12}><Alert variant="danger" className="mb-0">{error}</Alert></Col>:null}
    {success?<Col xs={12}><Alert variant="success" className="mb-0">{success}</Alert></Col>:null}

    <Col xs={12}>
     <Card className="shadow-sm">
      <Card.Header>Taglines</Card.Header>
      <Card.Body className="p-0">
       <Table responsive hover className="mb-0 align-middle">
        <thead>
         <tr>
          <th>Name</th>
          <th>Season</th>
          <th>Occasion</th>
          <th>Text</th>
          <th>Status</th>
          <th>Notes</th>
          <th className="text-end">Actions</th>
         </tr>
        </thead>
        <tbody>
         {loading?(
          <tr><td colSpan="7" className="text-center py-4 text-muted">Loading taglines...</td></tr>
         ):null}

         {!loading&&visibleRows.length===0?(
          <tr><td colSpan="7" className="text-center py-4 text-muted">No taglines found.</td></tr>
         ):null}

         {visibleRows.map(row=>(
          <tr key={row._id}>
           <td>{row.name||"-"}</td>
           <td>{formatValue(row.seasonRef)}</td>
           <td>{formatValue(row.occasionRef)}</td>
           <td>{row.text||"-"}</td>
           <td><Badge bg={row.isActive?"success":"secondary"}>{row.isActive?"Active":"Inactive"}</Badge></td>
           <td>{row.notes||"-"}</td>
           <td className="text-end">
            <ButtonGroup size="sm">
             <Button type="button" variant="outline-primary" onClick={()=>openEdit(row)}>Edit</Button>
             <Button type="button" variant="outline-danger" onClick={()=>openDelete(row)}>Delete</Button>
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
