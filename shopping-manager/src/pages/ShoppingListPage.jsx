// /src/pages/ShoppingListPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import ShoppingListForm from './forms/ShoppingListForm.jsx';

export default function ShoppingListPage(){
const [shoppingLists,setShoppingLists]=useState([]);
const [users,setUsers]=useState([]);
const [statuses,setStatuses]=useState([]);
const [stores,setStores]=useState([]);
const [products,setProducts]=useState([]);
const [units,setUnits]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedShoppingList,setSelectedShoppingList]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({show:true,type,message});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
};

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

useEffect(()=>{
loadData();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const loadData=async()=>{
setLoading(true);
try{
const [shoppingListRes,userRes,statusRes,storeRes,productRes,unitRes]=await Promise.all([
fetch('/api/shopping-lists'),
fetch('/api/users'),
fetch('/api/statuses'),
fetch('/api/stores'),
fetch('/api/products'),
fetch('/api/units')
]);

const shoppingListData=await shoppingListRes.json();
const userData=await userRes.json();
const statusData=await statusRes.json();
const storeData=await storeRes.json();
const productData=await productRes.json();
const unitData=await unitRes.json();

if(!shoppingListRes.ok)throw new Error(shoppingListData.message||'Failed to load shopping lists');

setShoppingLists(shoppingListData.shoppingLists||shoppingListData.data||shoppingListData||[]);
setUsers(userData.users||userData.data||userData||[]);
setStatuses(statusData.statuses||statusData.data||statusData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setProducts(productData.products||productData.data||productData||[]);
setUnits(unitData.units||unitData.data||unitData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedShoppingList(null);
setShowFormModal(true);
};

const openEditModal=shoppingList=>{
setFormMode('edit');
setSelectedShoppingList(shoppingList);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedShoppingList(null);
};

const openDeleteModal=shoppingList=>{
setDeleteTarget(shoppingList);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadData();
closeFormModal();
showAutoCloseAlert('success',`Shopping list ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/shopping-lists/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete shopping list');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Shopping list deleted successfully');
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

const getStatusName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=statuses.find(item=>item._id===value);
return found?found.name:'';
};

const getStoreName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=stores.find(item=>item._id===value);
return found?found.name:'';
};

const shoppingListStatuses=statuses.filter(item=>!item.type||item.type==='shoppingListStatus');
const priorityStatuses=statuses.filter(item=>item.type==='priority');

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Shopping Lists</h3>
<Button variant="primary" onClick={openAddModal}>Add Shopping List</Button>
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
<th>User</th>
<th>Name</th>
<th>Status</th>
<th>Type</th>
<th>Store</th>
<th>Budget</th>
<th>Target Date</th>
<th>Favorite</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{shoppingLists.length?shoppingLists.map(item=>(
<tr key={item._id}>
<td>{getUserName(item.user)}</td>
<td>{item.name}</td>
<td>{getStatusName(item.status)}</td>
<td>{item.type}</td>
<td>{getStoreName(item.store)}</td>
<td>{item.budget}</td>
<td>{item.targetDate?new Date(item.targetDate).toLocaleDateString():''}</td>
<td>{item.isFavorite?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="9" className="text-center">No shopping lists found</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} size="xl" backdrop="static" keyboard={false} centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Shopping List':'Add Shopping List'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<ShoppingListForm
initialData={selectedShoppingList||{}}
users={users}
statuses={shoppingListStatuses.length?shoppingListStatuses:statuses}
stores={stores}
products={products}
units={units}
itemStatuses={priorityStatuses}
endpoint={formMode==='edit'&&selectedShoppingList?`/api/shopping-lists/${selectedShoppingList._id}`:'/api/shopping-lists'}
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
Are you sure you want to delete this shopping list?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
