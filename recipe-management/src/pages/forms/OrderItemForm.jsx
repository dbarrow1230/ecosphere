import Alert from "../../components/AppAlert.jsx";
// /src/forms/OrderItemForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function OrderItemForm({initialData={},orders=[],products=[],shoppingListItems=[],units=[],stores=[],statuses=[],endpoint='/api/order-items',method='POST',onSuccess}){
const [form,setForm]=useState({
order:initialData.order?._id||initialData.order||'',
product:initialData.product?._id||initialData.product||'',
shoppingListItem:initialData.shoppingListItem?._id||initialData.shoppingListItem||'',
unit:initialData.unit?._id||initialData.unit||'',
store:initialData.store?._id||initialData.store||'',
quantityOrdered:initialData.quantityOrdered||1,
quantityShipped:initialData.quantityShipped||0,
quantityDelivered:initialData.quantityDelivered||0,
quantityCancelled:initialData.quantityCancelled||0,
quantityReturned:initialData.quantityReturned||0,
unitPrice:initialData.unitPrice||0,
discountAmount:initialData.discountAmount||0,
taxAmount:initialData.taxAmount||0,
subtotal:initialData.subtotal||0,
status:initialData.status?._id||initialData.status||'',
carrier:initialData.carrier||'',
trackingNumber:initialData.trackingNumber||'',
trackingUrl:initialData.trackingUrl||'',
estimatedDeliveryDate:initialData.estimatedDeliveryDate?new Date(initialData.estimatedDeliveryDate).toISOString().split('T')[0]:'',
shippedAt:initialData.shippedAt?new Date(initialData.shippedAt).toISOString().split('T')[0]:'',
deliveredAt:initialData.deliveredAt?new Date(initialData.deliveredAt).toISOString().split('T')[0]:'',
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
const quantityOrdered=Number(name==='quantityOrdered'?value:prev.quantityOrdered)||0;
const unitPrice=Number(name==='unitPrice'?value:prev.unitPrice)||0;
const discountAmount=Number(name==='discountAmount'?value:prev.discountAmount)||0;
const taxAmount=Number(name==='taxAmount'?value:prev.taxAmount)||0;
next.subtotal=Math.max((quantityOrdered*unitPrice)-discountAmount+taxAmount,0);
return next;
});
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
quantityOrdered:Number(form.quantityOrdered)||0,
quantityShipped:Number(form.quantityShipped)||0,
quantityDelivered:Number(form.quantityDelivered)||0,
quantityCancelled:Number(form.quantityCancelled)||0,
quantityReturned:Number(form.quantityReturned)||0,
unitPrice:Number(form.unitPrice)||0,
discountAmount:Number(form.discountAmount)||0,
taxAmount:Number(form.taxAmount)||0,
subtotal:Number(form.subtotal)||0,
estimatedDeliveryDate:form.estimatedDeliveryDate||null,
shippedAt:form.shippedAt||null,
deliveredAt:form.deliveredAt||null
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save order item');
showAutoCloseAlert('success',data.message||'Order item saved successfully');
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
<label className="form-label">Order</label>
<select className="form-select" name="order" value={form.order} onChange={handleChange} required>
<option value="">Select Order</option>
{orders.map(order=>(
<option key={order._id} value={order._id}>{order.name||order.orderNumber||order._id}</option>
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
<label className="form-label">Shopping List Item</label>
<select className="form-select" name="shoppingListItem" value={form.shoppingListItem} onChange={handleChange}>
<option value="">Select Shopping List Item</option>
{shoppingListItems.map(item=>(
<option key={item._id} value={item._id}>{item.name||item.title||item._id}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Store</label>
<select className="form-select" name="store" value={form.store} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-2">
<label className="form-label">Qty Ordered</label>
<input type="number" className="form-control" name="quantityOrdered" value={form.quantityOrdered} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-2">
<label className="form-label">Qty Shipped</label>
<input type="number" className="form-control" name="quantityShipped" value={form.quantityShipped} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Qty Delivered</label>
<input type="number" className="form-control" name="quantityDelivered" value={form.quantityDelivered} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Qty Cancelled</label>
<input type="number" className="form-control" name="quantityCancelled" value={form.quantityCancelled} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Qty Returned</label>
<input type="number" className="form-control" name="quantityReturned" value={form.quantityReturned} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Unit Price</label>
<input type="number" className="form-control" name="unitPrice" value={form.unitPrice} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-2">
<label className="form-label">Discount</label>
<input type="number" className="form-control" name="discountAmount" value={form.discountAmount} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Tax</label>
<input type="number" className="form-control" name="taxAmount" value={form.taxAmount} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-2">
<label className="form-label">Subtotal</label>
<input type="number" className="form-control" name="subtotal" value={form.subtotal} onChange={handleChange} min="0" step="0.01" required />
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
<label className="form-label">Carrier</label>
<input type="text" className="form-control" name="carrier" value={form.carrier} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Tracking Number</label>
<input type="text" className="form-control" name="trackingNumber" value={form.trackingNumber} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Tracking URL</label>
<input type="text" className="form-control" name="trackingUrl" value={form.trackingUrl} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Est. Delivery</label>
<input type="date" className="form-control" name="estimatedDeliveryDate" value={form.estimatedDeliveryDate} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Shipped At</label>
<input type="date" className="form-control" name="shippedAt" value={form.shippedAt} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Delivered At</label>
<input type="date" className="form-control" name="deliveredAt" value={form.deliveredAt} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Order Item'}
</button>
</div>
</div>
</form>
);
}