import {useState} from "react";
import {Button,Form} from "react-bootstrap";

const emptyIngredient={name:"",description:"",isActive:true};

export default function GlobalIngredientForm({initialData={},onSubmit,onCancel,saving=false}){
 const [data,setData]=useState(()=>({
  ...emptyIngredient,
  name:initialData.name||initialData.ingredientName||"",
  description:initialData.description||"",
  isActive:initialData.isActive!==false
 }));

 const submit=event=>{
  event.preventDefault();
  onSubmit({
   name:data.name.trim(),
   description:data.description.trim(),
   isActive:data.isActive
  });
 };

 return(
  <Form onSubmit={submit}>
   <Form.Group className="mb-3">
    <Form.Label>Global Ingredient Name</Form.Label>
    <Form.Control value={data.name} onChange={event=>setData(current=>({...current,name:event.target.value}))} required autoFocus disabled={saving}/>
    <Form.Text>This creates one shared ingredient record. Vendor assignments are added separately.</Form.Text>
   </Form.Group>
   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control as="textarea" rows={3} value={data.description} onChange={event=>setData(current=>({...current,description:event.target.value}))} disabled={saving}/>
   </Form.Group>
   <Form.Check type="switch" label="Active" checked={data.isActive} onChange={event=>setData(current=>({...current,isActive:event.target.checked}))} disabled={saving}/>
   <div className="d-flex justify-content-end gap-2 mt-4">
    <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
    <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Global Ingredient"}</Button>
   </div>
  </Form>
 );
}
