import {useEffect,useState} from "react";
import {Button,Table,Alert,Spinner} from "react-bootstrap";
import VendorIngredientPriceForm from "../forms/admin/VendorIngredientPriceForm.jsx";

function VendorIngredientPrices(){
 const API_URL=import.meta.env.VITE_BACKEND_URL||"";
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selected,setSelected]=useState(null);
 const [showForm,setShowForm]=useState(false);

 const getLabel=value=>{
  if(!value)return "—";
  if(typeof value==="string")return value;
  return value.legalName||value.name||value.ingredientName||value.displayName||value.title||value._id||"—";
 };

 const loadRows=async()=>{
  try{
   setLoading(true);
   setError("");
   const res=await fetch(`${API_URL}/api/vendor-ingredient-prices`);
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to load vendor ingredient prices");
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
  if(!window.confirm("Delete this vendor ingredient price?"))return;

  try{
   const res=await fetch(`${API_URL}/api/vendor-ingredient-prices/${id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok)throw new Error(data.message||"Failed to delete vendor ingredient price");
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
     <h1 className="h3 mb-1">Vendor Ingredient Prices</h1>
     <p className="text-muted mb-0">Manage vendor pack costs and ingredient pricing.</p>
    </div>
    <Button onClick={handleAdd}>Add Price</Button>
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
        <th>Business</th>
        <th>Vendor</th>
        <th>Ingredient</th>
        <th>Brand</th>
        <th>Pack Size</th>
        <th>Pack Cost</th>
        <th>Unit Cost</th>
        <th>Preferred</th>
        <th>Active</th>
        <th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {rows.length===0?(
        <tr>
         <td colSpan="10" className="text-center text-muted">No vendor ingredient prices found.</td>
        </tr>
       ):rows.map(row=>(
        <tr key={row._id}>
         <td>{getLabel(row.business)}</td>
         <td>{getLabel(row.vendor)}</td>
         <td>{getLabel(row.ingredient)}</td>
         <td>{row.brand||"—"}</td>
         <td>{row.packSizeName||"—"}</td>
         <td>${Number(row.packCost||0).toFixed(2)}</td>
         <td>${Number(row.unitCost||0).toFixed(4)}</td>
         <td>{row.isPreferred?"Yes":"No"}</td>
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
    <VendorIngredientPriceForm row={selected} onClose={handleClose}/>
   ):null}
  </main>
 );
}

export default VendorIngredientPrices;