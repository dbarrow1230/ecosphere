import {useEffect,useState} from "react";
import {Alert,Button,Spinner,Table} from "react-bootstrap";
import CategoryForm from "../forms/admin/CategoryForm.jsx";

export default function CategoryPage(){
 const [rows,setRows]=useState([]);
 const [selected,setSelected]=useState(null);
 const [showForm,setShowForm]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const loadRows=async()=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch("/api/categories");
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to load categories");
   setRows(Array.isArray(data)?data:data.data||[]);
  }catch(err){
   setError(err.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{loadRows();},[]);

 const closeForm=()=>{
  setSelected(null);
  setShowForm(false);
 };

 const save=async payload=>{
  try{
   setSaving(true);
   setError("");
   const url=payload._id?`/api/categories/${payload._id}`:"/api/categories";
   const res=await fetch(url,{
    method:payload._id?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to save category");
   return data;
  }catch(err){
   setError(err.message);
   throw err;
  }finally{
   setSaving(false);
  }
 };

 const remove=async id=>{
  if(!window.confirm("Delete this category?"))return;
  try{
   setError("");
   const res=await fetch(`/api/categories/${id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to delete category");
   await loadRows();
  }catch(err){
   setError(err.message);
  }
 };

 return(
  <main className="container py-4">
   <div className="d-flex justify-content-between align-items-center mb-3">
    <div><h1 className="h3 mb-1">Categories</h1><p className="text-muted mb-0">Manage recipe categories.</p></div>
    <Button onClick={()=>{setSelected(null);setShowForm(true);}}>Add Category</Button>
   </div>
   {error?<Alert variant="danger">{error}</Alert>:null}
   {loading?<div className="py-4 text-center"><Spinner animation="border"/></div>:(
    <div className="table-responsive">
     <Table striped bordered hover>
      <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Active</th><th>Actions</th></tr></thead>
      <tbody>
       {rows.length===0?<tr><td colSpan="5" className="text-center text-muted">No categories found.</td></tr>:rows.map(row=>(
        <tr key={row._id}>
         <td>{row.name}</td><td>{row.slug}</td><td>{row.description}</td><td>{row.isActive?"Yes":"No"}</td>
         <td>
          <Button size="sm" className="me-2" onClick={()=>{setSelected(row);setShowForm(true);}}>Edit</Button>
          <Button size="sm" variant="danger" onClick={()=>remove(row._id)}>Delete</Button>
         </td>
        </tr>
       ))}
      </tbody>
     </Table>
    </div>
   )}
   {showForm?<CategoryForm
    key={selected?._id||"new"}
    initialData={selected||{}}
    onSubmit={save}
    onSaved={async()=>{closeForm();await loadRows();}}
    onHide={closeForm}
    loading={saving}
   />:null}
  </main>
 );
}
