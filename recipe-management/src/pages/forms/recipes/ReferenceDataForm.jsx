import {useEffect,useState} from "react";
import {Button,Form} from "react-bootstrap";

const emptyForm={name:"",slug:"",description:"",isActive:true};

const slugify=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\s+/g,"-")
 .replace(/-+/g,"-");

export default function ReferenceDataForm({initialData={},label,onSubmit,loading=false}){
 const [formData,setFormData]=useState(emptyForm);

 useEffect(()=>{
  setFormData({...emptyForm,...initialData});
 },[initialData]);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>{
   const next={...prev,[name]:type==="checkbox"?checked:value};
   if(name==="name"&&!initialData?.slug)next.slug=slugify(value);
   return next;
  });
 };

 const handleSubmit=e=>{
  e.preventDefault();
  onSubmit({
   name:formData.name.trim(),
   slug:slugify(formData.slug||formData.name),
   description:formData.description.trim(),
   isActive:formData.isActive
  });
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Form.Group className="mb-3">
    <Form.Label>Name</Form.Label>
    <Form.Control name="name" value={formData.name} onChange={handleChange} required autoFocus/>
   </Form.Group>
   <Form.Group className="mb-3">
    <Form.Label>Slug</Form.Label>
    <Form.Control name="slug" value={formData.slug} onChange={handleChange} required/>
   </Form.Group>
   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange}/>
   </Form.Group>
   <Form.Check className="mb-3" type="switch" name="isActive" label="Active" checked={formData.isActive} onChange={handleChange}/>
   <div className="d-flex justify-content-end">
    <Button type="submit" disabled={loading}>{loading?"Saving...":`Save ${label}`}</Button>
   </div>
  </Form>
 );
}
