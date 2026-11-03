//src/pages/admin/Vendors.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button} from "react-bootstrap";
import Alert from "../../../../components/PopupAlert.jsx";
import VendorForm from "./VendorForm.jsx";
import "../../../../styles/Vendors.css";

const defaultFormData={business_id:"",legalName:"",code:"",dbaName:"",vendorCategory:"",email:"",phone:"",isPreferred:false,isActive:true};

const getRows=d=>Array.isArray(d)?d:Array.isArray(d?.data)?d.data:Array.isArray(d?.vendors)?d.vendors:Array.isArray(d?.businesses)?d.businesses:[];
const getId=v=>!v?"":typeof v==="string"?v:String(v?._id||v?.id||"");

export default function Vendors(){
 const [rows,setRows]=useState([]),[businesses,setBusinesses]=useState([]);
 const [selectedId,setSelectedId]=useState(""),[showForm,setShowForm]=useState(false),[showDelete,setShowDelete]=useState(false);
 const [mode,setMode]=useState("add"),[initial,setInitial]=useState(defaultFormData),[success,setSuccess]=useState(""); const t=useRef(null);

 const ok=m=>{if(t.current)clearTimeout(t.current);t.current=setTimeout(()=>setSuccess(""),2500);setSuccess(m)};

 const load=async()=>{
  const [b,r]=await Promise.all([fetch("/api/businesses"),fetch("/api/vendors")]);
  setBusinesses(getRows(await b.json()));
  const list=getRows(await r.json());
  setRows(list);
  if(list[0])setSelectedId(String(list[0]._id));
 };

 useEffect(()=>{load();return()=>t.current&&clearTimeout(t.current)},[]);

 const selected=useMemo(()=>rows.find(x=>String(x._id)===String(selectedId)),[rows,selectedId]);

 const openAdd=()=>{setMode("add");setInitial(defaultFormData);setShowForm(true)};
 const openEdit=()=>{if(!selected)return;setMode("edit");setInitial({...defaultFormData,...selected,business_id:getId(selected.business_id)});setShowForm(true)};
 const save=async(p)=>{const isEdit=mode==="edit";await fetch(isEdit?`/api/vendors/${selected._id}`:"/api/vendors",{method:isEdit?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});await load();setShowForm(false);ok(isEdit?"Updated":"Created")};
 const remove=async()=>{await fetch(`/api/vendors/${selected._id}`,{method:"DELETE"});await load();setShowDelete(false);ok("Deleted")};

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
