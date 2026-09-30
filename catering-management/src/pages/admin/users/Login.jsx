import {useEffect} from "react";
import {Container,Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LoginForm from "../../forms/users/LoginForm";
import "../../../styles/login.css";

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

 const handleLogin=({token,user})=>{
  if(token)
  {
   localStorage.setItem("token",token);
   sessionStorage.setItem("token",token);
  }

  if(user)
  {
   const serialized=JSON.stringify(user);
   localStorage.setItem("user",serialized);
   localStorage.setItem("userInfo",serialized);
   localStorage.setItem("authUser",serialized);
   localStorage.setItem("currentUser",serialized);

   sessionStorage.setItem("user",serialized);
   sessionStorage.setItem("userInfo",serialized);
   sessionStorage.setItem("authUser",serialized);
   sessionStorage.setItem("userInfo",serialized);
   sessionStorage.setItem("authUser",serialized);
   sessionStorage.setItem("currentUser",serialized);
  }

  navigate("/dashboard");
 };

 return(
  <Container className="login-container">
   <Card className="login-card">
    <Card.Body>
     <Card.Title className="login-title">Login</Card.Title>
     <LoginForm onLogin={handleLogin}/>
    </Card.Body>
   </Card>
  </Container>
 );
}