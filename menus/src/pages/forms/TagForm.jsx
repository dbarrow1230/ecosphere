import {useEffect,useState} from "react";
import {
 Alert,
 Button,
 Col,
 Form,
 Row
} from "react-bootstrap";

const emptyTag={
 name:"",
 slug:"",
 description:"",
 color:"#0f766e",
 status:"active"
};

export default function TagForm({
 tag=null,
 userId="",
 onSuccess,
 onCancel
}){
 const [form,setForm]=useState({...emptyTag});
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  setForm({
   name:tag?.name||"",
   slug:tag?.slug||"",
   description:tag?.description||"",
   color:tag?.color||"#0f766e",
   status:tag?.status||"active"
  });

  setError("");
 },[tag]);

 // Helper: update one tag field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 const handleChange=event=>{
  const {name,value}=event.target;
  updateField(name,value);
 };

 const handleSubmit=async event=>{
  event.preventDefault();

  if(!userId){
   setError("A valid user is required");
   return;
  }

  try{
   setSaving(true);
   setError("");

   const id=tag?._id;
   const response=await fetch(
    id
     ?`/api/tags/${id}`
     :"/api/tags",
    {
     method:id?"PUT":"POST",
     headers:{"Content-Type":"application/json"},
     credentials:"include",
     body:JSON.stringify({
      userId,
      name:form.name,
      slug:form.slug,
      description:form.description,
      color:form.color,
      status:form.status
     })
    }
   );

   const data=await response.json().catch(()=>null);

   if(!response.ok||!data?.success){
    throw new Error(data?.message||"Unable to save tag");
   }

   onSuccess?.(data.data);
  }catch(saveError){
   console.error("Tag save error",saveError);
   setError(saveError.message);
  }finally{
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   {error&&(
    <Alert
     variant="danger"
     dismissible
     onClose={()=>setError("")}
    >
     {error}
    </Alert>
   )}

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>

      <Form.Control
       required
       type="text"
       name="name"
       value={form.name}
       onChange={handleChange}
       placeholder="Example: Biblical Studies"
      />
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Slug</Form.Label>

      <Form.Control
       type="text"
       name="slug"
       value={form.slug}
       onChange={handleChange}
       placeholder="biblical-studies"
      />

      <Form.Text muted>
       Leave blank to generate it from the name.
      </Form.Text>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>

    <Form.Control
     as="textarea"
     rows={4}
     name="description"
     value={form.description}
     onChange={handleChange}
     placeholder="Describe how this tag should be used."
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Color</Form.Label>

      <div className="d-flex align-items-center gap-3">
       <Form.Control
        type="color"
        name="color"
        value={form.color}
        onChange={handleChange}
        title="Choose tag color"
       />

       <Form.Control
        type="text"
        value={form.color}
        onChange={event=>updateField(
         "color",
         event.target.value
        )}
        placeholder="#0f766e"
       />
      </div>
     </Form.Group>
    </Col>

    <Col xs={12} md={6}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>

      <Form.Select
       name="status"
       value={form.status}
       onChange={handleChange}
      >
       <option value="active">Active</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>
   </Row>

   <div className="d-flex justify-content-end gap-2">
    {onCancel&&(
     <Button
      type="button"
      variant="secondary"
      disabled={saving}
      onClick={onCancel}
     >
      Cancel
     </Button>
    )}

    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :tag?._id
       ?"Update Tag"
       :"Create Tag"}
    </Button>
   </div>
  </Form>
 );
}