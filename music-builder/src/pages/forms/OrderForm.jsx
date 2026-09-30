// /src/forms/OrderForm.jsx
import React,{useEffect,useRef,useState} from 'react';
import OrderItemForm from './OrderItemForm';
import {ORDER_TYPES} from '../../../backend/constants/modelOptions';

const ORDER_TYPE_OPTIONS=[
{value:ORDER_TYPES.ONLINE,label:'Online'},
{value:ORDER_TYPES.PICKUP,label:'Pickup'},
{value:ORDER_TYPES.DELIVERY,label:'Delivery'}
];

export default function OrderForm({initialData={},users=[],stores=[],shoppingLists=[],coupons=[],receipts=[],statuses=[],paymentStatuses=[],shippingStatuses=[],states=[],countries=[],products=[],shoppingListItems=[],units=[],endpoint='/api/orders',method='POST',onSuccess}){
const emptyItem={
_id:'',
order:'',
product:'',
shoppingListItem:'',
unit:'',
store:'',
quantityOrdered:1,
quantityShipped:0,
quantityDelivered:0,
quantityCancelled:0,
quantityReturned:0,
unitPrice:0,
discountAmount:0,
taxAmount:0,
subtotal:0,
status:'',
carrier:'',
trackingNumber:'',
trackingUrl:'',
estimatedDeliveryDate:'',
shippedAt:'',
deliveredAt:'',
notes:''
};
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
store:initialData.store?._id||initialData.store||'',
shoppingList:initialData.shoppingList?._id||initialData.shoppingList||'',
coupon:initialData.coupon?._id||initialData.coupon||'',
receipt:initialData.receipt?._id||initialData.receipt||'',
orderNumber:initialData.orderNumber||'',
orderDate:initialData.orderDate?new Date(initialData.orderDate).toISOString().split('T')[0]:'',
type:initialData.type||ORDER_TYPES.ONLINE,
status:initialData.status?._id||initialData.status||'',
paymentStatus:initialData.paymentStatus?._id||initialData.paymentStatus||'',
shippingStatus:initialData.shippingStatus?._id||initialData.shippingStatus||'',
carrier:initialData.carrier||'',
trackingNumber:initialData.trackingNumber||'',
trackingUrl:initialData.trackingUrl||'',
shippingAddress1:initialData.shippingAddress1||'',
shippingAddress2:initialData.shippingAddress2||'',
shippingCity:initialData.shippingCity||'',
shippingState:initialData.shippingState?._id||initialData.shippingState||'',
shippingCountry:initialData.shippingCountry?._id||initialData.shippingCountry||'',
shippingPostalCode:initialData.shippingPostalCode||'',
billingAddress1:initialData.billingAddress1||'',
billingAddress2:initialData.billingAddress2||'',
billingCity:initialData.billingCity||'',
billingState:initialData.billingState?._id||initialData.billingState||'',
billingCountry:initialData.billingCountry?._id||initialData.billingCountry||'',
billingPostalCode:initialData.billingPostalCode||'',
subtotal:initialData.subtotal||0,
discountTotal:initialData.discountTotal||0,
taxTotal:initialData.taxTotal||0,
shippingTotal:initialData.shippingTotal||0,
refundTotal:initialData.refundTotal||0,
total:initialData.total||0,
estimatedDeliveryDate:initialData.estimatedDeliveryDate?new Date(initialData.estimatedDeliveryDate).toISOString().split('T')[0]:'',
shippedAt:initialData.shippedAt?new Date(initialData.shippedAt).toISOString().split('T')[0]:'',
deliveredAt:initialData.deliveredAt?new Date(initialData.deliveredAt).toISOString().split('T')[0]:'',
cancelledAt:initialData.cancelledAt?new Date(initialData.cancelledAt).toISOString().split('T')[0]:'',
notes:initialData.notes||''
});
const [itemForm,setItemForm]=useState(emptyItem);
const [items,setItems]=useState(Array.isArray(initialData.orderItems)&&initialData.orderItems.length?initialData.orderItems.map(item=>({
_id:item._id||'',
order:item.order?._id||item.order||'',
product:item.product?._id||item.product||'',
shoppingListItem:item.shoppingListItem?._id||item.shoppingListItem||'',
unit:item.unit?._id||item.unit||'',
store:item.store?._id||item.store||'',
quantityOrdered:item.quantityOrdered||1,
quantityShipped:item.quantityShipped||0,
quantityDelivered:item.quantityDelivered||0,
quantityCancelled:item.quantityCancelled||0,
quantityReturned:item.quantityReturned||0,
unitPrice:item.unitPrice||0,
discountAmount:item.discountAmount||0,
taxAmount:item.taxAmount||0,
subtotal:item.subtotal||0,
status:item.status?._id||item.status||'',
carrier:item.carrier||'',
trackingNumber:item.trackingNumber||'',
trackingUrl:item.trackingUrl||'',
estimatedDeliveryDate:item.estimatedDeliveryDate?new Date(item.estimatedDeliveryDate).toISOString().split('T')[0]:'',
shippedAt:item.shippedAt?new Date(item.shippedAt).toISOString().split('T')[0]:'',
deliveredAt:item.deliveredAt?new Date(item.deliveredAt).toISOString().split('T')[0]:'',
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
setForm(prev=>{
const discountTotal=Number(prev.discountTotal)||0;
const taxTotal=Number(prev.taxTotal)||0;
const shippingTotal=Number(prev.shippingTotal)||0;
const refundTotal=Number(prev.refundTotal)||0;
return{
...prev,
subtotal,
total:Math.max(subtotal-discountTotal+taxTotal+shippingTotal-refundTotal,0)
};
});
},[items]);

const handleChange=e=>{
const {name,value}=e.target;
setForm(prev=>{
const next={...prev,[name]:value};
const subtotal=Number(next.subtotal)||0;
const discountTotal=Number(name==='discountTotal'?value:next.discountTotal)||0;
const taxTotal=Number(name==='taxTotal'?value:next.taxTotal)||0;
const shippingTotal=Number(name==='shippingTotal'?value:next.shippingTotal)||0;
const refundTotal=Number(name==='refundTotal'?value:next.refundTotal)||0;
next.total=Math.max(subtotal-discountTotal+taxTotal+shippingTotal-refundTotal,0);
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
showAutoCloseAlert('success','Order item updated');
}else{
setItems(prev=>[...prev,itemForm]);
showAutoCloseAlert('success','Order item added');
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
showAutoCloseAlert('success','Order item removed');
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
subtotal:Number(form.subtotal)||0,
discountTotal:Number(form.discountTotal)||0,
taxTotal:Number(form.taxTotal)||0,
shippingTotal:Number(form.shippingTotal)||0,
refundTotal:Number(form.refundTotal)||0,
total:Number(form.total)||0,
orderDate:form.orderDate||null,
estimatedDeliveryDate:form.estimatedDeliveryDate||null,
shippedAt:form.shippedAt||null,
deliveredAt:form.deliveredAt||null,
cancelledAt:form.cancelledAt||null,
orderItems:items.map(item=>({
...item,
quantityOrdered:Number(item.quantityOrdered)||0,
quantityShipped:Number(item.quantityShipped)||0,
quantityDelivered:Number(item.quantityDelivered)||0,
quantityCancelled:Number(item.quantityCancelled)||0,
quantityReturned:Number(item.quantityReturned)||0,
unitPrice:Number(item.unitPrice)||0,
discountAmount:Number(item.discountAmount)||0,
taxAmount:Number(item.taxAmount)||0,
subtotal:Number(item.subtotal)||0,
estimatedDeliveryDate:item.estimatedDeliveryDate||null,
shippedAt:item.shippedAt||null,
deliveredAt:item.deliveredAt||null
}))
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save order');
showAutoCloseAlert('success',data.message||'Order saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

const getNameById=(list,id)=>{
const found=list.find(item=>item._id===id);
return found?found.name||found.title||found.code||found.orderNumber||found._id:'';
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
<label className="form-label">Shopping List</label>
<select className="form-select" name="shoppingList" value={form.shoppingList} onChange={handleChange}>
<option value="">Select Shopping List</option>
{shoppingLists.map(list=>(
<option key={list._id} value={list._id}>{list.name||list.title||list._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Coupon</label>
<select className="form-select" name="coupon" value={form.coupon} onChange={handleChange}>
<option value="">Select Coupon</option>
{coupons.map(coupon=>(
<option key={coupon._id} value={coupon._id}>{coupon.title||coupon.code}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Receipt</label>
<select className="form-select" name="receipt" value={form.receipt} onChange={handleChange}>
<option value="">Select Receipt</option>
{receipts.map(receipt=>(
<option key={receipt._id} value={receipt._id}>{receipt.name||receipt.receiptNumber||receipt._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Order Number</label>
<input type="text" className="form-control" name="orderNumber" value={form.orderNumber} onChange={handleChange} required />
</div>

<div className="col-md-3">
<label className="form-label">Order Date</label>
<input type="date" className="form-control" name="orderDate" value={form.orderDate} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Type</label>
<select className="form-select" name="type" value={form.type} onChange={handleChange}>
{ORDER_TYPE_OPTIONS.map(item=>(
<option key={item.value} value={item.value}>{item.label}</option>
))}
</select>
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
<label className="form-label">Payment Status</label>
<select className="form-select" name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
<option value="">Select Payment Status</option>
{paymentStatuses.map(status=>(
<option key={status._id} value={status._id}>{status.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Shipping Status</label>
<select className="form-select" name="shippingStatus" value={form.shippingStatus} onChange={handleChange}>
<option value="">Select Shipping Status</option>
{shippingStatuses.map(status=>(
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

<div className="col-md-6">
<label className="form-label">Shipping Address 1</label>
<input type="text" className="form-control" name="shippingAddress1" value={form.shippingAddress1} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Shipping Address 2</label>
<input type="text" className="form-control" name="shippingAddress2" value={form.shippingAddress2} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Shipping City</label>
<input type="text" className="form-control" name="shippingCity" value={form.shippingCity} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Shipping State</label>
<select className="form-select" name="shippingState" value={form.shippingState} onChange={handleChange}>
<option value="">Select State</option>
{states.map(state=>(
<option key={state._id} value={state._id}>{state.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Shipping Country</label>
<select className="form-select" name="shippingCountry" value={form.shippingCountry} onChange={handleChange}>
<option value="">Select Country</option>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Shipping Postal Code</label>
<input type="text" className="form-control" name="shippingPostalCode" value={form.shippingPostalCode} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Billing Address 1</label>
<input type="text" className="form-control" name="billingAddress1" value={form.billingAddress1} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Billing Address 2</label>
<input type="text" className="form-control" name="billingAddress2" value={form.billingAddress2} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Billing City</label>
<input type="text" className="form-control" name="billingCity" value={form.billingCity} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Billing State</label>
<select className="form-select" name="billingState" value={form.billingState} onChange={handleChange}>
<option value="">Select State</option>
{states.map(state=>(
<option key={state._id} value={state._id}>{state.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Billing Country</label>
<select className="form-select" name="billingCountry" value={form.billingCountry} onChange={handleChange}>
<option value="">Select Country</option>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Billing Postal Code</label>
<input type="text" className="form-control" name="billingPostalCode" value={form.billingPostalCode} onChange={handleChange} />
</div>

<div className="col-md-2">
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
<label className="form-label">Refund</label>
<input type="number" className="form-control" name="refundTotal" value={form.refundTotal} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Total</label>
<input type="number" className="form-control" name="total" value={form.total} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Estimated Delivery</label>
<input type="date" className="form-control" name="estimatedDeliveryDate" value={form.estimatedDeliveryDate} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Shipped At</label>
<input type="date" className="form-control" name="shippedAt" value={form.shippedAt} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Delivered At</label>
<input type="date" className="form-control" name="deliveredAt" value={form.deliveredAt} onChange={handleChange} />
</div>

<div className="col-md-3">
<label className="form-label">Cancelled At</label>
<input type="date" className="form-control" name="cancelledAt" value={form.cancelledAt} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Order Item Entry</h5>
<OrderItemForm
index={0}
item={itemForm}
products={products}
shoppingListItems={shoppingListItems}
units={units}
stores={stores}
statuses={statuses}
onChange={handleItemFormChange}
onRemove={()=>{}}
embedded={true}
showRemove={false}
/>
<div className="d-flex gap-2 mt-3">
<button type="button" className="btn btn-outline-primary" onClick={addOrUpdateItem}>
{editingIndex>-1?'Update Order Item':'Add Order Item'}
</button>
{editingIndex>-1&&(
<button type="button" className="btn btn-outline-secondary" onClick={cancelItemEdit}>Cancel Edit</button>
)}
</div>
</div>

<div className="col-12">
<hr />
<h5 className="mb-3">Order Items</h5>
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
<td>{item.quantityOrdered}</td>
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
<td colSpan="7" className="text-center">No order items added</td>
</tr>
)}
</tbody>
</table>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Order'}
</button>
</div>
</div>
</form>
);
}