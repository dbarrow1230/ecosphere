// src/pages/Inventory.jsx
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Badge} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";

function Inventory(){

 const initialFormData={
  name:"",
  category:"",
  sku:"",
  quantityOnHand:"",
  reorderLevel:"",
  unit:"",
  costPerUnit:"",
  supplier:"",
  status:"in-stock",
  notes:""
 };

 const [items,setItems]=useState([]);
 const [formData,setFormData]=useState(initialFormData);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [selectedItem,setSelectedItem]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  if(status==="low") return "low";
  if(status==="out-of-stock") return "out-of-stock";
  if(status==="discontinued") return "discontinued";
  return "in-stock";
 };

 const statusLabel=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="out-of-stock") return "Out of Stock";
  if(normalized==="discontinued") return "Discontinued";
  if(normalized==="low") return "Low";
  return "In Stock";
 };

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="low") return "warning";
  if(normalized==="out-of-stock") return "danger";
  if(normalized==="discontinued") return "dark";
  return "success";
 };

 const formatMoney=value=>{
  const num=Number(value||0);
  if(Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
 };

 useEffect(()=>{
  const loadInventory=async()=>{
   try{
    setLoading(true);
    const res=await fetch("/api/inventory");
    const data=await res.json();
    const inventoryList=Array.isArray(data?.inventory)?data.inventory:Array.isArray(data?.items)?data.items:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setItems(inventoryList);
   }catch(err){
    console.error("Error loading inventory:",err);
    setItems([]);
    setAlert({show:true,variant:"danger",message:"Failed to load inventory."});
   }finally{
    setLoading(false);
   }
  };

  loadInventory();
 },[]);

 const handleChange=e=>{
  const {name,value}=e.target;
  if(name==="status"){
   setFormData(prev=>({...prev,status:normalizeStatus(value)}));
   return;
  }
  setFormData(prev=>({...prev,[name]:value}));
 };

 const resetForm=()=>{
  setFormData(initialFormData);
  setSelectedItem(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleAddItem=()=>{
  setFormData(initialFormData);
  setSelectedItem(null);
  setIsEditing(false);
  setIsAdding(true);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleViewItem=item=>{
  setSelectedItem(item);
  setIsEditing(false);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleEditItem=item=>{
  setSelectedItem(item);
  setFormData({
   name:item.name||"",
   category:item.category||"",
   sku:item.sku||"",
   quantityOnHand:item.quantityOnHand??"",
   reorderLevel:item.reorderLevel??"",
   unit:item.unit||"",
   costPerUnit:item.costPerUnit??"",
   supplier:item.supplier||"",
   status:normalizeStatus(item.status),
   notes:item.notes||""
  });
  setIsEditing(true);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleDeleteItem=async itemId=>{
  try{
   const confirmed=window.confirm("Are you sure you want to delete this inventory item?");
   if(!confirmed) return;

   closeAlert();

   const res=await fetch(`/api/inventory/${itemId}`,{
    method:"DELETE"
   });

   const data=await res.json().catch(()=>null);

   if(res.ok){
    setItems(prev=>prev.filter(item=>item._id!==itemId));
    if(selectedItem?._id===itemId){
     resetForm();
    }
    setAlert({show:true,variant:"success",message:"Inventory item deleted successfully."});
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to delete inventory item."});
   }
  }catch(err){
   console.error("Error deleting inventory item:",err);
   setAlert({show:true,variant:"danger",message:"Error deleting inventory item."});
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   closeAlert();

   const payload={
    name:formData.name,
    category:formData.category,
    sku:formData.sku,
    quantityOnHand:Number(formData.quantityOnHand||0),
    reorderLevel:Number(formData.reorderLevel||0),
    unit:formData.unit,
    costPerUnit:Number(formData.costPerUnit||0),
    supplier:formData.supplier,
    status:normalizeStatus(formData.status),
    notes:formData.notes
   };

   const url=isEditing&&selectedItem?`/api/inventory/${selectedItem._id}`:"/api/inventory";
   const method=isEditing&&selectedItem?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedItem=data?.inventory||data?.item||data?.data;

   if(res.ok&&savedItem){
    if(isEditing&&selectedItem){
     setItems(prev=>prev.map(item=>item._id===savedItem._id?savedItem:item));
     setSelectedItem(savedItem);
     setIsEditing(false);
     setAlert({show:true,variant:"success",message:"Inventory item updated successfully."});
    }else{
     setItems(prev=>[savedItem,...prev]);
     resetForm();
     setAlert({show:true,variant:"success",message:"Inventory item saved successfully."});
    }
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to save inventory item."});
   }
  }catch(err){
   console.error("Error saving inventory item:",err);
   setAlert({show:true,variant:"danger",message:"Error saving inventory item."});
  }finally{
   setSaving(false);
  }
 };

 const metrics=useMemo(()=>{
  return{
   total:items.length,
   low:items.filter(item=>normalizeStatus(item.status)==="low").length,
   out:items.filter(item=>normalizeStatus(item.status)==="out-of-stock").length
  };
 },[items]);

 return(
  <section className="inventory-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Kitchen Inventory</p>
       <h1 className="mb-2">Inventory</h1>
       <p className="text-muted mb-0">
        Track ingredients, supplies, and kitchen stock used for catering events.
       </p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <Row className="g-3 text-center">
         <Col xs={4}>
          <p className="text-muted mb-1">Items</p>
          <h3 className="mb-0">{metrics.total}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Low</p>
          <h3 className="mb-0">{metrics.low}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Out</p>
          <h3 className="mb-0">{metrics.out}</h3>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    {alert.show&&(
     <Row className="mb-4">
      <Col lg={12}>
       <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-0">
        {alert.message}
       </Alert>
      </Col>
     </Row>
    )}

    <Row className="g-4">

     <Col lg={4}>
      <Card>
       <Card.Body>

        {!selectedItem&&!isEditing&&!isAdding&&(
         <>
          <h2 className="h4 mb-3">Inventory Form</h2>

          <Form>
           <Form.Group className="mb-3" controlId="itemName">
            <Form.Label>Item Name</Form.Label>
            <Form.Control type="text" value="" placeholder="Ingredient or supply" disabled/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="itemCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value="" placeholder="Category" disabled/>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemQty">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value="" placeholder="0" disabled/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemUnit">
              <Form.Label>Unit</Form.Label>
              <Form.Control type="text" value="" placeholder="lbs / bottles / qt" disabled/>
             </Form.Group>
            </Col>
           </Row>

           <div className="d-grid">
            <Button type="button" variant="primary" onClick={handleAddItem}>Add Item</Button>
           </div>
          </Form>
         </>
        )}

        {isAdding&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Add Item</h2>
           <Button variant="outline-secondary" size="sm" onClick={resetForm}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>

           <Form.Group className="mb-3" controlId="itemNameAdd">
            <Form.Label>Item Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ingredient or supply" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="itemCategoryAdd">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
             <option value="">Select category</option>
             <option value="Protein">Protein</option>
             <option value="Seafood">Seafood</option>
             <option value="Vegetables">Vegetables</option>
             <option value="Dairy">Dairy</option>
             <option value="Grains">Grains</option>
             <option value="Pantry">Pantry</option>
             <option value="Beverages">Beverages</option>
             <option value="Supplies">Supplies</option>
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemSkuAdd">
              <Form.Label>SKU</Form.Label>
              <Form.Control type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="INV-1001"/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemStatusAdd">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="in-stock">In Stock</option>
               <option value="low">Low</option>
               <option value="out-of-stock">Out of Stock</option>
               <option value="discontinued">Discontinued</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemQtyAdd">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" name="quantityOnHand" value={formData.quantityOnHand} onChange={handleChange} min="0" placeholder="0" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemUnitAdd">
              <Form.Label>Unit</Form.Label>
              <Form.Control type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="lbs / bottles / qt" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemReorderLevelAdd">
              <Form.Label>Reorder Level</Form.Label>
              <Form.Control type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} min="0" placeholder="0"/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemCostPerUnitAdd">
              <Form.Label>Cost Per Unit</Form.Label>
              <Form.Control type="number" step="0.01" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} min="0" placeholder="0.00"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="itemSupplierAdd">
            <Form.Label>Supplier</Form.Label>
            <Form.Control type="text" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier name"/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="itemNotesAdd">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} placeholder="Storage notes or supplier details"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Save Item"}</Button>
           </div>

          </Form>
         </>
        )}

        {selectedItem&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">View Item</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>Close</Button>
            <Button variant="primary" size="sm" onClick={()=>handleEditItem(selectedItem)}>Edit Item</Button>
            <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteItem(selectedItem._id)}>Delete</Button>
           </div>
          </div>

          <div className="mb-3">
           <strong>Item Name</strong>
           <div>{selectedItem.name||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Category</strong>
           <div>{selectedItem.category||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>SKU</strong>
             <div>{selectedItem.sku||"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div>
              <Badge bg={statusVariant(selectedItem.status)}>
               {statusLabel(selectedItem.status)}
              </Badge>
             </div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Quantity On Hand</strong>
             <div>{selectedItem.quantityOnHand??"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Unit</strong>
             <div>{selectedItem.unit||"-"}</div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Reorder Level</strong>
             <div>{selectedItem.reorderLevel??"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Cost Per Unit</strong>
             <div>{formatMoney(selectedItem.costPerUnit)}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Supplier</strong>
           <div>{selectedItem.supplier||"-"}</div>
          </div>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{selectedItem.notes||"-"}</div>
          </div>
         </>
        )}

        {isEditing&&selectedItem&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Edit Item</h2>
           <Button variant="outline-secondary" size="sm" onClick={()=>setIsEditing(false)}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>

           <Form.Group className="mb-3" controlId="itemNameEdit">
            <Form.Label>Item Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ingredient or supply" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="itemCategoryEdit">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
             <option value="">Select category</option>
             <option value="Protein">Protein</option>
             <option value="Seafood">Seafood</option>
             <option value="Vegetables">Vegetables</option>
             <option value="Dairy">Dairy</option>
             <option value="Grains">Grains</option>
             <option value="Pantry">Pantry</option>
             <option value="Beverages">Beverages</option>
             <option value="Supplies">Supplies</option>
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemSkuEdit">
              <Form.Label>SKU</Form.Label>
              <Form.Control type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="INV-1001"/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemStatusEdit">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="in-stock">In Stock</option>
               <option value="low">Low</option>
               <option value="out-of-stock">Out of Stock</option>
               <option value="discontinued">Discontinued</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemQtyEdit">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" name="quantityOnHand" value={formData.quantityOnHand} onChange={handleChange} min="0" placeholder="0" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemUnitEdit">
              <Form.Label>Unit</Form.Label>
              <Form.Control type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="lbs / bottles / qt" required/>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="itemReorderLevelEdit">
              <Form.Label>Reorder Level</Form.Label>
              <Form.Control type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} min="0" placeholder="0"/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="itemCostPerUnitEdit">
              <Form.Label>Cost Per Unit</Form.Label>
              <Form.Control type="number" step="0.01" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} min="0" placeholder="0.00"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="itemSupplierEdit">
            <Form.Label>Supplier</Form.Label>
            <Form.Control type="text" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier name"/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="itemNotesEdit">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} placeholder="Storage notes or supplier details"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Update Item"}</Button>
           </div>

          </Form>
         </>
        )}

       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>

        <div className="d-flex align-items-center justify-content-between mb-3">
         <div>
          <h2 className="h4 mb-1">Inventory List</h2>
          <p className="text-muted mb-0">
           Monitor ingredient levels and kitchen supply availability.
          </p>
         </div>
        </div>

        <div className="table-responsive">

         <Table hover className="align-middle mb-0">

          <thead>
           <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="5" className="text-center text-muted py-4">Loading inventory...</td>
            </tr>
           )}

           {!loading&&items.length===0&&(
            <tr>
             <td colSpan="5" className="text-center text-muted py-4">No inventory items found.</td>
            </tr>
           )}

           {!loading&&items.map(item=>(
            <tr key={item._id} onClick={()=>handleViewItem(item)} style={{cursor:"pointer"}} className={selectedItem?._id===item._id?"table-active":""}>
             <td>{item.name}</td>
             <td>{item.category}</td>
             <td>{item.quantityOnHand}</td>
             <td>{item.unit}</td>
             <td>
              <Badge bg={statusVariant(item.status)}>
               {statusLabel(item.status)}
              </Badge>
             </td>
            </tr>
           ))}
          </tbody>

         </Table>

        </div>

       </Card.Body>
      </Card>
     </Col>

    </Row>

   </Container>
  </section>
 );
}

export default Inventory;