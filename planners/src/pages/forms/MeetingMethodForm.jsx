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
  <form onSubmit={handleSubmit} autoComplete="off">
   {error?<div className="alert alert-danger mb-3">{error}</div>:null}

   <div className="row mb-3 align-items-center">
    <label htmlFor="name" className="col-sm-3 col-form-label">Name</label>
    <div className="col-sm-9">
     <input id="name" className="form-control" name="name" value={form.name} onChange={handleChange} autoComplete="off" required />
    </div>
   </div>

   <div className="row mb-3">
    <label htmlFor="description" className="col-sm-3 col-form-label">Description</label>
    <div className="col-sm-9">
     <textarea id="description" className="form-control" name="description" value={form.description} onChange={handleChange} rows="4" autoComplete="off" />
    </div>
   </div>

   <div className="row mb-4 align-items-center">
    <label className="col-sm-3 col-form-label">Active</label>
    <div className="col-sm-9">
     <div className="form-check">
      <input id="isActive" type="checkbox" className="form-check-input" name="isActive" checked={form.isActive} onChange={handleChange} />
      <label htmlFor="isActive" className="form-check-label">Is Active</label>
     </div>
    </div>
   </div>

   <div className="d-flex justify-content-end gap-2">
    {onCancel?<button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>:null}
    <button type="submit" className="btn btn-primary" disabled={saving}>
     {saving?(method?._id?"Saving...":"Creating..."):(method?._id?"Update Method":"Create Method")}
    </button>
   </div>
  </form>
 );
}

export default MeetingMethodForm;