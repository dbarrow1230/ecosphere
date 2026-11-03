// /src/forms/ShoppingListForm.jsx
import React,{useEffect,useRef,useState} from 'react';
import ShoppingListItemForm from './ShoppingListItemForm';

export default function ShoppingListForm({initialData={},users=[],statuses=[],stores=[],products=[],units=[],itemStatuses=[],endpoint='/api/shopping-lists',method='POST',onSuccess}){
const emptyItem={
_id:'',
shoppingList:'',
user:initialData.user?._id||initialData.user||'',
product:'',
store:'',
unit:'',
quantity:1,
estimatedPrice:0,
priority:'',
notes:'',
isPurchased:false,
purchasedAt:''
};
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
name:initialData.name||'',
description:initialData.description||'',
status:initialData.status?._id||initialData.status||'',
type:initialData.type||'general',
store:initialData.store?._id||initialData.store||'',
budget:initialData.budget||0,
targetDate:initialData.targetDate?new Date(initialData.targetDate).toISOString().split('T')[0]:'',
isFavorite:initialData.isFavorite||false
});
const [itemForm,setItemForm]=useState(emptyItem);
const [items,setItems]=useState(Array.isArray(initialData.shoppingListItems)&&initialData.shoppingListItems.length?initialData.shoppingListItems.map(item=>({
_id:item._id||'',
shoppingList:item.shoppingList?._id||item.shoppingList||'',
user:item.user?._id||item.user||(initialData.user?._id||initialData.user||''),
product:item.product?._id||item.product||'',
store:item.store?._id||item.store||'',
unit:item.unit?._id||item.unit||'',
quantity:item.quantity||1,
estimatedPrice:item.estimatedPrice||0,
priority:item.priority?._id||item.priority||'',
notes:item.notes||'',
isPurchased:item.isPurchased||false,
purchasedAt:item.purchasedAt?new Date(item.purchasedAt).toISOString().split('T')[0]:''
})):[]);
const [editingIndex,setEditingIndex]=useState(-1);
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
if(name==='user'){
setItemForm(prev=>({...prev,user:value}));
}
if(name==='store'){
setItemForm(prev=>({...prev,store:value}));
}
};

const handleItemFormChange=data=>{
setItemForm(data);
};

const addOrUpdateItem=()=>{
if(!itemForm.product)return showAutoCloseAlert('danger','Product is required');
if(!itemForm.user)return showAutoCloseAlert('danger','User is required for item');
if(editingIndex>-1){
setItems(prev=>prev.map((item,index)=>index===editingIndex?itemForm:item));
showAutoCloseAlert('success','Shopping list item updated');
}else{
setItems(prev=>[...prev,itemForm]);
showAutoCloseAlert('success','Shopping list item added');
}
setItemForm({
...emptyItem,
user:form.user||'',
store:form.store||''
});
setEditingIndex(-1);
};

const editItem=index=>{
setItemForm(items[index]);
setEditingIndex(index);
};

const removeItem=index=>{
setItems(prev=>prev.filter((_,i)=>i!==index));
if(editingIndex===index){
setItemForm({
...emptyItem,
user:form.user||'',
store:form.store||''
});
setEditingIndex(-1);
}
showAutoCloseAlert('success','Shopping list item removed');
};

const cancelItemEdit=()=>{
setItemForm({
...emptyItem,
user:form.user||'',
store:form.store||''
});
setEditingIndex(-1);
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
budget:Number(form.budget)||0,
targetDate:form.targetDate||null,
shoppingListItems:items.map(item=>({
...item,
user:item.user||form.user||'',
store:item.store||form.store||null,
quantity:Number(item.quantity)||0,
estimatedPrice:Number(item.estimatedPrice)||0,
purchasedAt:item.isPurchased?(item.purchasedAt||null):null
}))
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save shopping list');
showAutoCloseAlert('success',data.message||'Shopping list saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

const getNameById=(list,id,labelKeys=['name','title','email'])=>{
const found=list.find(item=>item._id===id);
if(!found)return '';
for(const key of labelKeys){
if(found[key])return found[key];
}
return found._id||'';
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
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange} required>
<option value="">Select User</option>
{users.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.email}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-4">
<label className="form-label">Status</label>
<select className="form-select" name="status" value={form.status} onChange={handleChange}>
<option value="">Select Status</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Type</label>
<input type="text" className="form-control" name="type" value={form.type} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Budget</label>
<input type="number" className="form-control" name="budget" value={form.budget} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Target Date</label>
<input type="date" className="form-control" name="targetDate" value={form.targetDate} onChange={handleChange} />
</div>

<div className="col-md-4 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isFavorite" name="isFavorite" checked={form.isFavorite} onChange={handleChange} />
<label className="form-check-label" htmlFor="isFavorite">Favorite</label>
</div>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Shopping List Item Entry</h5>
<ShoppingListItemForm
initialData={itemForm}
shoppingLists={[]}
users={users}
products={products}
stores={stores}
units={units}
statuses={itemStatuses.length?itemStatuses:statuses}
endpoint=""
method="POST"
onSuccess={()=>{}}
/>
</div>

<div className="col-12">
<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Product</label>
<select className="form-select" value={itemForm.product} onChange={e=>handleItemFormChange({...itemForm,product:e.target.value})}>
<option value="">Select Product</option>
{products.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Store</label>
<select className="form-select" value={itemForm.store} onChange={e=>handleItemFormChange({...itemForm,store:e.target.value})}>
<option value="">Select Store</option>
{stores.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Unit</label>
<select className="form-select" value={itemForm.unit} onChange={e=>handleItemFormChange({...itemForm,unit:e.target.value})}>
<option value="">Select Unit</option>
{units.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" value={itemForm.quantity} onChange={e=>handleItemFormChange({...itemForm,quantity:e.target.value})} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Estimated Price</label>
<input type="number" className="form-control" value={itemForm.estimatedPrice} onChange={e=>handleItemFormChange({...itemForm,estimatedPrice:e.target.value})} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Priority</label>
<select className="form-select" value={itemForm.priority} onChange={e=>handleItemFormChange({...itemForm,priority:e.target.value})}>
<option value="">Select Priority</option>
{(itemStatuses.length?itemStatuses:statuses).map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3 d-flex align-items-end">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="item-isPurchased" checked={itemForm.isPurchased} onChange={e=>handleItemFormChange({...itemForm,isPurchased:e.target.checked,purchasedAt:e.target.checked?itemForm.purchasedAt:''})} />
<label className="form-check-label" htmlFor="item-isPurchased">Purchased</label>
</div>
</div>

<div className="col-md-3">
<label className="form-label">Purchased At</label>
<input type="date" className="form-control" value={itemForm.purchasedAt} onChange={e=>handleItemFormChange({...itemForm,purchasedAt:e.target.value})} disabled={!itemForm.isPurchased} />
</div>

<div className="col-12">
<label className="form-label">Item Notes</label>
<textarea className="form-control" value={itemForm.notes} onChange={e=>handleItemFormChange({...itemForm,notes:e.target.value})} rows="2"></textarea>
</div>

<div className="col-12 d-flex gap-2">
<button type="button" className="btn btn-outline-primary" onClick={addOrUpdateItem}>
{editingIndex>-1?'Update Shopping List Item':'Add Shopping List Item'}
</button>
{editingIndex>-1&&(
<button type="button" className="btn btn-outline-secondary" onClick={cancelItemEdit}>Cancel Edit</button>
)}
</div>
</div>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Shopping List Items</h5>
<div className="table-responsive">
<table className="table table-bordered table-sm align-middle">
<thead>
<tr>
<th>Product</th>
<th>Qty</th>
<th>Store</th>
<th>Estimated Price</th>
<th>Priority</th>
<th>Purchased</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{items.length?items.map((item,index)=>(
<tr key={index}>
<td>{getNameById(products,item.product)}</td>
<td>{item.quantity}</td>
<td>{getNameById(stores,item.store)}</td>
<td>{item.estimatedPrice}</td>
<td>{getNameById(itemStatuses.length?itemStatuses:statuses,item.priority)}</td>
<td>{item.isPurchased?'Yes':'No'}</td>
<td className="d-flex gap-2">
<button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>editItem(index)}>Edit</button>
<button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeItem(index)}>Remove</button>
</td>
</tr>
)):(
<tr>
<td colSpan="7" className="text-center">No shopping list items added</td>
</tr>
)}
</tbody>
</table>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Shopping List'}
</button>
</div>
</div>
</form>
);
}