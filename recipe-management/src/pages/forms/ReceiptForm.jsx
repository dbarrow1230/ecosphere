import Alert from "../../components/AppAlert.jsx";
// /src/forms/ReceiptForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function ReceiptForm({initialData={},users=[],purchases=[],stores=[],currencies=[],states=[],countries=[],endpoint='/api/receipts',method='POST',onSuccess}){
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
purchase:initialData.purchase?._id||initialData.purchase||'',
store:initialData.store?._id||initialData.store||'',
receiptNumber:initialData.receiptNumber||'',
image:initialData.image||'',
purchaseDate:initialData.purchaseDate?new Date(initialData.purchaseDate).toISOString().split('T')[0]:'',
subtotal:initialData.subtotal||0,
taxTotal:initialData.taxTotal||0,
discountTotal:initialData.discountTotal||0,
total:initialData.total||0,
currency:initialData.currency?._id||initialData.currency||'',
address1:initialData.address1||'',
address2:initialData.address2||'',
city:initialData.city||'',
state:initialData.state?._id||initialData.state||'',
country:initialData.country?._id||initialData.country||'',
postalCode:initialData.postalCode||'',
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
setForm(prev=>{
const next={...prev,[name]:value};
const subtotal=Number(name==='subtotal'?value:prev.subtotal)||0;
const taxTotal=Number(name==='taxTotal'?value:prev.taxTotal)||0;
const discountTotal=Number(name==='discountTotal'?value:prev.discountTotal)||0;
next.total=Math.max(subtotal+taxTotal-discountTotal,0);
return next;
});
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
purchaseDate:form.purchaseDate||null,
subtotal:Number(form.subtotal)||0,
taxTotal:Number(form.taxTotal)||0,
discountTotal:Number(form.discountTotal)||0,
total:Number(form.total)||0
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save receipt');
showAutoCloseAlert('success',data.message||'Receipt saved successfully');
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
<div className="col-md-4">
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange} required>
<option value="">Select User</option>
{users.map(user=>(
<option key={user._id} value={user._id}>{user.name||user.email}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Purchase</label>
<select className="form-select" name="purchase" value={form.purchase} onChange={handleChange}>
<option value="">Select Purchase</option>
{purchases.map(purchase=>(
<option key={purchase._id} value={purchase._id}>{purchase.name||purchase.purchaseNumber||purchase._id}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Receipt Number</label>
<input type="text" className="form-control" name="receiptNumber" value={form.receiptNumber} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Image</label>
<input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Purchase Date</label>
<input type="date" className="form-control" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Subtotal</label>
<input type="number" className="form-control" name="subtotal" value={form.subtotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Tax Total</label>
<input type="number" className="form-control" name="taxTotal" value={form.taxTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Discount Total</label>
<input type="number" className="form-control" name="discountTotal" value={form.discountTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Total</label>
<input type="number" className="form-control" name="total" value={form.total} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Currency</label>
<select className="form-select" name="currency" value={form.currency} onChange={handleChange}>
<option value="">Select Currency</option>
{currencies.map(currency=>(
<option key={currency._id} value={currency._id}>{currency.name} ({currency.code})</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Address 1</label>
<input type="text" className="form-control" name="address1" value={form.address1} onChange={handleChange} />
</div>

<div className="col-md-4">
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

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Receipt'}
</button>
</div>
</div>
</form>
);
}