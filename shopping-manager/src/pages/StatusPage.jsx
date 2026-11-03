// /src/pages/StatusPage.jsx
import {useEffect,useMemo,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner,Badge,Accordion} from 'react-bootstrap';
import StatusForm from './forms/StatusForm.jsx';
import {ORDER_TYPES,RETURN_REASONS,ITEM_CONDITIONS,RETURN_RESOLUTIONS,REFUND_METHODS,REFUND_STATUSES,RETURN_ITEM_STATUSES,BUDGET_PERIODS} from '../../backend/constants/modelOptions';

const GROUPS=[
{title:'Order Types',type:'order_type',typeAliases:['order_type','order_types','ordertype'],options:Object.values(ORDER_TYPES)},
{title:'Return Reasons',type:'return_reason',typeAliases:['return_reason','return_reasons','returnreason'],options:Object.values(RETURN_REASONS)},
{title:'Item Conditions',type:'item_condition',typeAliases:['item_condition','item_conditions','itemcondition'],options:Object.values(ITEM_CONDITIONS)},
{title:'Return Resolutions',type:'return_resolution',typeAliases:['return_resolution','return_resolutions','returnresolution'],options:Object.values(RETURN_RESOLUTIONS)},
{title:'Refund Methods',type:'refund_method',typeAliases:['refund_method','refund_methods','refundmethod'],options:Object.values(REFUND_METHODS)},
{title:'Refund Statuses',type:'refund_status',typeAliases:['refund_status','refund_statuses','refundstatus'],options:Object.values(REFUND_STATUSES)},
{title:'Return Item Statuses',type:'return_item_status',typeAliases:['return_item_status','return_item_statuses','returnitemstatus'],options:Object.values(RETURN_ITEM_STATUSES)},
{title:'Budget Periods',type:'budget_period',typeAliases:['budget_period','budget_periods','budgetperiod'],options:Object.values(BUDGET_PERIODS)}
];

const normalize=value=>String(value||'').trim().toLowerCase().replace(/[\s_-]/g,'');
const formatLabel=value=>String(value||'').replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,char=>char.toUpperCase());

export default function StatusPage(){
const [statuses,setStatuses]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedStatus,setSelectedStatus]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [selectedAccordionKey,setSelectedAccordionKey]=useState('0');
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const groupedRows=useMemo(()=>{
return GROUPS.map((group,groupIndex)=>({
...group,
accordionKey:String(groupIndex),
rows:group.options.map((optionValue,index)=>{
const normalizedOption=normalize(optionValue);
const record=statuses.find(item=>
group.typeAliases.includes(normalize(item.type))&&normalize(item.key)===normalizedOption
)||null;
return{
optionValue,
key:String(optionValue).toLowerCase(),
record,
defaultName:formatLabel(optionValue),
defaultLabel:formatLabel(optionValue),
defaultSortOrder:index
};
})
}));
},[statuses]);

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
loadStatuses();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const loadStatuses=async()=>{
setLoading(true);
try{
const res=await fetch('/api/statuses');
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to load statuses');
setStatuses(data.statuses||data.data||data||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load statuses');
}finally{
setLoading(false);
}
};

const openAddModal=(group,row)=>{
setSelectedAccordionKey(group.accordionKey);
setFormMode('add');
setSelectedStatus({
name:row.defaultName,
key:row.key,
type:group.type,
label:row.defaultLabel,
description:'',
color:'#198754',
sortOrder:row.defaultSortOrder,
isActive:true
});
setShowFormModal(true);
};

const openEditModal=(group,status)=>{
setSelectedAccordionKey(group.accordionKey);
setFormMode('edit');
setSelectedStatus(status);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedStatus(null);
};

const openDeleteModal=(group,status)=>{
setSelectedAccordionKey(group.accordionKey);
setDeleteTarget(status);
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadStatuses();
closeFormModal();
showAutoCloseAlert('success',`Status ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/statuses/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete status');
await loadStatuses();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Status deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Statuses</h3>
</div>

{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>
{alert.message}
</Alert>
)}

{loading?(
<div className="text-center py-4">
<Spinner animation="border" />
</div>
):(
<Accordion activeKey={selectedAccordionKey} onSelect={eventKey=>setSelectedAccordionKey(eventKey||'0')}>
{groupedRows.map(group=>(
<Accordion.Item eventKey={group.accordionKey} key={group.type}>
<Accordion.Header>
<div className="d-flex flex-column">
<span className="fw-semibold"><h2>{group.title}</h2></span>
<small className="text-muted">{group.type}</small>
</div>
</Accordion.Header>
<Accordion.Body>
<Card className="shadow-sm border-0">
<Card.Body className="p-0">
<div className="table-responsive">
<Table striped bordered hover responsive className="align-middle mb-0">
<thead>
<tr>
<th>Option</th>
<th>Key</th>
<th>Name</th>
<th>Label</th>
<th>Color</th>
<th>Sort Order</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{group.rows.map(row=>(
<tr key={`${group.type}-${row.key}`}>
<td>{formatLabel(row.optionValue)}</td>
<td>{row.key}</td>
<td>{row.record?.name||row.defaultName}</td>
<td>{row.record?.label||row.defaultLabel}</td>
<td>
{row.record?.color?(
<div className="d-flex align-items-center gap-2">
<span style={{display:'inline-block',width:'18px',height:'18px',border:'1px solid #ccc',borderRadius:'4px',backgroundColor:row.record.color}}></span>
<span>{row.record.color}</span>
</div>
):''}
</td>
<td>{row.record?.sortOrder??row.defaultSortOrder}</td>
<td>
{row.record?(
<Badge bg={row.record.isActive?'success':'secondary'}>
{row.record.isActive?'Yes':'No'}
</Badge>
):(
<Badge bg="warning" text="dark">Not Added</Badge>
)}
</td>
<td className="d-flex gap-2">
{row.record?(
<>
<Button type="button" variant="outline-primary" size="sm" onClick={()=>openEditModal(group,row.record)}>Edit</Button>
<Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteModal(group,row.record)}>Delete</Button>
</>
):(
<Button type="button" variant="primary" size="sm" onClick={()=>openAddModal(group,row)}>Add</Button>
)}
</td>
</tr>
))}
</tbody>
</Table>
</div>
</Card.Body>
</Card>
</Accordion.Body>
</Accordion.Item>
))}
</Accordion>
)}

<Modal show={showFormModal} onHide={closeFormModal} centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Status':'Add Status'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<StatusForm
initialData={selectedStatus||{}}
endpoint={formMode==='edit'&&selectedStatus?`/api/statuses/${selectedStatus._id}`:'/api/statuses'}
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
Are you sure you want to delete this status?
</Modal.Body>
<Modal.Footer>
<Button type="button" variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}