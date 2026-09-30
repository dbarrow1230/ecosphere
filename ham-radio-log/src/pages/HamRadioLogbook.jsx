import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Container,Form,Modal,Spinner,Table} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import HamRadioQsoForm from "./forms/HamRadioQsoForm.jsx";
import "../styles/Logbook.css";

const getToken=()=>localStorage.getItem("token")||sessionStorage.getItem("token")||"";
const authHeaders=extra=>({Authorization:`Bearer ${getToken()}`,...extra});
const readResponse=async response=>{
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||"The QSO request failed");
 return data;
};
const locationName=value=>typeof value==="object"&&value?value.name||value.abbreviation||"":"";

export default function HamRadioLogbook({user}){
 const [searchParams,setSearchParams]=useSearchParams();
 const [qsos,setQsos]=useState([]);
 const [operatorIdentity,setOperatorIdentity]=useState({hamRadioCallSign:"",cbHandle:""});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [alert,setAlert]=useState(null);
 const [formError,setFormError]=useState("");
 const [search,setSearch]=useState("");
 const [editing,setEditing]=useState(null);
 const [showForm,setShowForm]=useState(false);

 const loadQsos=useCallback(async()=>{
  setLoading(true);setError("");
  try{setQsos(await readResponse(await fetch("/api/qsos",{headers:authHeaders()})));}
  catch(loadError){setError(loadError.message);}
  finally{setLoading(false);}
 },[]);

 useEffect(()=>{loadQsos();},[loadQsos]);
 useEffect(()=>{
  if(!alert)return undefined;
  const timer=window.setTimeout(()=>setAlert(null),5000);
  return()=>window.clearTimeout(timer);
 },[alert]);
 useEffect(()=>{
  if(!error)return undefined;
  const timer=window.setTimeout(()=>setError(""),5000);
  return()=>window.clearTimeout(timer);
 },[error]);
 useEffect(()=>{
  if(!formError)return undefined;
  const timer=window.setTimeout(()=>setFormError(""),5000);
  return()=>window.clearTimeout(timer);
 },[formError]);
 useEffect(()=>{
  if(searchParams.get("new")==="1"){
   const nextParams=new URLSearchParams(searchParams);
   nextParams.delete("new");
   setSearchParams(nextParams,{replace:true});
   setEditing(null);
   setFormError("");
   setShowForm(true);
  }
 },[searchParams,setSearchParams]);
 useEffect(()=>{
  let ignore=false;
  const userId=user?._id||user?.id;
  const embeddedDetails=typeof user?.details==="object"?user.details:null;
  if(embeddedDetails){setOperatorIdentity({hamRadioCallSign:String(embeddedDetails.hamRadioCallSign||"").toUpperCase(),cbHandle:String(embeddedDetails.cbHandle||"")});return undefined;}
  if(!userId)return undefined;
  fetch(`/api/users/details/user/${userId}`)
   .then(response=>response.json().then(data=>({response,data})))
   .then(({response,data})=>{if(!ignore&&response.ok){const details=data?.data?.[0]||{};setOperatorIdentity({hamRadioCallSign:String(details.hamRadioCallSign||"").toUpperCase(),cbHandle:String(details.cbHandle||"")});}})
   .catch(()=>{});
  return()=>{ignore=true;};
 },[user]);

 const filteredQsos=useMemo(()=>{
  const query=search.trim().toLowerCase();
  if(!query)return qsos;
  return qsos.filter(qso=>[qso.callSign,qso.operatorCallSign,qso.band,qso.mode,qso.contactName,qso.qth,locationName(qso.countryRef),locationName(qso.stateRef)].some(value=>String(value||"").toLowerCase().includes(query)));
 },[qsos,search]);

 const saveQso=async payload=>{
  setSaving(true);setError("");setFormError("");setAlert(null);
  try{
   const wasEditing=!!editing;
   await readResponse(await fetch(editing?`/api/qsos/${editing._id}`:"/api/qsos",{method:editing?"PUT":"POST",headers:authHeaders({"Content-Type":"application/json"}),body:JSON.stringify(payload)}));
   setShowForm(false);setEditing(null);setSearchParams({}, {replace:true});
   setAlert({variant:"success",message:wasEditing?"QSO updated successfully.":"QSO saved successfully."});
   await loadQsos();
  }catch(saveError){setFormError(saveError.message||"Failed to save QSO.");}
  finally{setSaving(false);}
 };

 const deleteQso=async qso=>{
  if(!window.confirm(`Delete the ${qso.callSign} QSO?`))return;
  try{await readResponse(await fetch(`/api/qsos/${qso._id}`,{method:"DELETE",headers:authHeaders()}));setAlert({variant:"success",message:"QSO deleted successfully."});await loadQsos();}
  catch(deleteError){setAlert({variant:"danger",message:deleteError.message||"Failed to delete QSO."});}
 };

 return <Container fluid="lg" className="logbook-page py-4">
  <div className="logbook-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div><h1 className="logbook-title mb-1">Ham Radio QSO Logbook</h1><p className="logbook-text mb-0">Create, review, edit, and confirm radio contacts.</p></div><Button onClick={()=>{setEditing(null);setFormError("");setShowForm(true);}} className="logbook-primary-button">Log a QSO</Button></div>
  {alert?<Alert variant={alert.variant} dismissible onClose={()=>setAlert(null)}>{alert.message}</Alert>:null}
  {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
  <Card className="logbook-card"><Card.Body>
   <Form.Control type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search call sign, band, mode, operator, or location" className="logbook-search mb-3"/>
   {loading?<div className="text-center py-5"><Spinner animation="border"/><div className="logbook-text mt-2">Loading logbook...</div></div>:filteredQsos.length===0?<div className="logbook-empty text-center py-5">{qsos.length===0?"No QSOs logged yet.":"No QSOs match this search."}</div>:<div className="table-responsive"><Table hover className="logbook-table align-middle mb-0"><thead><tr><th>Date</th><th>Call Sign</th><th>Operator</th><th>Band</th><th>Mode</th><th>Frequency</th><th>RST</th><th>QTH</th><th>QSL</th><th className="text-end">Actions</th></tr></thead><tbody>{filteredQsos.map(qso=><tr key={qso._id}><td>{new Date(qso.contactDate).toLocaleString()}</td><td className="logbook-call-sign">{qso.callSign}</td><td>{qso.operatorCallSign}</td><td>{qso.band}</td><td>{qso.mode}</td><td>{qso.frequencyMHz??"—"}</td><td>{qso.rstSent||"—"} / {qso.rstReceived||"—"}</td><td>{qso.qth||locationName(qso.stateRef)||locationName(qso.countryRef)||"—"}</td><td><Badge className={qso.qslStatus==="confirmed"?"logbook-badge-confirmed":"logbook-badge-default"}>{String(qso.qslStatus||"").replace("-"," ")}</Badge></td><td className="text-end text-nowrap"><Button size="sm" onClick={()=>{setEditing(qso);setFormError("");setShowForm(true);}} className="logbook-edit-button">Edit</Button>{" "}<Button size="sm" onClick={()=>deleteQso(qso)} className="logbook-delete-button">Delete</Button></td></tr>)}</tbody></Table></div>}
  </Card.Body></Card>
  <Modal show={showForm} onHide={()=>{if(!saving){setShowForm(false);setFormError("");setSearchParams({}, {replace:true});}}} size="lg" centered scrollable className="logbook-qso-modal"><Modal.Header closeButton><Modal.Title>{editing?`Edit ${editing.callSign}`:"Log a QSO"}</Modal.Title></Modal.Header><Modal.Body>{formError?<Alert variant="danger" dismissible onClose={()=>setFormError("")}>{formError}</Alert>:null}<HamRadioQsoForm key={editing?._id||"new"} initialData={editing} hamRadioCallSign={operatorIdentity.hamRadioCallSign} cbHandle={operatorIdentity.cbHandle} onSubmit={saveQso} onCancel={()=>{setShowForm(false);setFormError("");setSearchParams({}, {replace:true});}} saving={saving}/></Modal.Body></Modal>
 </Container>;
}
