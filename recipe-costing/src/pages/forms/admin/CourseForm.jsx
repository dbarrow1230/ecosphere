import {useState} from "react";
import {Button,Form} from "react-bootstrap";

const emptyForm={name:"",slug:"",description:"",isActive:true};

export default function CourseForm({initialData={},onSubmit,onSaved,onHide,loading=false}){
 const [form,setForm]=useState(()=>({...emptyForm,...initialData,isActive:initialData.isActive!==false}));
 const handleChange=event=>{
  const {name,value,type,checked}=event.target;
  setForm(previous=>({...previous,[name]:type==="checkbox"?checked:value}));
 };
 const handleSubmit=async event=>{
  event.preventDefault();
  const saved=await onSubmit(form);
  onSaved(saved);
 };
 return(
  <Form onSubmit={handleSubmit}>
   <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control name="name" value={form.name} onChange={handleChange} required disabled={loading}/></Form.Group>
   <Form.Group className="mb-3"><Form.Label>Slug</Form.Label><Form.Control name="slug" value={form.slug} onChange={handleChange} disabled={loading}/></Form.Group>
   <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} disabled={loading}/></Form.Group>
   <Form.Check type="checkbox" label="Active" name="isActive" checked={form.isActive} onChange={handleChange} disabled={loading}/>
   <div className="d-flex justify-content-end gap-2 mt-3">
    <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
    <Button type="submit" disabled={loading}>{loading?"Saving...":form._id?"Update":"Create"}</Button>
   </div>
  </Form>
 );
}
