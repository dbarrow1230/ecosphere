// /src/forms/BudgetForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function BudgetForm({initialData={},users=[],periods=[],categories=[],endpoint='/api/budgets',method='POST',onSuccess}){
const [form,setForm]=useState({
user:initialData.user?._id||initialData.user||'',
name:initialData.name||'',
totalAmount:initialData.totalAmount||0,
totalSpent:initialData.totalSpent||0,
period:initialData.period?._id||initialData.period||'',
startDate:initialData.startDate?new Date(initialData.startDate).toISOString().split('T')[0]:'',
endDate:initialData.endDate?new Date(initialData.endDate).toISOString().split('T')[0]:'',
alertAtPercent:initialData.alertAtPercent||80,
allocations:Array.isArray(initialData.allocations)&&initialData.allocations.length?initialData.allocations.map(item=>({
category:item.category?._id||item.category||'',
amount:item.amount||0,
spent:item.spent||0,
isOverBudget:item.isOverBudget||false,
notes:item.notes||''
})):[{category:'',amount:0,spent:0,isOverBudget:false,notes:''}],
isOverBudget:initialData.isOverBudget||false,
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true,
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
const {name,value,type,checked}=e.target;
setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
};

const handleAllocationChange=(index,e)=>{
const {name,value,type,checked}=e.target;
setForm(prev=>{
const allocations=[...prev.allocations];
allocations[index]={
...allocations[index],
[name]:type==='checkbox'?checked:value
};
return {...prev,allocations};
});
};

const addAllocation=()=>{
setForm(prev=>({
...prev,
allocations:[...prev.allocations,{category:'',amount:0,spent:0,isOverBudget:false,notes:''}]
}));
};

const removeAllocation=index=>{
setForm(prev=>({
...prev,
allocations:prev.allocations.filter((_,i)=>i!==index)
}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
totalAmount:Number(form.totalAmount)||0,
totalSpent:Number(form.totalSpent)||0,
alertAtPercent:Number(form.alertAtPercent)||0,
allocations:form.allocations.map(item=>({
...item,
amount:Number(item.amount)||0,
spent:Number(item.spent)||0
}))
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save budget');
showAutoCloseAlert('success',data.message||'Budget saved successfully');
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
<label className="form-label">User</label>
<select className="form-select" name="user" value={form.user} onChange={handleChange} required>
<option value="">Select User</option>
{users.map(user=>(
<option key={user._id} value={user._id}>{user.name||user.email}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Budget Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">Total Amount</label>
<input type="number" className="form-control" name="totalAmount" value={form.totalAmount} onChange={handleChange} min="0" step="0.01" required />
</div>

<div className="col-md-4">
<label className="form-label">Total Spent</label>
<input type="number" className="form-control" name="totalSpent" value={form.totalSpent} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Alert At Percent</label>
<input type="number" className="form-control" name="alertAtPercent" value={form.alertAtPercent} onChange={handleChange} min="0" max="100" step="1" />
</div>

<div className="col-md-4">
<label className="form-label">Period</label>
<select className="form-select" name="period" value={form.period} onChange={handleChange} required>
<option value="">Select Period</option>
{periods.map(period=>(
<option key={period._id} value={period._id}>{period.name}</option>
))}
</select>
</div>

<div className="col-md-4">
<label className="form-label">Start Date</label>
<input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">End Date</label>
<input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-12">
<div className="d-flex justify-content-between align-items-center mb-2">
<label className="form-label mb-0">Allocations</label>
<button type="button" className="btn btn-outline-primary btn-sm" onClick={addAllocation}>Add Allocation</button>
</div>
</div>

{form.allocations.map((allocation,index)=>(
<React.Fragment key={index}>
<div className="col-md-3">
<label className="form-label">Category</label>
<select className="form-select" name="category" value={allocation.category} onChange={e=>handleAllocationChange(index,e)} required>
<option value="">Select Category</option>
{categories.map(category=>(
<option key={category._id} value={category._id}>{category.name}</option>
))}
</select>
</div>

<div className="col-md-2">
<label className="form-label">Amount</label>
<input type="number" className="form-control" name="amount" value={allocation.amount} onChange={e=>handleAllocationChange(index,e)} min="0" step="0.01" required />
</div>

<div className="col-md-2">
<label className="form-label">Spent</label>
<input type="number" className="form-control" name="spent" value={allocation.spent} onChange={e=>handleAllocationChange(index,e)} min="0" step="0.01" />
</div>

<div className="col-md-3">
<label className="form-label">Notes</label>
<input type="text" className="form-control" name="notes" value={allocation.notes} onChange={e=>handleAllocationChange(index,e)} />
</div>

<div className="col-md-1 d-flex align-items-end">
<div className="form-check mb-2">
<input type="checkbox" className="form-check-input" id={`allocation-isOverBudget-${index}`} name="isOverBudget" checked={allocation.isOverBudget} onChange={e=>handleAllocationChange(index,e)} />
<label className="form-check-label" htmlFor={`allocation-isOverBudget-${index}`}>Over</label>
</div>
</div>

<div className="col-md-1 d-flex align-items-end">
<button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={()=>removeAllocation(index)} disabled={form.allocations.length===1}>Remove</button>
</div>
</React.Fragment>
))}

<div className="col-md-6">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isOverBudget" name="isOverBudget" checked={form.isOverBudget} onChange={handleChange} />
<label className="form-check-label" htmlFor="isOverBudget">Budget Is Over</label>
</div>
</div>

<div className="col-md-6">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Budget'}
</button>
</div>
</div>
</form>
);
}