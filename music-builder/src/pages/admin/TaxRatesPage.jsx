//src/pages/admin/TaxRatesPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Form,Modal,Alert,Badge,ButtonGroup} from "react-bootstrap";
import TaxRateForm from "../forms/admin/TaxRateForm.jsx";
import AdminCatalogWorkspace from "../../components/AdminCatalogWorkspace.jsx";

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return String(value?._id||value?.id||value?.value||"");
 return "";
};

const getStateLabel=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value?.name||value?.title||value?.code||"";
};

export default function TaxRatesPage(){
 const [rows,setRows]=useState([]);
 const [states,setStates]=useState([]);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [deletingId,setDeletingId]=useState("");
 const [stateFilter,setStateFilter]=useState("");
 const [selectedId,setSelectedId]=useState("");
 const [showModal,setShowModal]=useState(false);
 const [editingItem,setEditingItem]=useState(null);
 const [status,setStatus]=useState({show:false,variant:"success",message:""});

 const filteredRows=useMemo(()=>{
  return rows.filter(item=>{
   const matchesState=!stateFilter||getObjectId(item?.stateRef)===stateFilter;
   return matchesState;
  });
 },[rows,stateFilter]);
 const selectedItem=rows.find(item=>getObjectId(item)===selectedId)||null;

 useEffect(()=>{
  if(!status.show)return;
  const timer=setTimeout(()=>{
   setStatus(prev=>({...prev,show:false}));
  },10000);
  return()=>clearTimeout(timer);
 },[status]);

 const showTimedStatus=(variant,message)=>{
  setStatus({show:true,variant,message});
 };

 const loadStates=async()=>{
  try{
   const res=await fetch("/api/states",{headers:{"Content-Type":"application/json"}});
   if(!res.ok)throw new Error("Failed to fetch states.");
   const data=await res.json().catch(()=>[]);
   const nextRows=Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.states)?data.states:[];
   setStates(nextRows);
  }catch(error){
   showTimedStatus("danger",error?.message||"Unable to load states.");
  }
 };

 const loadRows=async()=>{
  setLoading(true);
  try{
   const res=await fetch("/api/tax-rates",{headers:{"Content-Type":"application/json"}});
   if(!res.ok)throw new Error("Failed to fetch tax rates.");
   const data=await res.json().catch(()=>[]);
   const nextRows=Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.taxRates)?data.taxRates:[];
   setRows(nextRows);
   setSelectedId(current=>nextRows.some(item=>getObjectId(item)===current)?current:getObjectId(nextRows[0]));
  }catch(error){
   showTimedStatus("danger",error?.message||"Unable to load tax rates.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  queueMicrotask(()=>{
   loadStates();
   loadRows();
  });
 },[]);

 const handleAdd=()=>{
  setEditingItem(null);
  setShowModal(true);
 };

 const handleEdit=item=>{
  setEditingItem(item);
  setShowModal(true);
 };

 const handleSave=async payload=>{
  setSaving(true);
  try{
   const isEdit=!!getObjectId(editingItem?._id||payload?._id);
   const targetId=getObjectId(editingItem?._id||payload?._id);
   const res=await fetch(isEdit?`/api/tax-rates/${targetId}`:"/api/tax-rates",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} tax rate.`);
   await loadRows();
   setShowModal(false);
   setEditingItem(null);
   showTimedStatus("success",`Tax rate ${isEdit?"updated":"created"} successfully.`);
   return data;
  }catch(error){
   showTimedStatus("danger",error?.message||"Unable to save tax rate.");
   throw error;
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async item=>{
  const targetId=getObjectId(item?._id);
  if(!targetId)return;
  const confirmed=window.confirm(`Delete tax rate "${item?.name||""}"?`);
  if(!confirmed)return;
  setDeletingId(targetId);
  try{
   const res=await fetch(`/api/tax-rates/${targetId}`,{
    method:"DELETE",
    headers:{"Content-Type":"application/json"}
   });
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||"Failed to delete tax rate.");
   await loadRows();
   showTimedStatus("success","Tax rate deleted successfully.");
  }catch(error){
   showTimedStatus("danger",error?.message||"Unable to delete tax rate.");
  }finally{
   setDeletingId("");
  }
 };

 return(
  <div className="admin-reference-page">
   {status.show?(
    <Alert variant={status.variant} dismissible onClose={()=>setStatus(prev=>({...prev,show:false}))} className="mb-3">
     {status.message}
    </Alert>
   ):null}

   <div className="admin-catalog-context-filter"><Form.Select aria-label="Filter tax rates by state" value={stateFilter} onChange={e=>setStateFilter(e.target.value)}><option value="">All states</option>{states.map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getStateLabel(item)}</option>)}</Form.Select></div>
   <AdminCatalogWorkspace title="Tax Rates" description="Manage tax-rate records assigned to this app business." records={filteredRows}
    selectedId={selectedId} onSelect={setSelectedId} onAdd={handleAdd} addLabel="Add Tax Rate" loading={loading} emptyMessage="No tax rates found."
    searchPlaceholder="Search tax rates..." getId={getObjectId} getName={item=>item.name||"Unnamed tax rate"} getCode={item=>item.code||"NO CODE"}
    getDescription={item=>`${getStateLabel(item.stateRef)||"All states"} - ${Number(item.rate||0).toFixed(3)}%`} isActive={item=>item.isActive}
    actions={selectedItem?<ButtonGroup size="sm"><Button variant="outline-primary" onClick={()=>handleEdit(selectedItem)}>Edit</Button><Button variant="outline-danger" disabled={deletingId===selectedId} onClick={()=>handleDelete(selectedItem)}>{deletingId===selectedId?"Deleting...":"Delete"}</Button></ButtonGroup>:null}>
    {selectedItem?<><h2>{selectedItem.name}</h2><p className="text-muted">{selectedItem.notes||"No notes."}</p><div className="admin-catalog-detail-grid">
     <div><span>Code</span><strong>{selectedItem.code||"-"}</strong></div><div><span>State</span><strong>{getStateLabel(selectedItem.stateRef)||"All states"}</strong></div>
     <div><span>Rate</span><strong>{Number(selectedItem.rate||0).toFixed(3)}%</strong></div><div><span>Default</span><strong>{selectedItem.isDefault?"Yes":"No"}</strong></div>
     <div><span>Status</span><Badge bg={selectedItem.isActive?"success":"secondary"}>{selectedItem.isActive?"Active":"Inactive"}</Badge></div>
    </div></>:null}
   </AdminCatalogWorkspace>

   <Modal show={showModal} onHide={()=>{setShowModal(false);setEditingItem(null);}} centered backdrop="static" size="lg">
    <Modal.Header closeButton>
     <Modal.Title>{editingItem?"Edit Tax Rate":"Add Tax Rate"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <TaxRateForm
      initialData={editingItem||{}}
      onSubmit={handleSave}
      onSaved={()=>{}}
      onHide={()=>{
       setShowModal(false);
       setEditingItem(null);
      }}
      loading={saving}
      states={states}
     />
    </Modal.Body>
   </Modal>
  </div>
 );
}
