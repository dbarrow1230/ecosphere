// src/pages/admin/VendorCategoriesPage.jsx
import {useEffect,useState} from "react";
import {Button,Modal,Table,Alert,Spinner} from "react-bootstrap";
import VendorCategoryForm from "../forms/admin/VendorCategoryForm.jsx";

function VendorCategories(){
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [selected,setSelected]=useState(null);
 const [showForm,setShowForm]=useState(false);

 const loadRows=async()=>{
  try{
   setLoading(true);
   setError("");

   const res=await fetch("/api/vendor-categories");
   const data=await res.json();

   if(!res.ok)throw new Error(data.message||"Failed to load vendor categories");

   setRows(Array.isArray(data)?data:data.data||[]);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  loadRows();
 },[]);

 const handleAdd=()=>{
  setSelected(null);
  setShowForm(true);
 };

 const handleEdit=row=>{
  setSelected(row);
  setShowForm(true);
 };

 const handleHide=()=>{
  setSelected(null);
  setShowForm(false);
 };

 const handleSubmit=async payload=>{
  try{
   setSaving(true);
   setError("");

   const method=payload._id?"PUT":"POST";
   const url=payload._id?`/api/vendor-categories/${payload._id}`:"/api/vendor-categories";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)throw new Error(data.message||"Failed to save vendor category");

   return data;
  }catch(err){
   setError(err.message);
   throw err;
  }finally{
   setSaving(false);
  }
 };

 const handleSaved=()=>{
  setSelected(null);
  setShowForm(false);
  loadRows();
 };

 const handleDelete=async id=>{
  if(!window.confirm("Delete this vendor category?"))return;

  try{
   setError("");

   const res=await fetch(`/api/vendor-categories/${id}`,{method:"DELETE"});
   const data=await res.json();

   if(!res.ok)throw new Error(data.message||"Failed to delete vendor category");

   loadRows();
  }catch(err){
   setError(err.message);
  }
 };

 return(
  <main className="container py-4">
   <div className="d-flex justify-content-between align-items-center mb-3">
    <div>
     <h1 className="h3 mb-1">Vendor Categories</h1>
     <p className="text-muted mb-0">Manage vendor category records.</p>
    </div>
    <Button onClick={handleAdd}>Add Vendor Category</Button>
   </div>

   {error?<Alert variant="danger">{error}</Alert>:null}

   {loading?(
    <div className="py-4 text-center">
     <Spinner animation="border"/>
    </div>
   ):(
    <div className="table-responsive">
     <Table striped hover bordered>
      <thead>
       <tr>
        <th>Name</th>
        <th>Code</th>
        <th>Description</th>
        <th>Active</th>
        <th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {rows.length===0?(
        <tr>
         <td colSpan="5" className="text-center text-muted">No vendor categories found.</td>
        </tr>
       ):rows.map(row=>(
        <tr key={row._id}>
         <td>{row.name}</td>
         <td>{row.code}</td>
         <td>{row.description}</td>
         <td>{row.isActive?"Yes":"No"}</td>
         <td>
          <Button size="sm" className="me-2" onClick={()=>handleEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={()=>handleDelete(row._id)}>Delete</Button>
         </td>
        </tr>
       ))}
      </tbody>
     </Table>
    </div>
   )}

   <Modal show={showForm} onHide={handleHide} centered>
    <Modal.Header closeButton>
     <Modal.Title>{selected?._id?"Edit Vendor Category":"Add Vendor Category"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     <VendorCategoryForm
      initialData={selected||{}}
      onSubmit={handleSubmit}
      onSaved={handleSaved}
      onHide={handleHide}
      loading={saving}
     />
    </Modal.Body>
   </Modal>
  </main>
 );
}

export default VendorCategories;