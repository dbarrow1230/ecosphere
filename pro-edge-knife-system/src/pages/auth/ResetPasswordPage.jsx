// src/pages/auth/ResetPasswordPage.jsx
import {useState} from "react";
import {Form,Button,Container,Card,InputGroup,Alert} from "react-bootstrap";
import {Link,useParams,useNavigate} from "react-router-dom";
import logo from "../../images/logo.svg";
import "../../styles/login.css";

export default function ResetPasswordPage()
{
 const {token}=useParams();
 const navigate=useNavigate();

 const [form,setForm]=useState({
  password:"",
  confirmPassword:""
 });

 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

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
  setSuccess("");

  try
  {
   if(!form.password||!form.confirmPassword)
   {
    throw new Error("Both password fields are required");
   }

   if(form.password!==form.confirmPassword)
   {
    throw new Error("Passwords do not match");
   }

   const res=await fetch("/api/users/reset-password",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({token,password:form.password})
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to reset password");
   }

   setSuccess(data?.message||"Password has been reset successfully");
   setForm({
    password:"",
    confirmPassword:""
   });

   setTimeout(()=>{
    navigate("/login");
   },1500);
  }
  catch(err)
  {
    setError(err.message||"Failed to reset password");
  }
  finally
  {
   setLoading(false);
  }
 };

 return(
  <Container className="login-container">
   <Card className="login-card">
    <Card.Body>
     <div className="login-logo-wrapper">
      <img src={logo} alt="Antinet Zettelkasten" className="login-logo"/>
     </div>

     <h2 className="login-title">Reset Password</h2>

     {error&&<Alert variant="danger">{error}</Alert>}
     {success&&<Alert variant="success">{success}</Alert>}

     <Form onSubmit={handleSubmit}>
       <Form.Group className="mb-3">
        <Form.Label>New Password</Form.Label>
        <InputGroup>
         <InputGroup.Text>🔒</InputGroup.Text>
         <Form.Control
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
         />
        </InputGroup>
       </Form.Group>

       <Form.Group className="mb-3">
        <Form.Label>Confirm Password</Form.Label>
        <InputGroup>
         <InputGroup.Text>🔒</InputGroup.Text>
         <Form.Control
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
         />
        </InputGroup>
       </Form.Group>

       <Button type="submit" className="login-button" disabled={loading}>
        {loading?"Saving...":"Reset Password"}
       </Button>
     </Form>

     <div className="login-back-link">
      <Link to="/login">Back to Login</Link>
     </div>
    </Card.Body>
   </Card>
  </Container>
 );
}
