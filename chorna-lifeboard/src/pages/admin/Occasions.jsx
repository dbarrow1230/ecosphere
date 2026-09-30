//src/pages/admin/Occasions.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert,Table,Accordion} from "react-bootstrap";
import OccasionForm from "../forms/admin/OccasionForm.jsx";
import "../../styles/Occasions.css";

const defaultFormData={business_id:"",seasonRef:"",name:"",code:"",startDate:"",endDate:"",isRecurringAnnual:false,isActive:true,notes:""};
const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.occasions)?d.occasions:Array.isArray(d?.businesses)?d.businesses:Array.isArray(d?.seasons)?d.seasons:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");
const formatValue=v=>v==null||v===""?"-":typeof v==="object"?(v?.name||v?.legalName||v?.code||v?._id||"-"):String(v);
const formatDate=v=>!v?"-":(d=>isNaN(d.getTime())?"-":d.toLocaleDateString())(new Date(v));

export default function Occasions(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]),[seasons,setSeasons]=useState([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);
 const [error,setError]=useState(""),[success,setSuccess]=useState(""),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[activeRow,setActiveRow]=useState(null); const t=useRef(null);

 const clear=()=>{if(t.current){clearTimeout(t.current);t.current=null}};
 const ok=m=>{clear();setSuccess(m);t.current=setTimeout(()=>{setSuccess("");t.current=null},2500)};

 const loadBusinesses=async()=>{const r=await fetch("/api/businesses"),d=await r.json();setBusinesses(getRows(d))};
 const loadSeasons=async()=>{const r=await fetch("/api/seasons"),d=await r.json();setSeasons(getRows(d))};
 const loadOccasions=async()=>{const r=await fetch("/api/occasions"),d=await r.json();setRows(getRows(d))};

 useEffect(()=>{(async()=>{try{setLoading(true);setError("");await Promise.all([loadBusinesses(),loadSeasons(),loadOccasions()])}catch{setError("Load failed")}finally{setLoading(false)}})();return clear},[]);

 const rowsByBusiness=useMemo(()=>{
  const grouped={};
  rows.forEach(r=>{
   const businessId=getId(r.business_id)||"unassigned";
   if(!grouped[businessId])grouped[businessId]=[];
   grouped[businessId].push(r);
  });
  return grouped;
 },[rows]);

 const openAdd=businessId=>{setMode("add");setActiveRow(null);setInitial({...defaultFormData,business_id:businessId||""});setShowForm(true)};
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
   await loadOccasions();
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
   await loadOccasions();
   setShowDelete(false);
   setActiveRow(null);
   ok("Deleted");
  }catch{
   setError("Delete failed");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="occasions-page"><div className="occasions-wrap">
   <div className="occasions-topbar">
    <h1>Occasions</h1>
   </div>

   {error&&<Alert variant="danger">{error}</Alert>}
   {success&&<Alert variant="success">{success}</Alert>}

   {loading?(
    <div className="occasions-loading">Loading...</div>
   ):(
    <Accordion alwaysOpen className="occasions-accordion">
     {businesses.map((business,index)=>{
      const businessId=getId(business);
      const businessRows=rowsByBusiness[businessId]||[];

      return(
       <Accordion.Item eventKey={String(index)} key={businessId} className="occasions-accordion-item">
        <Accordion.Header>
         <div className="occasions-business-heading">
          <div className="occasions-business-title">{business.legalName||business.name||"Business"}</div>
          <div className="occasions-business-code">{formatValue(business.code)}</div>
         </div>
        </Accordion.Header>

        <Accordion.Body>
         <div className="occasions-business-toolbar">
          <Button className="occasions-action-btn" onClick={()=>openAdd(businessId)}>Add Occasion</Button>
         </div>

         <div className="occasions-table-wrap">
          <Table responsive className="occasions-table">
           <thead>
            <tr>
             <th>Name</th>
             <th>Code</th>
             <th>Season</th>
             <th>Start Date</th>
             <th>End Date</th>
             <th>Recurring Annual</th>
             <th>Active</th>
             <th>Notes</th>
             <th>Actions</th>
            </tr>
           </thead>
           <tbody>
            {businessRows.length>0?businessRows.map(row=>(
             <tr key={row._id}>
              <td>{row.name||"-"}</td>
              <td>{row.code||"-"}</td>
              <td>{formatValue(row.seasonRef)}</td>
              <td>{formatDate(row.startDate)}</td>
              <td>{formatDate(row.endDate)}</td>
              <td>{row.isRecurringAnnual?"Yes":"No"}</td>
              <td>{row.isActive?"Yes":"No"}</td>
              <td>{row.notes||"-"}</td>
              <td>
               <div className="occasions-actions">
                <Button size="sm" className="occasions-action-btn" onClick={()=>openEdit(row)}>Edit</Button>
                <Button size="sm" variant="danger" className="occasions-delete-btn" onClick={()=>openDelete(row)}>Delete</Button>
               </div>
              </td>
             </tr>
            )):(
             <tr>
              <td colSpan="9" className="occasions-empty-cell">No occasions for this business.</td>
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
    <div className="occasions-empty-state">No businesses found.</div>
   )}

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

  </div></div>
 );
}