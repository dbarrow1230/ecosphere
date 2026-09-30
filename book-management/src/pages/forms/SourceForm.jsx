// /src/pages/forms/SourceForm.jsx
import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";

const emptyForm={
 name:"",
 type:"",
 domestic:true,
 addressLine1:"",
 addressLine2:"",
 city:"",
 state:"",
 postalCode:"",
 country:"",
 website:"",
 contactName:"",
 email:"",
 phone:"",
 notes:""
};

function getId(value){
 if(!value)return "";
 return typeof value==="object"?value?._id||"":value;
}

function toCsv(value){
 if(!Array.isArray(value))return "";
 return value.filter(Boolean).join(", ");
}

function fromCsv(value){
 return value.split(",").map(item=>item.trim()).filter(Boolean);
}

export default function SourceForm({mode,sourceId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=sourceId||routeId||"";
 const isEdit=mode?mode==="edit":!!id;
 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [countries,setCountries]=useState([]);
 const [states,setStates]=useState([]);
 const [lookupLoading,setLookupLoading]=useState(true);

 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    setLookupLoading(true);
    const [countriesRes,statesRes]=await Promise.all([
     fetch("/api/countries"),
     fetch("/api/states")
    ]);
    const [countriesData,statesData]=await Promise.all([
     countriesRes.json(),
     statesRes.json()
    ]);
    if(!active)return;
    setCountries(Array.isArray(countriesData)?countriesData:(countriesData?.countries||countriesData?.items||[]));
    setStates(Array.isArray(statesData)?statesData:(statesData?.states||statesData?.items||[]));
   }catch(err){
    if(active)setError(prev=>prev||"Failed to load lookup data");
   }finally{
    if(active)setLookupLoading(false);
   }
  })();
  return()=>{active=false;};
 },[]);

 useEffect(()=>{
  if(initialData){
   setForm({
    name:initialData?.name||"",
    type:initialData?.type||"",
    domestic:typeof initialData?.domestic==="boolean"?initialData.domestic:true,
    addressLine1:initialData?.addressLine1||"",
    addressLine2:initialData?.addressLine2||"",
    city:initialData?.city||"",
    state:getId(initialData?.state),
    postalCode:initialData?.postalCode||"",
    country:getId(initialData?.country),
    website:initialData?.website||"",
    contactName:initialData?.contactName||"",
    email:initialData?.email||"",
    phone:initialData?.phone||"",
    notes:toCsv(initialData?.notes)
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
    const res=await fetch(`/api/sources/${id}`);
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load source");
    const source=data?.source||data;
    if(!active)return;
    setForm({
     name:source?.name||"",
     type:source?.type||"",
     domestic:typeof source?.domestic==="boolean"?source.domestic:true,
     addressLine1:source?.addressLine1||"",
     addressLine2:source?.addressLine2||"",
     city:source?.city||"",
     state:getId(source?.state),
     postalCode:source?.postalCode||"",
     country:getId(source?.country),
     website:source?.website||"",
     contactName:source?.contactName||"",
     email:source?.email||"",
     phone:source?.phone||"",
     notes:toCsv(source?.notes)
    });
   }catch(err){
    if(active)setError(err.message||"Failed to load source");
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

  if(form.email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim().toLowerCase())){
   setError("Invalid email address.");
   return;
  }

  if(form.phone.trim()&&!/^[0-9+\-().\s]{7,20}$/.test(form.phone.trim())){
   setError("Invalid phone number.");
   return;
  }

  const payload={
   name:form.name.trim(),
   type:form.type.trim(),
   domestic:!!form.domestic,
   addressLine1:form.addressLine1.trim(),
   addressLine2:form.addressLine2.trim(),
   city:form.city.trim(),
   state:form.state||null,
   postalCode:form.postalCode.trim(),
   country:form.country||null,
   website:form.website.trim(),
   contactName:form.contactName.trim(),
   email:form.email.trim().toLowerCase(),
   phone:form.phone.trim(),
   notes:fromCsv(form.notes)
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/sources/${id}`:"/api/sources",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} source`);
   const saved=data?.source||data;
   setSuccess(`Source ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   navigate(saved?._id?`/sources/${saved._id}`:"/sources");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} source`);
  }finally{
   setSaving(false);
  }
 }

 if(loading||lookupLoading){
  return <div className="container py-4">Loading...</div>;
 }

 return (
  <div className="container py-4">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-4">
     <h1 className="m-0">{isEdit?"Edit Source":"Add Source"}</h1>
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
      <label className="form-label">Type</label>
      <input type="text" className="form-control" value={form.type} onChange={e=>setField("type",e.target.value)} />
     </div>

     <div className="col-md-3 d-flex align-items-end">
      <div className="form-check mb-2">
       <input id="domestic" type="checkbox" className="form-check-input" checked={form.domestic} onChange={e=>setField("domestic",e.target.checked)} />
       <label htmlFor="domestic" className="form-check-label">Domestic</label>
      </div>
     </div>

     <div className="col-md-6">
      <label className="form-label">Address Line 1</label>
      <input type="text" className="form-control" value={form.addressLine1} onChange={e=>setField("addressLine1",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Address Line 2</label>
      <input type="text" className="form-control" value={form.addressLine2} onChange={e=>setField("addressLine2",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">City</label>
      <input type="text" className="form-control" value={form.city} onChange={e=>setField("city",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">State</label>
      <select className="form-select" value={form.state} onChange={e=>setField("state",e.target.value)}>
       <option value="">Select state</option>
       {states.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
      </select>
     </div>

     <div className="col-md-3">
      <label className="form-label">Postal Code</label>
      <input type="text" className="form-control" value={form.postalCode} onChange={e=>setField("postalCode",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Country</label>
      <select className="form-select" value={form.country} onChange={e=>setField("country",e.target.value)}>
       <option value="">Select country</option>
       {countries.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
      </select>
     </div>

     <div className="col-md-4">
      <label className="form-label">Website</label>
      <input type="text" className="form-control" value={form.website} onChange={e=>setField("website",e.target.value)} />
     </div>

     <div className="col-md-4">
      <label className="form-label">Contact Name</label>
      <input type="text" className="form-control" value={form.contactName} onChange={e=>setField("contactName",e.target.value)} />
     </div>

     <div className="col-md-2">
      <label className="form-label">Email</label>
      <input type="email" className="form-control" value={form.email} onChange={e=>setField("email",e.target.value)} />
     </div>

     <div className="col-md-2">
      <label className="form-label">Phone</label>
      <input type="text" className="form-control" value={form.phone} onChange={e=>setField("phone",e.target.value)} />
     </div>

     <div className="col-12">
      <label className="form-label">Notes</label>
      <textarea className="form-control" rows="3" value={form.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Comma-separated notes" />
     </div>

     <div className="col-12 d-flex gap-2 pt-2">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Source")}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving||isEdit}>Reset</button>
     </div>
    </div>
   </form>
  </div>
 );
}
