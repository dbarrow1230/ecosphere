// src/pages/forms/users/LoginForm.jsx
import {useState} from "react";
import {Form,Button,Alert,Row,Col} from "react-bootstrap";

export default function LoginForm({onLogin})
{
 const [form,setForm]=useState({
  username:"",
  password:""
 });

 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");

 const handleChange=(e)=>{
  const {name,value}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:value
  }));
 };

 const handleSubmit=async(e)=>{
  e.preventDefault();

  setLoading(true);
  setError("");

  try
  {
   const res=await fetch("/api/users/login",{
    method:"POST",
    headers:{
     "Content-Type":"application/json"
    },
    body:JSON.stringify(form)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.error||data?.message||"Login failed");
   }

   const token=data?.token||"";
   const user=data?.user||null;

   if(!token)
   {
    throw new Error("Login succeeded but token was not returned");
   }

   localStorage.setItem("token",token);

   if(user)
   {
    localStorage.setItem("user",JSON.stringify(user));
   }

   if(onLogin)
   {
    onLogin({token,user,raw:data});
   }
  }
  catch(err)
  {
   setError(err.message||"Login failed");
  }
  finally
  {
   setLoading(false);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>

   {error&&<Alert variant="danger">{error}</Alert>}

   <Row className="mb-3">

    <Col>
     <Form.Group>
      <Form.Label>Username</Form.Label>
      <Form.Control
       type="text"
       name="username"
       value={form.username}
       onChange={handleChange}
       required
      />
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col>
     <Form.Group>
      <Form.Label>Password</Form.Label>
      <Form.Control
       type="password"
       name="password"
       value={form.password}
       onChange={handleChange}
       required
      />
     </Form.Group>
    </Col>

   </Row>

   <Button type="submit" disabled={loading}>
    {loading?"Logging in...":"Login"}
   </Button>

  </Form>
 );
}