// /src/forms/ReturnItemForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function ReturnItemForm({initialData={},returns=[],orderItems=[],purchaseItems=[],products=[],units=[],statuses=[],endpoint='/api/return-items',method='POST',onSuccess}){
const [form,setForm]=useState({
return:initialData.return?._id||initialData.return||'',
orderItem:initialData.orderItem?._id||initialData.orderItem||'',
purchaseItem:initialData.purchaseItem?._id||initialData.purchaseItem||'',
product:initialData.product?._id||initialData.product||'',
unit:initialData.unit?._id||initialData.unit||'',
quantity:initialData.quantity||1,
unitPrice:initialData.unitPrice||0,
refundAmount:initialData.refundAmount||0,
reason:initialData.reason?._id||initialData.reason||'',
condition:initialData.condition?._id||initialData.condition||'',
resolution:initialData.resolution?._id||initialData.resolution||'',
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
quantity:Number(form.quantity)||0,
unitPrice:Number(form.unitPrice)||0,
refundAmount:Number(form.refundAmount)||0
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save return item');
showAutoCloseAlert('success',data.message||'Return item saved successfully');
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
<label className="form-label">Return</label>
<select className="form-select" name="return" value={form.return} onChange={handleChange} required>
<option value="">Select Return</option>
{returns.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.returnNumber||item._id}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Product</label>
<select className="form-select" name="product" value={form.product} onChange={handleChange} required>
<option value="">Select Product</option>
{products.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Order Item</label>
<select className="form-select" name="orderItem" value={form.orderItem} onChange={handleChange}>
<option value="">Select Order Item</option>
{orderItems.map(item=>(
<option key={item._id} value={item._id}>{item.product?.name||item.name||item._id}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Purchase Item</label>
<select className="form-select" name="purchaseItem" value={form.purchaseItem} onChange={handleChange}>
<option value="">Select Purchase Item</option>
{purchaseItems.map(item=>(
<option key={item._id} value={item._id}>{item.product?.name||item.name||item._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-3">
<label className="form-label">Unit Price</label>
<input type="number" className="form-control" name="unitPrice" value={form.unitPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Refund Amount</label>
<input type="number" className="form-control" name="refundAmount" value={form.refundAmount} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Reason</label>
<select className="form-select" name="reason" value={form.reason} onChange={handleChange}>
<option value="">Select Reason</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Condition</label>
<select className="form-select" name="condition" value={form.condition} onChange={handleChange}>
<option value="">Select Condition</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Resolution</label>
<select className="form-select" name="resolution" value={form.resolution} onChange={handleChange}>
<option value="">Select Resolution</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Status</label>
<select className="form-select" name="status" value={form.status} onChange={handleChange}>
<option value="">Select Status</option>
{statuses.map(item=>(
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
{loading?'Saving...':'Save Return Item'}
</button>
</div>
</div>
</form>
);
}