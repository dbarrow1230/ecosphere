import {useEffect} from "react";
import {Container,Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LoginForm from "../../forms/users/LoginForm";
import {isTimeClockOnlyUser} from "../../../utils/userAccess.js";

export default function Login()
{
 const navigate=useNavigate();

 useEffect(()=>{
  const token=localStorage.getItem("token")||sessionStorage.getItem("token");

  if(token)
  {
   const raw=localStorage.getItem("user")||sessionStorage.getItem("user");
   let storedUser=null;
   try{storedUser=raw?JSON.parse(raw):null;}catch{storedUser=null;}
   navigate(isTimeClockOnlyUser(storedUser)?"/time-clock":"/dashboard");
  }
 },[navigate]);

 const handleLogin=({user})=>{
  navigate(isTimeClockOnlyUser(user)?"/time-clock":"/dashboard");
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
