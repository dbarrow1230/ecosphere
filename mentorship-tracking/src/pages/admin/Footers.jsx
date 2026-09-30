//src/pages/admin/Footers.jsx
import {useEffect,useMemo,useRef,useState} from "react";
import {Modal,Button,Alert,Table,Accordion} from "react-bootstrap";
import FooterForm from "../forms/admin/FooterForm.jsx";
import "../../styles/Footers.css";

const defaultFormData={
 business_id:"",
 seasonRef:"",
 name:"",
 lines:[""],
 showDate:true,
 showTime:true,
 showCashier:false,
 isDefault:false,
 isActive:true,
 notes:""
};

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.footers))return data.footers;
 if(Array.isArray(data?.businesses))return data.businesses;
 if(Array.isArray(data?.seasons))return data.seasons;
 return [];
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||"");
 return "";
};

const formatValue=value=>{
 if(value===null||value===undefined||value==="")return "-";
 if(typeof value==="object")return value?.name||value?.legalName||value?.code||value?._id||"-";
 return String(value);
};

export default function Footers(){
 const [footers,setFooters]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [seasons,setSeasons]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [deleting,setDeleting]=useState(false);
 const [error,setError]=useState("");
 const [successMessage,setSuccessMessage]=useState("");
 const [showFormModal,setShowFormModal]=useState(false);
 const [showDeleteModal,setShowDeleteModal]=useState(false);
 const [modalMode,setModalMode]=useState("add");
 const [formInitialData,setFormInitialData]=useState(defaultFormData);
 const [activeFooter,setActiveFooter]=useState(null);
 const successTimerRef=useRef(null);

 const clearSuccessTimer=()=>{
  if(successTimerRef.current){
   clearTimeout(successTimerRef.current);
   successTimerRef.current=null;
  }
 };

 const showTimedSuccess=msg=>{
  clearSuccessTimer();
  setSuccessMessage(msg);
  successTimerRef.current=setTimeout(()=>{
   setSuccessMessage("");
   successTimerRef.current=null;
  },2500);
 };

 const loadBusinesses=async()=>{
  const res=await fetch("/api/businesses");
  const data=await res.json();
  setBusinesses(getRows(data));
 };

 const loadSeasons=async()=>{
  const res=await fetch("/api/seasons");
  const data=await res.json();
  setSeasons(getRows(data));
 };

 const loadFooters=async()=>{
  const res=await fetch("/api/footers");
  const data=await res.json();
  setFooters(getRows(data));
 };

 useEffect(()=>{
  (async()=>{
   try{
    setLoading(true);
    setError("");
    await Promise.all([loadBusinesses(),loadSeasons(),loadFooters()]);
   }catch(err){
    setError("Load failed");
   }finally{
    setLoading(false);
   }
  })();
  return()=>clearSuccessTimer();
 },[]);

 const footersByBusiness=useMemo(()=>{
  const grouped={};
  footers.forEach(f=>{
   const businessId=getId(f.business_id)||"unassigned";
   if(!grouped[businessId])grouped[businessId]=[];
   grouped[businessId].push(f);
  });
  return grouped;
 },[footers]);

 const openAdd=businessId=>{
  setModalMode("add");
  setActiveFooter(null);
  setFormInitialData({
   ...defaultFormData,
   business_id:businessId||""
  });
  setShowFormModal(true);
 };

 const openEdit=footer=>{
  if(!footer)return;
  setModalMode("edit");
  setActiveFooter(footer);
  setFormInitialData({
   ...defaultFormData,
   ...footer,
   business_id:getId(footer.business_id),
   seasonRef:getId(footer.seasonRef)
  });
  setShowFormModal(true);
 };

 const openDelete=footer=>{
  if(!footer)return;
  setActiveFooter(footer);
  setShowDeleteModal(true);
 };

 const save=async(payload)=>{
  try{
   setSaving(true);
   setError("");
   const isEdit=modalMode==="edit"&&activeFooter?._id;
   const url=isEdit?`/api/footers/${activeFooter._id}`:"/api/footers";
   const method=isEdit?"PUT":"POST";
   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   if(!res.ok)throw new Error("Save failed");
   await loadFooters();
   setShowFormModal(false);
   setActiveFooter(null);
   showTimedSuccess(isEdit?"Updated":"Created");
  }catch(err){
   setError("Save failed");
  }finally{
   setSaving(false);
  }
 };

 const remove=async()=>{
  if(!activeFooter?._id)return;
  try{
   setDeleting(true);
   setError("");
   const res=await fetch(`/api/footers/${activeFooter._id}`,{method:"DELETE"});
   if(!res.ok)throw new Error("Delete failed");
   await loadFooters();
   setShowDeleteModal(false);
   setActiveFooter(null);
   showTimedSuccess("Deleted");
  }catch(err){
   setError("Delete failed");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="footers-page">
   <div className="footers-wrap">

    <div className="footers-topbar">
     <h1>Footers</h1>
    </div>

    {error&&<Alert variant="danger">{error}</Alert>}
    {successMessage&&<Alert variant="success">{successMessage}</Alert>}

    {loading?(
     <div className="footers-loading">Loading...</div>
    ):(
     <Accordion alwaysOpen className="footers-accordion">
      {businesses.map((business,index)=>{
       const businessId=getId(business);
       const businessFooters=footersByBusiness[businessId]||[];

       return(
        <Accordion.Item eventKey={String(index)} key={businessId} className="footers-accordion-item">
         <Accordion.Header>
          <div className="footers-business-heading">
           <div className="footers-business-title">{business.legalName||business.name||"Business"}</div>
           <div className="footers-business-code">{formatValue(business.code)}</div>
          </div>
         </Accordion.Header>

         <Accordion.Body>
          <div className="footers-business-toolbar">
           <Button className="footers-action-btn" onClick={()=>openAdd(businessId)}>Add Footer</Button>
          </div>

          <div className="footers-table-wrap">
           <Table responsive className="footers-table">
            <thead>
             <tr>
              <th>Name</th>
              <th>Season</th>
              <th>Lines</th>
              <th>Show Date</th>
              <th>Show Time</th>
              <th>Show Cashier</th>
              <th>Default</th>
              <th>Active</th>
              <th>Notes</th>
              <th>Actions</th>
             </tr>
            </thead>
            <tbody>
             {businessFooters.length>0?businessFooters.map(footer=>(
              <tr key={footer._id}>
               <td>{footer.name||"-"}</td>
               <td>{formatValue(footer.seasonRef)}</td>
               <td>{Array.isArray(footer.lines)&&footer.lines.length>0?footer.lines.filter(Boolean).join(" | "):"-"}</td>
               <td>{footer.showDate?"Yes":"No"}</td>
               <td>{footer.showTime?"Yes":"No"}</td>
               <td>{footer.showCashier?"Yes":"No"}</td>
               <td>{footer.isDefault?"Yes":"No"}</td>
               <td>{footer.isActive?"Yes":"No"}</td>
               <td>{footer.notes||"-"}</td>
               <td>
                <div className="footers-actions">
                 <Button size="sm" className="footers-action-btn" onClick={()=>openEdit(footer)}>Edit</Button>
                 <Button size="sm" variant="danger" className="footers-delete-btn" onClick={()=>openDelete(footer)}>Delete</Button>
                </div>
               </td>
              </tr>
             )):(
              <tr>
               <td colSpan="10" className="footers-empty-cell">No footers for this business.</td>
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
     <div className="footers-empty-state">No businesses found.</div>
    )}

    <Modal show={showFormModal} onHide={()=>setShowFormModal(false)} size="xl" centered backdrop="static" keyboard={false}>
     <Modal.Body>
      <FooterForm
       initialData={formInitialData}
       onSubmit={save}
       loading={saving}
       businesses={businesses}
       seasons={seasons}
      />
     </Modal.Body>
    </Modal>

    <Modal show={showDeleteModal} onHide={()=>setShowDeleteModal(false)} centered>
     <Modal.Body>Confirm delete?</Modal.Body>
     <Modal.Footer>
      <Button onClick={()=>setShowDeleteModal(false)}>Cancel</Button>
      <Button variant="danger" onClick={remove} disabled={deleting}>{deleting?"Deleting...":"Delete"}</Button>
     </Modal.Footer>
    </Modal>

   </div>
  </div>
 );
}
