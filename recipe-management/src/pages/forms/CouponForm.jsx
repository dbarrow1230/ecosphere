import Alert from "../../components/AppAlert.jsx";
// /src/forms/CouponForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function CouponForm({initialData={},users=[],stores=[],countries=[],endpoint='/api/coupons',method='POST',onSuccess}){
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
store:initialData.store?._id||initialData.store||'',
code:initialData.code||'',
title:initialData.title||'',
description:initialData.description||'',
discountType:initialData.discountType||'fixed',
discountValue:initialData.discountValue||0,
minPurchaseAmount:initialData.minPurchaseAmount||0,
maxDiscountAmount:initialData.maxDiscountAmount||0,
startDate:initialData.startDate?new Date(initialData.startDate).toISOString().split('T')[0]:'',
endDate:initialData.endDate?new Date(initialData.endDate).toISOString().split('T')[0]:'',
countries:Array.isArray(initialData.countries)?initialData.countries.map(country=>country?._id||country):[],
isUsed:initialData.isUsed||false,
usedAt:initialData.usedAt?new Date(initialData.usedAt).toISOString().split('T')[0]:'',
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

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
};

const handleCountriesChange=e=>{
const values=Array.from(e.target.selectedOptions,option=>option.value);
setForm(prev=>({...prev,countries:values}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
discountValue:Number(form.discountValue)||0,
minPurchaseAmount:Number(form.minPurchaseAmount)||0,
maxDiscountAmount:Number(form.maxDiscountAmount)||0,
usedAt:form.isUsed?form.usedAt||null:null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save coupon');
showAutoCloseAlert('success',data.message||'Coupon saved successfully');
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
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange} required>
<option value="">Select User</option>
{users.map(user=>(
<option key={user._id} value={user._id}>{user.name||user.email}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Code</label>
<input type="text" className="form-control" name="code" value={form.code} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Title</label>
<input type="text" className="form-control" name="title" value={form.title} onChange={handleChange} required />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-4">
<label className="form-label">Discount Type</label>
<select className="form-select" name="discountType" value={form.discountType} onChange={handleChange}>
<option value="percent">Percent</option>
<option value="fixed">Fixed</option>
<option value="shipping">Shipping</option>
</select>
</div>

<div className="col-md-4">
<label className="form-label">Discount Value</label>
<input type="number" className="form-control" name="discountValue" value={form.discountValue} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-4">
<label className="form-label">Min Purchase Amount</label>
<input type="number" className="form-control" name="minPurchaseAmount" value={form.minPurchaseAmount} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Max Discount Amount</label>
<input type="number" className="form-control" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Start Date</label>
<input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">End Date</label>
<input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Countries</label>
<select className="form-select" name="countries" value={form.countries} onChange={handleCountriesChange} multiple>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-3 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isUsed" name="isUsed" checked={form.isUsed} onChange={handleChange} />
<label className="form-check-label" htmlFor="isUsed">Used</label>
</div>
</div>

<div className="col-md-3 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-md-4">
<label className="form-label">Used At</label>
<input type="date" className="form-control" name="usedAt" value={form.usedAt} onChange={handleChange} disabled={!form.isUsed} />
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Coupon'}
</button>
</div>
</div>
</form>
);
}