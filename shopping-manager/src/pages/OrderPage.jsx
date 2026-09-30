// /src/pages/OrderPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import OrderForm from './forms/OrderForm.jsx';

export default function OrderPage(){
const [orders,setOrders]=useState([]);
const [users,setUsers]=useState([]);
const [stores,setStores]=useState([]);
const [shoppingLists,setShoppingLists]=useState([]);
const [coupons,setCoupons]=useState([]);
const [receipts,setReceipts]=useState([]);
const [statuses,setStatuses]=useState([]);
const [states,setStates]=useState([]);
const [countries,setCountries]=useState([]);
const [products,setProducts]=useState([]);
const [shoppingListItems,setShoppingListItems]=useState([]);
const [units,setUnits]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedOrder,setSelectedOrder]=useState(null);
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
const [orderRes,userRes,storeRes,shoppingListRes,couponRes,receiptRes,statusRes,stateRes,countryRes,productRes,shoppingListItemRes,unitRes]=await Promise.all([
fetch('/api/orders'),
fetch('/api/users'),
fetch('/api/stores'),
fetch('/api/shopping-lists'),
fetch('/api/coupons'),
fetch('/api/receipts'),
fetch('/api/statuses'),
fetch('/api/states'),
fetch('/api/countries'),
fetch('/api/products'),
fetch('/api/shopping-list-items'),
fetch('/api/units')
]);

const orderData=await orderRes.json();
const userData=await userRes.json();
const storeData=await storeRes.json();
const shoppingListData=await shoppingListRes.json();
const couponData=await couponRes.json();
const receiptData=await receiptRes.json();
const statusData=await statusRes.json();
const stateData=await stateRes.json();
const countryData=await countryRes.json();
const productData=await productRes.json();
const shoppingListItemData=await shoppingListItemRes.json();
const unitData=await unitRes.json();

if(!orderRes.ok)throw new Error(orderData.message||'Failed to load orders');

setOrders(orderData.orders||orderData.data||orderData||[]);
setUsers(userData.users||userData.data||userData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setShoppingLists(shoppingListData.shoppingLists||shoppingListData.data||shoppingListData||[]);
setCoupons(couponData.coupons||couponData.data||couponData||[]);
setReceipts(receiptData.receipts||receiptData.data||receiptData||[]);
setStatuses(statusData.statuses||statusData.data||statusData||[]);
setStates(stateData.states||stateData.data||stateData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
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
setSelectedOrder(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedOrder(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedOrder(null);
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
showAutoCloseAlert('success',`Order ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/orders/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete order');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Order deleted successfully');
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

const getShoppingListName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||value.title||value._id||'';
const found=shoppingLists.find(item=>item._id===value);
return found?found.name||found.title||found._id:'';
};

const getCouponName=value=>{
if(!value)return '';
if(typeof value==='object')return value.title||value.code||'';
const found=coupons.find(item=>item._id===value);
return found?found.title||found.code:'';
};

const getReceiptName=value=>{
if(!value)return '';
if(typeof value==='object')return value.receiptNumber||value.name||value._id||'';
const found=receipts.find(item=>item._id===value);
return found?found.receiptNumber||found.name||found._id:'';
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
<h3 className="mb-0">Orders</h3>
<Button variant="primary" onClick={openAddModal}>Add Order</Button>
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
<th>Order Number</th>
<th>Store</th>
<th>Shopping List</th>
<th>Coupon</th>
<th>Receipt</th>
<th>Order Date</th>
<th>Type</th>
<th>Status</th>
<th>Total</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{orders.length?orders.map(item=>(
<tr key={item._id}>
<td>{getUserName(item.user)}</td>
<td>{item.orderNumber}</td>
<td>{getStoreName(item.store)}</td>
<td>{getShoppingListName(item.shoppingList)}</td>
<td>{getCouponName(item.coupon)}</td>
<td>{getReceiptName(item.receipt)}</td>
<td>{item.orderDate?new Date(item.orderDate).toLocaleDateString():''}</td>
<td>{item.type}</td>
<td>{getStatusName(item.status)}</td>
<td>{item.total}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="11" className="text-center">No orders found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Order':'Add Order'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<OrderForm
initialData={selectedOrder||{}}
users={users}
stores={stores}
shoppingLists={shoppingLists}
coupons={coupons}
receipts={receipts}
statuses={statuses}
paymentStatuses={statuses}
shippingStatuses={statuses}
states={states}
countries={countries}
products={products}
shoppingListItems={shoppingListItems}
units={units}
endpoint={formMode==='edit'&&selectedOrder?`/api/orders/${selectedOrder._id}`:'/api/orders'}
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
Are you sure you want to delete this order?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
