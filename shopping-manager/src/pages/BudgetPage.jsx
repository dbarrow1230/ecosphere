// /src/pages/BudgetPage.jsx
import {useCallback,useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import BudgetForm from './forms/BudgetForm.jsx';

export default function BudgetPage(){
const [budgets,setBudgets]=useState([]);
const [users,setUsers]=useState([]);
const [categories,setCategories]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedBudget,setSelectedBudget]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=useCallback((type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({show:true,type,message});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
},[]);

const closeAlert=useCallback(()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
},[]);

const loadData=useCallback(async()=>{
setLoading(true);
try{
const [budgetRes,userRes,categoryRes]=await Promise.all([
fetch('/api/budgets'),
fetch('/api/users'),
fetch('/api/categories')
]);

const budgetData=await budgetRes.json();
const userData=await userRes.json();
const categoryData=await categoryRes.json();

if(!budgetRes.ok)throw new Error(budgetData.message||'Failed to load budgets');

setBudgets(budgetData.budgets||budgetData.data||budgetData||[]);
setUsers(userData.users||userData.data||userData||[]);
setCategories(categoryData.categories||categoryData.data||categoryData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
},[showAutoCloseAlert]);

useEffect(()=>{
let cancelled=false;
Promise.resolve().then(()=>{
if(!cancelled)loadData();
});
return()=>{
cancelled=true;
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[loadData]);

const openAddModal=()=>{
setFormMode('add');
setSelectedBudget(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedBudget(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedBudget(null);
};

const openDeleteModal=item=>{
setDeleteTarget(item);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const addMonthsToDate=(date,months)=>{
if(!date)return '';
const next=new Date(date);
next.setMonth(next.getMonth()+months);
return next.toISOString().split('T')[0];
};

const openCopyModal=item=>{
const copy={
...item,
_id:undefined,
name:item.name?`${item.name} Copy`: '',
startDate:addMonthsToDate(item.startDate,1),
endDate:addMonthsToDate(item.endDate,1),
totalSpent:0,
budgetTypes:Array.isArray(item.budgetTypes)?item.budgetTypes.map(type=>({
...type,
spent:0,
remainingAmount:Number(type.amount)||0,
percentUsed:0,
isOverBudget:false
})):[],
allocations:Array.isArray(item.allocations)?item.allocations.map(allocation=>({
...allocation,
_id:undefined,
spent:0,
remainingAmount:Number(allocation.amount)||0,
percentUsed:0,
isOverBudget:false
})):[]
};
setFormMode('copy');
setSelectedBudget(copy);
setShowFormModal(true);
};

const handleSaveSuccess=async()=>{
await loadData();
closeFormModal();
showAutoCloseAlert('success',`Budget ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/budgets/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete budget');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Budget deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const getUserName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||value.username||value.email||'';
const found=users.find(item=>item._id===value);
return found?found.name||found.username||found.email:'';
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
if(raw)return {username:raw};
}
}
return null;
};

const formatMoney=value=>Number(value||0).toLocaleString(undefined,{style:'currency',currency:'USD'});

const formatDate=value=>{
if(!value)return '';
const dateText=String(value).split('T')[0];
const [year,month,day]=dateText.split('-').map(Number);
if(!year||!month||!day)return '';
return new Date(year,month-1,day).toLocaleDateString();
};

const getBudgetTypesSummary=item=>{
if(Array.isArray(item.budgetTypes)&&item.budgetTypes.length){
return item.budgetTypes
.filter(type=>Number(type.amount)>0)
.map(type=>`${type.label||type.key}: ${formatMoney(type.amount)}`)
.join(', ');
}
return item.budgetType||'';
};

const pageUser=getStoredUser();
const pageUserName=pageUser?.name||pageUser?.username||pageUser?.email||getUserName(budgets[0]?.user)||'User';

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Budgets for {pageUserName}</h3>
<Button variant="primary" onClick={openAddModal}>Add Budget</Button>
</div>

{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>
{alert.message}
</Alert>
)}

<Card className="shadow-sm">
<Card.Body>
{loading?(
<div className="text-center py-4">
<Spinner animation="border" />
</div>
):(
<div className="table-responsive">
<Table striped bordered hover responsive className="align-middle mb-0">
<thead>
<tr>
<th>Name</th>
<th>Budget Types</th>
<th>Total Amount</th>
<th>Total Spent</th>
<th>Start Date</th>
<th>End Date</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{budgets.length?budgets.map(item=>(
<tr key={item._id}>
<td>{item.name}</td>
<td>{getBudgetTypesSummary(item)}</td>
<td>{formatMoney(item.totalAmount)}</td>
<td>{formatMoney(item.totalSpent)}</td>
<td>{formatDate(item.startDate)}</td>
<td>{formatDate(item.endDate)}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-secondary" size="sm" onClick={()=>openCopyModal(item)}>Copy</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="8" className="text-center">No budgets found</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} size="xl" centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Budget':formMode==='copy'?'Copy Budget':'Add Budget'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<BudgetForm
key={`${formMode}-${selectedBudget?._id||'new'}-${categories.length}`}
initialData={selectedBudget||{}}
users={users}
categories={categories}
endpoint={formMode==='edit'&&selectedBudget?`/api/budgets/${selectedBudget._id}`:'/api/budgets'}
method={formMode==='edit'?'PUT':'POST'}
onSuccess={handleSaveSuccess}
/>
</Modal.Body>
</Modal>

<Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
<Modal.Header closeButton>
<Modal.Title>Confirm Delete</Modal.Title>
</Modal.Header>
<Modal.Body>
Are you sure you want to delete this budget?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
