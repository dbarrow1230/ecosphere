// /src/pages/ReminderPage.jsx
import {useCallback,useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner,Form,Row,Col} from 'react-bootstrap';

const emptyReminder={user:'',title:'',message:'',audienceType:'selected',selectedUsers:[],channels:{inApp:true,email:false,sms:false},sendAt:'',status:'pending',isRecurring:false,recurrenceRule:'',recurrenceEndAt:'',reminderOffsetMinutes:30};
const getStoredUser=()=>{for(const key of ['user','userInfo','authUser','currentUser']){try{const raw=localStorage.getItem(key)||sessionStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);return parsed?.user||parsed?.data||parsed;}}catch{/* Ignore malformed stored auth data. */}}return null;};

export default function ReminderPage(){
const [reminders,setReminders]=useState([]);
const [users,setUsers]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedReminder,setSelectedReminder]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [formData,setFormData]=useState(emptyReminder);
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=useCallback((type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({show:true,type,message});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
},[]);

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

const loadData=useCallback(async()=>{
setLoading(true);
try{
const storedUser=getStoredUser();
if(!storedUser?._id)throw new Error('Sign in to manage reminders');
const [reminderRes,userRes]=await Promise.all([
fetch(`/api/reminders?user=${encodeURIComponent(storedUser._id)}`),
fetch('/api/users')
]);

const reminderData=await reminderRes.json();
const userData=await userRes.json();

if(!reminderRes.ok)throw new Error(reminderData.message||'Failed to load reminders');

setReminders(reminderData.reminders||reminderData.data||reminderData||[]);
setUsers(userData.users||userData.data||userData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
},[showAutoCloseAlert]);

useEffect(()=>{
const loadTimer=setTimeout(loadData,0);
return()=>{
clearTimeout(loadTimer);
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[loadData]);

const openAddModal=()=>{
setFormMode('add');
setSelectedReminder(null);
setFormData({...emptyReminder,user:getStoredUser()?._id||''});
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedReminder(item);
setFormData({...emptyReminder,...item,user:typeof item.user==='object'?item.user?._id:item.user||'',sendAt:item.sendAt?new Date(item.sendAt).toISOString().slice(0,16):'',recurrenceEndAt:item.recurrenceEndAt?new Date(item.recurrenceEndAt).toISOString().slice(0,16):'',channels:{...emptyReminder.channels,...item.channels}});
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

const handleFormChange=event=>{
const{name,value,type,checked}=event.target;
if(name.startsWith('channel.')){const channel=name.split('.')[1];setFormData(current=>({...current,channels:{...current.channels,[channel]:checked}}));return;}
setFormData(current=>({...current,[name]:type==='checkbox'?checked:value}));
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
<Form onSubmit={event=>{event.preventDefault();handleSave(formData);}}>
<Row className="g-3">
<Col md={6}><Form.Group controlId="reminderUser"><Form.Label>User</Form.Label><Form.Select name="user" value={formData.user} onChange={handleFormChange} required>{users.map(user=><option key={user._id} value={user._id}>{user.username||user.email}</option>)}</Form.Select></Form.Group></Col>
<Col md={6}><Form.Group controlId="reminderSendAt"><Form.Label>Send At</Form.Label><Form.Control type="datetime-local" name="sendAt" value={formData.sendAt} onChange={handleFormChange} required/></Form.Group></Col>
<Col xs={12}><Form.Group controlId="reminderTitle"><Form.Label>Title</Form.Label><Form.Control name="title" value={formData.title} onChange={handleFormChange} required/></Form.Group></Col>
<Col xs={12}><Form.Group controlId="reminderMessage"><Form.Label>Message</Form.Label><Form.Control as="textarea" rows={4} name="message" value={formData.message} onChange={handleFormChange} required/></Form.Group></Col>
<Col md={4}><Form.Check name="channel.inApp" label="In-app" checked={formData.channels.inApp} onChange={handleFormChange}/></Col>
<Col md={4}><Form.Check name="channel.email" label="Email" checked={formData.channels.email} onChange={handleFormChange}/></Col>
<Col md={4}><Form.Check name="channel.sms" label="SMS" checked={formData.channels.sms} onChange={handleFormChange}/></Col>
<Col md={4}><Form.Check name="isRecurring" label="Recurring" checked={formData.isRecurring} onChange={handleFormChange}/></Col>
{formData.isRecurring&&<><Col md={4}><Form.Group controlId="reminderRecurrence"><Form.Label>Recurrence</Form.Label><Form.Select name="recurrenceRule" value={formData.recurrenceRule} onChange={handleFormChange} required><option value="">Select</option><option value="weekly">Weekly</option><option value="bi-weekly">Bi-weekly</option></Form.Select></Form.Group></Col><Col md={4}><Form.Group controlId="reminderEnd"><Form.Label>Ends</Form.Label><Form.Control type="datetime-local" name="recurrenceEndAt" value={formData.recurrenceEndAt||''} onChange={handleFormChange}/></Form.Group></Col></>}
<Col xs={12} className="d-flex justify-content-end gap-2"><Button type="button" variant="secondary" onClick={closeFormModal}>Cancel</Button><Button type="submit">{formMode==='edit'?'Update Reminder':'Save Reminder'}</Button></Col>
</Row>
</Form>
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
