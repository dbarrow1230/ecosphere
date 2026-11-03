import {useEffect} from "react";
import {Container,Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import LoginForm from "../../forms/admin/users/LoginForm";

export default function Login()
{
 const navigate=useNavigate();

 useEffect(()=>{
  const token=localStorage.getItem("token")||sessionStorage.getItem("token");

  if(token)
  {
   navigate("/dashboard");
  }
 },[navigate]);

 const handleLogin=({token,user,rememberMe=false})=>{
  const storage=rememberMe?localStorage:sessionStorage;
  const otherStorage=rememberMe?sessionStorage:localStorage;
  const authKeys=["token","user","userInfo","authUser","currentUser"];

  authKeys.forEach(key=>otherStorage.removeItem(key));

  if(token)
  {
   storage.setItem("token",token);
  }

  if(user)
  {
   const serialized=JSON.stringify(user);
   storage.setItem("user",serialized);
   storage.setItem("userInfo",serialized);
   storage.setItem("authUser",serialized);
   storage.setItem("currentUser",serialized);
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
