// /src/forms/BrandForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function BrandForm({initialData={},countries=[],endpoint='/api/brands',method='POST',onSuccess}){
const [form,setForm]=useState({
name:initialData.name||'',
slug:initialData.slug||'',
description:initialData.description||'',
logo:initialData.logo||'',
website:initialData.website||'',
country:initialData.country?._id||initialData.country||'',
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

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
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(form)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save brand');
showAutoCloseAlert('success',data.message||'Brand saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

return(
<form onSubmit={handleSubmit}>
{alert.show&&(
<div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
{alert.message}
<button type="button" className="btn-close" aria-label="Close" onClick={closeAlert}></button>
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
<label className="form-label">Logo</label>
<input type="text" className="form-control" name="logo" value={form.logo} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Website</label>
<input type="text" className="form-control" name="website" value={form.website} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Country</label>
<select className="form-select" name="country" value={form.country} onChange={handleChange}>
<option value="">Select Country</option>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-6 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Brand'}
</button>
</div>
</div>
</form>
);
}