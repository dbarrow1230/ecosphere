import {useEffect,useState} from "react";
import {Alert,Button,Col,Form,Modal,Row} from "react-bootstrap";
import SortedSelect from "../../../components/SortedSelect.jsx";
import {ingredientDisplayName,ingredientIdentity} from "../../../utils/ingredientIdentity.js";

const idOf=value=>typeof value==="object"?(value?._id||""):value||"";
const labelOf=value=>value?.legalName||value?.name||value?.ingredientName||value?.displayName||value?._id||"Unnamed";
const rowsOf=data=>Array.isArray(data)?data:(data?.data||data?.businesses||data?.vendors||[]);
const emptyForm={
 business:"",vendor:"",ingredient:"",brand:"",packSizeName:"",
 imperialQuantity:"",imperialUnit:"",imperialDisplay:"",
 metricQuantity:"",metricUnit:"",metricDisplay:"",
 packCost:"0",unitCost:"0",sku:"",itemCode:"",notes:"",
 effectiveDate:new Date().toISOString().slice(0,10),isPreferred:false,isActive:true
};

const uniqueIngredients=(items,preferredId="")=>{
 const seen=new Set();
 const ordered=preferredId?[...items].sort((left,right)=>(idOf(right)===preferredId?1:0)-(idOf(left)===preferredId?1:0)):items;
 return ordered.filter(item=>{
  const identity=ingredientIdentity(item)||`record:${item._id}`;
  if(seen.has(identity))return false;
  seen.add(identity);
  return true;
 }).map(item=>({...item,name:ingredientDisplayName(item)||item.name||item.ingredientName}));
};

export default function VendorIngredientPriceForm({row,business,ingredient,onClose,onSave,saving=false}){
 const lockedIngredientId=idOf(ingredient)||idOf(row?.ingredient);
 const [form,setForm]=useState(()=>row?{
  ...emptyForm,...row,
  business:idOf(row.business),vendor:idOf(row.vendor),ingredient:idOf(row.ingredient),
  imperialUnit:idOf(row.imperialUnit),metricUnit:idOf(row.metricUnit),
  notes:Array.isArray(row.notes)?row.notes.join("\n"):"",
  effectiveDate:row.effectiveDate?String(row.effectiveDate).slice(0,10):emptyForm.effectiveDate
 }:{...emptyForm,business:idOf(business),ingredient:idOf(ingredient)});
 const [options,setOptions]=useState({businesses:[],vendors:[],ingredients:[],imperialUnits:[],metricUnits:[]});
 const [error,setError]=useState("");

 useEffect(()=>{
  let active=true;
  Promise.all([
   fetch("/api/businesses"),fetch("/api/vendors"),fetch("/api/ingredients"),
   fetch("/api/imperial-units"),fetch("/api/metric-units")
  ]).then(async responses=>{
   const data=await Promise.all(responses.map(async response=>{
    const body=await response.json();
    if(!response.ok)throw new Error(body.message||"Failed to load form options");
    return body;
   }));
   const allVendors=rowsOf(data[1]);
   const ingredientVendors=allVendors.filter(vendor=>vendor.isActive!==false||idOf(vendor)===idOf(row?.vendor));
   if(active)setOptions({
    businesses:rowsOf(data[0]),vendors:ingredientVendors,ingredients:uniqueIngredients(rowsOf(data[2]),lockedIngredientId),
    imperialUnits:rowsOf(data[3]),metricUnits:rowsOf(data[4])
   });
  }).catch(err=>active&&setError(err.message));
  return()=>{active=false;};
 },[lockedIngredientId,row?.vendor]);

 const lockedIngredientRecord=(ingredient&&typeof ingredient==="object"?ingredient:null)||
  (row?.ingredient&&typeof row.ingredient==="object"?row.ingredient:null)||
  options.ingredients.find(item=>idOf(item)===lockedIngredientId)||null;

 const change=event=>{
  const {name,value,type,checked}=event.target;
  setForm(previous=>({...previous,[name]:type==="checkbox"?checked:value}));
 };

 const submit=async event=>{
  event.preventDefault();
  try{
   setError("");
   await onSave({
    ...form,
    imperialQuantity:form.imperialQuantity===""?null:Number(form.imperialQuantity),
    imperialUnit:form.imperialUnit||null,
    metricQuantity:form.metricQuantity===""?null:Number(form.metricQuantity),
    metricUnit:form.metricUnit||null,
    packCost:Number(form.packCost||0),
    unitCost:Number(form.unitCost||0),
    notes:String(form.notes||"").split(/\r?\n/).map(value=>value.trim()).filter(Boolean)
   });
  }catch(err){
   setError(err.message);
  }
 };

 const select=(name,items,required=false)=>(
  <SortedSelect
   name={name}
   value={form[name]}
   onChange={change}
   required={required}
   disabled={saving}
   options={items}
   getValue={item=>item._id}
   getLabel={labelOf}
   placeholder="Select"
  />
 );

 return(
  <Modal show onHide={onClose} centered size="lg">
   <Form onSubmit={submit}>
    <Modal.Header closeButton><Modal.Title>{form._id?"Edit Vendor Ingredient Price":"Add Vendor Ingredient Price"}</Modal.Title></Modal.Header>
    <Modal.Body>
     {error?<Alert variant="danger">{error}</Alert>:null}
     {!error&&options.vendors.length===0?<Alert variant="warning">No active vendors are available. Add or activate a vendor before saving an ingredient price.</Alert>:null}
     <Row className="g-3">
      <Col md={4}><Form.Group><Form.Label>Business</Form.Label>{select("business",options.businesses,true)}</Form.Group></Col>
      <Col md={4}><Form.Group><Form.Label>Vendor</Form.Label>{select("vendor",options.vendors,true)}</Form.Group></Col>
      <Col md={4}><Form.Group><Form.Label>Ingredient</Form.Label>{lockedIngredientId?<Form.Control value={ingredientDisplayName(lockedIngredientRecord)||"Loading ingredient…"} readOnly aria-label="Selected ingredient"/>:select("ingredient",options.ingredients,true)}</Form.Group></Col>
      <Col md={6}><Form.Group><Form.Label>Brand</Form.Label><Form.Control name="brand" value={form.brand} onChange={change}/></Form.Group></Col>
      <Col md={6}><Form.Group><Form.Label>Pack Size Name</Form.Label><Form.Control name="packSizeName" value={form.packSizeName} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Imperial Quantity</Form.Label><Form.Control type="number" min="0" step="any" name="imperialQuantity" value={form.imperialQuantity??""} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Imperial Unit</Form.Label>{select("imperialUnit",options.imperialUnits)}</Form.Group></Col>
      <Col md={6}><Form.Group><Form.Label>Imperial Display</Form.Label><Form.Control name="imperialDisplay" value={form.imperialDisplay} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Metric Quantity</Form.Label><Form.Control type="number" min="0" step="any" name="metricQuantity" value={form.metricQuantity??""} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Metric Unit</Form.Label>{select("metricUnit",options.metricUnits)}</Form.Group></Col>
      <Col md={6}><Form.Group><Form.Label>Metric Display</Form.Label><Form.Control name="metricDisplay" value={form.metricDisplay} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Pack Cost</Form.Label><Form.Control type="number" min="0" step="0.01" name="packCost" value={form.packCost} onChange={change} required/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Unit Cost</Form.Label><Form.Control type="number" min="0" step="0.0001" name="unitCost" value={form.unitCost} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>SKU</Form.Label><Form.Control name="sku" value={form.sku} onChange={change}/></Form.Group></Col>
      <Col md={3}><Form.Group><Form.Label>Item Code</Form.Label><Form.Control name="itemCode" value={form.itemCode} onChange={change}/></Form.Group></Col>
      <Col md={4}><Form.Group><Form.Label>Effective Date</Form.Label><Form.Control type="date" name="effectiveDate" value={form.effectiveDate} onChange={change}/></Form.Group></Col>
      <Col md={4} className="d-flex align-items-end"><Form.Check name="isPreferred" checked={form.isPreferred} onChange={change} label="Preferred price"/></Col>
      <Col md={4} className="d-flex align-items-end"><Form.Check name="isActive" checked={form.isActive} onChange={change} label="Active"/></Col>
      <Col xs={12}><Form.Group><Form.Label>Notes (one per line)</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={change}/></Form.Group></Col>
     </Row>
    </Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving...":"Save Price"}</Button></Modal.Footer>
   </Form>
  </Modal>
 );
}
