// src/pages/forms/users/LoginForm.jsx
import {useState} from "react";
import {Form,Button,Alert,Row,Col} from "react-bootstrap";
import {Link} from "react-router-dom";

export default function LoginForm({onLogin})
{
 const [form,setForm]=useState({
  username:"",
  password:"",
  rememberMe:false
 });

 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");

 const handleChange=(e)=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
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
    body:JSON.stringify({
     username:form.username,
     password:form.password
    })
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

   if(form.rememberMe)
   {
    localStorage.setItem("token",token);
    sessionStorage.removeItem("token");
   }
   else
   {
    sessionStorage.setItem("token",token);
    localStorage.removeItem("token");
   }

   if(user)
   {
    const serialized=JSON.stringify(user);

    if(form.rememberMe)
    {
     localStorage.setItem("user",serialized);
     localStorage.setItem("userInfo",serialized);
     localStorage.setItem("authUser",serialized);
     localStorage.setItem("currentUser",serialized);

     sessionStorage.removeItem("user");
     sessionStorage.removeItem("userInfo");
     sessionStorage.removeItem("authUser");
     sessionStorage.removeItem("currentUser");
    }
    else
    {
     sessionStorage.setItem("user",serialized);
     sessionStorage.setItem("userInfo",serialized);
     sessionStorage.setItem("authUser",serialized);
     sessionStorage.setItem("currentUser",serialized);

     localStorage.removeItem("user");
     localStorage.removeItem("userInfo");
     localStorage.removeItem("authUser");
     localStorage.removeItem("currentUser");
    }
   }

   if(onLogin)
   {
    onLogin({token,user,rememberMe:form.rememberMe,raw:data});
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

   <Row className="mb-3">
    <Col className="d-flex justify-content-between align-items-center">
     <Form.Group className="mb-0">
      <Form.Check
       type="checkbox"
       name="rememberMe"
       label="Remember me"
       checked={form.rememberMe}
       onChange={handleChange}
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