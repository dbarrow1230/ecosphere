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

export default function AuthorForm({mode,authorId,initialData,onSaved,onCancel}){
 const navigate=useNavigate();
 const {id:routeId}=useParams();
 const id=authorId||routeId||"";
 const isEdit=mode?mode==="edit":!!id;
 const [form,setForm]=useState(emptyForm);
 const [loading,setLoading]=useState(isEdit&&!initialData);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [imageFile,setImageFile]=useState(null);
 const [imageUploading,setImageUploading]=useState(false);
 const [imageUploadError,setImageUploadError]=useState("");
 const [imageInputKey,setImageInputKey]=useState(0);

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
     url:initialData?.image?.url||"",
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
      url:author?.image?.url||"",
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

 function resolveImageUrl(value){
  const image=String(value||"").trim();
  if(!image)return "";
  if(image.startsWith("http://")||image.startsWith("https://")||image.startsWith("/"))return image;
  if(image.startsWith("authors/"))return `/${image}`;
  return `/authors/${image}`;
 }

 const previewImageUrl=useMemo(()=>{
  if(imageFile)return URL.createObjectURL(imageFile);
  return resolveImageUrl(form.image.url);
 },[imageFile,form.image.url]);

 useEffect(()=>{
  return ()=>{
   if(previewImageUrl.startsWith("blob:"))URL.revokeObjectURL(previewImageUrl);
  };
 },[previewImageUrl]);

 function handleImageFileChange(e){
  const file=e.target.files&&e.target.files[0]?e.target.files[0]:null;
  setImageFile(file);
  setImageUploadError("");
 }

 function clearImage(){
  setNested("image","url","");
  setImageFile(null);
  setImageUploadError("");
  setImageInputKey(key=>key+1);
 }

 async function uploadImageFile(){
  if(!imageFile)return form.image.url.trim();

  const uploadData=new FormData();
  uploadData.append("file",imageFile);

  const res=await fetch("/api/upload/authors",{
   method:"POST",
   body:uploadData
  });
  const data=await res.json();

  if(!res.ok)throw new Error(data?.message||"Failed to upload author image");

  return data?.filename||data?.originalName||"";
 }

 async function handleImageUpload(){
  if(!imageFile)return;

  try{
   setImageUploading(true);
   setImageUploadError("");

   const filename=await uploadImageFile();
   setNested("image","url",filename);
   setImageFile(null);
  }catch(err){
   setImageUploadError(err.message||"Failed to upload author image");
  }finally{
   setImageUploading(false);
  }
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

  let imageUrl=form.image.url.trim();

  try{
   if(imageFile){
    setImageUploading(true);
    imageUrl=await uploadImageFile();
    setNested("image","url",imageUrl);
    setImageFile(null);
   }
  }catch(err){
   setImageUploadError(err.message||"Failed to upload author image");
   setError(err.message||"Failed to upload author image");
   setImageUploading(false);
   return;
  }finally{
   setImageUploading(false);
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
    url:imageUrl,
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
   navigate("/authors");
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
      <label className="form-label">Image</label>
      <div className="input-group">
       <input type="text" className="form-control" value={form.image.url} onChange={e=>setNested("image","url",e.target.value)} placeholder="Uploaded image filename" />
        <input key={imageInputKey} type="file" className="form-control" accept="image/*" onChange={handleImageFileChange} />
        <button type="button" className="btn btn-outline-primary" onClick={handleImageUpload} disabled={!imageFile||imageUploading}>{imageUploading?"Uploading...":"Upload"}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={clearImage} disabled={imageUploading||(!form.image.url&&!imageFile)}>Clear</button>
        </div>
      {imageUploadError?<div className="text-danger small mt-1">{imageUploadError}</div>:null}
     </div>

     <div className="col-md-4">
      <label className="form-label">Image Alt</label>
      <input type="text" className="form-control" value={form.image.alt} onChange={e=>setNested("image","alt",e.target.value)} />
     </div>

     <div className="col-12">
      <div className="border rounded p-2 d-inline-flex align-items-center justify-content-center" style={{width:"120px",height:"120px",background:"#f8f9fa"}}>
        {previewImageUrl?(
         <img src={previewImageUrl} alt={form.image.alt||computed.displayName||imageFile?.name||"Author"} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"cover"}} />
         ):(
         <span className="text-muted small">No image</span>
         )}
      </div>
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
