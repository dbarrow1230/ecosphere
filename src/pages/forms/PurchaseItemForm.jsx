// /src/forms/PurchaseItemForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function PurchaseItemForm({initialData={},purchases=[],products=[],shoppingListItems=[],units=[],endpoint='/api/purchase-items',method='POST',onSuccess}){
const [form,setForm]=useState({
purchase:initialData.purchase?._id||initialData.purchase||'',
product:initialData.product?._id||initialData.product||'',
shoppingListItem:initialData.shoppingListItem?._id||initialData.shoppingListItem||'',
unit:initialData.unit?._id||initialData.unit||'',
quantity:initialData.quantity||1,
unitPrice:initialData.unitPrice||0,
discountAmount:initialData.discountAmount||0,
taxAmount:initialData.taxAmount||0,
subtotal:initialData.subtotal||0,
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
const quantity=Number(name==='quantity'?value:next.quantity)||0;
const unitPrice=Number(name==='unitPrice'?value:next.unitPrice)||0;
const discountAmount=Number(name==='discountAmount'?value:next.discountAmount)||0;
const taxAmount=Number(name==='taxAmount'?value:next.taxAmount)||0;
next.subtotal=Math.max((quantity*unitPrice)-discountAmount+taxAmount,0);
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
unitPrice:Number(form.unitPrice)||0,
discountAmount:Number(form.discountAmount)||0,
taxAmount:Number(form.taxAmount)||0,
subtotal:Number(form.subtotal)||0
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save purchase item');
showAutoCloseAlert('success',data.message||'Purchase item saved successfully');
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
<label className="form-label">Purchase</label>
<select className="form-select" name="purchase" value={form.purchase} onChange={handleChange} required>
<option value="">Select Purchase</option>
{purchases.map(purchase=>(
<option key={purchase._id} value={purchase._id}>{purchase.name||purchase.purchaseNumber||purchase._id}</option>
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

<div className="col-md-6">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Quantity</label>
<input type="number" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-3">
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

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Purchase Item'}
</button>
</div>
</div>
</form>
);
}