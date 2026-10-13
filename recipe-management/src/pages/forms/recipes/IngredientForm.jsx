import "../../../styles/VendorIngredientForm.css";
import Alert from "../../../components/AppAlert.jsx";
import {useEffect,useState} from "react";
import {Alert as VendorBanner,Button,Col,Dropdown,Form,Row} from "react-bootstrap";

const id=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");
const empty={ingredient:"",name:"",description:"",defaultUnit:"g",ingredientNotes:"",brand:"",packSizeName:"",imperialQuantity:"",imperialUnit:"",imperialDisplay:"",metricQuantity:"",metricUnit:"",metricDisplay:"",packCost:"",unitCost:"",sku:"",itemCode:"",notes:"",effectiveDate:new Date().toISOString().slice(0,10),isPreferred:false,isActive:true};

export default function IngredientForm({initialData={},vendor,ingredients=[],imperialUnits=[],metricUnits=[],categories=[],onSubmit,onCancel,loading=false}){
 const [data,setData]=useState(empty);
 const [mode,setMode]=useState("new");

 useEffect(()=>{
  const ingredient=(typeof initialData.ingredient==="object"&&initialData.ingredient)||ingredients.find(item=>id(item)===id(initialData.ingredient))||{};
  setMode(initialData._id||id(initialData.ingredient)?"existing":"new");
  setData({...empty,...initialData,ingredient:id(ingredient),name:ingredient.name||ingredient.ingredientName||"",description:ingredient.description||"",defaultUnit:ingredient.unit||"g",vendorCategory:id(initialData.vendorCategory),ingredientNotes:ingredient.notes||"",imperialUnit:id(initialData.imperialUnit),metricUnit:id(initialData.metricUnit),notes:Array.isArray(initialData.notes)?initialData.notes.join("\n"):initialData.notes||"",effectiveDate:initialData.effectiveDate?String(initialData.effectiveDate).slice(0,10):empty.effectiveDate});
 },[initialData,ingredients]);

 const change=e=>{const {name,value,type,checked}=e.target;setData(current=>({...current,[name]:type==="checkbox"?checked:value}));};
 const chooseIngredient=e=>{const ingredientId=e.target.value;const ingredient=ingredients.find(item=>item._id===ingredientId);setData(current=>({...current,ingredient:ingredientId,name:ingredient?.name||ingredient?.ingredientName||"",description:ingredient?.description||"",defaultUnit:ingredient?.unit||"g",ingredientNotes:ingredient?.notes||""}));};
 const submit=e=>{e.preventDefault();onSubmit({...data,reassignIngredient:Boolean(initialData._id&&id(initialData.ingredient)!==data.ingredient),vendor:id(vendor),business:id(vendor?.business_id),notes:String(data.notes||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean),imperialQuantity:data.imperialQuantity===""?null:Number(data.imperialQuantity),metricQuantity:data.metricQuantity===""?null:Number(data.metricQuantity),availablePacks:data.availablePacks===""||data.availablePacks===undefined?null:Number(data.availablePacks),packCost:Number(data.packCost||0),unitCost:Number(data.unitCost||0)});};

 if(!vendor)return <Alert variant="warning">Select a vendor before adding an ingredient.</Alert>;
 return <Form className="vendor-ingredient-form" onSubmit={submit}>
  <VendorBanner className="vendor-ingredient-banner" variant="info"><strong>{vendor.legalName}</strong></VendorBanner>
  {!initialData._id?<Form.Group className="vendor-ingredient-field mb-3"><Form.Label>Ingredient Record</Form.Label><div className="d-flex flex-wrap gap-3"><Form.Check type="radio" label="Create new ingredient" checked={mode==="new"} onChange={()=>{setMode("new");setData(current=>({...current,ingredient:"",name:"",description:"",defaultUnit:"g",ingredientNotes:""}));}}/><Form.Check type="radio" label="Use existing ingredient" checked={mode==="existing"} onChange={()=>setMode("existing")}/></div></Form.Group>:null}
  <Row className="g-3">
   {mode==="existing"?<Col xs={12}><Form.Group className="vendor-ingredient-field"><Form.Label>Existing Ingredient</Form.Label><Form.Select value={data.ingredient} onChange={chooseIngredient} required><option value="">Select ingredient</option>{ingredients.map(item=><option key={item._id} value={item._id}>{item.name||item.ingredientName}</option>)}</Form.Select></Form.Group></Col>:null}
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label htmlFor="vendor-ingredient-name">Ingredient Name</Form.Label><Form.Control id="vendor-ingredient-name" name="name" value={data.name} onChange={change} required/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Default Recipe Unit</Form.Label><div className="vendor-unit-combobox"><Form.Control className="vendor-ingredient-short" name="defaultUnit" value={data.defaultUnit} onChange={change} required/><Dropdown><Dropdown.Toggle variant="outline-primary" aria-label="Choose default recipe unit"/><Dropdown.Menu>{[["Imperial",imperialUnits],["Metric",metricUnits]].map(([heading,items])=><div key={heading}><Dropdown.Header>{heading}</Dropdown.Header>{items.map(unit=><Dropdown.Item key={unit._id} onClick={()=>setData(current=>({...current,defaultUnit:unit.symbol||unit.name}))}>{unit.name}{unit.symbol?` (${unit.symbol})`:""}</Dropdown.Item>)}</div>)}</Dropdown.Menu></Dropdown></div></Form.Group></Col>
   {categories.length>0?<Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Category</Form.Label><Form.Select name="vendorCategory" value={data.vendorCategory||""} onChange={change}><option value="">Uncategorized</option>{categories.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select></Form.Group></Col>:null}
   <Col xs={12}><Form.Group className="vendor-ingredient-field vendor-ingredient-description"><Form.Label>Ingredient Description</Form.Label><Form.Control as="textarea" rows={2} name="description" value={data.description} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Brand</Form.Label><Form.Control className="vendor-ingredient-medium" name="brand" value={data.brand} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Vendor SKU</Form.Label><Form.Control className="vendor-ingredient-medium" name="sku" value={data.sku} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Vendor Item Code</Form.Label><Form.Control className="vendor-ingredient-medium" name="itemCode" value={data.itemCode} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Pack Size Name</Form.Label><Form.Control className="vendor-ingredient-medium" name="packSizeName" value={data.packSizeName} onChange={change} placeholder="Case, 6-pack, 25 lb bag..."/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Pack Cost</Form.Label><Form.Control className="vendor-ingredient-short" type="number" min="0" step="0.01" name="packCost" value={data.packCost} onChange={change} required/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Unit Cost</Form.Label><Form.Control className="vendor-ingredient-short" type="number" min="0" step="0.0001" name="unitCost" value={data.unitCost} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Imperial Qty</Form.Label><Form.Control className="vendor-ingredient-short" type="number" min="0" step="any" name="imperialQuantity" value={data.imperialQuantity??""} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Imperial Unit</Form.Label><Form.Select className="vendor-ingredient-medium" name="imperialUnit" value={data.imperialUnit} onChange={change}><option value="">Select unit</option>{imperialUnits.map(item=><option key={item._id} value={item._id}>{item.name} ({item.symbol})</option>)}</Form.Select></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Imperial Pack Display</Form.Label><Form.Control className="vendor-ingredient-medium" name="imperialDisplay" value={data.imperialDisplay} onChange={change} placeholder="25 lb bag"/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Metric Qty</Form.Label><Form.Control className="vendor-ingredient-short" type="number" min="0" step="any" name="metricQuantity" value={data.metricQuantity??""} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Metric Unit</Form.Label><Form.Select className="vendor-ingredient-medium" name="metricUnit" value={data.metricUnit} onChange={change}><option value="">Select unit</option>{metricUnits.map(item=><option key={item._id} value={item._id}>{item.name} ({item.symbol})</option>)}</Form.Select></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Metric Pack Display</Form.Label><Form.Control className="vendor-ingredient-medium" name="metricDisplay" value={data.metricDisplay} onChange={change} placeholder="11.34 kg bag"/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Available Packs</Form.Label><Form.Control className="vendor-ingredient-short" type="number" min="0" step="1" name="availablePacks" value={data.availablePacks??""} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Effective Date</Form.Label><Form.Control className="vendor-ingredient-medium" type="date" name="effectiveDate" value={data.effectiveDate} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Group className="vendor-ingredient-field"><Form.Label>Vendor Offer Notes</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={data.notes} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Check type="switch" name="isPreferred" label="Preferred offer for this ingredient" checked={data.isPreferred} onChange={change}/></Col><Col md={6}><Form.Check type="switch" name="isActive" label="Active vendor offering" checked={data.isActive} onChange={change}/></Col>
  </Row>
  <div className="d-flex justify-content-end gap-2 mt-4">{onCancel?<Button type="button" variant="outline-primary" disabled={loading} onClick={onCancel}>Cancel</Button>:null}<Button type="submit" disabled={loading}>{loading?"Saving...":"Save Vendor Ingredient"}</Button></div>
 </Form>;
}

