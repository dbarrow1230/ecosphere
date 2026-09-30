// src/pages/forms/MeetingMethodForm.jsx
import {useEffect,useState} from "react";

const getStoredUser=()=>{
 const keys=["userInfo","user","authUser","currentUser"];

 for(const key of keys){
  try{
   const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
   if(!raw)continue;

   const parsed=JSON.parse(raw);

   if(parsed?._id||parsed?.id)return parsed;
   if(parsed?.user?._id||parsed?.user?.id)return parsed.user;
   if(parsed?.data?._id||parsed?.data?.id)return parsed.data;
  }catch(err){
   console.error(`Failed to parse stored user from ${key}`,err);
  }
 }

 return null;
};

const getInitialForm=method=>({
 name:method?.name||"",
 description:method?.description||"",
 isActive:method?.isActive??true
});

function MeetingMethodForm({method,onSuccess,onCancel,user}){
 const [form,setForm]=useState(getInitialForm(method));
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [storedUser,setStoredUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  setForm(getInitialForm(method));
  setError("");
 },[method]);

 useEffect(()=>{
  setStoredUser(getStoredUser());
 },[]);

 const currentUser=user?._id||user?.id?user:storedUser;
 const currentUserId=currentUser?._id||currentUser?.id||"";

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");

   const payload={
    name:form.name.trim(),
    description:form.description.trim(),
    isActive:Boolean(form.isActive),
    createdBy:currentUserId||null
   };

   const url=method?._id?`/api/meeting-methods/${method._id}`:"/api/meeting-methods";
   const methodType=method?._id?"PUT":"POST";

   const res=await fetch(url,{
    method:methodType,
    credentials:"include",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data?.error||data?.message||"Failed to save meeting method");
   }

   if(onSuccess)onSuccess(data);
  }catch(err){
   setError(err.message||"Failed to save meeting method");
  }finally{
   setSaving(false);
  }
 };

 return(
  <form className="meeting-method-form" onSubmit={handleSubmit} autoComplete="off">
   {error?<div className="app-feedback app-feedback-danger" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={()=>setError("")}>×</button></div>:null}

   <div className="row g-2 align-items-center meeting-method-row">
    <label htmlFor="name" className="col-auto col-form-label">Name:</label>
    <div className="col meeting-method-control">
     <input id="name" className="form-control" name="name" value={form.name} onChange={handleChange} autoComplete="off" required />
    </div>
   </div>

   <div className="row g-2 align-items-start meeting-method-row">
    <label htmlFor="description" className="col-auto col-form-label">Description:</label>
    <div className="col meeting-method-control">
     <input id="description" className="form-control" name="description" value={form.description} onChange={handleChange} autoComplete="off" />
    </div>
   </div>

   <div className="row g-2 align-items-center meeting-method-row">
    <span className="col-auto col-form-label meeting-method-label">Status:</span>
    <div className="col meeting-method-control">
     <label htmlFor="isActive" className={`meeting-method-status-toggle ${form.isActive?"is-active":"is-inactive"}`}>
      <input id="isActive" className="visually-hidden" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
      <span aria-hidden="true">{form.isActive?"✓":"×"}</span>
      <strong>{form.isActive?"Active":"Inactive"}</strong>
     </label>
    </div>
   </div>

   <div className="meeting-method-actions">
    {onCancel?<button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>:null}
    <button type="submit" className="btn btn-primary" disabled={saving}>
     {saving?(method?._id?"Saving...":"Creating..."):(method?._id?"Update Method":"Create Method")}
    </button>
   </div>
  </form>
 );
}

export default MeetingMethodForm;
