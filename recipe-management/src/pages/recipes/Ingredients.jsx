import Alert from "../../components/AppAlert.jsx";
import {useEffect,useMemo,useState} from "react";
import {Badge,Button,Card,Col,Container,Form,Modal,Row,Table} from "react-bootstrap";
import IngredientForm from "../forms/recipes/IngredientForm.jsx";

const rows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:[];
const id=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");

export default function Ingredients(){
 const [vendors,setVendors]=useState([]);
 const [vendorId,setVendorId]=useState("");
 const [ingredients,setIngredients]=useState([]);
 const [offers,setOffers]=useState([]);
 const [imperialUnits,setImperialUnits]=useState([]);
 const [metricUnits,setMetricUnits]=useState([]);
 const [selected,setSelected]=useState(null);
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [showDelete,setShowDelete]=useState(false);

 const selectedVendor=vendors.find(vendor=>vendor._id===vendorId)||null;
 const visibleOffers=useMemo(()=>{const search=query.trim().toLowerCase();return offers.filter(offer=>id(offer.vendor)===vendorId).filter(offer=>!search||[offer.ingredient?.name,offer.brand,offer.sku,offer.itemCode,offer.packSizeName].some(value=>String(value||"").toLowerCase().includes(search))).sort((a,b)=>String(a.ingredient?.name||"").localeCompare(String(b.ingredient?.name||"")));},[offers,vendorId,query]);

 const fetchRows=async url=>{const response=await fetch(url);const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||`Failed to load ${url}.`);return rows(data);};
 const load=async()=>{
  const [vendorRows,ingredientRows,offerRows,imperialRows,metricRows]=await Promise.all([fetchRows("/api/vendors"),fetchRows("/api/ingredients"),fetchRows("/api/vendor-ingredient-prices"),fetchRows("/api/imperial-units"),fetchRows("/api/metric-units")]);
  const activeVendors=vendorRows.filter(vendor=>vendor.isActive!==false).sort((a,b)=>a.legalName.localeCompare(b.legalName));
  setVendors(activeVendors);setIngredients(ingredientRows);setOffers(offerRows);setImperialUnits(imperialRows);setMetricUnits(metricRows);
  setVendorId(current=>activeVendors.some(vendor=>vendor._id===current)?current:activeVendors[0]?._id||"");
 };

 useEffect(()=>{load().catch(err=>setError(err.message)).finally(()=>setLoading(false));},[]);

 const save=async payload=>{
  try{
   setSaving(true);setError("");
   let ingredientId=payload.ingredient;
   if(!ingredientId){
    const response=await fetch("/api/ingredients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:payload.name,description:payload.description,unit:payload.defaultUnit,notes:payload.ingredientNotes,isActive:true})});
    const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Failed to create ingredient record.");ingredientId=data.ingredient?._id;
   }else if(selected?._id){
    const response=await fetch(`/api/ingredients/${ingredientId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:payload.name,description:payload.description,unit:payload.defaultUnit,notes:payload.ingredientNotes,isActive:true})});
    const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Failed to update ingredient record.");
   }
   const offer={business:payload.business,vendor:payload.vendor,ingredient:ingredientId,brand:payload.brand,packSizeName:payload.packSizeName,imperialQuantity:payload.imperialQuantity,imperialUnit:payload.imperialUnit||null,imperialDisplay:payload.imperialDisplay,metricQuantity:payload.metricQuantity,metricUnit:payload.metricUnit||null,metricDisplay:payload.metricDisplay,packCost:payload.packCost,unitCost:payload.unitCost,sku:payload.sku,itemCode:payload.itemCode,notes:payload.notes,effectiveDate:payload.effectiveDate||null,isPreferred:payload.isPreferred,isActive:payload.isActive};
   const response=await fetch(selected?._id?`/api/vendor-ingredient-prices/${selected._id}`:"/api/vendor-ingredient-prices",{method:selected?._id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(offer)});
   const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Failed to save vendor ingredient.");
   if(selectedVendor&&!selectedVendor.supportsIngredients){
    const vendorResponse=await fetch(`/api/vendors/${selectedVendor._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({supportsIngredients:true})});
    const vendorData=await vendorResponse.json().catch(()=>null);if(!vendorResponse.ok)throw new Error(vendorData?.message||"Ingredient saved, but the vendor capability could not be updated.");
   }
   await load();setShowForm(false);setSelected(null);
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };

 const remove=async()=>{
  try{setSaving(true);setError("");const response=await fetch(`/api/vendor-ingredient-prices/${selected._id}`,{method:"DELETE"});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Failed to delete vendor ingredient.");await load();setShowDelete(false);setSelected(null);}catch(err){setError(err.message);}finally{setSaving(false);}
 };

 const enableIngredientSupport=async()=>{
  if(!selectedVendor)return;
  try{
   setSaving(true);setError("");
   const response=await fetch(`/api/vendors/${selectedVendor._id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({supportsIngredients:true})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Failed to update the vendor setting.");
   await load();
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };

 return <Container fluid="lg" className="py-4">
  <div className="d-flex flex-wrap justify-content-between gap-3 mb-4"><div><h1 className="mb-1">Vendor Ingredients</h1><p className="text-muted mb-0">Select a vendor to manage only the ingredients and prices supplied by that vendor.</p></div><Button disabled={!selectedVendor} onClick={()=>{setSelected(null);setShowForm(true);}}>Add Ingredient for Vendor</Button></div>
  {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}
  <Card className="border-0 shadow-sm mb-4"><Card.Body><Row className="g-3 align-items-end"><Col md={6}><Form.Group><Form.Label>Vendor</Form.Label><Form.Select value={vendorId} onChange={event=>{setVendorId(event.target.value);setSelected(null);}} disabled={loading}><option value="">Select vendor</option>{vendors.map(vendor=><option key={vendor._id} value={vendor._id}>{vendor.legalName}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Search This Vendor's Ingredients</Form.Label><Form.Control type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Ingredient, brand, SKU, item code..." disabled={!vendorId}/></Form.Group></Col></Row></Card.Body></Card>
  {!loading&&!vendors.length?<Alert variant="warning">Create a vendor before adding vendor ingredients.</Alert>:null}
  {selectedVendor&&!selectedVendor.supportsIngredients?<Alert variant="info" className="d-flex flex-wrap align-items-center justify-content-between gap-3"><span><strong>{selectedVendor.legalName}</strong> has saved ingredient offerings, but its vendor profile’s <strong>Supplies ingredients</strong> setting is off. The offerings below are still usable.</span><Button type="button" size="sm" variant="outline-primary" onClick={enableIngredientSupport} disabled={saving}>{saving?"Updating...":"Turn On Vendor Setting"}</Button></Alert>:null}
  <div className="table-responsive"><Table bordered hover align="middle"><thead><tr><th>Ingredient</th><th>Brand</th><th>Pack</th><th>Vendor SKU</th><th>Pack Cost</th><th>Unit Cost</th><th>Preferred</th><th>Status</th><th className="text-end">Actions</th></tr></thead><tbody>
   {loading?<tr><td colSpan="9" className="text-center py-4">Loading...</td></tr>:null}
   {!loading&&!vendorId?<tr><td colSpan="9" className="text-center py-4 text-muted">Select a vendor.</td></tr>:null}
   {!loading&&vendorId&&!visibleOffers.length?<tr><td colSpan="9" className="text-center py-4 text-muted">This vendor has no ingredient offerings yet.</td></tr>:null}
   {visibleOffers.map(offer=><tr key={offer._id}><td className="fw-semibold">{offer.ingredient?.name||"Missing ingredient"}</td><td>{offer.brand||"-"}</td><td>{offer.packSizeName||offer.imperialDisplay||offer.metricDisplay||"-"}</td><td>{offer.sku||offer.itemCode||"-"}</td><td>${Number(offer.packCost||0).toFixed(2)}</td><td>${Number(offer.unitCost||0).toFixed(4)}</td><td><Badge bg={offer.isPreferred?"primary":"secondary"}>{offer.isPreferred?"Preferred":"No"}</Badge></td><td><Badge bg={offer.isActive!==false?"success":"secondary"}>{offer.isActive!==false?"Active":"Inactive"}</Badge></td><td className="text-end"><Button size="sm" variant="outline-primary" className="me-2" onClick={()=>{setSelected(offer);setShowForm(true);}}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>{setSelected(offer);setShowDelete(true);}}>Delete Offer</Button></td></tr>)}
  </tbody></Table></div>
  <Modal size="xl" show={showForm} onHide={()=>!saving&&setShowForm(false)} centered scrollable><Modal.Header closeButton><Modal.Title>{selected?"Edit":"Add"} Vendor Ingredient</Modal.Title></Modal.Header><Modal.Body><IngredientForm initialData={selected||{}} vendor={selectedVendor} ingredients={ingredients} imperialUnits={imperialUnits} metricUnits={metricUnits} onSubmit={save} loading={saving}/></Modal.Body></Modal>
  <Modal show={showDelete} onHide={()=>!saving&&setShowDelete(false)} centered><Modal.Header closeButton><Modal.Title>Delete Vendor Offering</Modal.Title></Modal.Header><Modal.Body>Remove <strong>{selected?.ingredient?.name}</strong> from <strong>{selectedVendor?.legalName}</strong>? The reusable ingredient record and other vendors' offers will remain.</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button><Button variant="danger" onClick={remove} disabled={saving}>{saving?"Deleting...":"Delete Vendor Offer"}</Button></Modal.Footer></Modal>
 </Container>;
}
