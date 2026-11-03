// /src/pages/CouponPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import CouponForm from './forms/CouponForm.jsx';

export default function CouponPage(){
const [coupons,setCoupons]=useState([]);
const [users,setUsers]=useState([]);
const [stores,setStores]=useState([]);
const [countries,setCountries]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedCoupon,setSelectedCoupon]=useState(null);
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
const [couponRes,userRes,storeRes,countryRes]=await Promise.all([
fetch('/api/coupons'),
fetch('/api/users'),
fetch('/api/stores'),
fetch('/api/countries')
]);

const couponData=await couponRes.json();
const userData=await userRes.json();
const storeData=await storeRes.json();
const countryData=await countryRes.json();

if(!couponRes.ok)throw new Error(couponData.message||'Failed to load coupons');

setCoupons(couponData.coupons||couponData.data||couponData||[]);
setUsers(userData.users||userData.data||userData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedCoupon(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedCoupon(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedCoupon(null);
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
showAutoCloseAlert('success',`Coupon ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/coupons/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete coupon');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Coupon deleted successfully');
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

const getCountryNames=value=>{
if(!value||!Array.isArray(value)||!value.length)return '';
return value.map(item=>{
if(typeof item==='object')return item.name||'';
const found=countries.find(country=>country._id===item);
return found?found.name:'';
}).filter(Boolean).join(', ');
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Coupons</h3>
<Button variant="primary" onClick={openAddModal}>Add Coupon</Button>
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
<th>Code</th>
<th>Title</th>
<th>Discount Type</th>
<th>Discount Value</th>
<th>Countries</th>
<th>Used</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{coupons.length?coupons.map(item=>(
<tr key={item._id}>
<td>{getUserName(item.user)}</td>
<td>{getStoreName(item.store)}</td>
<td>{item.code}</td>
<td>{item.title}</td>
<td>{item.discountType}</td>
<td>{item.discountValue}</td>
<td>{getCountryNames(item.countries)}</td>
<td>{item.isUsed?'Yes':'No'}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="10" className="text-center">No coupons found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Coupon':'Add Coupon'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<CouponForm
initialData={selectedCoupon||{}}
users={users}
stores={stores}
countries={countries}
endpoint={formMode==='edit'&&selectedCoupon?`/api/coupons/${selectedCoupon._id}`:'/api/coupons'}
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
Are you sure you want to delete this coupon?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
