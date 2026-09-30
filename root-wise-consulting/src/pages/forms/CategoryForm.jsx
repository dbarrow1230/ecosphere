// /src/forms/CategoryForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function CategoryForm({initialData={},categories=[],endpoint='/api/categories',method='POST',onSuccess}){
const buildForm=()=>({
name:initialData.name||'',
slug:initialData.slug||'',
description:initialData.description||'',
image:initialData.image||'',
parentCategory:initialData.parentCategory?._id||initialData.parentCategory||'',
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});

const [form,setForm]=useState(buildForm);
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

useEffect(()=>{
setForm(buildForm());
},[initialData]);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({type,message,show:true});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},3000);
};

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

useEffect(()=>{
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const slugify=value=>value
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g,'')
.replace(/\s+/g,'-')
.replace(/-+/g,'-');

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>{
const next={...prev,[name]:type==='checkbox'?checked:value};
if(name==='name'&&!initialData.slug)next.slug=slugify(value);
return next;
});
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
slug:form.slug.trim().toLowerCase(),
parentCategory:form.parentCategory||null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save category');
showAutoCloseAlert('success',data.message||'Category saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

const parentCategoryName=categories.find(category=>String(category._id)===String(form.parentCategory))?.name||'';

return(
<form onSubmit={handleSubmit}>
{alert.show&&(
<div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
{alert.message}
<button type="button" className="btn-close" aria-label="Close" onClick={closeAlert}></button>
</div>
)}

{parentCategoryName&&(
<div className="alert alert-info py-2">
Parent Category: <strong>{parentCategoryName}</strong>
</div>
)}

<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Slug</label>
<input type="text" className="form-control" name="slug" value={form.slug} onChange={handleChange} required />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-6">
<label className="form-label">Image</label>
<input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Parent Category</label>
<select className="form-select" name="parentCategory" value={form.parentCategory} onChange={handleChange}>
<option value="">Select Parent Category</option>
{categories.filter(category=>String(category._id)!==String(initialData._id||'')).map(category=>(
<option key={category._id} value={category._id}>{category.name}</option>
))}
</select>
</div>

<div className="col-12">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Category'}
</button>
</div>
</div>
</form>
);
}