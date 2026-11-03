// /src/forms/PurchaseForm.jsx
import React,{useEffect,useRef,useState} from 'react';
import PurchaseItemForm from './PurchaseItemForm';

export default function PurchaseForm({initialData={},users=[],stores=[],receipts=[],coupons=[],shoppingLists=[],statuses=[],products=[],shoppingListItems=[],units=[],endpoint='/api/purchases',method='POST',onSuccess}){
const emptyItem={
_id:'',
purchase:'',
product:'',
shoppingListItem:'',
unit:'',
quantity:1,
unitPrice:0,
discountAmount:0,
taxAmount:0,
subtotal:0,
notes:''
};
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
store:initialData.store?._id||initialData.store||'',
receipt:initialData.receipt?._id||initialData.receipt||'',
coupon:initialData.coupon?._id||initialData.coupon||'',
shoppingList:initialData.shoppingList?._id||initialData.shoppingList||'',
purchaseDate:initialData.purchaseDate?new Date(initialData.purchaseDate).toISOString().split('T')[0]:'',
subtotal:initialData.subtotal||0,
discountTotal:initialData.discountTotal||0,
taxTotal:initialData.taxTotal||0,
shippingTotal:initialData.shippingTotal||0,
total:initialData.total||0,
paymentMethod:initialData.paymentMethod||'',
status:initialData.status?._id||initialData.status||'',
notes:initialData.notes||''
});
const [itemForm,setItemForm]=useState(emptyItem);
const [items,setItems]=useState(Array.isArray(initialData.purchaseItems)&&initialData.purchaseItems.length?initialData.purchaseItems.map(item=>({
_id:item._id||'',
purchase:item.purchase?._id||item.purchase||'',
product:item.product?._id||item.product||'',
shoppingListItem:item.shoppingListItem?._id||item.shoppingListItem||'',
unit:item.unit?._id||item.unit||'',
quantity:item.quantity||1,
unitPrice:item.unitPrice||0,
discountAmount:item.discountAmount||0,
taxAmount:item.taxAmount||0,
subtotal:item.subtotal||0,
notes:item.notes||''
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

useEffect(()=>{
const subtotal=items.reduce((sum,item)=>sum+(Number(item.subtotal)||0),0);
const itemsDiscount=items.reduce((sum,item)=>sum+(Number(item.discountAmount)||0),0);
const itemsTax=items.reduce((sum,item)=>sum+(Number(item.taxAmount)||0),0);
setForm(prev=>{
const shippingTotal=Number(prev.shippingTotal)||0;
return{
...prev,
subtotal,
discountTotal:itemsDiscount,
taxTotal:itemsTax,
total:Math.max(subtotal+shippingTotal,0)
};
});
},[items]);

const handleChange=e=>{
const {name,value}=e.target;
setForm(prev=>{
const next={...prev,[name]:value};
const subtotal=Number(next.subtotal)||0;
const shippingTotal=Number(name==='shippingTotal'?value:next.shippingTotal)||0;
next.total=Math.max(subtotal+shippingTotal,0);
return next;
});
};

const handleItemFormChange=(index,nextItem)=>{
setItemForm(nextItem);
};

const addOrUpdateItem=()=>{
if(!itemForm.product)return showAutoCloseAlert('danger','Product is required');
if(editingIndex>-1){
setItems(prev=>prev.map((item,index)=>index===editingIndex?itemForm:item));
showAutoCloseAlert('success','Purchase item updated');
}else{
setItems(prev=>[...prev,itemForm]);
showAutoCloseAlert('success','Purchase item added');
}
setItemForm(emptyItem);
setEditingIndex(-1);
};

const editItem=index=>{
setItemForm(items[index]);
setEditingIndex(index);
};

const removeItem=index=>{
setItems(prev=>prev.filter((_,i)=>i!==index));
if(editingIndex===index){
setItemForm(emptyItem);
setEditingIndex(-1);
}
showAutoCloseAlert('success','Purchase item removed');
};

const cancelItemEdit=()=>{
setItemForm(emptyItem);
setEditingIndex(-1);
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
purchaseDate:form.purchaseDate||null,
subtotal:Number(form.subtotal)||0,
discountTotal:Number(form.discountTotal)||0,
taxTotal:Number(form.taxTotal)||0,
shippingTotal:Number(form.shippingTotal)||0,
total:Number(form.total)||0,
purchaseItems:items.map(item=>({
...item,
quantity:Number(item.quantity)||0,
unitPrice:Number(item.unitPrice)||0,
discountAmount:Number(item.discountAmount)||0,
taxAmount:Number(item.taxAmount)||0,
subtotal:Number(item.subtotal)||0
}))
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save purchase');
showAutoCloseAlert('success',data.message||'Purchase saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

const getNameById=(list,id)=>{
const found=list.find(item=>item._id===id);
return found?found.name||found.title||found.code||found._id:'';
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
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Receipt</label>
<select className="form-select" name="receipt" value={form.receipt} onChange={handleChange}>
<option value="">Select Receipt</option>
{receipts.map(receipt=>(
<option key={receipt._id} value={receipt._id}>{receipt.name||receipt.receiptNumber||receipt._id}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Coupon</label>
<select className="form-select" name="coupon" value={form.coupon} onChange={handleChange}>
<option value="">Select Coupon</option>
{coupons.map(coupon=>(
<option key={coupon._id} value={coupon._id}>{coupon.title||coupon.code}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Shopping List</label>
<select className="form-select" name="shoppingList" value={form.shoppingList} onChange={handleChange}>
<option value="">Select Shopping List</option>
{shoppingLists.map(list=>(
<option key={list._id} value={list._id}>{list.name||list.title||list._id}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Purchase Date</label>
<input type="date" className="form-control" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Payment Method</label>
<input type="text" className="form-control" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Status</label>
<select className="form-select" name="status" value={form.status} onChange={handleChange}>
<option value="">Select Status</option>
{statuses.map(status=>(
<option key={status._id} value={status._id}>{status.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Subtotal</label>
<input type="number" className="form-control" name="subtotal" value={form.subtotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Discount</label>
<input type="number" className="form-control" name="discountTotal" value={form.discountTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Tax</label>
<input type="number" className="form-control" name="taxTotal" value={form.taxTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Shipping</label>
<input type="number" className="form-control" name="shippingTotal" value={form.shippingTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Total</label>
<input type="number" className="form-control" name="total" value={form.total} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Purchase Item Entry</h5>
<PurchaseItemForm
initialData={itemForm}
purchases={[]}
products={products}
shoppingListItems={shoppingListItems}
units={units}
endpoint=""
method="POST"
onSuccess={()=>{}}
/>
</div>

<div className="col-12">
<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Product</label>
<select className="form-select" value={itemForm.product} onChange={e=>handleItemFormChange(0,{...itemForm,product:e.target.value})}>
<option value="">Select Product</option>
{products.map(product=>(
<option key={product._id} value={product._id}>{product.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Shopping List Item</label>
<select className="form-select" value={itemForm.shoppingListItem} onChange={e=>handleItemFormChange(0,{...itemForm,shoppingListItem:e.target.value})}>
<option value="">Select Shopping List Item</option>
{shoppingListItems.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.title||item._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Unit</label>
<select className="form-select" value={itemForm.unit} onChange={e=>handleItemFormChange(0,{...itemForm,unit:e.target.value})}>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" value={itemForm.quantity} onChange={e=>{
const quantity=Number(e.target.value)||0;
const unitPrice=Number(itemForm.unitPrice)||0;
const discountAmount=Number(itemForm.discountAmount)||0;
const taxAmount=Number(itemForm.taxAmount)||0;
handleItemFormChange(0,{...itemForm,quantity:e.target.value,subtotal:Math.max((quantity*unitPrice)-discountAmount+taxAmount,0)});
}} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Unit Price</label>
<input type="number" className="form-control" value={itemForm.unitPrice} onChange={e=>{
const unitPrice=Number(e.target.value)||0;
const quantity=Number(itemForm.quantity)||0;
const discountAmount=Number(itemForm.discountAmount)||0;
const taxAmount=Number(itemForm.taxAmount)||0;
handleItemFormChange(0,{...itemForm,unitPrice:e.target.value,subtotal:Math.max((quantity*unitPrice)-discountAmount+taxAmount,0)});
}} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Discount</label>
<input type="number" className="form-control" value={itemForm.discountAmount} onChange={e=>{
const discountAmount=Number(e.target.value)||0;
const quantity=Number(itemForm.quantity)||0;
const unitPrice=Number(itemForm.unitPrice)||0;
const taxAmount=Number(itemForm.taxAmount)||0;
handleItemFormChange(0,{...itemForm,discountAmount:e.target.value,subtotal:Math.max((quantity*unitPrice)-discountAmount+taxAmount,0)});
}} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Tax</label>
<input type="number" className="form-control" value={itemForm.taxAmount} onChange={e=>{
const taxAmount=Number(e.target.value)||0;
const quantity=Number(itemForm.quantity)||0;
const unitPrice=Number(itemForm.unitPrice)||0;
const discountAmount=Number(itemForm.discountAmount)||0;
handleItemFormChange(0,{...itemForm,taxAmount:e.target.value,subtotal:Math.max((quantity*unitPrice)-discountAmount+taxAmount,0)});
}} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Subtotal</label>
<input type="number" className="form-control" value={itemForm.subtotal} onChange={e=>handleItemFormChange(0,{...itemForm,subtotal:e.target.value})} min="0" step="0.01" />
</div>

<div className="col-12">
<label className="form-label">Item Notes</label>
<textarea className="form-control" value={itemForm.notes} onChange={e=>handleItemFormChange(0,{...itemForm,notes:e.target.value})} rows="2"></textarea>
</div>

<div className="col-12 d-flex gap-2">
<button type="button" className="btn btn-outline-primary" onClick={addOrUpdateItem}>
{editingIndex>-1?'Update Purchase Item':'Add Purchase Item'}
</button>
{editingIndex>-1&&(
<button type="button" className="btn btn-outline-secondary" onClick={cancelItemEdit}>Cancel Edit</button>
)}
</div>
</div>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Purchase Items</h5>
<div className="table-responsive">
<table className="table table-bordered table-sm align-middle">
<thead>
<tr>
<th>Product</th>
<th>Qty</th>
<th>Unit Price</th>
<th>Discount</th>
<th>Tax</th>
<th>Subtotal</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{items.length?items.map((item,index)=>(
<tr key={index}>
<td>{getNameById(products,item.product)}</td>
<td>{item.quantity}</td>
<td>{item.unitPrice}</td>
<td>{item.discountAmount}</td>
<td>{item.taxAmount}</td>
<td>{item.subtotal}</td>
<td className="d-flex gap-2">
<button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>editItem(index)}>Edit</button>
<button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeItem(index)}>Remove</button>
</td>
</tr>
)):(
<tr>
<td colSpan="7" className="text-center">No purchase items added</td>
</tr>
)}
</tbody>
</table>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Purchase'}
</button>
</div>
</div>
</form>
);
}