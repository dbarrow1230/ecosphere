// src/pages/auth/ForgotPasswordPage.jsx
import {useState} from "react";
import {Form,Button,Container,Card,InputGroup,Alert} from "react-bootstrap";
import {Link} from "react-router-dom";
import logo from "../../images/logo.png";
import "../../styles/login.css";

export default function ForgotPasswordPage()
{
 const [form,setForm]=useState({email:""});
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [resetUrl,setResetUrl]=useState("");

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
  setResetUrl("");

  try
  {
   const res=await fetch("/api/users/forgot-password",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email:form.email})
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to generate reset link");
   }

   setSuccess(data?.message||"Password reset link generated.");
   setResetUrl(data?.resetUrl||"");
   setForm({email:""});
  }
  catch(err)
  {
   setError(err.message||"Failed to generate reset link");
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
      <img src={logo} alt="Food Preservation Manager" className="login-logo"/>
     </div>

     <h2 className="login-title">Forgot Password</h2>

     {error&&<Alert variant="danger">{error}</Alert>}
     {success&&<Alert variant="success">{success}</Alert>}
     {resetUrl&&
      <Alert variant="warning">
       <div className="mb-2">Use this reset link:</div>
       <div className="reset-link-box">
        <a href={resetUrl} target="_blank" rel="noreferrer">{resetUrl}</a>
       </div>
      </Alert>
     }

     <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
       <Form.Label>Email</Form.Label>
       <InputGroup>
        <InputGroup.Text>@</InputGroup.Text>
        <Form.Control
         type="email"
         name="email"
         value={form.email}
         onChange={handleChange}
         required
        />
       </InputGroup>
      </Form.Group>

      <Button type="submit" className="login-button" disabled={loading}>
       {loading?"Generating...":"Generate Reset Link"}
      </Button>

      <div className="login-back-link">
       <Link to="/login">Back to Login</Link>
      </div>
     </Form>
    </Card.Body>
   </Card>
  </Container>
 );
}
