import {useEffect,useState} from "react";
import {Button,Table,Alert,Spinner} from "react-bootstrap";
import DietaryForm from "../forms/admin/DietaryForm.jsx";

function Dietaries(){
 const API_URL=import.meta.env.VITE_BACKEND_URL||"";
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selected,setSelected]=useState(null);
 const [showForm,setShowForm]=useState(false);

 const loadRows=async()=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch(`${API_URL}/api/dietaries`);
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to load dietaries");
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

 const handleDelete=async(id)=>{
  if(!window.confirm("Delete this dietary item?"))return;

  try{
   const res=await fetch(`${API_URL}/api/dietaries/${id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to delete dietary item");
   loadRows();
  }catch(err){
   setError(err.message);
  }
 };

 const handleClose=()=>{
  setSelected(null);
  setShowForm(false);
  loadRows();
 };

 return(
  <main className="container py-4">
   <div className="d-flex justify-content-between align-items-center mb-3">
    <div>
     <h1 className="h3 mb-1">Dietary</h1>
     <p className="text-muted mb-0">Manage dietary labels.</p>
    </div>
    <Button onClick={handleAdd}>Add Dietary</Button>
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
        <th>Slug</th>
        <th>Description</th>
        <th>Active</th>
        <th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {rows.length===0?(
        <tr>
         <td colSpan="5" className="text-center text-muted">No dietary items found.</td>
        </tr>
       ):rows.map(row=>(
        <tr key={row._id}>
         <td>{row.name}</td>
         <td>{row.slug}</td>
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

   {showForm?(
    <DietaryForm row={selected} onClose={handleClose}/>
   ):null}
  </main>
 );
}

export default Dietaries;