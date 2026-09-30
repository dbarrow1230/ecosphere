// /src/pages/StorePage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import StoreForm from './forms/StoreForm.jsx';

export default function StorePage(){
const [stores,setStores]=useState([]);
const [states,setStates]=useState([]);
const [countries,setCountries]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedStore,setSelectedStore]=useState(null);
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
const [storeRes,stateRes,countryRes]=await Promise.all([
fetch('/api/stores'),
fetch('/api/states'),
fetch('/api/countries')
]);

const storeData=await storeRes.json();
const stateData=await stateRes.json();
const countryData=await countryRes.json();

if(!storeRes.ok)throw new Error(storeData.message||'Failed to load stores');

setStores(storeData.stores||storeData.data||storeData||[]);
setStates(stateData.states||stateData.data||stateData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedStore(null);
setShowFormModal(true);
};

const openEditModal=store=>{
setFormMode('edit');
setSelectedStore(store);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedStore(null);
};

const openDeleteModal=store=>{
setDeleteTarget(store);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadData();
closeFormModal();
showAutoCloseAlert('success',`Store ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/stores/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete store');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Store deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const getStateName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=states.find(item=>item._id===value);
return found?found.name:'';
};

const getCountryName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=countries.find(item=>item._id===value);
return found?found.name:'';
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Stores</h3>
<Button variant="primary" onClick={openAddModal}>Add Store</Button>
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
<th>Email</th>
<th>Phone</th>
<th>City</th>
<th>State</th>
<th>Country</th>
<th>Online</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{stores.length?stores.map(item=>(
<tr key={item._id}>
<td>{item.name}</td>
<td>{item.email}</td>
<td>{item.phone}</td>
<td>{item.city}</td>
<td>{getStateName(item.state)}</td>
<td>{getCountryName(item.country)}</td>
<td>{item.isOnline?'Yes':'No'}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="9" className="text-center">No stores found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Store':'Add Store'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<StoreForm
initialData={selectedStore||{}}
states={states}
countries={countries}
endpoint={formMode==='edit'&&selectedStore?`/api/stores/${selectedStore._id}`:'/api/stores'}
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
Are you sure you want to delete this store?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}