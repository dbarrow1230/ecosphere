import Alert from "../../components/AppAlert.jsx";
// /src/forms/StatusForm.jsx
import React,{useEffect,useRef,useState} from 'react';

const formatLabel=value=>String(value||'')
.replace(/([A-Z])/g,' $1')
.replace(/[_-]/g,' ')
.replace(/\s+/g,' ')
.trim()
.replace(/\b\w/g,char=>char.toUpperCase());

const normalizeHex=value=>{
let hex=String(value||'').trim();
if(!hex)return '';
if(!hex.startsWith('#'))hex=`#${hex}`;
if(/^#[0-9A-Fa-f]{3}$/.test(hex)||/^#[0-9A-Fa-f]{6}$/.test(hex))return hex;
return value;
};

export default function StatusForm({initialData={},endpoint='/api/statuses',method='POST',onSuccess}){
const [form,setForm]=useState({
name:initialData.name||formatLabel(initialData.key||''),
key:initialData.key||'',
type:initialData.type||'',
label:initialData.label||formatLabel(initialData.key||''),
description:initialData.description||'',
color:initialData.color||'#198754',
sortOrder:initialData.sortOrder||0,
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

useEffect(()=>{
setForm({
name:initialData.name||formatLabel(initialData.key||''),
key:initialData.key||'',
type:initialData.type||'',
label:initialData.label||formatLabel(initialData.key||''),
description:initialData.description||'',
color:initialData.color||'#198754',
sortOrder:initialData.sortOrder||0,
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true
});
},[initialData]);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({type,message,show:true});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
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

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
};

const handleColorPickerChange=e=>{
setForm(prev=>({...prev,color:e.target.value}));
};

const handleColorTextChange=e=>{
setForm(prev=>({...prev,color:e.target.value}));
};

const handleColorBlur=()=>{
setForm(prev=>({...prev,color:normalizeHex(prev.color)}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
name:String(form.name||'').trim(),
key:String(form.key||'').trim().toLowerCase(),
type:String(form.type||'').trim().toLowerCase(),
label:String(form.label||'').trim(),
description:String(form.description||'').trim(),
color:normalizeHex(form.color),
sortOrder:Number(form.sortOrder)||0,
isActive:!!form.isActive
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.error||data.message||'Failed to save status');
showAutoCloseAlert('success',data.message||'Status saved successfully');
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
<label className="form-label">Type</label>
<input type="text" className="form-control" name="type" value={form.type} readOnly />
</div>

<div className="col-md-6">
<label className="form-label">Key</label>
<input type="text" className="form-control" name="key" value={form.key} readOnly />
</div>

<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Label</label>
<input type="text" className="form-control" name="label" value={form.label} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-3">
<label className="form-label">Color Picker</label>
<input type="color" className="form-control form-control-color w-100" value={/^#[0-9A-Fa-f]{6}$/.test(normalizeHex(form.color))?normalizeHex(form.color):'#198754'} onChange={handleColorPickerChange} />
</div>

<div className="col-md-3">
<label className="form-label">Hex Color</label>
<input type="text" className="form-control" name="color" value={form.color} onChange={handleColorTextChange} onBlur={handleColorBlur} placeholder="#198754" />
</div>

<div className="col-md-3">
<label className="form-label">Sort Order</label>
<input type="number" className="form-control" name="sortOrder" value={form.sortOrder} onChange={handleChange} step="1" />
</div>

<div className="col-md-3 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Status'}
</button>
</div>
</div>
</form>
);
}