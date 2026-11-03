//src/pages/admin/Taglines.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert,Table,Accordion} from "react-bootstrap";
import TaglineForm from "../forms/admin/TaglineForm.jsx";
import "../../styles/Taglines.css";

const defaultFormData={business_id:"",seasonRef:"",occasionRef:"",name:"",text:"",isActive:true,notes:""};
const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.taglines)?d.taglines:Array.isArray(d?.businesses)?d.businesses:Array.isArray(d?.seasons)?d.seasons:Array.isArray(d?.occasions)?d.occasions:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");
const formatValue=v=>v==null||v===""?"-":typeof v==="object"?(v?.name||v?.legalName||v?.code||v?._id||"-"):String(v);

export default function Taglines(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]),[seasons,setSeasons]=useState([]),[occasions,setOccasions]=useState([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);
 const [showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[activeRow,setActiveRow]=useState(null);
 const [error,setError]=useState(""),[success,setSuccess]=useState(""); const t=useRef(null);

 const clear=()=>{if(t.current){clearTimeout(t.current);t.current=null}};
 const ok=m=>{clear();setSuccess(m);t.current=setTimeout(()=>{setSuccess("");t.current=null},2500)};

 const loadBusinesses=async()=>{const r=await fetch("/api/businesses"),d=await r.json();setBusinesses(getRows(d))};
 const loadSeasons=async()=>{const r=await fetch("/api/seasons"),d=await r.json();setSeasons(getRows(d))};
 const loadOccasions=async()=>{const r=await fetch("/api/occasions"),d=await r.json();setOccasions(getRows(d))};
 const loadTaglines=async()=>{const r=await fetch("/api/taglines"),d=await r.json();setRows(getRows(d))};

 useEffect(()=>{(async()=>{try{setLoading(true);setError("");await Promise.all([loadBusinesses(),loadSeasons(),loadOccasions(),loadTaglines()])}catch{setError("Load failed")}finally{setLoading(false)}})();return clear},[]);

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
   await loadTaglines();
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
   await loadTaglines();
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
  <div className="taglines-page"><div className="taglines-wrap">
   <div className="taglines-topbar">
    <h1>Taglines</h1>
   </div>

   {error&&<Alert variant="danger">{error}</Alert>}
   {success&&<Alert variant="success">{success}</Alert>}

   {loading?(
    <div className="taglines-loading">Loading...</div>
   ):(
    <Accordion alwaysOpen className="taglines-accordion">
     {businesses.map((business,index)=>{
      const businessId=getId(business);
      const businessRows=rowsByBusiness[businessId]||[];

      return(
       <Accordion.Item eventKey={String(index)} key={businessId} className="taglines-accordion-item">
        <Accordion.Header>
         <div className="taglines-business-heading">
          <div className="taglines-business-title">{business.legalName||business.name||"Business"}</div>
          <div className="taglines-business-code">{formatValue(business.code)}</div>
         </div>
        </Accordion.Header>

        <Accordion.Body>
         <div className="taglines-business-toolbar">
          <Button className="taglines-action-btn" onClick={()=>openAdd(businessId)}>Add Tagline</Button>
         </div>

         <div className="taglines-table-wrap">
          <Table responsive className="taglines-table">
           <thead>
            <tr>
             <th>Name</th>
             <th>Season</th>
             <th>Occasion</th>
             <th>Text</th>
             <th>Active</th>
             <th>Notes</th>
             <th>Actions</th>
            </tr>
           </thead>
           <tbody>
            {businessRows.length>0?businessRows.map(row=>(
             <tr key={row._id}>
              <td>{row.name||"-"}</td>
              <td>{formatValue(row.seasonRef)}</td>
              <td>{formatValue(row.occasionRef)}</td>
              <td>{row.text||"-"}</td>
              <td>{row.isActive?"Yes":"No"}</td>
              <td>{row.notes||"-"}</td>
              <td>
               <div className="taglines-actions">
                <Button size="sm" className="taglines-action-btn" onClick={()=>openEdit(row)}>Edit</Button>
                <Button size="sm" variant="danger" className="taglines-delete-btn" onClick={()=>openDelete(row)}>Delete</Button>
               </div>
              </td>
             </tr>
            )):(
             <tr>
              <td colSpan="7" className="taglines-empty-cell">No taglines for this business.</td>
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
    <div className="taglines-empty-state">No businesses found.</div>
   )}

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

  </div></div>
 );
}