// /src/pages/ReturnPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import ReturnForm from './forms/ReturnForm.jsx';

export default function ReturnPage(){
const [returns,setReturns]=useState([]);
const [users,setUsers]=useState([]);
const [stores,setStores]=useState([]);
const [orders,setOrders]=useState([]);
const [purchases,setPurchases]=useState([]);
const [receipts,setReceipts]=useState([]);
const [statuses,setStatuses]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedReturn,setSelectedReturn]=useState(null);
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
const [returnRes,userRes,storeRes,orderRes,purchaseRes,receiptRes,statusRes]=await Promise.all([
fetch('/api/returns'),
fetch('/api/users'),
fetch('/api/stores'),
fetch('/api/orders'),
fetch('/api/purchases'),
fetch('/api/receipts'),
fetch('/api/statuses')
]);

const returnData=await returnRes.json();
const userData=await userRes.json();
const storeData=await storeRes.json();
const orderData=await orderRes.json();
const purchaseData=await purchaseRes.json();
const receiptData=await receiptRes.json();
const statusData=await statusRes.json();

if(!returnRes.ok)throw new Error(returnData.message||'Failed to load returns');

setReturns(returnData.returns||returnData.data||returnData||[]);
setUsers(userData.users||userData.data||userData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setOrders(orderData.orders||orderData.data||orderData||[]);
setPurchases(purchaseData.purchases||purchaseData.data||purchaseData||[]);
setReceipts(receiptData.receipts||receiptData.data||receiptData||[]);
setStatuses(statusData.statuses||statusData.data||statusData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedReturn(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedReturn(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedReturn(null);
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
showAutoCloseAlert('success',`Return ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/returns/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete return');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Return deleted successfully');
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

const getOrderName=value=>{
if(!value)return '';
if(typeof value==='object')return value.orderNumber||value.name||value._id||'';
const found=orders.find(item=>item._id===value);
return found?found.orderNumber||found.name||found._id:'';
};

const getPurchaseName=value=>{
if(!value)return '';
if(typeof value==='object')return value.purchaseNumber||value.name||value._id||'';
const found=purchases.find(item=>item._id===value);
return found?found.purchaseNumber||found.name||found._id:'';
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
<h3 className="mb-0">Returns</h3>
<Button variant="primary" onClick={openAddModal}>Add Return</Button>
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
<th>Return Number</th>
<th>Store</th>
<th>Order</th>
<th>Purchase</th>
<th>Receipt</th>
<th>Status</th>
<th>Refund Status</th>
<th>Refund Total</th>
<th>Return Date</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{returns.length?returns.map(item=>(
<tr key={item._id}>
<td>{getUserName(item.user)}</td>
<td>{item.returnNumber}</td>
<td>{getStoreName(item.store)}</td>
<td>{getOrderName(item.order)}</td>
<td>{getPurchaseName(item.purchase)}</td>
<td>{getReceiptName(item.receipt)}</td>
<td>{getStatusName(item.status)}</td>
<td>{getStatusName(item.refundStatus)}</td>
<td>{item.refundTotal}</td>
<td>{item.returnDate?new Date(item.returnDate).toLocaleDateString():''}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="11" className="text-center">No returns found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Return':'Add Return'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<ReturnForm
initialData={selectedReturn||{}}
users={users}
stores={stores}
orders={orders}
purchases={purchases}
receipts={receipts}
statuses={statuses}
refundStatuses={statuses}
refundMethods={statuses}
orderItems={[]}
purchaseItems={[]}
products={[]}
units={[]}
endpoint={formMode==='edit'&&selectedReturn?`/api/returns/${selectedReturn._id}`:'/api/returns'}
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
Are you sure you want to delete this return?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
