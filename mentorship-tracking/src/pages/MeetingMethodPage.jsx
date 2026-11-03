// src/pages/MeetingMethodPage.jsx
import {useEffect,useState} from "react";
import MeetingMethodForm from "./forms/MeetingMethodForm";
import "../styles/MeetingMethods.css";

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

function MeetingMethodPage({user}){
 const [methods,setMethods]=useState([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [successMessage,setSuccessMessage]=useState("");
 const [showModal,setShowModal]=useState(false);
 const [editingMethod,setEditingMethod]=useState(null);
 const [deleteMethod,setDeleteMethod]=useState(null);
 const [deleting,setDeleting]=useState(false);
 const [storedUser,setStoredUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  setStoredUser(getStoredUser());
 },[]);

 const currentUser=user?._id||user?.id?user:storedUser;

 const fetchMethods=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/meeting-methods",{credentials:"include"});
   const data=await res.json();

   if(!res.ok){
    throw new Error(data?.error||data?.message||"Failed to load meeting methods");
   }

   setMethods(Array.isArray(data?.meetingMethods)?data.meetingMethods:[]);
  }catch(err){
   setError(err.message||"Failed to load meeting methods");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchMethods();
 },[]);

 const openAddModal=()=>{
  setError("");
  setSuccessMessage("");
  setEditingMethod(null);
  setShowModal(true);
 };

 const openEditModal=method=>{
  setError("");
  setSuccessMessage("");
  setEditingMethod(method);
  setShowModal(true);
 };

 const closeModal=()=>{
  setShowModal(false);
  setEditingMethod(null);
 };

 const confirmDelete=async()=>{
  if(!deleteMethod)return;
  try{
   setDeleting(true);
   setError("");
   setSuccessMessage("");

   const res=await fetch(`/api/meeting-methods/${deleteMethod._id}`,{
    method:"DELETE",
    credentials:"include"
   });

   const data=await res.json();

   if(!res.ok){
    throw new Error(data?.error||data?.message||"Delete failed");
   }

   const deletedName=deleteMethod.name;
   setDeleteMethod(null);
   await fetchMethods();
   setSuccessMessage(`${deletedName} was deleted.`);
  }catch(err){
   setError(err.message||"Delete failed");
  }finally{
   setDeleting(false);
  }
 };

 return(
  <div className="container py-4">
   <div className="d-flex justify-content-between align-items-center mb-4">
    <h3>Meeting Methods</h3>
    <button className="btn btn-primary" onClick={openAddModal}>Add Method</button>
   </div>

   {error?<div className="app-feedback app-feedback-danger" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={()=>setError("")}>×</button></div>:null}
   {successMessage?<div className="app-feedback app-feedback-success" role="status"><span>{successMessage}</span><button type="button" aria-label="Dismiss message" onClick={()=>setSuccessMessage("")}>×</button></div>:null}
   {loading?<p>Loading...</p>:null}

   {!loading?(
    <div className="card">
     <div className="card-body">
      {methods.length?(
       <div className="table-responsive">
        <table className="table align-middle mb-0">
         <thead>
          <tr>
           <th>Name</th>
           <th>Description</th>
           <th>Status</th>
           <th style={{width:"180px"}}>Actions</th>
          </tr>
         </thead>
         <tbody>
          {methods.map(method=>(
           <tr key={method._id}>
            <td>{method.name}</td>
            <td>{method.description||<span className="text-muted">No description</span>}</td>
            <td>
             <span className={`app-status-badge ${method.isActive?"status-active":"status-unknown"}`}>
              {method.isActive?"Active":"Inactive"}
             </span>
            </td>
            <td>
             <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={()=>openEditModal(method)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>{setError("");setSuccessMessage("");setDeleteMethod(method);}}>Delete</button>
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ):<p className="text-muted mb-0">No meeting methods found.</p>}
     </div>
    </div>
   ):null}

   {showModal&&(
    <div className="modal d-block meeting-method-modal-backdrop">
     <div className="modal-dialog meeting-method-modal">
      <div className="modal-content">
       <div className="modal-header">
        <h5 className="modal-title">{editingMethod?"Edit Meeting Method":"Add Meeting Method"}</h5>
        <button className="btn-close" onClick={closeModal}></button>
       </div>

       <div className="modal-body">
        <MeetingMethodForm
         method={editingMethod}
         user={currentUser}
         onCancel={closeModal}
         onSuccess={()=>{
          const message=editingMethod?`${editingMethod.name} was updated.`:"Meeting method was added.";
          fetchMethods();
          closeModal();
          setSuccessMessage(message);
         }}
        />
       </div>
      </div>
     </div>
    </div>
   )}

   {deleteMethod&&(
    <div className="app-modal-backdrop" role="presentation">
     <section className="app-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-meeting-method-title">
      <header>
       <h2 id="delete-meeting-method-title">Delete Meeting Method</h2>
      </header>
      <div className="app-confirm-body">
       {error?<div className="app-feedback app-feedback-danger" role="alert"><span>{error}</span></div>:null}
       <p>Delete <strong>{deleteMethod.name}</strong>?</p>
       <p>This removes it from future mentee and session selections.</p>
      </div>
      <footer>
       <button type="button" className="btn btn-secondary" onClick={()=>setDeleteMethod(null)} disabled={deleting}>Cancel</button>
       <button type="button" className="btn app-danger-button" onClick={confirmDelete} disabled={deleting}>{deleting?"Deleting…":"Delete"}</button>
      </footer>
     </section>
    </div>
   )}
  </div>
 );
}

export default MeetingMethodPage;
