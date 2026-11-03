// /src/pages/forms/ContactForm.jsx
import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

const emptyForm={
 name:"",
 phone:"",
 email:"",
 lentAt:"",
 returnedAt:"",
 conditionOut:"",
 conditionIn:"",
 notes:"",
 isActive:true
};

function toInputDate(value){
 if(!value)return "";
 const d=new Date(value);
 if(Number.isNaN(d.getTime()))return "";
 return d.toISOString().slice(0,10);
}

function toCsv(value){
 if(!Array.isArray(value))return "";
 return value.filter(Boolean).join(", ");
}

function fromCsv(value){
 return value.split(",").map(item=>item.trim()).filter(Boolean);
}

export default function ContactForm({mode,contactId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=contactId||routeId||"";
 const isEdit=mode?mode==="edit":!!id;
 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  if(initialData){
   setForm({
    name:initialData?.name||"",
    phone:initialData?.phone||"",
    email:initialData?.email||"",
    lentAt:toInputDate(initialData?.lentAt),
    returnedAt:toInputDate(initialData?.returnedAt),
    conditionOut:initialData?.conditionOut||"",
    conditionIn:initialData?.conditionIn||"",
    notes:toCsv(initialData?.notes),
    isActive:typeof initialData?.isActive==="boolean"?initialData.isActive:true
   });
   setLoading(false);
   return;
  }
  if(!isEdit)return;
  let active=true;
  (async()=>{
   try{
    setLoading(true);
    setError("");
    const res=await fetch(`/api/contacts/${id}`);
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load contact");
    const contact=data?.contact||data;
    if(!active)return;
    setForm({
     name:contact?.name||"",
     phone:contact?.phone||"",
     email:contact?.email||"",
     lentAt:toInputDate(contact?.lentAt),
     returnedAt:toInputDate(contact?.returnedAt),
     conditionOut:contact?.conditionOut||"",
     conditionIn:contact?.conditionIn||"",
     notes:toCsv(contact?.notes),
     isActive:typeof contact?.isActive==="boolean"?contact.isActive:true
    });
   }catch(err){
    if(active)setError(err.message||"Failed to load contact");
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[id,isEdit,initialData]);

 function setField(name,value){
  setForm(prev=>({...prev,[name]:value}));
 }

 async function handleSubmit(e){
  e.preventDefault();
  if(saving)return;
  setError("");
  setSuccess("");

  if(!form.name.trim()){
   setError("Name is required.");
   return;
  }

  if(form.phone.trim()&&!/^\+?[0-9\s\-().]{7,20}$/.test(form.phone.trim())){
   setError("Invalid phone number.");
   return;
  }

  if(form.email.trim()&&!/^\S+@\S+\.\S+$/.test(form.email.trim().toLowerCase())){
   setError("Invalid email address.");
   return;
  }

  if(form.lentAt&&form.returnedAt&&new Date(form.returnedAt)<new Date(form.lentAt)){
   setError("Returned date cannot be before lent date.");
   return;
  }

  const payload={
   name:form.name.trim(),
   phone:form.phone.trim(),
   email:form.email.trim().toLowerCase(),
   lentAt:form.lentAt||null,
   returnedAt:form.returnedAt||null,
   conditionOut:form.conditionOut.trim(),
   conditionIn:form.conditionIn.trim(),
   notes:fromCsv(form.notes),
   isActive:!!form.isActive
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/contacts/${id}`:"/api/contacts",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} contact`);
   const saved=data?.contact||data;
   setSuccess(`Contact ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   navigate(saved?._id?`/contacts/${saved._id}`:"/contacts");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} contact`);
  }finally{
   setSaving(false);
  }
 }

 if(loading){
  return <div className="container py-4">Loading...</div>;
 }

 return (
  <div className="container py-4">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-4">
     <h1 className="m-0">{isEdit?"Edit Contact":"Add Contact"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger">{error}</div>:null}
   {success?<div className="alert alert-success">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="row g-3">
     <div className="col-md-6">
      <label className="form-label">Name</label>
      <input type="text" className="form-control" value={form.name} onChange={e=>setField("name",e.target.value)} required />
     </div>

     <div className="col-md-3">
      <label className="form-label">Phone</label>
      <PhoneInput
       country="us"
       value={form.phone}
       onChange={value=>setField("phone",value?`+${value}`:"")}
       inputClass="form-control w-100"
       containerClass="w-100"
       buttonClass=""
       inputProps={{name:"phone"}}
      />
     </div>

     <div className="col-md-3">
      <label className="form-label">Email</label>
      <input type="email" className="form-control" value={form.email} onChange={e=>setField("email",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Lent At</label>
      <input type="date" className="form-control" value={form.lentAt} onChange={e=>setField("lentAt",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Returned At</label>
      <input type="date" className="form-control" value={form.returnedAt} min={form.lentAt||undefined} onChange={e=>setField("returnedAt",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Condition Out</label>
      <input type="text" className="form-control" value={form.conditionOut} onChange={e=>setField("conditionOut",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Condition In</label>
      <input type="text" className="form-control" value={form.conditionIn} onChange={e=>setField("conditionIn",e.target.value)} />
     </div>

     <div className="col-12">
      <label className="form-label">Notes</label>
      <textarea className="form-control" rows="3" value={form.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Comma-separated notes" />
     </div>

     <div className="col-12">
      <div className="form-check">
       <input id="isActive" type="checkbox" className="form-check-input" checked={form.isActive} onChange={e=>setField("isActive",e.target.checked)} />
       <label htmlFor="isActive" className="form-check-label">Active</label>
      </div>
     </div>

     <div className="col-12 d-flex gap-2 pt-2">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Contact")}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving||isEdit}>Reset</button>
     </div>
    </div>
   </form>
  </div>
 );
}