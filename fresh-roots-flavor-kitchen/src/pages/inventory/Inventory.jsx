import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Row,Tab,Tabs} from "react-bootstrap";
import {Link,useLocation,useNavigate} from "react-router-dom";
import "../../styles/inventory.css";

const emptyForm={name:"",category:"",sku:"",quantityOnHand:"",reorderLevel:"",unit:"",costPerUnit:"",supplier:"",status:"in-stock",area:"boh",notes:""};

function Inventory({items}){
 const location=useLocation();
 const navigate=useNavigate();
 const [loadedItems,setLoadedItems]=useState(null);
 const [formData,setFormData]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [tab,setTab]=useState("boh");
 const isNew=location.pathname.endsWith("/new");

 useEffect(()=>{
  let active=true;
  fetch("/api/inventory")
   .then(async response=>{
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.message||"Inventory is unavailable");
    if(active)setLoadedItems(Array.isArray(data?.inventory)?data.inventory:[]);
   })
   .catch(error=>{if(active){setLoadedItems([]);setMessage(error.message);}});
  return()=>{active=false;};
 },[]);

 const inventoryItems=useMemo(()=>Array.isArray(items)?items:(loadedItems||[]),[items,loadedItems]);
 const bohItems=inventoryItems.filter(item=>(item.area||"boh")==="boh");
 const fohItems=inventoryItems.filter(item=>item.area==="foh");
 const restockItems=inventoryItems.filter(item=>["low","out-of-stock"].includes(String(item.status||"").toLowerCase())||Number(item.quantityOnHand??item.quantity??0)<=Number(item.reorderLevel||0));

 const getStatusClass=status=>{
  const value=String(status||"").toLowerCase();
  if(value.includes("out")||value.includes("restock"))return "inventory-status-restock";
  if(value.includes("low"))return "inventory-status-low";
  return "inventory-status-ok";
 };

 const statusLabel=status=>{
  const value=String(status||"").toLowerCase();
  if(value==="out-of-stock")return "Out of Stock";
  if(value==="low")return "Low";
  if(value==="discontinued")return "Discontinued";
  return "In Stock";
 };

 const renderRows=list=>list.length?(
  <div className="inventory-list">{list.map(item=><div key={item._id} className="inventory-row"><div className="inventory-row-main"><span className="inventory-name">{item.name}</span><span className="inventory-meta">{item.category}{item.sku?` · ${item.sku}`:""}</span></div><div className="inventory-row-qty">{item.quantityOnHand??item.quantity??0} {item.unit}</div><div className={`inventory-status ${getStatusClass(item.status)}`}>{statusLabel(item.status)}</div></div>)}</div>
 ):(<p className="inventory-empty">No inventory items in this section.</p>);

 const handleChange=event=>setFormData(current=>({...current,[event.target.name]:event.target.value}));
 const handleSubmit=async event=>{
  event.preventDefault();
  setSaving(true);
  setMessage("");
  try{
   const response=await fetch("/api/inventory",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...formData,quantityOnHand:Number(formData.quantityOnHand||0),reorderLevel:Number(formData.reorderLevel||0),costPerUnit:Number(formData.costPerUnit||0)})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data?.message||"Inventory item could not be saved");
   setLoadedItems(current=>[...(current||[]),data.inventory]);
   setFormData(emptyForm);
   navigate("/inventory",{replace:true});
  }catch(error){setMessage(error.message);}finally{setSaving(false);}
 };

 return(
  <Container className="inventory-page">
   <Row className="align-items-end mb-4"><Col md={8}><p className="inventory-eyebrow">Back of House / Front of House</p><h1 className="inventory-title">Inventory</h1><p className="inventory-text">Track kitchen stock, service supplies, and restock needs across operations.</p></Col><Col md={4} className="text-md-end"><div className="inventory-actions"><Link to="/inventory/new" className="inventory-action">Add Item</Link><Link to="/inventory/restock" className="inventory-action-light">Restock</Link></div></Col></Row>
   {message&&<Alert variant="warning" dismissible onClose={()=>setMessage("")}>{message}</Alert>}

   {isNew&&<Card className="mb-4"><Card.Body><div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h4 mb-0">Add Inventory Item</h2><Button variant="outline-secondary" size="sm" onClick={()=>navigate("/inventory")}>Cancel</Button></div><Form onSubmit={handleSubmit}><Row className="g-3">
    <Col md={6}><Form.Group controlId="publicInventoryName"><Form.Label>Item</Form.Label><Form.Control name="name" value={formData.name} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventoryCategory"><Form.Label>Category</Form.Label><Form.Control name="category" value={formData.category} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventorySku"><Form.Label>SKU</Form.Label><Form.Control name="sku" value={formData.sku} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventoryQuantity"><Form.Label>Quantity</Form.Label><Form.Control type="number" min="0" step="0.01" name="quantityOnHand" value={formData.quantityOnHand} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventoryReorder"><Form.Label>Reorder Level</Form.Label><Form.Control type="number" min="0" step="0.01" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange}/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventoryUnit"><Form.Label>Unit</Form.Label><Form.Control name="unit" value={formData.unit} onChange={handleChange} required/></Form.Group></Col>
    <Col md={3}><Form.Group controlId="publicInventoryCost"><Form.Label>Cost / Unit</Form.Label><Form.Control type="number" min="0" step="0.01" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange}/></Form.Group></Col>
    <Col md={4}><Form.Group controlId="publicInventorySupplier"><Form.Label>Supplier</Form.Label><Form.Control name="supplier" value={formData.supplier} onChange={handleChange}/></Form.Group></Col>
    <Col md={4}><Form.Group controlId="publicInventoryArea"><Form.Label>Area</Form.Label><Form.Select name="area" value={formData.area} onChange={handleChange}><option value="boh">Back of House</option><option value="foh">Front of House</option></Form.Select></Form.Group></Col>
    <Col md={4}><Form.Group controlId="publicInventoryStatus"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status} onChange={handleChange}><option value="in-stock">In Stock</option><option value="low">Low</option><option value="out-of-stock">Out of Stock</option><option value="discontinued">Discontinued</option></Form.Select></Form.Group></Col>
    <Col xs={12}><Form.Group controlId="publicInventoryNotes"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/></Form.Group></Col>
    <Col xs={12}><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Item"}</Button></Col>
   </Row></Form></Card.Body></Card>}

   <Row className="g-3 mb-4"><Col md={4}><div className="inventory-stat"><span>Total Items</span><strong>{inventoryItems.length}</strong></div></Col><Col md={4}><div className="inventory-stat"><span>BOH Items</span><strong>{bohItems.length}</strong></div></Col><Col md={4}><div className="inventory-stat"><span>Restock</span><strong>{restockItems.length}</strong></div></Col></Row>
   <Row><Col><div className="inventory-panel"><Tabs activeKey={location.pathname.endsWith("/restock")?"restock":tab} onSelect={key=>setTab(key||"boh")} id="inventory-tabs" className="inventory-tabs" fill><Tab eventKey="boh" title={`BOH (${bohItems.length})`}><div className="inventory-tab-body">{renderRows(bohItems)}</div></Tab><Tab eventKey="foh" title={`FOH (${fohItems.length})`}><div className="inventory-tab-body">{renderRows(fohItems)}</div></Tab><Tab eventKey="restock" title={`Restock (${restockItems.length})`}><div className="inventory-tab-body">{renderRows(restockItems)}</div></Tab></Tabs></div></Col></Row>
  </Container>
 );
}

export default Inventory;
