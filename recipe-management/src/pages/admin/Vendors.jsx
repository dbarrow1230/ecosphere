import Alert from "../../components/AppAlert.jsx";
//src/pages/admin/Vendors.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button} from "react-bootstrap";
import VendorForm from "../forms/admin/VendorForm.jsx";
import "../../styles/Vendors.css";

const defaultFormData={business_id:"",legalName:"",code:"",dbaName:"",vendorCategory:"",email:"",phone:"",isPreferred:false,isActive:true};

const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.vendors)?d.vendors:Array.isArray(d?.businesses)?d.businesses:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");

export default function Vendors(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]);
 const [selectedId,setSelectedId]=useState(""),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[success,setSuccess]=useState("");
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const t=useRef(null);

 const ok=m=>{if(t.current)clearTimeout(t.current);t.current=setTimeout(()=>setSuccess(""),2500);setSuccess(m)};

 const load=async()=>{
  try{
   setLoading(true);
   setError("");

   const [businessRes,vendorRes]=await Promise.all([fetch("/api/businesses"),fetch("/api/vendors")]);
   const businessData=await businessRes.json().catch(()=>null);
   const vendorData=await vendorRes.json().catch(()=>null);

   if(!businessRes.ok)throw new Error(businessData?.message||"Businesses could not load.");
   if(!vendorRes.ok)throw new Error(vendorData?.message||"Vendors could not load.");

   const businessRows=getRows(businessData);
   const vendorRows=getRows(vendorData);

   setBusinesses(businessRows);
   setRows(vendorRows);

   if(vendorRows.length)
   {
    const currentStillExists=vendorRows.some(v=>String(getId(v))===String(selectedId));
    setSelectedId(currentStillExists?selectedId:String(getId(vendorRows[0])));
   }
   else
   {
    setSelectedId("");
   }
  }catch(err){
   setError(err.message||"Vendors could not load.");
   setRows([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{load();return()=>t.current&&clearTimeout(t.current)},[]);

 const selected=useMemo(()=>rows.find(x=>String(getId(x))===String(selectedId)),[rows,selectedId]);

 const openAdd=()=>{setMode("add");setInitial(defaultFormData);setShowForm(true)};
 const openEdit=()=>{if(!selected)return;setMode("edit");setInitial({...defaultFormData,...selected,business_id:getId(selected.business_id)});setShowForm(true)};
 const save=async(p)=>{
  const isEdit=mode==="edit";
  const res=await fetch(isEdit?`/api/vendors/${getId(selected)}`:"/api/vendors",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.message||"Vendor could not save.");
  await load();
  setShowForm(false);
  ok(isEdit?"Updated":"Created");
 };
 const remove=async()=>{
  const res=await fetch(`/api/vendors/${getId(selected)}`,{method:"DELETE"});
  const data=await res.json().catch(()=>null);
  if(!res.ok){
   setError(data?.message||"Vendor could not delete.");
   return;
  }
  await load();
  setShowDelete(false);
  ok("Deleted");
 };

 return(
  <div className="vendors-page"><div className="vendors-wrap">

   <div className="vendors-topbar">
    <h1>Vendors</h1>
    <div className="d-flex gap-2">
     <Button onClick={openAdd}>Add</Button>
     <Button onClick={openEdit} disabled={!selected}>Edit</Button>
     <Button variant="danger" onClick={()=>setShowDelete(true)} disabled={!selected}>Delete</Button>
    </div>
   </div>

   {success&&<Alert variant="success">{success}</Alert>}
   {error&&<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>}

   <div className="vendors-layout">

    <div className="vendors-col vendors-list">
     <div className="vendors-col-header">
      <h3>Vendor List</h3>
     </div>
     <div className="vendors-col-body">
      {loading?<div className="vendors-empty">Loading vendors...</div>:null}
      {!loading&&!error&&rows.length===0?<div className="vendors-empty">No vendors found.</div>:null}
      {rows.map(v=>(
       <button key={getId(v)} onClick={()=>setSelectedId(getId(v))} className={`vendors-list-item ${selectedId===getId(v)?"active":""}`}>
        {v.legalName||v.name||"Unnamed vendor"}
       </button>
      ))}
     </div>
    </div>

    <div className="vendors-col vendors-details">
     <div className="vendors-col-header">
      <h3>Vendor Details</h3>
     </div>
     <div className="vendors-col-body">
      {!selected&&!loading?<div className="vendors-empty">Select a vendor to view details.</div>:null}
      {selected&&(
       <>
        <h4>{selected.legalName}</h4>
        <div>{selected.dbaName||"-"}</div>
        <div>{selected.email||"-"}</div>
        <div>{selected.phone||"-"}</div>
        <div>Category: {selected.vendorCategory||"-"}</div>
        <div>Preferred: {selected.isPreferred?"Yes":"No"}</div>
        <div>Active: {selected.isActive?"Yes":"No"}</div>
       </>
      )}
     </div>
    </div>

    <div className="vendors-col vendors-extra">
     <div className="vendors-col-header">
      <h3>Vendor Operations</h3>
     </div>
     <div className="vendors-col-body">
      {selected&&(
       <>
        <div className="vendors-section">
         <h5>Payment</h5>
         <div>{selected.payment?.paymentTerms||"-"}</div>
         <div>{selected.payment?.preferredPaymentMethod||"-"}</div>
         <div>{selected.payment?.currencyCode||"-"}</div>
        </div>

        <div className="vendors-section">
         <h5>Ordering</h5>
         <div>{selected.ordering?.orderingEmail||"-"}</div>
         <div>{selected.ordering?.leadTimeDays||0} days</div>
         <div>{selected.ordering?.minimumOrderValue||0}</div>
        </div>

        <div className="vendors-section">
         <h5>Performance</h5>
         <div>Rating: {selected.performance?.rating||0}</div>
         <div>On Time: {selected.performance?.onTimeRate||0}%</div>
         <div>Fill Rate: {selected.performance?.fillRate||0}%</div>
        </div>
       </>
      )}
     </div>
    </div>

   </div>

   <Modal show={showForm} onHide={()=>setShowForm(false)} size="xl">
    <Modal.Body>
     <VendorForm initialData={initial} onSubmit={save} businesses={businesses}/>
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={()=>setShowDelete(false)}>
    <Modal.Body>Delete?</Modal.Body>
    <Modal.Footer>
     <Button onClick={()=>setShowDelete(false)}>Cancel</Button>
     <Button variant="danger" onClick={remove}>Delete</Button>
    </Modal.Footer>
   </Modal>

  </div></div>
 );
}
