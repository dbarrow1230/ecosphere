import {getAdminAccess} from "../../utils/adminAccess.js";
// src/pages/products/ProductsPage.jsx
import {useEffect,useMemo,useState} from "react";
import {Button,Card,Table,Modal} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";
import ProductForm from "../forms/ProductForm";
import ProductDetailsTabs from "../../components/ProductDetailsTabs.jsx";
import {parseProductDetails,applyProductDetailsEdits} from "../../../shared/parseProductDetails.js";
import {makeSku} from "../../../shared/productIdentifiers.js";

export default function ProductsPage({user}){
 const[products,setProducts]=useState([]);
 const[loading,setLoading]=useState(false);
 const[showForm,setShowForm]=useState(false);
 const[editingProduct,setEditingProduct]=useState(null);
 const[selectedProduct,setSelectedProduct]=useState(null);
 const[search,setSearch]=useState("");

 const {isAdmin}=getAdminAccess(user);
 const [error,setError]=useState("");
 const statusLabel=status=>status?.name||status?.code||(typeof status==="string"?status:"Not set");

 useEffect(()=>{
  fetchProducts();
 },[]);

 const fetchProducts=async(query="")=>{
  setLoading(true);
  setError("");
  try{
   const res=await fetch(`/api/products${query?`?search=${encodeURIComponent(query)}`:""}`);
   const data=await res.json();
   if(!res.ok||!data?.success)throw new Error(data?.message||"Unable to load products");
   setProducts(data.products||[]);
  }catch(error){
   setError(error.message||"Unable to load products");
  }finally{
   setLoading(false);
  }
 };

 const groupedProducts=useMemo(()=>{
  const groups=Object.create(null);

  products.forEach(item=>{
   const categoryName=item.category?.name||"Uncategorized";
   if(!groups[categoryName])groups[categoryName]=[];
   groups[categoryName].push(item);
  });

  return Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0]));
 },[products]);
 const selectedDetails=useMemo(()=>{
  const details=selectedProduct?.details;
  if(!details?.rawText)return null;
  try{return details.sections?.length?applyProductDetailsEdits(details.rawText,details.sections):parseProductDetails(details.rawText);}
  catch{return parseProductDetails(details.rawText);}
 },[selectedProduct]);

 const openAddModal=()=>{
  if(!isAdmin)return;
  setEditingProduct(null);
  setShowForm(true);
 };

 const openEditModal=product=>{
  if(!isAdmin)return;
  setEditingProduct(product);
  setShowForm(true);
 };

 const closeFormModal=()=>{
  setShowForm(false);
  setEditingProduct(null);
 };

 const openDetailsModal=product=>{
  setSelectedProduct(product);
 };

 const closeDetailsModal=()=>{
  setSelectedProduct(null);
 };

 const handleDelete=async id=>{
  if(!isAdmin)return;
  const ok=window.confirm("Are you sure you want to delete this product?");
  if(!ok)return;

  try{
   const res=await fetch(`/api/products/${id}`,{method:"DELETE"});
   const data=await res.json();
   if(!res.ok||!data?.success)throw new Error(data?.message||"Unable to delete product");
   setError("");
   if(res.ok&&data?.success){
    setProducts(prev=>prev.filter(item=>item._id!==id));
    if(editingProduct?._id===id){
     setEditingProduct(null);
     setShowForm(false);
    }
    if(selectedProduct?._id===id){
     setSelectedProduct(null);
    }
   }
  }catch(error){setError(error.message||"Unable to delete product");}
 };

 const handleSaved=product=>{
  if(!product){
   fetchProducts(search);
   return;
  }

  setProducts(prev=>{
   const exists=prev.some(item=>item._id===product._id);
   if(exists)return prev.map(item=>item._id===product._id?product:item);
   return[product,...prev];
  });

  if(selectedProduct?._id===product._id){
   setSelectedProduct(product);
  }
 };

 const handleSearch=e=>{
  e.preventDefault();
  fetchProducts(search);
 };

 return(
  <div className="products-page">
   <div className="d-flex justify-content-between align-items-center mb-3">
    <h1 className="mb-0">Products</h1>
    {isAdmin&&<Button type="button" onClick={openAddModal}>Add Product</Button>}
   </div>

   <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
    <input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} placeholder={isAdmin?"Search by name, slug, SKU or barcode":"Search by name, SKU or barcode"} />
    <Button type="submit">Search</Button>
    <Button type="button" variant="secondary" onClick={()=>{setSearch("");fetchProducts();}}>Reset</Button>
   </form>

   {error&&<Alert variant="danger">{error}</Alert>}

   <Card>
    <Card.Body>
     {loading?<p className="mb-0">Loading...</p>:groupedProducts.length?groupedProducts.map(([categoryName,items])=>(
      <div key={categoryName} className="mb-4">
       <h4 className="mb-3">{categoryName}</h4>

       <Table responsive striped hover className="mb-0">
        <thead>
         <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Price</th>
          <th>Stock</th>
          {isAdmin&&<th>Status</th>}
          {isAdmin&&<th>Featured</th>}
          {isAdmin&&<th>Actions</th>}
         </tr>
        </thead>

        <tbody>
         {items.map(item=>(
          <tr key={item._id} className="product-list-row" onClick={()=>openDetailsModal(item)}>
           <td>{item.name}</td>
           <td>{makeSku(item.name,item.price)}</td>
           <td>{item.price}</td>
           <td>{item.quantity}</td>
           {isAdmin&&<td>{statusLabel(item.status)}</td>}
           {isAdmin&&<td>{item.featured?"Yes":"No"}</td>}

           {isAdmin&&(
            <td onClick={e=>e.stopPropagation()}>
             <div className="d-flex gap-2">
              <Button type="button" size="sm" onClick={()=>openEditModal(item)}>Edit</Button>
              <Button type="button" size="sm" variant="danger" onClick={()=>handleDelete(item._id)}>Delete</Button>
             </div>
            </td>
           )}
          </tr>
         ))}
        </tbody>
       </Table>
      </div>
     )):(
      <p className="mb-0">No products found</p>
     )}
    </Card.Body>
   </Card>

   {isAdmin&&<ProductForm show={showForm} onHide={closeFormModal} editingProduct={editingProduct} onSuccess={handleSaved} />}

   <Modal show={!!selectedProduct} onHide={closeDetailsModal} centered size="lg" scrollable>
    <Modal.Body className="p-4">
     {selectedProduct&&(
      <Card className="border shadow-sm">
       <Card.Body className="p-4">

        <div className="text-center border-bottom pb-3 mb-4">
         <h2 className="mb-1">{selectedProduct.name}</h2>
         <div className="text-muted">{selectedProduct.category?.name||"Uncategorized"}</div>
        </div>

        <ProductDetailsTabs product={selectedProduct} details={selectedDetails} />

       </Card.Body>
      </Card>
     )}
    </Modal.Body>

    <Modal.Footer>
     {isAdmin&&selectedProduct&&<Button type="button" onClick={()=>{closeDetailsModal();openEditModal(selectedProduct);}}>Edit</Button>}
     <Button type="button" variant="secondary" onClick={closeDetailsModal}>Close</Button>
    </Modal.Footer>
   </Modal>
  </div>
 );
}
