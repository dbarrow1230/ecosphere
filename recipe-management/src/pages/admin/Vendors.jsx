import {Link} from "react-router-dom";
import VendorProductsPanel from "../../components/vendors/VendorProductsPanel.jsx";
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
 const [currentBusiness,setCurrentBusiness]=useState(null);
 const [saving,setSaving]=useState(false);
 const t=useRef(null);

 const ok=m=>{if(t.current)clearTimeout(t.current);t.current=setTimeout(()=>setSuccess(""),2500);setSuccess(m)};

 const load=async()=>{
  try{
   setLoading(true);
   setError("");

   const [businessRes,vendorRes]=await Promise.all([fetch("/api/businesses"),fetch("/api/vendors"),fetch("/api/app/current-business/recipe-management").then(async response=>{const data=await response.json();if(!response.ok)throw new Error("Recipe Management business could not load.");setCurrentBusiness(data?.business||data?.data||data);})]);
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

 const openAdd=()=>{setMode("add");setInitial({...defaultFormData,business_id:getId(currentBusiness)});setShowForm(true)};
 const openEdit=()=>{if(!selected)return;setMode("edit");setInitial({...defaultFormData,...selected,business_id:getId(selected.business_id)});setShowForm(true)};
 const save=async(p)=>{
  if(saving)return;setSaving(true);setError("");try{
  const isEdit=mode==="edit";
  const res=await fetch(isEdit?`/api/vendors/${getId(selected)}`:"/api/vendors",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.message||"Vendor could not save.");
  await load();
  setShowForm(false);
  ok(isEdit?"Updated":"Created");
  }catch(err){setError(err.message);}finally{setSaving(false);}
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
        <dl className="vendor-reference-list">
         {selected.dbaName?<><dt>DBA</dt><dd>{selected.dbaName}</dd></>:null}
         {selected.email?<><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></>:null}
         {selected.phone?<><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></>:null}
         {selected.vendorCategory?<><dt>Category</dt><dd>{typeof selected.vendorCategory==="object"?selected.vendorCategory.name:selected.vendorCategory}</dd></>:null}
         <dt>Preferred</dt><dd>{selected.isPreferred?"Yes":"No"}</dd><dt>Active</dt><dd>{selected.isActive?"Yes":"No"}</dd>
        </dl>
        <div className="d-flex flex-wrap gap-2"><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${getId(selected)}&new=1`}>New Order</Button><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${getId(selected)}`}>Orders & Receiving</Button></div>
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
        <dl className="vendor-reference-list">
         {selected.payment?.paymentTerms?<><dt>Payment</dt><dd>{selected.payment.paymentTerms}</dd></>:null}
         {selected.payment?.preferredPaymentMethod?<><dt>Method</dt><dd>{selected.payment.preferredPaymentMethod}</dd></>:null}
         {selected.ordering?.orderingEmail?<><dt>Order email</dt><dd><a href={`mailto:${selected.ordering.orderingEmail}`}>{selected.ordering.orderingEmail}</a></dd></>:null}
         {selected.ordering?.vendorPortalUrl?<><dt>Portal</dt><dd><a href={/^https?:\/\//i.test(selected.ordering.vendorPortalUrl)?selected.ordering.vendorPortalUrl:`https://${selected.ordering.vendorPortalUrl}`} target="_blank" rel="noreferrer">Open vendor portal</a></dd></>:null}
         {selected.ordering?.leadTimeDays!=null?<><dt>Lead time</dt><dd>{selected.ordering.leadTimeDays} days</dd></>:null}
         {selected.ordering?.minimumOrderValue!=null?<><dt>Minimum order</dt><dd>${Number(selected.ordering.minimumOrderValue).toFixed(2)}</dd></>:null}
         {selected.performance?.rating!=null?<><dt>Rating</dt><dd><span className="vendor-rating" role="img" aria-label={`${selected.performance.rating} out of 5 stars`} title={`${selected.performance.rating} / 5`}><span aria-hidden="true">☆☆☆☆☆</span><span aria-hidden="true" style={{width:`${Math.max(0,Math.min(5,Number(selected.performance.rating)))/5*100}%`}}>★★★★★</span></span></dd></>:null}
         {selected.performance?.onTimeRate!=null?<><dt>On time</dt><dd>{selected.performance.onTimeRate}%</dd></>:null}
         {selected.performance?.fillRate!=null?<><dt>Fill rate</dt><dd>{selected.performance.fillRate}%</dd></>:null}
        </dl>
       </>
      )}
     </div>
    </div>

    {selected?<VendorProductsPanel key={getId(selected)} vendor={selected}/>:null}
   </div>

   <Modal show={showForm} onHide={()=>!saving&&setShowForm(false)} size="xl" centered scrollable><Modal.Header closeButton><Modal.Title>{mode==="edit"?"Edit":"Add"} Vendor</Modal.Title></Modal.Header>
    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}<VendorForm initialData={initial} loading={saving} onSubmit={save} onCancel={()=>setShowForm(false)} fixedBusiness={currentBusiness} businesses={businesses}/>
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
