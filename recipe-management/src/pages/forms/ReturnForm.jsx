import Alert from "../../components/AppAlert.jsx";
// /src/forms/ReturnForm.jsx
import React,{useEffect,useRef,useState} from 'react';
import ReturnItemForm from './ReturnItemForm';

export default function ReturnForm({initialData={},users=[],stores=[],orders=[],purchases=[],receipts=[],statuses=[],refundStatuses=[],refundMethods=[],orderItems=[],purchaseItems=[],products=[],units=[],endpoint='/api/returns',method='POST',onSuccess}){
const emptyItem={
_id:'',
return:'',
orderItem:'',
purchaseItem:'',
product:'',
unit:'',
quantity:1,
unitPrice:0,
refundAmount:0,
reason:'',
condition:'',
resolution:'',
status:'',
notes:''
};
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
store:initialData.store?._id||initialData.store||'',
order:initialData.order?._id||initialData.order||'',
purchase:initialData.purchase?._id||initialData.purchase||'',
receipt:initialData.receipt?._id||initialData.receipt||'',
returnNumber:initialData.returnNumber||'',
returnDate:initialData.returnDate?new Date(initialData.returnDate).toISOString().split('T')[0]:'',
status:initialData.status?._id||initialData.status||'',
refundStatus:initialData.refundStatus?._id||initialData.refundStatus||'',
refundMethod:initialData.refundMethod?._id||initialData.refundMethod||'',
carrier:initialData.carrier||'',
trackingNumber:initialData.trackingNumber||'',
trackingUrl:initialData.trackingUrl||'',
reason:initialData.reason||'',
refundTotal:initialData.refundTotal||0,
requestedAt:initialData.requestedAt?new Date(initialData.requestedAt).toISOString().split('T')[0]:'',
approvedAt:initialData.approvedAt?new Date(initialData.approvedAt).toISOString().split('T')[0]:'',
shippedAt:initialData.shippedAt?new Date(initialData.shippedAt).toISOString().split('T')[0]:'',
receivedAt:initialData.receivedAt?new Date(initialData.receivedAt).toISOString().split('T')[0]:'',
completedAt:initialData.completedAt?new Date(initialData.completedAt).toISOString().split('T')[0]:'',
notes:initialData.notes||''
});
const [itemForm,setItemForm]=useState(emptyItem);
const [items,setItems]=useState(Array.isArray(initialData.returnItems)&&initialData.returnItems.length?initialData.returnItems.map(item=>({
_id:item._id||'',
return:item.return?._id||item.return||'',
orderItem:item.orderItem?._id||item.orderItem||'',
purchaseItem:item.purchaseItem?._id||item.purchaseItem||'',
product:item.product?._id||item.product||'',
unit:item.unit?._id||item.unit||'',
quantity:item.quantity||1,
unitPrice:item.unitPrice||0,
refundAmount:item.refundAmount||0,
reason:item.reason?._id||item.reason||'',
condition:item.condition?._id||item.condition||'',
resolution:item.resolution?._id||item.resolution||'',
status:item.status?._id||item.status||'',
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
const refundTotal=items.reduce((sum,item)=>sum+(Number(item.refundAmount)||0),0);
setForm(prev=>({...prev,refundTotal}));
},[items]);

const handleChange=e=>{
const {name,value}=e.target;
setForm(prev=>({...prev,[name]:value}));
};

const handleItemFormChange=data=>{
setItemForm(data);
};

const addOrUpdateItem=()=>{
if(!itemForm.product)return showAutoCloseAlert('danger','Product is required');
if(editingIndex>-1){
setItems(prev=>prev.map((item,index)=>index===editingIndex?itemForm:item));
showAutoCloseAlert('success','Return item updated');
}else{
setItems(prev=>[...prev,itemForm]);
showAutoCloseAlert('success','Return item added');
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
showAutoCloseAlert('success','Return item removed');
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
refundTotal:Number(form.refundTotal)||0,
returnDate:form.returnDate||null,
requestedAt:form.requestedAt||null,
approvedAt:form.approvedAt||null,
shippedAt:form.shippedAt||null,
receivedAt:form.receivedAt||null,
completedAt:form.completedAt||null,
returnItems:items.map(item=>({
...item,
quantity:Number(item.quantity)||0,
unitPrice:Number(item.unitPrice)||0,
refundAmount:Number(item.refundAmount)||0
}))
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save return');
showAutoCloseAlert('success',data.message||'Return saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

const getNameById=(list,id,labelKeys=['name','title','code','returnNumber'])=>{
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
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Return Number</label>
<input type="text" className="form-control" name="returnNumber" value={form.returnNumber} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">Order</label>
<select className="form-select" name="order" value={form.order} onChange={handleChange}>
<option value="">Select Order</option>
{orders.map(order=>(
<option key={order._id} value={order._id}>{order.orderNumber||order.name||order._id}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Purchase</label>
<select className="form-select" name="purchase" value={form.purchase} onChange={handleChange}>
<option value="">Select Purchase</option>
{purchases.map(purchase=>(
<option key={purchase._id} value={purchase._id}>{purchase.purchaseNumber||purchase.name||purchase._id}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Receipt</label>
<select className="form-select" name="receipt" value={form.receipt} onChange={handleChange}>
<option value="">Select Receipt</option>
{receipts.map(receipt=>(
<option key={receipt._id} value={receipt._id}>{receipt.receiptNumber||receipt.name||receipt._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Return Date</label>
<input type="date" className="form-control" name="returnDate" value={form.returnDate} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Status</label>
<select className="form-select" name="status" value={form.status} onChange={handleChange}>
<option value="">Select Status</option>
{statuses.map(status=>(
<option key={status._id} value={status._id}>{status.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Refund Status</label>
<select className="form-select" name="refundStatus" value={form.refundStatus} onChange={handleChange}>
<option value="">Select Refund Status</option>
{refundStatuses.map(status=>(
<option key={status._id} value={status._id}>{status.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Refund Method</label>
<select className="form-select" name="refundMethod" value={form.refundMethod} onChange={handleChange}>
<option value="">Select Refund Method</option>
{refundMethods.map(status=>(
<option key={status._id} value={status._id}>{status.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Carrier</label>
<input type="text" className="form-control" name="carrier" value={form.carrier} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Tracking Number</label>
<input type="text" className="form-control" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Tracking URL</label>
<input type="text" className="form-control" name="trackingUrl" value={form.trackingUrl} onChange={handleChange} />
</div>

<div className="col-md-8">
<label className="form-label">Reason</label>
<input type="text" className="form-control" name="reason" value={form.reason} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Refund Total</label>
<input type="number" className="form-control" name="refundTotal" value={form.refundTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Requested At</label>
<input type="date" className="form-control" name="requestedAt" value={form.requestedAt} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Approved At</label>
<input type="date" className="form-control" name="approvedAt" value={form.approvedAt} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Shipped At</label>
<input type="date" className="form-control" name="shippedAt" value={form.shippedAt} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Received At</label>
<input type="date" className="form-control" name="receivedAt" value={form.receivedAt} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Completed At</label>
<input type="date" className="form-control" name="completedAt" value={form.completedAt} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Return Item Entry</h5>
<ReturnItemForm
initialData={itemForm}
returns={[]}
orderItems={orderItems}
purchaseItems={purchaseItems}
products={products}
units={units}
statuses={statuses}
endpoint=""
method="POST"
onSuccess={()=>{}}
/>
</div>

<div className="col-12">
<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Order Item</label>
<select className="form-select" value={itemForm.orderItem} onChange={e=>handleItemFormChange({...itemForm,orderItem:e.target.value})}>
<option value="">Select Order Item</option>
{orderItems.map(item=>(
<option key={item._id} value={item._id}>{item.product?.name||item.name||item._id}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Purchase Item</label>
<select className="form-select" value={itemForm.purchaseItem} onChange={e=>handleItemFormChange({...itemForm,purchaseItem:e.target.value})}>
<option value="">Select Purchase Item</option>
{purchaseItems.map(item=>(
<option key={item._id} value={item._id}>{item.product?.name||item.name||item._id}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Product</label>
<select className="form-select" value={itemForm.product} onChange={e=>handleItemFormChange({...itemForm,product:e.target.value})}>
<option value="">Select Product</option>
{products.map(item=>(
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
<label className="form-label">Unit Price</label>
<input type="number" className="form-control" value={itemForm.unitPrice} onChange={e=>handleItemFormChange({...itemForm,unitPrice:e.target.value})} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Refund Amount</label>
<input type="number" className="form-control" value={itemForm.refundAmount} onChange={e=>handleItemFormChange({...itemForm,refundAmount:e.target.value})} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Reason</label>
<select className="form-select" value={itemForm.reason} onChange={e=>handleItemFormChange({...itemForm,reason:e.target.value})}>
<option value="">Select Reason</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Condition</label>
<select className="form-select" value={itemForm.condition} onChange={e=>handleItemFormChange({...itemForm,condition:e.target.value})}>
<option value="">Select Condition</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Resolution</label>
<select className="form-select" value={itemForm.resolution} onChange={e=>handleItemFormChange({...itemForm,resolution:e.target.value})}>
<option value="">Select Resolution</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Item Status</label>
<select className="form-select" value={itemForm.status} onChange={e=>handleItemFormChange({...itemForm,status:e.target.value})}>
<option value="">Select Status</option>
{statuses.map(item=>(
<option key={item._id} value={item._id}>{item.name}</option>
))}
</select>
</div>

<div className="col-12">
<label className="form-label">Item Notes</label>
<textarea className="form-control" value={itemForm.notes} onChange={e=>handleItemFormChange({...itemForm,notes:e.target.value})} rows="2"></textarea>
</div>

<div className="col-12 d-flex gap-2">
<button type="button" className="btn btn-outline-primary" onClick={addOrUpdateItem}>
{editingIndex>-1?'Update Return Item':'Add Return Item'}
</button>
{editingIndex>-1&&(
<button type="button" className="btn btn-outline-secondary" onClick={cancelItemEdit}>Cancel Edit</button>
)}
</div>
</div>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Return Items</h5>
<div className="table-responsive">
<table className="table table-bordered table-sm align-middle">
<thead>
<tr>
<th>Product</th>
<th>Qty</th>
<th>Unit Price</th>
<th>Refund</th>
<th>Reason</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{items.length?items.map((item,index)=>(
<tr key={index}>
<td>{getNameById(products,item.product)}</td>
<td>{item.quantity}</td>
<td>{item.unitPrice}</td>
<td>{item.refundAmount}</td>
<td>{getNameById(statuses,item.reason)}</td>
<td>{getNameById(statuses,item.status)}</td>
<td className="d-flex gap-2">
<button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>editItem(index)}>Edit</button>
<button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeItem(index)}>Remove</button>
</td>
</tr>
)):(
<tr>
<td colSpan="7" className="text-center">No return items added</td>
</tr>
)}
</tbody>
</table>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Return'}
</button>
</div>
</div>
</form>
);
}