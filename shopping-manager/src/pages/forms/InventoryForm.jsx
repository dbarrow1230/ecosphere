// /src/forms/InventoryForm.jsx
import React,{useEffect,useRef,useState} from 'react';

const getId=value=>{
if(!value)return '';
if(typeof value==='object')return value._id||value.id||'';
return value;
};

const getStoredUser=()=>{
if(typeof window==='undefined')return null;
const keys=['userInfo','user','authUser','currentUser'];
for(const key of keys){
try{
const raw=window.localStorage.getItem(key)||window.sessionStorage.getItem(key);
if(!raw)continue;
const parsed=JSON.parse(raw);
return parsed?.user||parsed?.authUser||parsed?.data||parsed?.profile||parsed;
}catch{
const raw=window.localStorage.getItem(key)||window.sessionStorage.getItem(key);
if(raw)return {_id:raw};
}
}
return null;
};

const getProductLabel=product=>{
if(!product)return '';
return product.name||product.title||product.label||product.sku||product.barcode||'Unnamed Product';
};

const toDateInput=value=>value?new Date(value).toISOString().split('T')[0]:'';

export default function InventoryForm({initialData={},products=[],units=[],stores=[],locations=[],endpoint='/api/inventories',method='POST',onSuccess,onAddProduct,onAddStore,onAddLocation,newRelatedItem}){
const storedUser=getStoredUser();
const storedUserId=getId(storedUser);
const [form,setForm]=useState({
user:getId(initialData.user)||storedUserId,
product:getId(initialData.product),
unit:getId(initialData.unit),
store:getId(initialData.store),
quantity:initialData.quantity||0,
minQuantity:initialData.minQuantity||0,
maxQuantity:initialData.maxQuantity||0,
reorderLevel:initialData.reorderLevel||0,
purchaseDate:toDateInput(initialData.purchaseDate),
expiryDate:toDateInput(initialData.expiryDate),
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

useEffect(()=>{
if(!newRelatedItem)return;
const timer=window.setTimeout(()=>{
const id=getId(newRelatedItem.item);
if(newRelatedItem.type==='product'&&id)setForm(prev=>({...prev,product:id}));
if(newRelatedItem.type==='store'&&id)setForm(prev=>({...prev,store:id}));
if(newRelatedItem.type==='location')setForm(prev=>({...prev,location:newRelatedItem.item?.name||newRelatedItem.item?.label||''}));
},0);
return()=>window.clearTimeout(timer);
},[newRelatedItem]);

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
user:form.user||storedUserId,
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
<form className="inventory-form" onSubmit={handleSubmit}>
{alert.show&&(
<div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
{alert.message}
<button type="button" className="btn-close" aria-label="Close" onClick={closeAlert}></button>
</div>
)}

<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Product</label>
<div className="input-group">
<select className="form-select" name="product" value={form.product} onChange={handleChange} required>
<option value="">Select Product</option>
{products.map(product=>(
<option key={product._id} value={product._id}>{getProductLabel(product)}</option>
))}
</select>
<button type="button" className="btn btn-outline-primary" onClick={onAddProduct}>Add Product</button>
</div>
</div>

<div className="col-md-6">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange} required>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Store</label>
<div className="input-group">
<select className="form-select" name="store" value={form.store} onChange={handleChange} required>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
<button type="button" className="btn btn-outline-primary" onClick={onAddStore}>Add Store</button>
</div>
</div>

<div className="col-md-6">
<label className="form-label">Location</label>
<div className="input-group">
<select className="form-select" name="location" value={form.location} onChange={handleChange} required>
<option value="">Select Location</option>
{locations.map(location=>(
<option key={location} value={location}>{location}</option>
))}
</select>
<button type="button" className="btn btn-outline-primary" onClick={onAddLocation}>Add Location</button>
</div>
</div>

<div className="col-12">
<div className="form-compact-row">
<div className="form-compact-field">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="form-compact-field">
<label className="form-label">Min Quantity</label>
<input type="number" className="form-control" name="minQuantity" value={form.minQuantity} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="form-compact-field">
<label className="form-label">Max Quantity</label>
<input type="number" className="form-control" name="maxQuantity" value={form.maxQuantity} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="form-compact-field">
<label className="form-label">Reorder Level</label>
<input type="number" className="form-control" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} min="0" step="0.01" />
</div>
</div>
</div>

<div className="col-12">
<div className="form-compact-row">
<div className="form-compact-field form-date-field">
<label className="form-label">Purchase Date</label>
<input type="date" className="form-control" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
</div>

<div className="form-compact-field form-date-field">
<label className="form-label">Expiry Date</label>
<input type="date" className="form-control" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
</div>
</div>
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
