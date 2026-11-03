//src/pages/admin/Vendors.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert} from "react-bootstrap";
import VendorForm from "../forms/admin/VendorForm.jsx";
import "../../styles/Vendors.css";

const defaultFormData={business_id:"",legalName:"",code:"",dbaName:"",vendorCategory:"",email:"",phone:"",isPreferred:false,isActive:true};

const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.vendors)?d.vendors:Array.isArray(d?.businesses)?d.businesses:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");

export default function Vendors(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]);
 const [error,setError]=useState(""),[loading,setLoading]=useState(false);
 const api=async(url,options)=>{
  const response=await fetch(url,options);
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||data.message||"Vendor request failed");
  return data;
 };
 const [selectedId,setSelectedId]=useState(""),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[success,setSuccess]=useState(""); const t=useRef(null);

 const ok=m=>{if(t.current)clearTimeout(t.current);t.current=setTimeout(()=>setSuccess(""),2500);setSuccess(m)};

 const load=async()=>{
  const [b,r]=await Promise.all([api("/api/businesses"),api("/api/vendors")]);
  setBusinesses(getRows(b));
  const list=getRows(r);
  setRows(list);
  setSelectedId(previous=>list.some(row=>String(row._id)===String(previous))?previous:String(list[0]?._id||""));
 };

 useEffect(()=>{load().catch(error=>setError(error.message));return()=>t.current&&clearTimeout(t.current)},[]);

 const selected=useMemo(()=>rows.find(x=>String(x._id)===String(selectedId)),[rows,selectedId]);

 const openAdd=()=>{setMode("add");setInitial(defaultFormData);setShowForm(true)};
 const openEdit=()=>{if(!selected)return;setMode("edit");setInitial({...defaultFormData,...selected,business_id:getId(selected.business_id)});setShowForm(true)};
 const save=async(p)=>{
  setLoading(true);setError("");
  try{const isEdit=mode==="edit";const saved=await api(isEdit?`/api/vendors/${selected._id}`:"/api/vendors",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});setShowForm(false);await load();setSelectedId(String(saved._id));ok(isEdit?"Updated":"Created");}
  catch(error){setError(error.message);}finally{setLoading(false);}
 };
 const remove=async()=>{
  if(!selected||loading)return;setLoading(true);setError("");
  try{await api(`/api/vendors/${selected._id}`,{method:"DELETE"});setShowDelete(false);await load();ok("Deleted");}
  catch(error){setError(error.message);}finally{setLoading(false);}
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
   {error&&<Alert variant="danger">{error}</Alert>}

   <div className="vendors-layout">

    <div className="vendors-col vendors-list">
     <div className="vendors-col-header">
      <h3>Vendor List</h3>
     </div>
     <div className="vendors-col-body">
      {rows.map(v=>(
       <button key={v._id} onClick={()=>setSelectedId(v._id)} className={`vendors-list-item ${selectedId===v._id?"active":""}`}>
        {v.legalName}
       </button>
      ))}
     </div>
    </div>

    <div className="vendors-col vendors-details">
     <div className="vendors-col-header">
      <h3>Vendor Details</h3>
     </div>
     <div className="vendors-col-body">
      {selected&&(
       <>
        <h4>{selected.legalName}</h4>
        <div>{selected.dbaName||"-"}</div>
        <div>{selected.email||"-"}</div>
        <div>{selected.phone||"-"}</div>
        <div>Category: {selected.vendorCategory||"-"}</div>
        <div>Code: {selected.code||"-"}</div>
        <div>Business: {businesses.find(b=>getId(b)===getId(selected.business_id))?.legalName||"-"}</div>
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
         <div>Portal: {selected.ordering?.vendorPortalUrl||"-"}</div>
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
     {error&&<Alert variant="danger">{error}</Alert>}
     <VendorForm initialData={initial} onSubmit={save} businesses={businesses} loading={loading}/>
    </Modal.Body>
   </Modal>

   <Modal show={showDelete} onHide={()=>setShowDelete(false)}>
    <Modal.Body>Delete?</Modal.Body>
    <Modal.Footer>
     <Button onClick={()=>setShowDelete(false)}>Cancel</Button>
     <Button variant="danger" onClick={remove} disabled={loading}>Delete</Button>
    </Modal.Footer>
   </Modal>

  </div></div>
 );
}
