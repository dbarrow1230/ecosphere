// /src/pages/ReminderPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import ReminderForm from './forms/ReminderForm.jsx';

export default function ReminderPage({user}){
const [reminders,setReminders]=useState([]);
const [users,setUsers]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedReminder,setSelectedReminder]=useState(null);
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
const [reminderRes,userRes]=await Promise.all([
fetch(`/api/reminders?user=${encodeURIComponent(user?._id||'')}`),
fetch('/api/users')
]);

const reminderData=await reminderRes.json();
const userData=await userRes.json();

if(!reminderRes.ok)throw new Error(reminderData.message||'Failed to load reminders');

setReminders(reminderData.reminders||reminderData.data||reminderData||[]);
const userList=userData.users||userData.data||userData;
setUsers(Array.isArray(userList)?userList:[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
};

const openAddModal=()=>{
setFormMode('add');
setSelectedReminder(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedReminder(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedReminder(null);
};

const openDeleteModal=item=>{
setDeleteTarget(item);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSave=async formData=>{
try{
const endpoint=formMode==='edit'&&selectedReminder?`/api/reminders/${selectedReminder._id}`:'/api/reminders';
const requestMethod=formMode==='edit'?'PUT':'POST';
const res=await fetch(endpoint,{
method:requestMethod,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(formData)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save reminder');
await loadData();
closeFormModal();
showAutoCloseAlert('success',data.message||`Reminder ${formMode==='edit'?'updated':'created'} successfully`);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
throw err;
}
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/reminders/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete reminder');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Reminder deleted successfully');
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

const formatDateTime=value=>{
if(!value)return '';
const date=new Date(value);
return Number.isNaN(date.getTime())?'':date.toLocaleString();
};

const getChannelsText=channels=>{
if(!channels)return '';
const items=[];
if(channels.inApp)items.push('In App');
if(channels.email)items.push('Email');
if(channels.sms)items.push('SMS');
return items.join(', ');
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Reminders</h3>
<Button variant="primary" onClick={openAddModal}>Add Reminder</Button>
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
<th>Title</th>
<th>User</th>
<th>Audience</th>
<th>Channels</th>
<th>Status</th>
<th>Recurring</th>
<th>Send At</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{reminders.length?reminders.map(item=>(
<tr key={item._id}>
<td>{item.title}</td>
<td>{getUserName(item.user)}</td>
<td>{item.audienceType}</td>
<td>{getChannelsText(item.channels)}</td>
<td>{item.status}</td>
<td>{item.isRecurring?(item.recurrenceRule||'Yes'):'No'}</td>
<td>{formatDateTime(item.sendAt)}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="8" className="text-center">No reminders found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Reminder':'Add Reminder'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<ReminderForm
mode={formMode}
currentUser={user}
users={users}
initialData={selectedReminder||{}}
onSubmit={handleSave}
onCancel={closeFormModal}
/>
</Modal.Body>
</Modal>

<Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
<Modal.Header closeButton>
<Modal.Title>Confirm Delete</Modal.Title>
</Modal.Header>
<Modal.Body>
Are you sure you want to delete this reminder?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
