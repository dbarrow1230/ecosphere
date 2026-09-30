// src/pages/forms/AcquisitionSourceForm.jsx
import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";

const emptyForm={
 name:"",
 website:"",
 notes:""
};

async function fetchJson(url){
 const res=await fetch(url,{cache:"no-store"});
 const data=await res.json();
 if(!res.ok)throw new Error(data?.message||`Failed to load ${url}`);
 return data;
}

export default function AcquisitionSourceForm({mode,sourceId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const params=useParams();
 const id=sourceId||params.id||"";
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
    website:initialData?.website||"",
    notes:initialData?.notes||""
   });
   return;
  }

  if(!isEdit)return;

  let active=true;

  (async()=>{
   try{
    setLoading(true);
    setError("");
    const data=await fetchJson(`/api/acquisition-sources/${id}`);
    if(!active)return;
    const source=data?.acquisitionSource||data;
    setForm({
     name:source?.name||"",
     website:source?.website||"",
     notes:source?.notes||""
    });
   }catch(err){
    if(active)setError(err.message||"Failed to load acquisition source");
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

  const payload={
   name:form.name.trim(),
   website:form.website.trim(),
   notes:form.notes.trim()
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/acquisition-sources/${id}`:"/api/acquisition-sources",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} acquisition source`);
   const saved=data?.acquisitionSource||data;
   setSuccess(`Acquisition source ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   if(!isEdit)setForm(emptyForm);
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} acquisition source`);
  }finally{
   setSaving(false);
  }
 }

 if(loading)return <div className="container py-4">Loading...</div>;

 return(
  <div className="container py-3">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-3">
     <h1 className="m-0">{isEdit?"Edit Acquisition Source":"Add Acquisition Source"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger py-2">{error}</div>:null}
   {success?<div className="alert alert-success py-2">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="border rounded p-3 bg-white">
     <div className="row g-2 align-items-start mb-2">
      <div className="col-md-3 fw-semibold text-md-end pt-2">Name:</div>
      <div className="col-md-9">
       <input type="text" className="form-control" value={form.name} onChange={e=>setField("name",e.target.value)} required />
      </div>
     </div>

     <div className="row g-2 align-items-start mb-2">
      <div className="col-md-3 fw-semibold text-md-end pt-2">Website:</div>
      <div className="col-md-9">
       <input type="url" className="form-control" value={form.website} onChange={e=>setField("website",e.target.value)} />
      </div>
     </div>

     <div className="row g-2 align-items-start mb-2">
      <div className="col-md-3 fw-semibold text-md-end pt-2">Notes:</div>
      <div className="col-md-9">
       <textarea className="form-control" rows="4" value={form.notes} onChange={e=>setField("notes",e.target.value)} />
      </div>
     </div>
    </div>

    <div className="d-flex gap-2 pt-3">
     <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Source")}</button>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)} disabled={saving}>Cancel</button>
     {!isEdit?<button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving}>Reset</button>:null}
    </div>
   </form>
  </div>
 );
}