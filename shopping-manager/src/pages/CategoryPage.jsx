// /src/pages/CategoryPage.jsx
import {Fragment,useEffect,useMemo,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner,Accordion} from 'react-bootstrap';
import CategoryForm from './forms/CategoryForm.jsx';

export default function CategoryPage(){
const [categories,setCategories]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedCategory,setSelectedCategory]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [activeAccordionKey,setActiveAccordionKey]=useState(null);
const [formTitle,setFormTitle]=useState('Add Category');
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);
const initializedAccordionRef=useRef(false);

const getButtonLabel=node=>`Add Under ${node.name}`;

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
loadCategories();
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const normalizeName=value=>String(value||'').trim().toLowerCase();

const sortCategories=list=>[...(list||[])].sort((a,b)=>normalizeName(a.name).localeCompare(normalizeName(b.name)));

const getParentId=item=>typeof item.parentCategory==='object'?item.parentCategory?._id:item.parentCategory;


const getFormTitle=(level,parentName)=>{
if(level===0)return `Add Child Category Under ${parentName}`;
if(level===1)return `Add Grandchild Category Under ${parentName}`;
if(level===2)return `Add Great-Grandchild Category Under ${parentName}`;
return `Add Nested Category Under ${parentName}`;
};

const categoryMap=useMemo(()=>{
const map=new Map();
sortCategories(categories).forEach(category=>{
map.set(String(category._id),{...category,children:[]});
});
map.forEach(node=>{
const parentId=getParentId(node);
if(parentId&&map.has(String(parentId))){
map.get(String(parentId)).children.push(node);
}
});
map.forEach(node=>{
node.children=sortCategories(node.children);
});
return map;
},[categories]);

const rootCategories=useMemo(()=>{
const roots=[...categoryMap.values()].filter(node=>!getParentId(node)||!categoryMap.has(String(getParentId(node))));
return sortCategories(roots);
},[categoryMap]);

useEffect(()=>{
if(!rootCategories.length)return;
if(!initializedAccordionRef.current){
setActiveAccordionKey(String(rootCategories[0]._id));
initializedAccordionRef.current=true;
return;
}
if(activeAccordionKey&&!rootCategories.some(group=>String(group._id)===String(activeAccordionKey))){
setActiveAccordionKey(String(rootCategories[0]._id));
}
},[rootCategories,activeAccordionKey]);

const loadCategories=async()=>{
setLoading(true);
try{
const res=await fetch('/api/categories');
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to load categories');
setCategories(data.categories||data.data||data||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load categories');
}finally{
setLoading(false);
}
};

const openAddModal=(parentCategory=null,accordionKey=null,level=null)=>{
setFormMode('add');
setSelectedCategory({
name:'',
slug:'',
description:'',
image:'',
parentCategory:parentCategory?._id||parentCategory||'',
isActive:true
});
setFormTitle(parentCategory&&level!==null?getFormTitle(level,parentCategory.name):'Add Category');
if(accordionKey)setActiveAccordionKey(String(accordionKey));
setShowFormModal(true);
};

const openEditModal=(category,accordionKey=null)=>{
setFormMode('edit');
setSelectedCategory(category);
setFormTitle(`Edit Category: ${category.name}`);
if(accordionKey)setActiveAccordionKey(String(accordionKey));
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedCategory(null);
setFormTitle('Add Category');
};

const openDeleteModal=(category,accordionKey=null)=>{
setDeleteTarget(category);
if(accordionKey)setActiveAccordionKey(String(accordionKey));
setShowDeleteModal(true);
};

const closeDeleteModal=()=>{
setShowDeleteModal(false);
setDeleteTarget(null);
};

const handleSaveSuccess=async()=>{
await loadCategories();
closeFormModal();
showAutoCloseAlert('success',`Category ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/categories/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete category');
await loadCategories();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Category deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const renderCategoryNode=(node,level=0,accordionKey=null)=>(
<Fragment key={node._id}>
<tr>
<td style={{paddingLeft:`${level*28+8}px`}}>{node.name}</td>
<td>{node.slug}</td>
<td>{node.image}</td>
<td>{node.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2 flex-wrap">
<Button type="button" variant="outline-primary" size="sm" onClick={()=>openEditModal(node,accordionKey)}>Edit</Button>
<Button type="button" variant="outline-danger" size="sm" onClick={()=>openDeleteModal(node,accordionKey)}>Delete</Button>
<Button type="button" variant="success" size="sm" onClick={()=>openAddModal(node,accordionKey,level)}>{getButtonLabel(node)}</Button>
</td>
</tr>
{node.children.map(child=>renderCategoryNode(child,level+1,accordionKey))}
</Fragment>
);

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Categories</h3>
<Button type="button" variant="primary" onClick={()=>openAddModal(null,activeAccordionKey,null)}>Add Category</Button>
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
):rootCategories.length?(
<Accordion activeKey={activeAccordionKey} onSelect={eventKey=>setActiveAccordionKey(eventKey)}>
{rootCategories.map(root=>(
<Accordion.Item eventKey={String(root._id)} key={root._id}>
<Accordion.Header>
<div className="d-flex flex-column">
<span><h5>{root.name}</h5></span>
<small className="text-muted">{root.slug}</small>
</div>
</Accordion.Header>
<Accordion.Body>
<div className="d-flex justify-content-end mb-3">
<Button type="button" size="sm" variant="success" onClick={()=>openAddModal(root,root._id,0)}>Add Child Category</Button>
</div>

<div className="table-responsive">
<Table striped bordered hover responsive className="align-middle mb-0">
<thead>
<tr>
<th>Name</th>
<th>Slug</th>
<th>Image</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{renderCategoryNode(root,0,root._id)}
</tbody>
</Table>
</div>
</Accordion.Body>
</Accordion.Item>
))}
</Accordion>
):(
<div className="text-center">No categories found</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} centered>
<Modal.Header closeButton>
<Modal.Title>{formTitle}</Modal.Title>
</Modal.Header>
<Modal.Body>
<CategoryForm
key={`${formMode}-${selectedCategory?._id||'new'}-${selectedCategory?.parentCategory?._id||selectedCategory?.parentCategory||'root'}-${categories.length}`}
initialData={selectedCategory||{}}
categories={sortCategories(categories)}
endpoint={formMode==='edit'&&selectedCategory?`/api/categories/${selectedCategory._id}`:'/api/categories'}
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
Are you sure you want to delete this category?
</Modal.Body>
<Modal.Footer>
<Button type="button" variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
