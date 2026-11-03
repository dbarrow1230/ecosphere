import Alert from "../../components/AppAlert.jsx";
// /src/forms/ProductForm.jsx
import React,{useEffect,useRef,useState} from 'react';

export default function ProductForm({initialData={},categories=[],brands=[],units=[],stores=[],countries=[],endpoint='/api/products',method='POST',onSuccess}){
const [form,setForm]=useState({
name:initialData.name||'',
slug:initialData.slug||'',
sku:initialData.sku||'',
barcode:initialData.barcode||'',
description:initialData.description||'',
image:initialData.image||'',
category:initialData.category?._id||initialData.category||'',
brand:initialData.brand?._id||initialData.brand||'',
unit:initialData.unit?._id||initialData.unit||'',
defaultStore:initialData.defaultStore?._id||initialData.defaultStore||'',
countries:Array.isArray(initialData.countries)?initialData.countries.map(country=>country?._id||country):[],
tags:Array.isArray(initialData.tags)?initialData.tags.join(', '):'',
size:initialData.size||'',
color:initialData.color||'',
material:initialData.material||'',
modelNumber:initialData.modelNumber||'',
price:initialData.price||0,
minPrice:initialData.minPrice||0,
maxPrice:initialData.maxPrice||0,
isActive:typeof initialData.isActive==='boolean'?initialData.isActive:true,
isFeatured:initialData.isFeatured||false
});
const [loading,setLoading]=useState(false);
const [alert,setAlert]=useState({type:'',message:'',show:false});
const alertTimerRef=useRef(null);

const showAutoCloseAlert=(type,message)=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert({type,message,show:true});
alertTimerRef.current=setTimeout(()=>{
setAlert(prev=>({...prev,show:false}));
},3000);
};

const closeAlert=()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
setAlert(prev=>({...prev,show:false}));
};

useEffect(()=>{
return()=>{
if(alertTimerRef.current)clearTimeout(alertTimerRef.current);
};
},[]);

const slugify=value=>value
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g,'')
.replace(/\s+/g,'-')
.replace(/-+/g,'-');

const handleChange=e=>{
const {name,value,type,checked}=e.target;
setForm(prev=>{
const next={...prev,[name]:type==='checkbox'?checked:value};
if(name==='name'&&!initialData.slug)next.slug=slugify(value);
return next;
});
};

const handleCountriesChange=e=>{
const values=Array.from(e.target.selectedOptions,option=>option.value);
setForm(prev=>({...prev,countries:values}));
};

const handleSubmit=async e=>{
e.preventDefault();
setLoading(true);
try{
const payload={
...form,
tags:form.tags.split(',').map(tag=>tag.trim()).filter(Boolean),
price:Number(form.price)||0,
minPrice:Number(form.minPrice)||0,
maxPrice:Number(form.maxPrice)||0
};
const res=await fetch(endpoint,{
method,
headers:{'Content-Type':'application/json'},
body:JSON.stringify(payload)
});
const data=await res.json();
if(!res.ok)throw new Error(data.message||'Failed to save product');
showAutoCloseAlert('success',data.message||'Product saved successfully');
if(onSuccess)onSuccess(data);
}catch(err){
showAutoCloseAlert('danger',err.message||'Something went wrong');
}finally{
setLoading(false);
}
};

return(
<form onSubmit={handleSubmit}>
{alert.show&&(
<Alert variant={alert.type} dismissible onClose={closeAlert}>{alert.message}</Alert>
)}

<div className="row g-3">
<div className="col-md-6">
<label className="form-label">Name</label>
<input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
</div>

<div className="col-md-6">
<label className="form-label">Slug</label>
<input type="text" className="form-control" name="slug" value={form.slug} onChange={handleChange} required />
</div>

<div className="col-md-4">
<label className="form-label">SKU</label>
<input type="text" className="form-control" name="sku" value={form.sku} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Barcode</label>
<input type="text" className="form-control" name="barcode" value={form.barcode} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Model Number</label>
<input type="text" className="form-control" name="modelNumber" value={form.modelNumber} onChange={handleChange} />
</div>

<div className="col-12">
<label className="form-label">Description</label>
<textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3"></textarea>
</div>

<div className="col-md-6">
<label className="form-label">Image</label>
<input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} />
</div>

<div className="col-md-6">
<label className="form-label">Tags</label>
<input type="text" className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="tag1, tag2, tag3" />
</div>

<div className="col-md-3">
<label className="form-label">Category</label>
<select className="form-select" name="category" value={form.category} onChange={handleChange} required>
<option value="">Select Category</option>
{categories.map(category=>(
<option key={category._id} value={category._id}>{category.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Brand</label>
<select className="form-select" name="brand" value={form.brand} onChange={handleChange}>
<option value="">Select Brand</option>
{brands.map(brand=>(
<option key={brand._id} value={brand._id}>{brand.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Unit</label>
<select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
<option value="">Select Unit</option>
{units.map(unit=>(
<option key={unit._id} value={unit._id}>{unit.name}</option>
))}
</select>
</div>

<div className="col-md-3">
<label className="form-label">Default Store</label>
<select className="form-select" name="defaultStore" value={form.defaultStore} onChange={handleChange}>
<option value="">Select Store</option>
{stores.map(store=>(
<option key={store._id} value={store._id}>{store.name}</option>
))}
</select>
</div>

<div className="col-md-6">
<label className="form-label">Countries</label>
<select className="form-select" name="countries" value={form.countries} onChange={handleCountriesChange} multiple>
{countries.map(country=>(
<option key={country._id} value={country._id}>{country.name}</option>
))}
</select>
</div>

<div className="col-md-2">
<label className="form-label">Size</label>
<input type="text" className="form-control" name="size" value={form.size} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Color</label>
<input type="text" className="form-control" name="color" value={form.color} onChange={handleChange} />
</div>

<div className="col-md-2">
<label className="form-label">Material</label>
<input type="text" className="form-control" name="material" value={form.material} onChange={handleChange} />
</div>

<div className="col-md-4">
<label className="form-label">Price</label>
<input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Min Price</label>
<input type="number" className="form-control" name="minPrice" value={form.minPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-4">
<label className="form-label">Max Price</label>
<input type="number" className="form-control" name="maxPrice" value={form.maxPrice} onChange={handleChange} min="0" step="0.01" />
</div>

<div className="col-md-6">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isActive" name="isActive" checked={form.isActive} onChange={handleChange} />
<label className="form-check-label" htmlFor="isActive">Active</label>
</div>
</div>

<div className="col-md-6">
<div className="form-check">
<input type="checkbox" className="form-check-input" id="isFeatured" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
<label className="form-check-label" htmlFor="isFeatured">Featured</label>
</div>
</div>

<div className="col-12">
<button type="submit" className="btn btn-primary" disabled={loading}>
{loading?'Saving...':'Save Product'}
</button>
</div>
</div>
</form>
);
}