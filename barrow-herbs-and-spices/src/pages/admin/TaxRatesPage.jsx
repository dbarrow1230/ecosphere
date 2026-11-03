//src/pages/admin/TaxRatesPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Col,Form,Modal,Row,Table,Badge} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";
import TaxRateForm from "../forms/admin/TaxRateForm.jsx";

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
 const [query,setQuery]=useState("");
 const [stateFilter,setStateFilter]=useState("");
 const [activeFilter,setActiveFilter]=useState("all");
 const [showModal,setShowModal]=useState(false);
 const [editingItem,setEditingItem]=useState(null);
 const [status,setStatus]=useState({show:false,variant:"success",message:""});

 const filteredRows=useMemo(()=>{
  return rows.filter(item=>{
   const matchesQuery=!query.trim()||[
    item?.name,
    item?.code,
    getStateLabel(item?.stateRef),
    item?.notes
   ].some(value=>String(value||"").toLowerCase().includes(query.trim().toLowerCase()));
   const matchesState=!stateFilter||getObjectId(item?.stateRef)===stateFilter;
   const matchesActive=activeFilter==="all"||String(!!item?.isActive)===activeFilter;
   return matchesQuery&&matchesState&&matchesActive;
  });
 },[rows,query,stateFilter,activeFilter]);

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
   <div className="businesses-topbar">
    <div>
     <h1 className="businesses-title">Tax Rates</h1>
     <div className="businesses-subtitle">Manage tax rates by state.</div>
    </div>
    <div className="d-flex align-items-center gap-2">
     <Button type="button" onClick={handleAdd}>Add Tax Rate</Button>
     <div className="businesses-total">Total: <strong>{filteredRows.length}</strong></div>
    </div>
   </div>

   {status.show?(
    <Alert variant={status.variant} dismissible onClose={()=>setStatus(prev=>({...prev,show:false}))} className="mb-3">
     {status.message}
    </Alert>
   ):null}

   <section className="businesses-card admin-reference-card">
    <div className="admin-reference-card-header">Tax Rates</div>
    <div className="admin-reference-card-body">
     <Row className="g-3 align-items-end mb-3">
      <Col md={4}>
       <Form.Label className="fw-semibold">Search</Form.Label>
       <Form.Control
        type="text"
        value={query}
        onChange={e=>setQuery(e.target.value)}
        placeholder="Search tax rates"
       />
      </Col>

      <Col md={3}>
       <Form.Label className="fw-semibold">State</Form.Label>
       <Form.Select value={stateFilter} onChange={e=>setStateFilter(e.target.value)}>
        <option value="">All States</option>
        {states.map(item=>(
         <option key={getObjectId(item)} value={getObjectId(item)}>
          {getStateLabel(item)}
         </option>
        ))}
       </Form.Select>
      </Col>

      <Col md={3}>
       <Form.Label className="fw-semibold">Status</Form.Label>
       <Form.Select value={activeFilter} onChange={e=>setActiveFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
       </Form.Select>
      </Col>

      <Col md={2}>
       <div className="d-grid">
        <Button type="button" onClick={handleAdd}>Add Tax Rate</Button>
       </div>
      </Col>
     </Row>

     <div className="table-responsive">
      <Table striped hover className="align-middle mb-0">
       <thead>
        <tr>
         <th>Name</th>
         <th>Code</th>
         <th>State</th>
         <th>Rate</th>
         <th>Default</th>
         <th>Status</th>
         <th className="text-end">Actions</th>
        </tr>
       </thead>
       <tbody>
        {!loading&&filteredRows.length===0?(
         <tr>
          <td colSpan={7} className="text-center py-4">No tax rates found.</td>
         </tr>
        ):null}

        {filteredRows.map(item=>(
         <tr key={getObjectId(item)}>
          <td>{item?.name||""}</td>
          <td>{item?.code||""}</td>
          <td>{getStateLabel(item?.stateRef)}</td>
          <td>{Number(item?.rate||0).toFixed(3)}%</td>
          <td>{item?.isDefault?<Badge bg="success">Default</Badge>:""}</td>
          <td>{item?.isActive?<Badge bg="primary">Active</Badge>:<Badge bg="secondary">Inactive</Badge>}</td>
          <td className="text-end">
           <div className="d-inline-flex gap-2">
            <Button type="button" size="sm" variant="outline-primary" onClick={()=>handleEdit(item)}>Edit</Button>
            <Button type="button" size="sm" variant="outline-danger" disabled={deletingId===getObjectId(item)} onClick={()=>handleDelete(item)}>
             {deletingId===getObjectId(item)?"Deleting...":"Delete"}
            </Button>
           </div>
          </td>
         </tr>
        ))}

        {loading?(
         <tr>
          <td colSpan={7} className="text-center py-4">Loading...</td>
         </tr>
        ):null}
       </tbody>
      </Table>
     </div>
    </div>
   </section>

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
