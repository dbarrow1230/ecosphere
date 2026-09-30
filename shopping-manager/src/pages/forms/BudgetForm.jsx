// /src/forms/BudgetForm.jsx
import React,{useEffect,useMemo,useRef,useState} from 'react';

const DEFAULT_BUDGET_TYPES=[
{key:'cash',label:'Cash Budget',amount:''},
{key:'food',label:'Food Budget',amount:''},
{key:'entertainment',label:'Entertainment Budget',amount:''},
{key:'home',label:'Home Budget',amount:''},
{key:'electronics',label:'Electronics Budget',amount:''}
];

const CUSTOM_TARGET_VALUE='__custom__';
const EMPTY_ALLOCATION={budgetType:'',category:'',targetName:'',amount:'',spent:0,isPriority:false,notes:''};
const PRIORITY_BILLS=['Rent','Electric','Internet','Phone','Credit Card'];
const BUDGET_TYPE_KEYWORDS={
food:['food','grocery','groceries','pantry','produce','meat','seafood','dairy','bread','beverage','drink','paper','household','cleaning'],
entertainment:['entertainment','movie','movies','game','games','music','event','events','ticket','tickets','restaurant','dining','hobby'],
electronics:['electronics','electronic','computer','mobile','tablet','tv','television','audio','camera','printer','ink','inkjet','device','cable'],
home:['home','house','household','rent','electric','utility','utilities','internet','phone','mortgage','insurance','repair','maintenance','furniture','decor','cleaning']
};

const getId=value=>{
if(!value)return '';
if(typeof value==='object')return value._id||value.id||'';
return value;
};

const toNumber=value=>{
const num=Number(value);
return Number.isFinite(num)?num:0;
};

const formatMoney=value=>toNumber(value).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

const SummaryBox=({label,value,className='',style})=>(
<div className="col-md-3">
<strong>{label}:</strong> <span className={className} style={style}>${formatMoney(value)}</span>
</div>
);

const makeKey=value=>{
const key=String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
return key||`budget-${Date.now()}`;
};

const textForCategory=category=>[
category?.name,
category?.slug,
category?.description,
category?.parentCategory?.name,
category?.parentCategory?.slug
].filter(Boolean).join(' ').toLowerCase();

const categoryMatchesBudgetType=(category,budgetType)=>{
const typeKey=makeKey(budgetType);
if(typeKey==='cash')return true;
const words=BUDGET_TYPE_KEYWORDS[typeKey]||String(budgetType||'').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
if(!words.length)return true;
const text=textForCategory(category);
return words.some(word=>text.includes(word));
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

const getInitialUserId=initialData=>getId(initialData.user)||getId(getStoredUser());

const buildBudgetTypes=initialData=>{
if(Array.isArray(initialData.budgetTypes)&&initialData.budgetTypes.length){
return initialData.budgetTypes.map(item=>({
key:makeKey(item.key||item.label||item.name),
label:item.label||item.name||item.key||'Budget Type',
amount:item.amount===0?'0':item.amount||''
}));
}
return DEFAULT_BUDGET_TYPES.map(item=>({...item}));
};

const buildAllocationRows=initialData=>{
if(!Array.isArray(initialData.allocations))return [];
return initialData.allocations.map(item=>({
budgetType:makeKey(item.budgetType||item.type),
category:getId(item.category),
targetName:item.targetName||'',
amount:item.amount===0?'0':item.amount||'',
spent:toNumber(item.spent),
isPriority:!!item.isPriority,
notes:item.notes||''
}));
};

export default function BudgetForm({initialData={},users=[],categories=[],endpoint='/api/budgets',method='POST',onSuccess}){
const storedUser=getStoredUser();
const storedUserId=getId(storedUser);
const userOptions=storedUserId&&!users.some(user=>String(getId(user))===String(storedUserId))?[storedUser,...users]:users;
const [form,setForm]=useState(()=>({
user:getInitialUserId(initialData),
name:initialData.name||'',
budgetTypes:buildBudgetTypes(initialData),
startDate:initialData.startDate?new Date(initialData.startDate).toISOString().split('T')[0]:'',
endDate:initialData.endDate?new Date(initialData.endDate).toISOString().split('T')[0]:'',
alertAtPercent:initialData.alertAtPercent||80,
allocations:buildAllocationRows(initialData),
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true,
notes:initialData.notes||''
}));
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const [targetSearch,setTargetSearch]=useState({});
const alertTimerRef=useRef(null);

const allocationsByType=useMemo(()=>{
return form.allocations.reduce((acc,item)=>{
if(!item.budgetType)return acc;
if(!acc[item.budgetType])acc[item.budgetType]=[];
acc[item.budgetType].push(item);
return acc;
},{});
},[form.allocations]);

const allocationTotalByType=useMemo(()=>{
return form.allocations.reduce((acc,item)=>{
acc[item.budgetType]=(acc[item.budgetType]||0)+toNumber(item.amount);
return acc;
},{});
},[form.allocations]);

const totalBudget=useMemo(()=>form.budgetTypes.reduce((sum,type)=>sum+toNumber(type.amount),0),[form.budgetTypes]);
const totalAllocated=useMemo(()=>form.allocations.reduce((sum,item)=>sum+toNumber(item.amount),0),[form.allocations]);
const totalSpent=useMemo(()=>form.allocations.reduce((sum,item)=>sum+toNumber(item.spent),0),[form.allocations]);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({type,message,show:true});
alertTimerRef.current=setTimeout(()=>setAlert(prev=>({...prev,show:false})),3000);
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

const handleBudgetTypeChange=(index,field,value)=>{
setForm(prev=>{
const budgetTypes=[...prev.budgetTypes];
const current=budgetTypes[index];
const next={...current,[field]:value};
budgetTypes[index]=next;
return {...prev,budgetTypes};
});
};

const addBudgetType=()=>{
setForm(prev=>({
...prev,
budgetTypes:[...prev.budgetTypes,{key:`custom-${Date.now()}`,label:'',amount:''}]
}));
};

const removeBudgetType=index=>{
setForm(prev=>{
const target=prev.budgetTypes[index];
return {
...prev,
budgetTypes:prev.budgetTypes.filter((_,i)=>i!==index),
allocations:prev.allocations.filter(item=>item.budgetType!==target.key)
};
});
};

const handleAllocationChange=(index,e)=>{
const {name,value,type,checked}=e.target;
setForm(prev=>{
const allocations=[...prev.allocations];
if(name==='category'){
allocations[index]={
...allocations[index],
category:value===CUSTOM_TARGET_VALUE?'':value,
targetName:value===CUSTOM_TARGET_VALUE?allocations[index].targetName:''
};
}else{
allocations[index]={...allocations[index],[name]:type==='checkbox'?checked:value};
}
return {...prev,allocations};
});
};

const addAllocation=budgetType=>{
setForm(prev=>({
...prev,
allocations:[...prev.allocations,{...EMPTY_ALLOCATION,budgetType}]
}));
};

const addPriorityBill=(budgetType,name)=>{
setForm(prev=>({
...prev,
allocations:[
...prev.allocations,
{...EMPTY_ALLOCATION,budgetType,targetName:name,isPriority:true}
]
}));
};

const removeAllocation=index=>{
setForm(prev=>({...prev,allocations:prev.allocations.filter((_,i)=>i!==index)}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const budgetTypes=form.budgetTypes
.filter(item=>item.label.trim()||toNumber(item.amount)>0)
.map(item=>({
key:item.key||makeKey(item.label),
label:item.label.trim(),
amount:toNumber(item.amount)
}));
const validTypeKeys=new Set(budgetTypes.map(item=>item.key));
const allocations=form.allocations
.filter(item=>validTypeKeys.has(item.budgetType)&&(item.category||item.targetName.trim())&&(toNumber(item.amount)>0||toNumber(item.spent)>0||item.notes.trim()||item.isPriority))
.map(item=>({
budgetType:item.budgetType,
category:item.category||null,
targetName:item.targetName.trim(),
amount:toNumber(item.amount),
spent:toNumber(item.spent),
isPriority:!!item.isPriority,
notes:item.notes.trim()
}));
const payload={
...form,
budgetTypes,
totalAmount:budgetTypes.reduce((sum,item)=>sum+toNumber(item.amount),0),
totalSpent:allocations.reduce((sum,item)=>sum+toNumber(item.spent),0),
alertAtPercent:Number(form.alertAtPercent)||0,
allocations
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
{userOptions.map(user=>(
<option key={getId(user)} value={getId(user)}>{user.name||user.username||user.email||'Current User'}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Budget Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">Start Date</label>
<input type="date" className="form-control" name="startDate" value={form.startDate} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">End Date</label>
<input type="date" className="form-control" name="endDate" value={form.endDate} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">Alert At Percent</label>
<input type="number" className="form-control" name="alertAtPercent" value={form.alertAtPercent} onChange={handleChange} min="0" max="100" step="1" />
</div>

<div className="col-12">
<div className="row g-2 text-bg-light border rounded p-2 mx-0">
<SummaryBox label="Total Budget" value={totalBudget} className="text-success" />
<SummaryBox label="Allocated" value={totalAllocated} className="text-warning" />
<SummaryBox label="Available" value={totalBudget-totalAllocated} style={{color:'#fd7e14'}} />
<SummaryBox label="Spent" value={totalSpent} className="text-danger" />
</div>
</div>

<div className="col-12">
<div className="border rounded">
<div className="d-flex justify-content-between align-items-center gap-2 p-2 border-bottom bg-light">
<strong>Budget Types</strong>
<button type="button" className="btn btn-outline-primary btn-sm" onClick={addBudgetType}>Add Budget Type</button>
</div>
<div className="table-responsive">
<table className="table table-sm align-middle mb-0">
<thead>
<tr>
<th style={{minWidth:'240px'}}>Type Name</th>
<th style={{minWidth:'160px'}}>Amount</th>
<th style={{minWidth:'130px'}}>Allocated</th>
<th style={{minWidth:'130px'}}>Available</th>
<th className="text-end">Action</th>
</tr>
</thead>
<tbody>
{form.budgetTypes.map((type,index)=>{
const allocated=toNumber(allocationTotalByType[type.key]);
const available=toNumber(type.amount)-allocated;
return(
<tr key={type.key}>
<td>
<input className="form-control form-control-sm" value={type.label} onChange={e=>handleBudgetTypeChange(index,'label',e.target.value)} required />
</td>
<td>
<input type="number" className="form-control form-control-sm" value={type.amount} onChange={e=>handleBudgetTypeChange(index,'amount',e.target.value)} min="0" step="0.01" />
</td>
<td>${formatMoney(allocated)}</td>
<td className={available<0?'text-danger fw-semibold':''}>${formatMoney(available)}</td>
<td className="text-end">
<button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeBudgetType(index)} disabled={form.budgetTypes.length===1}>Remove</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
</div>

<div className="col-12">
<label className="form-label">Notes</label>
<textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} rows="2"></textarea>
</div>

<div className="col-12">
<label className="form-label mb-2">Allocations</label>
{form.budgetTypes.map(type=>{
const searchText=String(targetSearch[type.key]||'').trim().toLowerCase();
const filteredCategories=categories
.filter(category=>categoryMatchesBudgetType(category,type.key))
.filter(category=>!searchText||textForCategory(category).includes(searchText));
const rows=(allocationsByType[type.key]||[]).map(allocation=>({
allocation,
index:form.allocations.indexOf(allocation)
}));
const allocated=toNumber(allocationTotalByType[type.key]);
const available=toNumber(type.amount)-allocated;
return(
<div className="border rounded mb-3" key={`allocation-${type.key}`}>
<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-2 border-bottom bg-light">
<div>
<strong>{type.label||'Untitled Budget Type'}</strong>
<span className="ms-3 small">Available: ${formatMoney(available)}</span>
</div>
<div className="d-flex flex-wrap gap-2">
<input className="form-control form-control-sm" style={{width:'220px'}} value={targetSearch[type.key]||''} onChange={e=>setTargetSearch(prev=>({...prev,[type.key]:e.target.value}))} placeholder={type.key==='cash'?'Search all items':'Search matching items'} />
{(type.key==='cash'||type.key==='home')&&PRIORITY_BILLS.map(name=>(
<button type="button" className="btn btn-outline-secondary btn-sm" key={`${type.key}-${name}`} onClick={()=>addPriorityBill(type.key,name)}>{name}</button>
))}
<button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>addAllocation(type.key)}>Add Allocation</button>
</div>
</div>
{rows.length?(
<div className="table-responsive">
<table className="table table-sm align-middle mb-0">
<thead>
<tr>
<th style={{minWidth:'220px'}}>Allocate To</th>
<th style={{minWidth:'140px'}}>Budget</th>
<th style={{minWidth:'120px'}}>Spent</th>
<th style={{minWidth:'120px'}}>Remaining</th>
<th style={{minWidth:'90px'}}>Priority</th>
<th style={{minWidth:'220px'}}>Notes</th>
<th className="text-end">Action</th>
</tr>
</thead>
<tbody>
{rows.map(({allocation,index})=>{
const rowAmount=toNumber(allocation.amount);
const spent=toNumber(allocation.spent);
const remaining=rowAmount-spent;
return(
<tr key={`${type.key}-${index}`}>
<td>
<select className="form-select form-select-sm" name="category" value={allocation.category||allocation.targetName?allocation.category||CUSTOM_TARGET_VALUE:''} onChange={e=>handleAllocationChange(index,e)}>
<option value="">Select Allocation Target</option>
{filteredCategories.map(category=>(
<option key={category._id} value={category._id}>{category.name}</option>
))}
<option value={CUSTOM_TARGET_VALUE}>Custom item</option>
</select>
{(!allocation.category||allocation.targetName)&&(
<input className="form-control form-control-sm mt-1" name="targetName" value={allocation.targetName} onChange={e=>handleAllocationChange(index,e)} placeholder="Type missing item" />
)}
</td>
<td>
<input type="number" className="form-control form-control-sm" name="amount" value={allocation.amount} onChange={e=>handleAllocationChange(index,e)} min="0" step="0.01" />
</td>
<td>${formatMoney(spent)}</td>
<td className={remaining<0?'text-danger fw-semibold':''}>${formatMoney(remaining)}</td>
<td>
<input type="checkbox" className="form-check-input" name="isPriority" checked={!!allocation.isPriority} onChange={e=>handleAllocationChange(index,e)} />
</td>
<td>
<input type="text" className="form-control form-control-sm" name="notes" value={allocation.notes} onChange={e=>handleAllocationChange(index,e)} />
</td>
<td className="text-end">
<button type="button" className="btn btn-outline-danger btn-sm" onClick={()=>removeAllocation(index)}>Remove</button>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
):(
<div className="p-3 text-muted">No allocations added.</div>
)}
</div>
);
})}
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
