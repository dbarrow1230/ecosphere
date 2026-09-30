// /src/pages/ProductPage.jsx
import {useEffect,useRef,useState} from 'react';
import {Button,Card,Modal,Table,Alert,Spinner} from 'react-bootstrap';
import ProductForm from './forms/ProductForm.jsx';

export default function ProductPage(){
const [products,setProducts]=useState([]);
const [categories,setCategories]=useState([]);
const [brands,setBrands]=useState([]);
const [units,setUnits]=useState([]);
const [stores,setStores]=useState([]);
const [countries,setCountries]=useState([]);
const [loading,setLoading]=useState(true);
const [showFormModal,setShowFormModal]=useState(false);
const [showDeleteModal,setShowDeleteModal]=useState(false);
const [formMode,setFormMode]=useState('add');
const [selectedProduct,setSelectedProduct]=useState(null);
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
const [productRes,categoryRes,brandRes,unitRes,storeRes,countryRes]=await Promise.all([
fetch('/api/products'),
fetch('/api/categories'),
fetch('/api/brands'),
fetch('/api/units'),
fetch('/api/stores'),
fetch('/api/countries')
]);

const productData=await productRes.json();
const categoryData=await categoryRes.json();
const brandData=await brandRes.json();
const unitData=await unitRes.json();
const storeData=await storeRes.json();
const countryData=await countryRes.json();

if(!productRes.ok)throw new Error(productData.message||'Failed to load products');

setProducts(productData.products||productData.data||productData||[]);
setCategories(categoryData.categories||categoryData.data||categoryData||[]);
setBrands(brandData.brands||brandData.data||brandData||[]);
setUnits(unitData.units||unitData.data||unitData||[]);
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
setSelectedProduct(null);
setShowFormModal(true);
};

const openEditModal=item=>{
setFormMode('edit');
setSelectedProduct(item);
setShowFormModal(true);
};

const closeFormModal=()=>{
setShowFormModal(false);
setSelectedProduct(null);
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
showAutoCloseAlert('success',`Product ${formMode==='edit'?'updated':'created'} successfully`);
};

const handleDelete=async()=>{
if(!deleteTarget?._id)return;
try{
const res=await fetch(`/api/products/${deleteTarget._id}`,{method:'DELETE'});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to delete product');
await loadData();
closeDeleteModal();
showAutoCloseAlert('success',data.message||'Product deleted successfully');
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}
};

const getCategoryName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=categories.find(item=>item._id===value);
return found?found.name:'';
};

const getBrandName=value=>{
if(!value)return '';
if(typeof value==='object')return value.name||'';
const found=brands.find(item=>item._id===value);
return found?found.name:'';
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

return(
<div className="container py-4">
<div className="d-flex justify-content-between align-items-center mb-3">
<h3 className="mb-0">Products</h3>
<Button variant="primary" onClick={openAddModal}>Add Product</Button>
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
<th>SKU</th>
<th>Category</th>
<th>Brand</th>
<th>Unit</th>
<th>Store</th>
<th>Price</th>
<th>Featured</th>
<th>Active</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{products.length?products.map(item=>(
<tr key={item._id}>
<td>{item.name}</td>
<td>{item.sku}</td>
<td>{getCategoryName(item.category)}</td>
<td>{getBrandName(item.brand)}</td>
<td>{getUnitName(item.unit)}</td>
<td>{getStoreName(item.defaultStore)}</td>
<td>{item.price}</td>
<td>{item.isFeatured?'Yes':'No'}</td>
<td>{item.isActive?'Yes':'No'}</td>
<td className="d-flex gap-2">
<Button variant="outline-primary" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
<Button variant="outline-danger" size="sm" onClick={()=>openDeleteModal(item)}>Delete</Button>
</td>
</tr>
)):(
<tr>
<td colSpan="10" className="text-center">No products found</td>
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
<Modal.Title>{formMode==='edit'?'Edit Product':'Add Product'}</Modal.Title>
</Modal.Header>
<Modal.Body>
<ProductForm
initialData={selectedProduct||{}}
categories={categories}
brands={brands}
units={units}
stores={stores}
countries={countries}
endpoint={formMode==='edit'&&selectedProduct?`/api/products/${selectedProduct._id}`:'/api/products'}
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
Are you sure you want to delete this product?
</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={closeDeleteModal}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
</Modal.Footer>
</Modal>
</div>
);
}