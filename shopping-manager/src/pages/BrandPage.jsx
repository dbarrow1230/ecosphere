// /src/pages/BrandPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import BrandForm from './forms/BrandForm.jsx';

export default function BrandPage(){
const [brands,setBrands]=useState([]);
const [countries,setCountries]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedBrand,setSelectedBrand]=useState(null);
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
const [brandRes,countryRes]=await Promise.all([
fetch('/api/brands'),
fetch('/api/countries')
]);

const brandData=await brandRes.json();
const countryData=await countryRes.json();

if(!brandRes.ok)throw new Error(brandData.message||'Failed to load brands');

setBrands(brandData.brands||brandData.data||brandData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedBrand(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedBrand(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedBrand(null);
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
showAutoCloseAlert('success',`Brand ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/brands/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete brand');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Brand deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
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
<h3 className="mb-0">Brands</h3>
<Button variant="primary" onClick={openAddModal}>Add Brand</Button>
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
<th>Slug</th>
<th>Website</th>
<th>Country</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{brands.length?brands.map(item=>(
<tr key={item._id}>
<td>{item.name}</td>
<td>{item.slug}</td>
<td>{item.website}</td>
<td>{getCountryName(item.country)}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="6" className="text-center">No brands found</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Brand':'Add Brand'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<BrandForm
initialData={selectedBrand||{}}
countries={countries}
endpoint={formMode==='edit'&&selectedBrand?`/api/brands/${selectedBrand._id}`:'/api/brands'}
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
Are you sure you want to delete this brand?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}