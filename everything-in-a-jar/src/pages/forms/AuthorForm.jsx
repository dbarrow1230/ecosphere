// /src/pages/forms/AuthorForm.jsx
import {useEffect,useMemo,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";

const emptyForm={
 firstName:"",
 middleName:"",
 lastName:"",
 birthDate:"",
 deathDate:"",
 nationality:"",
 languages:"",
 roles:"",
 bio:"",
 image:{url:"",alt:""},
 links:{official:"",wikipedia:"",goodreads:"",openLibrary:""},
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

function cleanUploadFilename(value){
 const text=String(value||"").trim();
 if(!text)return "";
 const filename=text.replace(/\\/g,"/").split("/").pop();
 return filename.replace(/^\d{10,}-/,"");
}

function getImagePreview(url){
 const value=String(url||"").trim();
 if(!value)return "";
 if(value.startsWith("http://")||value.startsWith("https://")||value.startsWith("/")||value.startsWith("data:"))return value;
 return `/authors/${cleanUploadFilename(value)}`;
}

async function fileExistsInAuthors(filename){
 if(!filename)return false;
 try{
  const res=await fetch(`/authors/${encodeURIComponent(filename)}`,{method:"HEAD",cache:"no-store"});
  return res.ok;
 }catch{
  return false;
 }
}

export default function AuthorForm({mode,authorId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=authorId||routeId||"";
 const isEdit=mode?mode==="edit":!!id;
 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [uploadingImage,setUploadingImage]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 const computed=useMemo(()=>{
  const first=form.firstName.trim();
  const middle=form.middleName.trim();
  const last=form.lastName.trim();
  const full=[first,middle,last].filter(Boolean).join(" ");
  const sort=last?`${last}, ${first}${middle?` ${middle}`:""}`:full;
  const slug=full
   .toLowerCase()
   .replace(/[^a-z0-9\s-]/g,"")
   .replace(/\s+/g,"-")
   .replace(/-+/g,"-")
   .replace(/^-+|-+$/g,"");
  return {displayName:full,sortName:sort,slug};
 },[form.firstName,form.middleName,form.lastName]);

 const imagePreview=useMemo(()=>getImagePreview(form.image.url),[form.image.url]);

 useEffect(()=>{
  if(initialData){
   setForm({
    firstName:initialData?.firstName||"",
    middleName:initialData?.middleName||"",
    lastName:initialData?.lastName||"",
    birthDate:toInputDate(initialData?.birthDate),
    deathDate:toInputDate(initialData?.deathDate),
    nationality:initialData?.nationality||"",
    languages:toCsv(initialData?.languages),
    roles:toCsv(initialData?.roles),
    bio:initialData?.bio||"",
    image:{
     url:cleanUploadFilename(initialData?.image?.url),
     alt:initialData?.image?.alt||""
    },
    links:{
     official:initialData?.links?.official||"",
     wikipedia:initialData?.links?.wikipedia||"",
     goodreads:initialData?.links?.goodreads||"",
     openLibrary:initialData?.links?.openLibrary||""
    },
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
    const res=await fetch(`/api/authors/${id}`);
    const data=await res.json();
    if(!res.ok)throw new Error(data?.error||data?.message||"Failed to load author");
    const author=data?.author||data;
    if(!active)return;
    setForm({
     firstName:author?.firstName||"",
     middleName:author?.middleName||"",
     lastName:author?.lastName||"",
     birthDate:toInputDate(author?.birthDate),
     deathDate:toInputDate(author?.deathDate),
     nationality:author?.nationality||"",
     languages:toCsv(author?.languages),
     roles:toCsv(author?.roles),
     bio:author?.bio||"",
     image:{
      url:cleanUploadFilename(author?.image?.url),
      alt:author?.image?.alt||""
     },
     links:{
      official:author?.links?.official||"",
      wikipedia:author?.links?.wikipedia||"",
      goodreads:author?.links?.goodreads||"",
      openLibrary:author?.links?.openLibrary||""
     },
     notes:toCsv(author?.notes),
     isActive:typeof author?.isActive==="boolean"?author.isActive:true
    });
   }catch(err){
    if(active)setError(err.message||"Failed to load author");
   }finally{
    if(active)setLoading(false);
   }
  })();
  return()=>{active=false;};
 },[id,isEdit,initialData]);

 function setField(name,value){
  setForm(prev=>({...prev,[name]:value}));
 }

 function setNested(parent,name,value){
  setForm(prev=>({...prev,[parent]:{...prev[parent],[name]:value}}));
 }

 async function handleAuthorImageChange(e){
  const file=e.target.files?.[0];
  if(!file)return;

  setError("");
  setUploadingImage(true);

  try{
   const cleanFilename=cleanUploadFilename(file.name);
   const existing=await fileExistsInAuthors(cleanFilename);

   if(existing){
    setForm(prev=>({
     ...prev,
     image:{
      url:cleanFilename,
      alt:prev.image.alt||computed.displayName||file.name
     }
    }));
    return;
   }

   const body=new FormData();
   body.append("file",file);

   const res=await fetch("/api/upload/authors",{
    method:"POST",
    body
   });
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to upload author image");

   const filename=cleanUploadFilename(data?.filename||cleanFilename);
   setForm(prev=>({
    ...prev,
    image:{
     url:filename,
     alt:prev.image.alt||computed.displayName||file.name
    }
   }));
  }catch(err){
   setError(err.message||"Failed to upload author image");
  }finally{
   setUploadingImage(false);
   e.target.value="";
  }
 }

 function clearAuthorImage(){
  setForm(prev=>({
   ...prev,
   image:{url:"",alt:""}
  }));
 }

 async function handleSubmit(e){
  e.preventDefault();
  if(saving)return;
  setError("");
  setSuccess("");

  if(!form.firstName.trim()||!form.lastName.trim()){
   setError("First name and last name are required.");
   return;
  }

  if(form.birthDate&&form.deathDate&&new Date(form.deathDate)<new Date(form.birthDate)){
   setError("Death date cannot be before birth date.");
   return;
  }

  const payload={
   firstName:form.firstName.trim(),
   middleName:form.middleName.trim(),
   lastName:form.lastName.trim(),
   displayName:computed.displayName,
   sortName:computed.sortName,
   slug:computed.slug,
   birthDate:form.birthDate||null,
   deathDate:form.deathDate||null,
   nationality:form.nationality.trim(),
   languages:fromCsv(form.languages),
   roles:fromCsv(form.roles),
   bio:form.bio.trim(),
   image:{
    url:cleanUploadFilename(form.image.url),
    alt:form.image.alt.trim()
   },
   links:{
    official:form.links.official.trim(),
    wikipedia:form.links.wikipedia.trim(),
    goodreads:form.links.goodreads.trim(),
    openLibrary:form.links.openLibrary.trim()
   },
   notes:fromCsv(form.notes),
   isActive:!!form.isActive
  };

  try{
   setSaving(true);
   const res=await fetch(isEdit?`/api/authors/${id}`:"/api/authors",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.error||data?.message||`Failed to ${isEdit?"update":"create"} author`);
   const saved=data?.author||data;
   setSuccess(`Author ${isEdit?"updated":"created"} successfully.`);
   if(onSaved){
    onSaved(saved);
    return;
   }
   navigate(saved?._id?`/authors/${saved._id}`:"/authors");
  }catch(err){
   setError(err.message||`Failed to ${isEdit?"update":"create"} author`);
  }finally{
   setSaving(false);
  }
 }

 if(loading){
  return <div className="container py-4">Loading...</div>;
 }

 return(
  <div className="container py-4">
   {!onSaved&&(
    <div className="d-flex align-items-center justify-content-between mb-4">
     <h1 className="m-0">{isEdit?"Edit Author":"Add Author"}</h1>
     <button type="button" className="btn btn-outline-secondary" onClick={()=>onCancel?onCancel():navigate(-1)}>Back</button>
    </div>
   )}

   {error?<div className="alert alert-danger">{error}</div>:null}
   {success?<div className="alert alert-success">{success}</div>:null}

   <form onSubmit={handleSubmit}>
    <div className="row g-3">
     <div className="col-md-4">
      <label className="form-label">First Name</label>
      <input type="text" className="form-control" value={form.firstName} onChange={e=>setField("firstName",e.target.value)} required />
     </div>

     <div className="col-md-4">
      <label className="form-label">Middle Name</label>
      <input type="text" className="form-control" value={form.middleName} onChange={e=>setField("middleName",e.target.value)} />
     </div>

     <div className="col-md-4">
      <label className="form-label">Last Name</label>
      <input type="text" className="form-control" value={form.lastName} onChange={e=>setField("lastName",e.target.value)} required />
     </div>

     <div className="col-md-4">
      <label className="form-label">Display Name</label>
      <input type="text" className="form-control" value={computed.displayName} readOnly />
     </div>

     <div className="col-md-4">
      <label className="form-label">Sort Name</label>
      <input type="text" className="form-control" value={computed.sortName} readOnly />
     </div>

     <div className="col-md-4">
      <label className="form-label">Slug</label>
      <input type="text" className="form-control" value={computed.slug} readOnly />
     </div>

     <div className="col-md-3">
      <label className="form-label">Birth Date</label>
      <input type="date" className="form-control" value={form.birthDate} onChange={e=>setField("birthDate",e.target.value)} />
     </div>

     <div className="col-md-3">
      <label className="form-label">Death Date</label>
      <input type="date" className="form-control" value={form.deathDate} min={form.birthDate||undefined} onChange={e=>setField("deathDate",e.target.value)} />
     </div>

     <div className="col-md-4">
      <label className="form-label">Nationality</label>
      <input type="text" className="form-control" value={form.nationality} onChange={e=>setField("nationality",e.target.value)} />
     </div>

     <div className="col-md-2 d-flex align-items-end">
      <div className="form-check mb-2">
       <input id="isActive" type="checkbox" className="form-check-input" checked={form.isActive} onChange={e=>setField("isActive",e.target.checked)} />
       <label htmlFor="isActive" className="form-check-label">Active</label>
      </div>
     </div>

     <div className="col-md-6">
      <label className="form-label">Languages</label>
      <input type="text" className="form-control" value={form.languages} onChange={e=>setField("languages",e.target.value)} placeholder="English, French" />
     </div>

     <div className="col-md-6">
      <label className="form-label">Roles</label>
      <input type="text" className="form-control" value={form.roles} onChange={e=>setField("roles",e.target.value)} placeholder="Author, Poet, Editor" />
     </div>

     <div className="col-12">
      <label className="form-label">Bio</label>
      <textarea className="form-control" rows="5" value={form.bio} onChange={e=>setField("bio",e.target.value)} />
     </div>

     <div className="col-md-8">
      <label className="form-label">Author Image</label>
      <div className="d-flex flex-column gap-2">
       <div className="d-flex gap-2 align-items-center flex-wrap">
        <input type="file" className="form-control" accept="image/*" onChange={handleAuthorImageChange} disabled={uploadingImage} />
        <button type="button" className="btn btn-outline-secondary" onClick={clearAuthorImage} disabled={!form.image.url||uploadingImage}>Clear</button>
       </div>
       {uploadingImage?<div className="text-muted small">Uploading...</div>:null}
       {form.image.url?<div className="small text-muted">Image: {cleanUploadFilename(form.image.url)}</div>:null}
       {imagePreview?<div><img src={imagePreview} alt={form.image.alt||computed.displayName||"Author preview"} style={{maxWidth:"140px",maxHeight:"180px",borderRadius:"8px",border:"1px solid #ddd",objectFit:"cover"}} /></div>:null}
      </div>
     </div>

     <div className="col-md-4">
      <label className="form-label">Image Alt</label>
      <input type="text" className="form-control" value={form.image.alt} onChange={e=>setNested("image","alt",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Official Link</label>
      <input type="text" className="form-control" value={form.links.official} onChange={e=>setNested("links","official",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Wikipedia</label>
      <input type="text" className="form-control" value={form.links.wikipedia} onChange={e=>setNested("links","wikipedia",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Goodreads</label>
      <input type="text" className="form-control" value={form.links.goodreads} onChange={e=>setNested("links","goodreads",e.target.value)} />
     </div>

     <div className="col-md-6">
      <label className="form-label">Open Library</label>
      <input type="text" className="form-control" value={form.links.openLibrary} onChange={e=>setNested("links","openLibrary",e.target.value)} />
     </div>

     <div className="col-12">
      <label className="form-label">Notes</label>
      <textarea className="form-control" rows="3" value={form.notes} onChange={e=>setField("notes",e.target.value)} placeholder="Comma-separated notes" />
     </div>

     <div className="col-12 d-flex gap-2 pt-2">
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving?(isEdit?"Saving...":"Creating..."):(isEdit?"Save Changes":"Create Author")}</button>
      <button type="button" className="btn btn-outline-secondary" onClick={()=>setForm(emptyForm)} disabled={saving||isEdit}>Reset</button>
     </div>
    </div>
   </form>
  </div>
 );
}
