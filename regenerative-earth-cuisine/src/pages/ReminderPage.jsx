// /src/pages/ReminderPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Alert,Badge,Button,ButtonGroup,Card,Container,Modal,Spinner,Table} from 'react-bootstrap';
import ReminderForm from './forms/ReminderForm.jsx';
import '../styles/ReminderPage.css';

export default function ReminderPage({user}){
const [reminders,setReminders]=useState([]);
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
// The page intentionally reloads only when the authenticated user changes.
// eslint-disable-next-line react-hooks/exhaustive-deps
},[user]);

const getStoredUser=()=>{
const keys=["userInfo","user","authUser","currentUser"];
for(const key of keys){
try{
const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
if(!raw)continue;
const parsed=JSON.parse(raw);
if(parsed?._id||parsed?.id||parsed?.username||parsed?.email)return parsed;
if(parsed?.user?._id||parsed?.user?.id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
if(parsed?.data?._id||parsed?.data?.id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
}catch(err){
console.error(`Failed to parse stored user from ${key}`,err);
}
}
return null;
};

const resolveUserId=value=>{
if(!value)return "";
if(typeof value==="string")return value;
if(typeof value==="object"){
if(typeof value._id==="string")return value._id;
if(typeof value.id==="string")return value.id;
if(typeof value.$oid==="string")return value.$oid;
if(typeof value._id?.$oid==="string")return value._id.$oid;
if(typeof value.id?.$oid==="string")return value.id.$oid;
}
return "";
};

async function loadData(){
setLoading(true);
try{
const currentUser=user||getStoredUser();
const userId=resolveUserId(currentUser);
const reminderUrl=userId?`/api/reminders?userId=${encodeURIComponent(userId)}`:'/api/reminders';
const reminderRes=await fetch(reminderUrl,{credentials:'include'});

const reminderData=await reminderRes.json();

if(!reminderRes.ok)throw new Error(reminderData.message||'Failed to load reminders');

setReminders(reminderData.reminders||reminderData.data||reminderData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
}

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
const currentUser=user||getStoredUser();
const endpoint=formMode==='edit'&&selectedReminder?`/api/reminders/${selectedReminder._id}`:'/api/reminders';
const requestMethod=formMode==='edit'?'PUT':'POST';
const res=await fetch(endpoint,{
method:requestMethod,
headers:{'Content-Type':'application/json'},
body:JSON.stringify({...formData,userId:formData.userId||resolveUserId(currentUser)})
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
const currentUser=user||getStoredUser();
const userId=resolveUserId(currentUser);
const res=await fetch(`/api/reminders/${deleteTarget._id}?userId=${encodeURIComponent(userId)}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete reminder');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Reminder deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const formatDateTime=value=>{
if(!value)return '';
const date=new Date(value);
return Number.isNaN(date.getTime())?'':date.toLocaleString();
};

const handleStatusAction=async(item,action)=>{
try{
const currentUser=user||getStoredUser();
const userId=resolveUserId(currentUser);
const response=await fetch(`/api/reminders/${item._id}/${action}?userId=${encodeURIComponent(userId)}`,{
method:'PATCH',
credentials:'include'
});
const data=await response.json();
if(!response.ok)throw new Error(data.message||`Unable to ${action} reminder`);
await loadData();
showAutoCloseAlert('success',data.message||`Reminder ${action==='resume'?'resumed':`${action}d`}`);
}catch(error){
showAutoCloseAlert('danger',error.message||`Unable to ${action} reminder`);
}
};

const getChannelsText=channels=>{
const enabled=[];
if(channels?.inApp)enabled.push('On Screen');
if(channels?.email)enabled.push('Email');
return enabled.join(', ')||'None';
};

const getDisplayStatus=reminder=>{
const scheduledTime=new Date(reminder.sendAt).getTime();
const neverRan=
reminder.status==='pending'&&
!reminder.lastSentAt&&
!reminder.sentAt&&
!Number.isNaN(scheduledTime)&&
scheduledTime<Date.now();
return neverRan?'never-ran':String(reminder.status||'pending').toLowerCase();
};

const renderStatus=reminder=>{
const status=getDisplayStatus(reminder);
const labels={
'never-ran':'Never Ran',
pending:'Pending',
processing:'Processing',
sent:'Sent',
failed:'Failed',
paused:'Paused',
archived:'Archived'
};
return <Badge bg="" className={`reminder-status-badge status-${status}`}>{labels[status]||status}</Badge>;
};

return(
<Container fluid className="reminder-page">
<header className="reminder-page-header">
<div>
<p className="reminder-page-eyebrow">Scheduled notifications</p>
<h1 className="reminder-page-title">Reminders</h1>
<p className="reminder-page-lead">Create one-time or recurring on-screen and email reminders.</p>
</div>
<Button variant="primary" onClick={openAddModal}>Add Reminder</Button>
</header>

{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>
{alert.message}
</Alert>
)}

<Card className="reminder-card">
<Card.Body>
<div className="reminder-card-heading">
<div>
<Card.Title>Scheduled Reminders</Card.Title>
<Card.Text>Review timing, notification methods, recurrence, and delivery status.</Card.Text>
</div>
</div>
{loading?(
<div className="text-center py-4">
<Spinner animation="border" />
</div>
):(
<Table striped bordered hover className="reminder-table align-middle mb-0">
<thead>
<tr>
<th>Title</th>
<th>Purpose</th>
<th>Notify By</th>
<th>Status</th>
<th>Recurring</th>
<th>Reminder Date</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{reminders.length?reminders.map(item=>(
<tr key={item._id}>
<td data-label="Title">{item.title}</td>
<td data-label="Purpose">{item.reminderType||'custom'}</td>
<td data-label="Notify By">{getChannelsText(item.channels)}</td>
<td data-label="Status">{renderStatus(item)}</td>
<td data-label="Recurring">{item.isRecurring?(item.recurrenceRule||'Yes'):'No'}</td>
<td data-label="Reminder Date">{formatDateTime(item.sendAt)}</td>
<td data-label="Actions" className="reminder-actions-cell">
<ButtonGroup size="sm" className="reminder-actions">
<Button variant="outline-primary" onClick={()=>openEditModal(item)}>Edit</Button>
{['pending','failed'].includes(item.status)&&<Button variant="outline-secondary" onClick={()=>handleStatusAction(item,'pause')}>Pause</Button>}
{item.status==='paused'&&<Button variant="outline-success" onClick={()=>handleStatusAction(item,'resume')}>Resume</Button>}
{!['archived','processing'].includes(item.status)&&<Button variant="outline-warning" onClick={()=>handleStatusAction(item,'archive')}>Archive</Button>}
<Button variant="outline-danger" onClick={()=>openDeleteModal(item)}>Delete</Button>
</ButtonGroup>
</td>
</tr>
)):(
<tr>
<td colSpan="7" className="text-center">No reminders found</td>
</tr>
)}
</tbody>
</Table>
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
currentUser={user||getStoredUser()}
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
</Container>
);
}
