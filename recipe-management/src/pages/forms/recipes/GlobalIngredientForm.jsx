import "../../../styles/VendorIngredientForm.css";
import {useState} from "react";
import {Button,Form} from "react-bootstrap";

const emptyIngredient={name:"",description:"",isActive:true};

export default function GlobalIngredientForm({initialData={},onSubmit,onCancel,saving=false,businesses=[],categories=[]}){
 const [data,setData]=useState(()=>({
  ...emptyIngredient,
  name:initialData.name||initialData.ingredientName||"",
  description:initialData.description||"",
  unit:initialData.unit||"g",notes:initialData.notes||"",business:initialData.business?._id||initialData.business||"",category:initialData.category?._id||initialData.category||"",
  isActive:initialData.isActive!==false
 }));

 const submit=event=>{
  event.preventDefault();
  onSubmit({
   name:data.name.trim(),
   description:data.description.trim(),
   unit:data.unit.trim(),notes:data.notes,business:data.business||null,category:data.category||null,
   isActive:data.isActive
  });
 };

 return(
  <Form className="vendor-ingredient-form" onSubmit={submit}>
   <Form.Group className="vendor-ingredient-field mb-3">
    <Form.Label>Ingredient Name</Form.Label>
    <Form.Control value={data.name} onChange={event=>setData(current=>({...current,name:event.target.value}))} required autoFocus disabled={saving}/>

   </Form.Group>
   <Form.Group className="vendor-ingredient-field vendor-ingredient-description mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control as="textarea" rows={3} value={data.description} onChange={event=>setData(current=>({...current,description:event.target.value}))} disabled={saving}/>
   </Form.Group>
   <Form.Group className="vendor-ingredient-field mb-3"><Form.Label>Default Recipe Unit</Form.Label><Form.Control className="vendor-ingredient-short" value={data.unit} onChange={event=>setData(current=>({...current,unit:event.target.value}))} required disabled={saving}/></Form.Group>
   <Form.Group className="vendor-ingredient-field mb-3"><Form.Label>Business</Form.Label><Form.Select value={data.business} onChange={event=>setData(current=>({...current,business:event.target.value}))} disabled={saving}><option value="">Shared ingredient</option>{businesses.map(item=><option key={item._id} value={item._id}>{item.legalName||item.name}</option>)}</Form.Select></Form.Group>
   <Form.Group className="vendor-ingredient-field mb-3"><Form.Label>Category</Form.Label><Form.Select value={data.category} onChange={event=>setData(current=>({...current,category:event.target.value}))} disabled={saving}><option value="">Select category</option>{categories.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select></Form.Group>
   <Form.Check type="switch" label="Active" checked={data.isActive} onChange={event=>setData(current=>({...current,isActive:event.target.checked}))} disabled={saving}/>
   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
    <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Ingredient"}</Button>
   </div>
  </Form>
 );
}
