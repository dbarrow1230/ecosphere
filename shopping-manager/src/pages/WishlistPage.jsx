// /src/pages/WishlistPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import WishlistForm from './forms/WishlistForm.jsx';

export default function WishlistPage(){
const [wishlists,setWishlists]=useState([]);
const [users,setUsers]=useState([]);
const [products,setProducts]=useState([]);
const [stores,setStores]=useState([]);
const [statuses,setStatuses]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedWishlist,setSelectedWishlist]=useState(null);
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

const loadData=async()=>{
setLoading(true);
try{
const [wishlistRes,userRes,productRes,storeRes,statusRes]=await Promise.all([
fetch('/api/wishlists'),
fetch('/api/users'),
fetch('/api/products'),
fetch('/api/stores'),
fetch('/api/statuses')
]);

const wishlistData=await wishlistRes.json();
const userData=await userRes.json();
const productData=await productRes.json();
const storeData=await storeRes.json();
const statusData=await statusRes.json();

if(!wishlistRes.ok)throw new Error(wishlistData.message||'Failed to load wishlists');

setWishlists(wishlistData.wishlists||wishlistData.data||wishlistData||[]);
setUsers(userData.users||userData.data||userData||[]);
setProducts(productData.products||productData.data||productData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setStatuses(statusData.statuses||statusData.data||statusData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

useEffect(()=>{
// Initial page synchronization intentionally loads API-backed state.
// eslint-disable-next-line react-hooks/set-state-in-effect
loadData();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
// loadData is intentionally limited to the initial page load.
// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);

const openAddModal=()=>{
setFormMode('add');
setSelectedWishlist(null);
setShowFormModal(true);
};

const openEditModal=wishlist=>{
setFormMode('edit');
setSelectedWishlist(wishlist);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedWishlist(null);
};

const openDeleteModal=wishlist=>{
setDeleteTarget(wishlist);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSave=async formData=>{
try{
const endpoint=formMode==='edit'&&selectedWishlist?`/api/wishlists/${selectedWishlist._id}`:'/api/wishlists';
const method=formMode==='edit'&&selectedWishlist?'PUT':'POST';

const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(formData)
});
const data=await res.json();

if(!res.ok)throw new Error(data.message||'Failed to save wishlist');

await loadData();
closeFormModal();
showAutoCloseAlert('success',data.message||`Wishlist ${formMode==='edit'?'updated':'created'} successfully`);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
throw err;
}
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/wishlists/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete wishlist');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Wishlist deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const getStatusName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=statuses.find(item=>item._id===value);
return found?found.name:'';
};

const getUserName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||value.username||value.email||'';
const found=users.find(item=>item._id===value);
return found?found.name||found.username||found.email:'';
};

const getProductName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=products.find(item=>item._id===value);
return found?found.name:'';
};

const getStoreName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=stores.find(item=>item._id===value);
return found?found.name:'';
};

const getExternalUrl=value=>{
const url=String(value||'').trim();
if(!url)return '';
return /^https?:\/\//i.test(url)?url:`https://${url}`;
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Wishlist</h3>
<Button variant="primary" onClick={openAddModal}>Add Wishlist</Button>
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
<th>Item</th>
<th>User</th>
<th>Product</th>
<th>Store</th>
<th>Target Price</th>
<th>Current Price</th>
<th>Priority</th>
<th>Status</th>
<th>Notes</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{wishlists.length?wishlists.map(item=>(
<tr key={item._id}>
<td>{item.name||getProductName(item.product)||'Unnamed item'}</td>
<td>{getUserName(item.user)}</td>
<td>{getProductName(item.product)}</td>
<td>{item.store?.website?(
<a href={getExternalUrl(item.store.website)} target="_blank" rel="noreferrer">{getStoreName(item.store)}</a>
):getStoreName(item.store)}</td>
<td>{item.targetPrice}</td>
<td>{item.currentPrice}</td>
<td>{getStatusName(item.priority)}</td>
<td>{getStatusName(item.status)}</td>
<td>{item.notes}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="10" className="text-center">No wishlist items found</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} size="lg" centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Wishlist':'Add Wishlist'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<WishlistForm
initialData={selectedWishlist||{}}
users={users}
products={products}
stores={stores}
statuses={statuses}
endpoint={formMode==='edit'&&selectedWishlist?`/api/wishlists/${selectedWishlist._id}`:'/api/wishlists'}
method={formMode==='edit'?'PUT':'POST'}
onSuccess={handleSave}
/>
</Modal.Body>
</Modal>

<Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
<Modal.Header closeButton>
<Modal.Title>Confirm Delete</Modal.Title>
</Modal.Header>
<Modal.Body>
Are you sure you want to delete this wishlist item?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
