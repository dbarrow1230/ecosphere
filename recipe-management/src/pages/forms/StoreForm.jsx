import Alert from "../../components/AppAlert.jsx";
// /src/forms/StoreForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function StoreForm({initialData={},states=[],countries=[],endpoint='/api/stores',method='POST',onSuccess}){
const [form,setForm]=useState({
name:initialData.name||'',
slug:initialData.slug||'',
description:initialData.description||'',
email:initialData.email||'',
phone:initialData.phone||'',
website:initialData.website||'',
logo:initialData.logo||'',
address1:initialData.address1||'',
address2:initialData.address2||'',
city:initialData.city||'',
state:initialData.state?._id||initialData.state||'',
country:initialData.country?._id||initialData.country||'',
postalCode:initialData.postalCode||'',
location:{
type:initialData.location?.type||'Point',
coordinates:Array.isArray(initialData.location?.coordinates)&&initialData.location.coordinates.length===2?initialData.location.coordinates:[0,0]
},
isOnline:initialData.isOnline||false,
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

const handleCoordinateChange=e=>{
const {name,value}=e.target;
setForm(prev=>{
const coordinates=[...prev.location.coordinates];
if(name==='longitude')coordinates[0]=value;
if(name==='latitude')coordinates[1]=value;
return{
...prev,
location:{
...prev.location,
coordinates
}
};
});
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
slug:form.slug.trim().toLowerCase(),
email:form.email.trim().toLowerCase(),
location:{
type:'Point',
coordinates:[
Number(form.location.coordinates[0])||0,
Number(form.location.coordinates[1])||0
]
}
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save store');
showAutoCloseAlert('success',data.message||'Store saved successfully');
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
<Alert variant={alert.type} dismissible onClose={closeAlert}>{alert.message}</Alert>
)}

<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Slug</label>
<input type="text" className="form-control" name="slug" value={form.slug} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-4">
<label className="form-label">Email</label>
<input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Phone</label>
<input type="text" className="form-control" name="phone" value={form.phone} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Website</label>
<input type="text" className="form-control" name="website" value={form.website} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Logo</label>
<input type="text" className="form-control" name="logo" value={form.logo} onChange={handleChange} />
</div>

<div className="col-md-6 d-flex align-items-end">
<div className="form-check me-3">
<input type="checkbox" className="form-check-input" id="isOnline" name="isOnline" checked={form.isOnline} onChange={handleChange} />
<label className="form-check-label" htmlFor="isOnline">Online Store</label>
</div>
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-md-6">
<label className="form-label">Address 1</label>
<input type="text" className="form-control" name="address1" value={form.address1} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Address 2</label>
<input type="text" className="form-control" name="address2" value={form.address2} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">City</label>
<input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">State</label>
<select className="form-select" name="state" value={form.state} onChange={handleChange}>
<option value="">Select State</option>
{states.map(state=>(
<option key={state._id} value={state._id}>{state.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Country</label>
<select className="form-select" name="country" value={form.country} onChange={handleChange}>
<option value="">Select Country</option>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Postal Code</label>
<input type="text" className="form-control" name="postalCode" value={form.postalCode} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Longitude</label>
<input type="number" className="form-control" name="longitude" value={form.location.coordinates[0]} onChange={handleCoordinateChange} step="any" />
</div>

<div className="col-md-6">
<label className="form-label">Latitude</label>
<input type="number" className="form-control" name="latitude" value={form.location.coordinates[1]} onChange={handleCoordinateChange} step="any" />
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Store'}
</button>
</div>
</div>
</form>
);
}