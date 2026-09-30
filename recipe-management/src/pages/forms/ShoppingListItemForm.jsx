import Alert from "../../components/AppAlert.jsx";
// /src/forms/ShoppingListItemForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function ShoppingListItemForm({initialData={},shoppingLists=[],users=[],products=[],stores=[],units=[],statuses=[],endpoint='/api/shopping-list-items',method='POST',onSuccess}){
const [form,setForm]=useState({
shoppingList:initialData.shoppingList?._id||initialData.shoppingList||'',
user:initialData.user?._id||initialData.user||'',
product:initialData.product?._id||initialData.product||'',
store:initialData.store?._id||initialData.store||'',
unit:initialData.unit?._id||initialData.unit||'',
quantity:initialData.quantity||1,
estimatedPrice:initialData.estimatedPrice||0,
priority:initialData.priority?._id||initialData.priority||'',
notes:initialData.notes||'',
isPurchased:initialData.isPurchased||false,
purchasedAt:initialData.purchasedAt?new Date(initialData.purchasedAt).toISOString().split('T')[0]:''
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
setForm(prev=>{
const next={...prev,[name]:type==='checkbox'?checked:value};
if(name==='isPurchased'&&!checked)next.purchasedAt='';
return next;
});
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
quantity:Number(form.quantity)||0,
estimatedPrice:Number(form.estimatedPrice)||0,
purchasedAt:form.isPurchased?(form.purchasedAt||null):null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save shopping list item');
showAutoCloseAlert('success',data.message||'Shopping list item saved successfully');
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
<label className="form-label">Shopping List</label>
<select className="form-select" name="shoppingList" value={form.shoppingList} onChange={handleChange} required>
<option value="">Select Shopping List</option>
{shoppingLists.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.title||item._id}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange} required>
<option value="">Select User</option>
{users.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.email}</option>
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
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-4">
<label className="form-label">Estimated Price</label>
<input type="number" className="form-control" name="estimatedPrice" value={form.estimatedPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-6">
<label className="form-label">Priority</label>
<select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
<option value="">Select Priority</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isPurchased" name="isPurchased" checked={form.isPurchased} onChange={handleChange} />
<label className="form-check-label" htmlFor="isPurchased">Purchased</label>
</div>
</div>

<div className="col-md-3">
<label className="form-label">Purchased At</label>
<input type="date" className="form-control" name="purchasedAt" value={form.purchasedAt} onChange={handleChange} disabled={!form.isPurchased} />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Shopping List Item'}
</button>
</div>
</div>
</form>
);
}