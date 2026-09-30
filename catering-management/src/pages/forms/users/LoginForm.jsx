// src/pages/forms/users/LoginForm.jsx
import {useState} from "react";
import {Link} from "react-router-dom";
import {Form,Button,Alert,Row,Col} from "react-bootstrap";
import logoImage from "../../../images/logo.png";

export default function LoginForm({
 onLogin,
 logo=logoImage,
 logoAlt="Catering Management Logo",
 title="Catering Management",
 subtitle="Sign in to continue."
})
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
   const storage=form.rememberMe?localStorage:sessionStorage;
   const clearStorage=form.rememberMe?sessionStorage:localStorage;

   if(!token)
   {
    throw new Error("Login succeeded but token was not returned");
   }

   clearStorage.removeItem("token");
   clearStorage.removeItem("user");
   clearStorage.removeItem("userInfo");
   clearStorage.removeItem("authUser");
   clearStorage.removeItem("currentUser");

   storage.setItem("token",token);

   if(user)
   {
    storage.setItem("user",JSON.stringify(user));
   }

   if(onLogin)
   {
    onLogin({token,user,raw:data,rememberMe:form.rememberMe});
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

   <div className="login-form-brand">
    <img src={logo} alt={logoAlt} className="login-form-logo"/>
      <p className="login-form-subtitle">{subtitle}</p>
   </div>

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
       autoComplete="username"
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
       autoComplete="current-password"
       required
      />
     </Form.Group>
    </Col>

   </Row>

   <Row className="mb-3">

    <Col>
     <div className="login-form-options">
      <Form.Check
       type="checkbox"
       id="rememberMe"
       name="rememberMe"
       label="Remember me"
       checked={form.rememberMe}
       onChange={handleChange}
      />

      <Link to="/forgot-password" className="login-form-link">
       Forgot password?
      </Link>
     </div>
    </Col>

   </Row>

   <Button type="submit" disabled={loading} className="login-form-button">
    {loading?"Logging in...":"Login"}
   </Button>

  </Form>
 );
}