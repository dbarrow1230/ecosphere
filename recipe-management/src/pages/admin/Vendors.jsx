import {Link} from "react-router-dom";
import VendorProductsPanel from "../../components/vendors/VendorProductsPanel.jsx";
import Alert from "../../components/AppAlert.jsx";
//src/pages/admin/Vendors.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Form} from "react-bootstrap";
import VendorForm from "../forms/admin/VendorForm.jsx";
import "../../styles/Vendors.css";

const defaultFormData={business_id:"",legalName:"",code:"",dbaName:"",vendorCategory:"",email:"",phone:"",isPreferred:false,isActive:true};

const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.vendors)?d.vendors:Array.isArray(d?.businesses)?d.businesses:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");

export default function Vendors(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]);
 const [selectedId,setSelectedId]=useState(()=>{try{return globalThis.sessionStorage?.getItem("recipe-management-selected-vendor")||"";}catch{return "";}}),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[success,setSuccess]=useState("");
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const [currentBusiness,setCurrentBusiness]=useState(null);
 const [saving,setSaving]=useState(false);
 const [vendorSearch,setVendorSearch]=useState(""),[vendorLetter,setVendorLetter]=useState("");
 const [vendorType,setVendorType]=useState("");
 const typeName=vendor=>typeof vendor.vendorCategory==="object"?vendor.vendorCategory?.name||"":vendor.vendorCategory||"";
 const vendorTypes=[...new Set(rows.map(typeName).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const vendorName=vendor=>vendor.legalName||vendor.name||"Unnamed vendor";
 const filteredVendors=rows.filter(vendor=>(!vendorType||typeName(vendor)===vendorType)&&vendorName(vendor).toLowerCase().includes(vendorSearch.trim().toLowerCase())&&(!vendorLetter||vendorName(vendor).toUpperCase().startsWith(vendorLetter))).sort((a,b)=>vendorName(a).localeCompare(vendorName(b)));
 const [deliveryPerformance,setDeliveryPerformance]=useState({});
 useEffect(()=>{const business=getId(currentBusiness);if(!business)return;let active=true;fetch(`/api/purchasing-workflow/vendor-performance?business=${business}`).then(async response=>{if(!response.ok)throw new Error("Delivery performance could not load.");return response.json();}).then(data=>{if(active)setDeliveryPerformance(data);}).catch(err=>{if(active)setError(err.message);});return()=>{active=false;};},[currentBusiness]);
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
     <div className="vendors-list-tools"><Form.Control type="search" aria-label="Search vendors" placeholder="Search vendors…" value={vendorSearch} onChange={event=>setVendorSearch(event.target.value)}/><Form.Select aria-label="Filter vendors by type" value={vendorType} onChange={event=>{setVendorType(event.target.value);setVendorLetter("");}}><option value="">All vendor types</option>{vendorTypes.map(type=><option key={type} value={type}>{type}</option>)}</Form.Select><div className="vendors-alphabet" role="group" aria-label="Filter vendors by first letter">{["",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(letter=><button type="button" key={letter||"all"} aria-pressed={vendorLetter===letter} onClick={()=>setVendorLetter(letter)} disabled={Boolean(letter)&&!rows.some(vendor=>vendorName(vendor).toUpperCase().startsWith(letter))}>{letter||"All"}</button>)}</div></div>
     <div className="vendors-col-body">
      {loading?<div className="vendors-empty">Loading vendors...</div>:null}
      {!loading&&!error&&filteredVendors.length===0?<div className="vendors-empty">No vendors found.</div>:null}
      {filteredVendors.map(v=>(
       <button key={getId(v)} onClick={()=>{setSelectedId(getId(v));try{globalThis.sessionStorage?.setItem("recipe-management-selected-vendor",getId(v));}catch{}}} className={`vendors-list-item ${selectedId===getId(v)?"active":""}`}>
        {v.legalName||v.name||"Unnamed vendor"}
       </button>
      ))}
     </div>
    </div>

    <div className="vendors-col vendors-details">
     <div className="vendors-col-header vendor-details-columns">
      <h3>Vendor Details</h3><h3>Vendor Operations</h3>
     </div>
     <div className="vendors-col-body">
      {!selected&&!loading?<div className="vendors-empty">Select a vendor to view details.</div>:null}
      {selected&&(
       <>
        <h4>{selected.legalName}</h4>
        <div className="vendor-details-columns"><dl className="vendor-reference-list">
         {selected.dbaName?<><dt>DBA</dt><dd>{selected.dbaName}</dd></>:null}
         {selected.email?<><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></>:null}
         {selected.phone?<><dt>Phone</dt><dd><a href={`tel:${selected.phone}`}>{selected.phone}</a></dd></>:null}
         {selected.vendorCategory?<><dt>Vendor Type</dt><dd>{typeof selected.vendorCategory==="object"?selected.vendorCategory.name:selected.vendorCategory}</dd></>:null}
         <dt>Preferred</dt><dd>{selected.isPreferred?"Yes":"No"}</dd><dt>Active</dt><dd>{selected.isActive?"Yes":"No"}</dd>
        </dl><section className="vendor-operations-section"><dl className="vendor-reference-list">
         {selected.payment?.paymentTerms?<><dt>Payment</dt><dd>{selected.payment.paymentTerms}</dd></>:null}
         {selected.payment?.preferredPaymentMethod?<><dt>Method</dt><dd>{selected.payment.preferredPaymentMethod}</dd></>:null}
         {selected.ordering?.orderingEmail?<><dt>Order email</dt><dd><a href={`mailto:${selected.ordering.orderingEmail}`}>{selected.ordering.orderingEmail}</a></dd></>:null}
         {selected.ordering?.vendorPortalUrl?<><dt>Portal</dt><dd><a href={/^https?:\/\//i.test(selected.ordering.vendorPortalUrl)?selected.ordering.vendorPortalUrl:`https://${selected.ordering.vendorPortalUrl}`} target="_blank" rel="noreferrer">Open vendor portal</a></dd></>:null}
         {selected.ordering?.leadTimeDays!=null?<><dt>Lead time</dt><dd>{selected.ordering.leadTimeDays} days</dd></>:null}
         {selected.ordering?.minimumOrderValue!=null?<><dt>Minimum order</dt><dd>${Number(selected.ordering.minimumOrderValue).toFixed(2)}</dd></>:null}
         {selected.performance?.rating!=null?<><dt>Rating</dt><dd><span className="vendor-rating" role="img" aria-label={`${selected.performance.rating} out of 5 stars`} title={`${selected.performance.rating} / 5`}><span aria-hidden="true">☆☆☆☆☆</span><span aria-hidden="true" style={{width:`${Math.max(0,Math.min(5,Number(selected.performance.rating)))/5*100}%`}}>★★★★★</span></span></dd></>:null}
         {(deliveryPerformance[getId(selected)]?.onTimeRate!=null||selected.performance?.onTimeRate!=null)?<><dt>On time</dt><dd>{deliveryPerformance[getId(selected)]?.onTimeRate!=null?deliveryPerformance[getId(selected)].onTimeRate.toFixed(1):selected.performance.onTimeRate}%</dd></>:null}
         {(deliveryPerformance[getId(selected)]?.fillRate!=null||selected.performance?.fillRate!=null)?<><dt>Fill rate</dt><dd>{deliveryPerformance[getId(selected)]?.fillRate!=null?deliveryPerformance[getId(selected)].fillRate.toFixed(1):selected.performance.fillRate}%</dd></>:null}
        </dl></section></div>
        <div className="d-flex flex-wrap gap-2"><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${encodeURIComponent(getId(selected))}&new=1`} state={{vendorId:getId(selected),vendorName:selected.legalName}}>New Order</Button><Button as={Link} size="sm" variant="outline-primary" to={`/purchasing?vendor=${getId(selected)}`} state={{vendorId:getId(selected),vendorName:selected.legalName}}>Orders & Receiving</Button></div>
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
