// /src/forms/WishlistForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function WishlistForm({initialData={},users=[],products=[],stores=[],statuses=[],endpoint='/api/wishlists',method='POST',onSuccess}){
const priorityStatuses=statuses.filter(item=>String(item.type||'').toLowerCase()==='priority');
const wishlistStatuses=statuses.filter(item=>String(item.type||'').toLowerCase()==='wishliststatus');
const [form,setForm]=useState({
name:initialData.name||initialData.product?.name||'',
user:initialData.user?._id||initialData.user||'',
product:initialData.product?._id||initialData.product||'',
store:initialData.store?._id||initialData.store||'',
targetPrice:initialData.targetPrice||0,
currentPrice:initialData.currentPrice||0,
priority:initialData.priority?._id||initialData.priority||'',
status:initialData.status?._id||initialData.status||'',
notes:initialData.notes||''
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
const {name,value}=e.target;
setForm(prev=>({...prev,[name]:value}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
user:form.user||null,
product:form.product||null,
store:form.store||null,
priority:form.priority||null,
status:form.status||null,
targetPrice:Number(form.targetPrice)||0,
currentPrice:Number(form.currentPrice)||0
};
if(onSuccess){
await onSuccess(payload);
return;
}
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save wishlist');
showAutoCloseAlert('success',data.message||'Wishlist saved successfully');
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
<div className="col-12">
<label className="form-label">Wishlist Item Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange}>
<option value="">Unassigned User</option>
{users.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.username||item.email}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Product</label>
<select className="form-select" name="product" value={form.product} onChange={handleChange}>
<option value="">Unassigned Product</option>
{products.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Unassigned Store</option>
{stores.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Target Price</label>
<input type="number" className="form-control" name="targetPrice" value={form.targetPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Current Price</label>
<input type="number" className="form-control" name="currentPrice" value={form.currentPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-6">
<label className="form-label">Priority</label>
<select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
<option value="">Select Priority</option>
{priorityStatuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Status</label>
<select className="form-select" name="status" value={form.status} onChange={handleChange}>
<option value="">Select Status</option>
{wishlistStatuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Wishlist'}
</button>
</div>
</div>
</form>
);
}
