import React,{useEffect,useRef,useState} from 'react';

const getId=value=>{
if(!value)return '';
if(typeof value==='object')return value._id||value.id||'';
return value;
};

export default function LocationForm({initialData={},businesses=[],locationTypes=[],locations=[],endpoint='/api/locations',method='POST',onSuccess}){
const [form,setForm]=useState({
business:getId(initialData.business)||getId(businesses[0]),
name:initialData.name||'',
code:initialData.code||'',
type:getId(initialData.type)||getId(locationTypes[0]),
description:initialData.description||'',
parentLocation:getId(initialData.parentLocation)||'',
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

useEffect(()=>{
const timer=window.setTimeout(()=>{
setForm(prev=>({
...prev,
business:prev.business||getId(businesses[0]),
type:prev.type||getId(locationTypes[0])
}));
},0);
return()=>window.clearTimeout(timer);
},[businesses,locationTypes]);

useEffect(()=>{
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

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

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
name:form.name.trim(),
code:form.code.trim(),
description:form.description.trim(),
parentLocation:form.parentLocation||null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save location');
showAutoCloseAlert('success',data.message||'Location saved successfully');
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
<label className="form-label">Business</label>
<select className="form-select" name="business" value={form.business} onChange={handleChange} required>
<option value="">Select Business</option>
{businesses.map(business=>(
<option key={business._id} value={business._id}>{business.legalName||business.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Location Type</label>
<select className="form-select" name="type" value={form.type} onChange={handleChange} required>
<option value="">Select Location Type</option>
{locationTypes.map(type=>(
<option key={type._id} value={type._id}>{type.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Code</label>
<input type="text" className="form-control" name="code" value={form.code} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Parent Location</label>
<select className="form-select" name="parentLocation" value={form.parentLocation} onChange={handleChange}>
<option value="">No Parent</option>
{locations.map(location=>(
<option key={location._id} value={location._id}>{location.name}</option>
))}
</select>
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="locationIsActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="locationIsActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Location'}
</button>
</div>
</div>
</form>
);
}
