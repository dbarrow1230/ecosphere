// /src/pages/UnitPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import UnitForm from './forms/UnitForm.jsx';

export default function UnitPage(){
const [units,setUnits]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedUnit,setSelectedUnit]=useState(null);
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
loadUnits();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const loadUnits=async()=>{
setLoading(true);
try{
const res=await fetch('/api/units');
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to load units');
setUnits(data.units||data.data||data||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load units');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedUnit(null);
setShowFormModal(true);
};

const openEditModal=unit=>{
setFormMode('edit');
setSelectedUnit(unit);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedUnit(null);
};

const openDeleteModal=unit=>{
setDeleteTarget(unit);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadUnits();
closeFormModal();
showAutoCloseAlert('success',`Unit ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/units/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete unit');
await loadUnits();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Unit deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Units</h3>
<Button variant="primary" onClick={openAddModal}>Add Unit</Button>
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
<th>Short Name</th>
<th>Type</th>
<th>Description</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{units.length?units.map(item=>(
<tr key={item._id}>
<td>{item.name}</td>
<td>{item.shortName}</td>
<td>{item.type}</td>
<td>{item.description}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="6" className="text-center">No units found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Unit':'Add Unit'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<UnitForm
initialData={selectedUnit||{}}
endpoint={formMode==='edit'&&selectedUnit?`/api/units/${selectedUnit._id}`:'/api/units'}
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
Are you sure you want to delete this unit?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}