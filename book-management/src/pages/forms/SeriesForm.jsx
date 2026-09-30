// /src/pages/forms/SeriesForm.jsx
import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";

const emptyForm={
 name:"",
 numberOfBooks:""
};

export default function SeriesForm({mode,seriesId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=seriesId||routeId||"";
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
    numberOfBooks:initialData?.numberOfBooks??""
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
    const res=await fetch(`/api/series/${id}`);
    const data=await res.json();
    if(!res.ok)throw new Error(data?.message||"Failed to load series");
    const series=data?.series||data;
    if(!active)return;
    setForm({
     name:series?.name||"",
     numberOfBooks:series?.numberOfBooks??""
    });
   }catch(err){
    if(active)setError(err.message||"Failed to load series");
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

  if(form.numberOfBooks===""||Number(form.numberOfBooks)<1){
   setError("Number of books must be at least 1.");
   return;
  }

  const payload={
   name:form.name.trim(),
   numberOfBooks:Number(form.numberOfBooks)
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/series/${id}`:"/api/series",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||`Failed to ${isEdit?"update":"create"} series`);
   const saved=data?.series||data;
   setSuccess(`Series ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   navigate(saved?._id?`/series/${saved._id}`:"/series");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} series`);
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
     <h1 className="m-0">{isEdit?"Edit Series":"Add Series"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger">{error}</div>:null}
   {success?<div className="alert alert-success">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="row g-3">
     <div className="col-md-8">
      <label className="form-label">Series Name</label>
      <input type="text" className="form-control" value={form.name} onChange={e=>setField("name",e.target.value)} required />
     </div>

     <div className="col-md-4">
      <label className="form-label">Number of Books</label>
      <input type="number" min="1" step="1" className="form-control" value={form.numberOfBooks} onChange={e=>setField("numberOfBooks",e.target.value)} required />
     </div>

     <div className="col-12 d-flex gap-2 pt-2">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Series")}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving||isEdit}>Reset</button>
     </div>
    </div>
   </form>
  </div>
 );
}
