import {useState,useEffect} from "react";
import {Form,Button,Row,Col} from "react-bootstrap";

export default function TagForm({tag,onSuccess})
{
 const[form,setForm]=useState({
  name:"",
  slug:"",
  description:"",
  color:"#0f766e"
 });

 const[saving,setSaving]=useState(false);

 useEffect(()=>{
  if(tag)
  {
   setForm({
    name:tag.name||"",
    slug:tag.slug||"",
    description:tag.description||"",
    color:tag.color||"#0f766e"
   });
  }
 },[tag]);

 const handleChange=(e)=>{
  const{name,value}=e.target;
  setForm(prev=>({...prev,[name]:value}));
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  setSaving(true);

  try{

   const method=tag?"PUT":"POST";
   const url=tag?`/api/tags/${tag._id}`:"/api/tags";

   const res=await fetch(url,{
    method,
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(form)
   });

   const data=await res.json();

   if(data.success&&onSuccess)
    onSuccess(data.data);

  }
  catch(err){
   console.error("Tag save error",err);
  }
  finally{
   setSaving(false);
  }
 };

 return(

  <Form onSubmit={handleSubmit}>

   <Row className="mb-3">

    <Col md={6}>

     <Form.Group>

      <Form.Label>Name</Form.Label>

      <Form.Control
       type="text"
       name="name"
       value={form.name}
       onChange={handleChange}
       required
      />

     </Form.Group>

    </Col>

    <Col md={6}>

     <Form.Group>

      <Form.Label>Slug</Form.Label>

      <Form.Control
       type="text"
       name="slug"
       value={form.slug}
       onChange={handleChange}
      />

     </Form.Group>

    </Col>

   </Row>

   <Form.Group className="mb-3">

    <Form.Label>Description</Form.Label>

    <Form.Control
     as="textarea"
     rows={3}
     name="description"
     value={form.description}
     onChange={handleChange}
    />

   </Form.Group>

   <Row className="mb-3">

    <Col md={4}>

     <Form.Group>

      <Form.Label>Color</Form.Label>

      <Form.Control
       type="color"
       name="color"
       value={form.color}
       onChange={handleChange}
      />

     </Form.Group>

    </Col>

   </Row>

   <Button type="submit" disabled={saving}>
    {saving?"Saving...":tag?"Update Tag":"Create Tag"}
   </Button>

  </Form>

 );
}