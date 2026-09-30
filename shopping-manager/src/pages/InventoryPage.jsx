// /src/pages/InventoryPage.jsx
import {useCallback,useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import InventoryForm from './forms/InventoryForm.jsx';
import ProductForm from './forms/ProductForm.jsx';
import StoreForm from './forms/StoreForm.jsx';
import LocationForm from './forms/LocationForm.jsx';

export default function InventoryPage(){
const [inventories,setInventories]=useState([]);
const [users,setUsers]=useState([]);
const [products,setProducts]=useState([]);
const [units,setUnits]=useState([]);
const [stores,setStores]=useState([]);
const [categories,setCategories]=useState([]);
const [brands,setBrands]=useState([]);
const [countries,setCountries]=useState([]);
const [states,setStates]=useState([]);
const [businesses,setBusinesses]=useState([]);
const [locationTypes,setLocationTypes]=useState([]);
const [referenceLocations,setReferenceLocations]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [relatedForm,setRelatedForm]=useState(null);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedInventory,setSelectedInventory]=useState(null);
const [deleteTarget,setDeleteTarget]=useState(null);
const [newRelatedItem,setNewRelatedItem]=useState(null);
const [alert,setAlert]=useState({show:false,type:'success',message:''});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=useCallback((type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({show:true,type,message});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},5000);
},[]);

const closeAlert=useCallback(()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
},[]);

const loadData=useCallback(async()=>{
setLoading(true);
try{
const [inventoryRes,userRes,productRes,unitRes,storeRes,categoryRes,brandRes,countryRes,stateRes,businessRes,locationTypeRes,referenceLocationRes]=await Promise.all([
fetch('/api/inventories'),
fetch('/api/users'),
fetch('/api/products'),
fetch('/api/units'),
fetch('/api/stores'),
fetch('/api/categories'),
fetch('/api/brands'),
fetch('/api/countries'),
fetch('/api/states'),
fetch('/api/businesses'),
fetch('/api/location-types'),
fetch('/api/locations')
]);

const inventoryData=await inventoryRes.json();
const userData=await userRes.json();
const productData=await productRes.json();
const unitData=await unitRes.json();
const storeData=await storeRes.json();
const categoryData=await categoryRes.json();
const brandData=await brandRes.json();
const countryData=await countryRes.json();
const stateData=await stateRes.json();
const businessData=await businessRes.json();
const locationTypeData=await locationTypeRes.json();
const referenceLocationData=await referenceLocationRes.json();

if(!inventoryRes.ok)throw new Error(inventoryData.message||'Failed to load inventories');

setInventories(inventoryData.inventories||inventoryData.data||inventoryData||[]);
setUsers(userData.users||userData.data||userData||[]);
setProducts(productData.products||productData.data||productData||[]);
setUnits(unitData.units||unitData.data||unitData||[]);
setStores(storeData.stores||storeData.data||storeData||[]);
setCategories(categoryData.categories||categoryData.data||categoryData||[]);
setBrands(brandData.brands||brandData.data||brandData||[]);
setCountries(countryData.countries||countryData.data||countryData||[]);
setStates(stateData.states||stateData.data||stateData||[]);
setBusinesses(businessData.businesses||businessData.data||businessData||[]);
setLocationTypes(locationTypeData.locationTypes||locationTypeData.data||locationTypeData||[]);
setReferenceLocations(referenceLocationData.locations||referenceLocationData.data||referenceLocationData||[]);
}catch(err){
showAutoCloseAlert('danger',err.message||'Failed to load page data');
}finally{
setLoading(false);
}
},[showAutoCloseAlert]);

useEffect(()=>{
let cancelled=false;
Promise.resolve().then(()=>{
if(!cancelled)loadData();
});
return()=>{
cancelled=true;
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[loadData]);

const openAddModal=()=>{
setFormMode('add');
setSelectedInventory(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedInventory(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedInventory(null);
};

const closeRelatedForm=()=>{
setRelatedForm(null);
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
showAutoCloseAlert('success',`Inventory ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleRelatedSaveSuccess=type=>async data=>{
await loadData();
const item=data?.[type]||data?.data||data;
setNewRelatedItem({type,item,stamp:Date.now()});
closeRelatedForm();
showAutoCloseAlert('success',`${type.charAt(0).toUpperCase()+type.slice(1)} created successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/inventories/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete inventory');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Inventory deleted successfully');
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

const getStoredUser=()=>{
if(typeof window==='undefined')return null;
const keys=['userInfo','user','authUser','currentUser'];
for(const key of keys){
try{
const raw=window.localStorage.getItem(key)||window.sessionStorage.getItem(key);
if(!raw)continue;
const parsed=JSON.parse(raw);
return parsed?.user||parsed?.authUser||parsed?.data||parsed?.profile||parsed;
}catch{
const raw=window.localStorage.getItem(key)||window.sessionStorage.getItem(key);
if(raw)return {username:raw};
}
}
return null;
};

const getProductLabel=value=>{
if(!value)return '';
const product=typeof value==='object'?value:products.find(item=>item._id===value);
if(!product)return '';
return product.name||product.title||product.label||product.sku||product.barcode||'Unnamed Product';
};

const getProductName=value=>{
return getProductLabel(value);
};

const getUnitName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=units.find(item=>item._id===value);
return found?found.name:'';
};

const getStoreName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=stores.find(item=>item._id===value);
return found?found.name:'';
};

const inventoryLocations=[...new Set([
...referenceLocations.map(item=>item.name).filter(Boolean),
...inventories.map(item=>item.location).filter(Boolean)
])].sort((a,b)=>a.localeCompare(b));
const pageUser=getStoredUser();
const pageUserName=pageUser?.name||pageUser?.username||pageUser?.email||getUserName(inventories[0]?.user)||'User';

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Inventory for {pageUserName}</h3>
<Button variant="primary" onClick={openAddModal}>Add Inventory</Button>
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
<th>Product</th>
<th>Unit</th>
<th>Store</th>
<th>Quantity</th>
<th>Min</th>
<th>Max</th>
<th>Reorder</th>
<th>Low Stock</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{inventories.length?inventories.map(item=>(
<tr key={item._id}>
<td>{getProductName(item.product)}</td>
<td>{getUnitName(item.unit)}</td>
<td>{getStoreName(item.store)}</td>
<td>{item.quantity}</td>
<td>{item.minQuantity}</td>
<td>{item.maxQuantity}</td>
<td>{item.reorderLevel}</td>
<td>{item.isLowStock?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="9" className="text-center">No inventory found</td>
</tr>
)}
</tbody>
</Table>
</div>
)}
</Card.Body>
</Card>

<Modal show={showFormModal} onHide={closeFormModal} size="xl" backdrop="static" keyboard={false} centered>
<Modal.Header closeButton>
<Modal.Title>{formMode==='edit'?'Edit Inventory':'Add Inventory'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<InventoryForm
initialData={selectedInventory||{}}
users={users}
products={products}
categories={categories}
units={units}
stores={stores}
locations={inventoryLocations}
endpoint={formMode==='edit'&&selectedInventory?`/api/inventories/${selectedInventory._id}`:'/api/inventories'}
method={formMode==='edit'?'PUT':'POST'}
onSuccess={handleSaveSuccess}
onAddProduct={()=>setRelatedForm('product')}
onAddStore={()=>setRelatedForm('store')}
onAddLocation={()=>setRelatedForm('location')}
newRelatedItem={newRelatedItem}
/>
</Modal.Body>
</Modal>

<Modal show={relatedForm==='product'} onHide={closeRelatedForm} size="xl" backdrop="static" keyboard={false} centered>
<Modal.Header closeButton>
<Modal.Title>Add Product</Modal.Title>
</Modal.Header>
<Modal.Body>
<ProductForm
categories={categories}
brands={brands}
units={units}
stores={stores}
countries={countries}
onSuccess={handleRelatedSaveSuccess('product')}
/>
</Modal.Body>
</Modal>

<Modal show={relatedForm==='store'} onHide={closeRelatedForm} size="xl" backdrop="static" keyboard={false} centered>
<Modal.Header closeButton>
<Modal.Title>Add Store</Modal.Title>
</Modal.Header>
<Modal.Body>
<StoreForm
states={states}
countries={countries}
onSuccess={handleRelatedSaveSuccess('store')}
/>
</Modal.Body>
</Modal>

<Modal show={relatedForm==='location'} onHide={closeRelatedForm} size="xl" backdrop="static" keyboard={false} centered>
<Modal.Header closeButton>
<Modal.Title>Add Location</Modal.Title>
</Modal.Header>
<Modal.Body>
<LocationForm
businesses={businesses}
locationTypes={locationTypes}
locations={referenceLocations}
onSuccess={handleRelatedSaveSuccess('location')}
/>
</Modal.Body>
</Modal>

<Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
<Modal.Header closeButton>
<Modal.Title>Confirm Delete</Modal.Title>
</Modal.Header>
<Modal.Body>
Are you sure you want to delete this inventory item?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}
