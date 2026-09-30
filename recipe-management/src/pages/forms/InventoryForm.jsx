import Alert from "../../components/AppAlert.jsx";
// /src/forms/InventoryForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function InventoryForm({initialData={},users=[],products=[],units=[],stores=[],endpoint='/api/inventories',method='POST',onSuccess}){
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
product:initialData.product?._id||initialData.product||'',
unit:initialData.unit?._id||initialData.unit||'',
store:initialData.store?._id||initialData.store||'',
quantity:initialData.quantity||0,
minQuantity:initialData.minQuantity||0,
maxQuantity:initialData.maxQuantity||0,
reorderLevel:initialData.reorderLevel||0,
purchaseDate:initialData.purchaseDate?new Date(initialData.purchaseDate).toISOString().split('T')[0]:'',
expiryDate:initialData.expiryDate?new Date(initialData.expiryDate).toISOString().split('T')[0]:'',
location:initialData.location||'',
notes:initialData.notes||'',
isLowStock:initialData.isLowStock||false
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

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
quantity:Number(form.quantity)||0,
minQuantity:Number(form.minQuantity)||0,
maxQuantity:Number(form.maxQuantity)||0,
reorderLevel:Number(form.reorderLevel)||0,
purchaseDate:form.purchaseDate||null,
expiryDate:form.expiryDate||null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save inventory');
showAutoCloseAlert('success',data.message||'Inventory saved successfully');
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
<label className="form-label">Product</label>
<select className="form-select" name="product" value={form.product} onChange={handleChange} required>
<option value="">Select Product</option>
{products.map(product=>(
<option key={product._id} value={product._id}>{product.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
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

<div className="col-md-3">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-3">
<label className="form-label">Min Quantity</label>
<input type="number" className="form-control" name="minQuantity" value={form.minQuantity} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Max Quantity</label>
<input type="number" className="form-control" name="maxQuantity" value={form.maxQuantity} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Reorder Level</label>
<input type="number" className="form-control" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-6">
<label className="form-label">Purchase Date</label>
<input type="date" className="form-control" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Expiry Date</label>
<input type="date" className="form-control" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Location</label>
<input type="text" className="form-control" name="location" value={form.location} onChange={handleChange} />
</div>

<div className="col-md-6 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isLowStock" name="isLowStock" checked={form.isLowStock} onChange={handleChange} />
<label className="form-check-label" htmlFor="isLowStock">Low Stock</label>
</div>
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Inventory'}
</button>
</div>
</div>
</form>
);
}