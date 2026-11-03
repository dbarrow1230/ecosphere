// src/pages/users/Login.jsx
import {useEffect} from "react";
import {Container,Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LoginForm from "../forms/users/LoginForm";

export default function Login()
{
 const navigate=useNavigate();

 useEffect(()=>{
  const token=localStorage.getItem("token");

  if(token)
  {
   navigate("/dashboard");
  }
 },[navigate]);

 const handleLogin=({token,user,rememberMe=false})=>{
  const storage=rememberMe?localStorage:sessionStorage;
  const clearStorage=rememberMe?sessionStorage:localStorage;

  clearStorage.removeItem("token");
  clearStorage.removeItem("user");
  clearStorage.removeItem("userInfo");
  clearStorage.removeItem("authUser");
  clearStorage.removeItem("currentUser");

  if(token)
  {
   storage.setItem("token",token);
  }

  if(user)
  {
   storage.setItem("user",JSON.stringify(user));
  }

  navigate("/dashboard");
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
