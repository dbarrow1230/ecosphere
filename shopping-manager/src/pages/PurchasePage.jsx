// /src/pages/PurchasePage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import PurchaseForm from './forms/PurchaseForm.jsx';

export default function PurchasePage(){
const [purchases,setPurchases]=useState([]);
const [users,setUsers]=useState([]);
const [stores,setStores]=useState([]);
const [receipts,setReceipts]=useState([]);
const [coupons,setCoupons]=useState([]);
const [shoppingLists,setShoppingLists]=useState([]);
const [statuses,setStatuses]=useState([]);
const [products,setProducts]=useState([]);
const [shoppingListItems,setShoppingListItems]=useState([]);
const [units,setUnits]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedPurchase,setSelectedPurchase]=useState(null);
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
const [purchaseRes,userRes,storeRes,receiptRes,couponRes,shoppingListRes,statusRes,productRes,shoppingListItemRes,unitRes]=await Promise.all([
fetch('/api/purchases'),
fetch('/api/users'),
fetch('/api/stores'),
fetch('/api/receipts'),
fetch('/api/coupons'),
fetch('/api/shopping-lists'),
fetch('/api/statuses'),
fetch('/api/products'),
fetch('/api/shopping-list-items'),
fetch('/api/units')
]);

const purchaseData=await purchaseRes.json();
const userData=await userRes.json();
const storeData=await storeRes.json();
const receiptData=await receiptRes.json();
const couponData=await couponRes.json();
const shoppingListData=await shoppingListRes.json();
const statusData=await statusRes.json();
const productData=await productRes.json();
const shoppingListItemData=await shoppingListItemRes.json();
const unitData=await unitRes.json();

if(!purchaseRes.ok)throw new Error(purchaseData.message||'Failed to load purchases');

setPurchases(purchaseData.purchases||purchaseData.data||purchaseData||[]);
setUsers(userData.users||userData.data||userData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setReceipts(receiptData.receipts||receiptData.data||receiptData||[]);
setCoupons(couponData.coupons||couponData.data||couponData||[]);
setShoppingLists(shoppingListData.shoppingLists||shoppingListData.data||shoppingListData||[]);
setStatuses(statusData.statuses||statusData.data||statusData||[]);
setProducts(productData.products||productData.data||productData||[]);
setShoppingListItems(shoppingListItemData.shoppingListItems||shoppingListItemData.data||shoppingListItemData||[]);
setUnits(unitData.units||unitData.data||unitData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedPurchase(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedPurchase(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedPurchase(null);
};

const openDeleteModal=item=>{
setDeleteTarget(item);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadData();
closeFormModal();
showAutoCloseAlert('success',`Purchase ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/purchases/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete purchase');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Purchase deleted successfully');
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

const getStoreName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=stores.find(item=>item._id===value);
return found?found.name:'';
};

const getReceiptName=value=>{
if(!value)return '';
if(typeof value==='object')return value.receiptNumber||value.name||value._id||'';
const found=receipts.find(item=>item._id===value);
return found?found.receiptNumber||found.name||found._id:'';
};

const getCouponName=value=>{
if(!value)return '';
if(typeof value==='object')return value.title||value.code||'';
const found=coupons.find(item=>item._id===value);
return found?found.title||found.code:'';
};

const getShoppingListName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||value.title||value._id||'';
const found=shoppingLists.find(item=>item._id===value);
return found?found.name||found.title||found._id:'';
};

const getStatusName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=statuses.find(item=>item._id===value);
return found?found.name:'';
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Purchases</h3>
<Button variant="primary" onClick={openAddModal}>Add Purchase</Button>
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
<th>Store</th>
<th>Receipt</th>
<th>Coupon</th>
<th>Shopping List</th>
<th>Purchase Date</th>
<th>Payment Method</th>
<th>Status</th>
<th>Total</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{purchases.length?purchases.map(item=>(
<tr key={item._id}>
<td>{getUserName(item.user)}</td>
<td>{getStoreName(item.store)}</td>
<td>{getReceiptName(item.receipt)}</td>
<td>{getCouponName(item.coupon)}</td>
<td>{getShoppingListName(item.shoppingList)}</td>
<td>{item.purchaseDate?new Date(item.purchaseDate).toLocaleDateString():''}</td>
<td>{item.paymentMethod}</td>
<td>{getStatusName(item.status)}</td>
<td>{item.total}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="10" className="text-center">No purchases found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Purchase':'Add Purchase'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<PurchaseForm
initialData={selectedPurchase||{}}
users={users}
stores={stores}
receipts={receipts}
coupons={coupons}
shoppingLists={shoppingLists}
statuses={statuses}
products={products}
shoppingListItems={shoppingListItems}
units={units}
endpoint={formMode==='edit'&&selectedPurchase?`/api/purchases/${selectedPurchase._id}`:'/api/purchases'}
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
Are you sure you want to delete this purchase?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
