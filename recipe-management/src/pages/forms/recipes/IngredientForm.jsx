import Alert from "../../../components/AppAlert.jsx";
import {useEffect,useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";

const id=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");
const empty={ingredient:"",name:"",description:"",defaultUnit:"g",ingredientNotes:"",brand:"",packSizeName:"",imperialQuantity:"",imperialUnit:"",imperialDisplay:"",metricQuantity:"",metricUnit:"",metricDisplay:"",packCost:"",unitCost:"",sku:"",itemCode:"",notes:"",effectiveDate:new Date().toISOString().slice(0,10),isPreferred:false,isActive:true};

export default function IngredientForm({initialData={},vendor,ingredients=[],imperialUnits=[],metricUnits=[],onSubmit,loading=false}){
 const [data,setData]=useState(empty);
 const [mode,setMode]=useState("new");

 useEffect(()=>{
  const ingredient=initialData.ingredient||{};
  setMode(initialData._id?"existing":"new");
  setData({...empty,...initialData,ingredient:id(ingredient),name:ingredient.name||"",description:ingredient.description||"",defaultUnit:ingredient.unit||"g",ingredientNotes:ingredient.notes||"",imperialUnit:id(initialData.imperialUnit),metricUnit:id(initialData.metricUnit),notes:Array.isArray(initialData.notes)?initialData.notes.join("\n"):initialData.notes||"",effectiveDate:initialData.effectiveDate?String(initialData.effectiveDate).slice(0,10):empty.effectiveDate});
 },[initialData]);

 const change=e=>{const {name,value,type,checked}=e.target;setData(current=>({...current,[name]:type==="checkbox"?checked:value}));};
 const chooseIngredient=e=>{const ingredientId=e.target.value;const ingredient=ingredients.find(item=>item._id===ingredientId);setData(current=>({...current,ingredient:ingredientId,name:ingredient?.name||"",description:ingredient?.description||"",defaultUnit:ingredient?.unit||"g",ingredientNotes:ingredient?.notes||""}));};
 const submit=e=>{e.preventDefault();onSubmit({...data,vendor:id(vendor),business:id(vendor?.business_id),notes:String(data.notes||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean),imperialQuantity:data.imperialQuantity===""?null:Number(data.imperialQuantity),metricQuantity:data.metricQuantity===""?null:Number(data.metricQuantity),packCost:Number(data.packCost||0),unitCost:Number(data.unitCost||0)});};

 if(!vendor)return <Alert variant="warning">Select a vendor before adding an ingredient.</Alert>;
 return <Form onSubmit={submit}>
  <Alert variant="info"><strong>Vendor:</strong> {vendor.legalName}. This offer belongs only to this vendor.</Alert>
  {!initialData._id?<Form.Group className="mb-3"><Form.Label>Ingredient Record</Form.Label><div className="d-flex gap-3"><Form.Check type="radio" label="Create new ingredient" checked={mode==="new"} onChange={()=>{setMode("new");setData(current=>({...current,ingredient:"",name:"",description:"",defaultUnit:"g",ingredientNotes:""}));}}/><Form.Check type="radio" label="Use existing ingredient" checked={mode==="existing"} onChange={()=>setMode("existing")}/></div></Form.Group>:null}
  <Row className="g-3">
   {mode==="existing"?<Col xs={12}><Form.Group><Form.Label>Existing Ingredient</Form.Label><Form.Select value={data.ingredient} onChange={chooseIngredient} required><option value="">Select ingredient</option>{ingredients.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select></Form.Group></Col>:null}
   <Col md={8}><Form.Group><Form.Label>Ingredient Name</Form.Label><Form.Control name="name" value={data.name} onChange={change} required readOnly={mode==="existing"}/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Default Recipe Unit</Form.Label><Form.Control name="defaultUnit" value={data.defaultUnit} onChange={change} required readOnly={mode==="existing"}/></Form.Group></Col>
   <Col xs={12}><Form.Group><Form.Label>Ingredient Description</Form.Label><Form.Control as="textarea" rows={2} name="description" value={data.description} onChange={change} readOnly={mode==="existing"}/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Brand</Form.Label><Form.Control name="brand" value={data.brand} onChange={change}/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Vendor SKU</Form.Label><Form.Control name="sku" value={data.sku} onChange={change}/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Vendor Item Code</Form.Label><Form.Control name="itemCode" value={data.itemCode} onChange={change}/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Pack Size Name</Form.Label><Form.Control name="packSizeName" value={data.packSizeName} onChange={change} placeholder="Case, 6-pack, 25 lb bag..."/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Pack Cost</Form.Label><Form.Control type="number" min="0" step="0.01" name="packCost" value={data.packCost} onChange={change} required/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Unit Cost</Form.Label><Form.Control type="number" min="0" step="0.0001" name="unitCost" value={data.unitCost} onChange={change}/></Form.Group></Col>
   <Col md={2}><Form.Group><Form.Label>Imperial Qty</Form.Label><Form.Control type="number" min="0" step="any" name="imperialQuantity" value={data.imperialQuantity??""} onChange={change}/></Form.Group></Col>
   <Col md={3}><Form.Group><Form.Label>Imperial Unit</Form.Label><Form.Select name="imperialUnit" value={data.imperialUnit} onChange={change}><option value="">Select unit</option>{imperialUnits.map(item=><option key={item._id} value={item._id}>{item.name} ({item.symbol})</option>)}</Form.Select></Form.Group></Col>
   <Col md={7}><Form.Group><Form.Label>Imperial Pack Display</Form.Label><Form.Control name="imperialDisplay" value={data.imperialDisplay} onChange={change} placeholder="25 lb bag"/></Form.Group></Col>
   <Col md={2}><Form.Group><Form.Label>Metric Qty</Form.Label><Form.Control type="number" min="0" step="any" name="metricQuantity" value={data.metricQuantity??""} onChange={change}/></Form.Group></Col>
   <Col md={3}><Form.Group><Form.Label>Metric Unit</Form.Label><Form.Select name="metricUnit" value={data.metricUnit} onChange={change}><option value="">Select unit</option>{metricUnits.map(item=><option key={item._id} value={item._id}>{item.name} ({item.symbol})</option>)}</Form.Select></Form.Group></Col>
   <Col md={7}><Form.Group><Form.Label>Metric Pack Display</Form.Label><Form.Control name="metricDisplay" value={data.metricDisplay} onChange={change} placeholder="11.34 kg bag"/></Form.Group></Col>
   <Col md={4}><Form.Group><Form.Label>Effective Date</Form.Label><Form.Control type="date" name="effectiveDate" value={data.effectiveDate} onChange={change}/></Form.Group></Col>
   <Col md={8}><Form.Group><Form.Label>Vendor Offer Notes</Form.Label><Form.Control as="textarea" rows={2} name="notes" value={data.notes} onChange={change}/></Form.Group></Col>
   <Col md={6}><Form.Check type="switch" name="isPreferred" label="Preferred offer for this ingredient" checked={data.isPreferred} onChange={change}/></Col><Col md={6}><Form.Check type="switch" name="isActive" label="Active vendor offering" checked={data.isActive} onChange={change}/></Col>
  </Row>
  <div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={loading}>{loading?"Saving...":"Save Vendor Ingredient"}</Button></div>
 </Form>;
}
