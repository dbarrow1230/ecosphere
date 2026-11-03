// src/pages/auth/Login.jsx
import {useEffect} from "react";
import {Container,Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LoginForm from "../../forms/users/LoginForm";

export default function Login(){
 const navigate=useNavigate();

 useEffect(()=>{
  const token=localStorage.getItem("token")||sessionStorage.getItem("token");

  if(token){
   navigate("/dashboard",{replace:true});
  }
 },[navigate]);

 const handleLogin=({token,user})=>{
  if(token){
   localStorage.setItem("token",token);
   sessionStorage.setItem("token",token);
  }

  if(user){
   const serialized=JSON.stringify(user);

   localStorage.setItem("user",serialized);
   localStorage.setItem("currentUser",serialized);

   sessionStorage.setItem("user",serialized);
   sessionStorage.setItem("currentUser",serialized);
  }

  navigate("/dashboard",{replace:true});
 };

 return(
  <Container className="py-4 d-flex justify-content-center">
   <Card style={{width:"100%",maxWidth:"480px"}}>
    <Card.Body>
     <Card.Title className="mb-4">Login</Card.Title>
     <LoginForm onLogin={handleLogin}/>
    </Card.Body>
   </Card>
  </Container>
 );
}