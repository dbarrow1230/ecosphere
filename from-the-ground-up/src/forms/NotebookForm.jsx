import {useState,useEffect} from "react";
import {Form,Button,Row,Col,Alert} from "react-bootstrap";

export default function NotebookForm({notebook,onSuccess})
{
 const emptyForm={
  name:"",
  description:"",
  color:"#6366f1",
  isArchived:false
 };

 const [form,setForm]=useState(emptyForm);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys)
  {
   try
   {
    const raw=localStorage.getItem(key);

    if(!raw)
    {
     continue;
    }

    const parsed=JSON.parse(raw);

    if(parsed?._id)
    {
     return parsed;
    }

    if(parsed?.user?._id)
    {
     return parsed.user;
    }

    if(parsed?.data?._id)
    {
     return parsed.data;
    }
   }
   catch(err)
   {
    console.error(`Failed to parse localStorage key: ${key}`,err);
   }
  }

  return null;
 };

 const getToken=()=>{
  try
  {
   return (localStorage.getItem("token")||"").trim();
  }
  catch(err)
  {
   console.error("Failed to read token",err);
   return "";
  }
 };

 const getAuthHeaders=()=>{
  const token=getToken();
  const headers={"Content-Type":"application/json"};

  if(token)
  {
   headers.Authorization=`Bearer ${token}`;
  }

  return headers;
 };

 const resolveUserId=(value)=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object"&&value._id)
  {
   return value._id;
  }

  return "";
 };

 useEffect(()=>{
  if(notebook)
  {
   setForm({
    name:notebook.name||"",
    description:notebook.description||"",
    color:notebook.color||"#6366f1",
    isArchived:notebook.isArchived||false
   });
  }
  else
  {
    setForm(emptyForm);
  }

  setError("");
 },[notebook]);

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>{
   return{
    ...prev,
    [name]:type==="checkbox"?checked:value
   };
  });
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  setSaving(true);
  setError("");

  try
  {
   const loggedInUser=getStoredUser();
   const userId=resolveUserId(notebook?.user)||resolveUserId(loggedInUser);
   const token=getToken();

   if(!userId)
   {
    throw new Error("No logged in user found");
   }

   if(!token)
   {
    throw new Error("Unauthorized, no token");
   }

   const method=notebook?"PUT":"POST";
   const url=notebook?`http://127.0.0.1:3001/api/notebooks/${notebook._id}`:"http://127.0.0.1:3001/api/notebooks";

   const payload={
    name:form.name.trim(),
    description:form.description.trim(),
    color:form.color,
    isArchived:form.isArchived
   };

   const res=await fetch(url,{
    method,
    headers:getAuthHeaders(),
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Failed to save notebook");
   }

   if(data.success&&onSuccess)
   {
    onSuccess(data.data);
   }
  }
  catch(err)
  {
   console.error("Notebook save error",err);
   setError(err.message||"Failed to save notebook");
  }
  finally
  {
   setSaving(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   {error&&<Alert variant="danger">{error}</Alert>}

   <Row className="mb-3">

    <Col md={6}>
     <Form.Group>
      <Form.Label>Name</Form.Label>
      <Form.Control type="text" name="name" value={form.name} onChange={handleChange} required/>
     </Form.Group>
    </Col>

    <Col md={6}>
     <Form.Group>
      <Form.Label>Color</Form.Label>
      <Form.Control type="color" name="color" value={form.color} onChange={handleChange}/>
     </Form.Group>
    </Col>

   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange}/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Check type="checkbox" label="Archived" name="isArchived" checked={form.isArchived} onChange={handleChange}/>
   </Form.Group>

   <Button type="submit" disabled={saving}>
    {saving?"Saving...":notebook?"Update Notebook":"Create Notebook"}
   </Button>

  </Form>
 );
}