// src/pages/forms/users/LoginForm.jsx
import {useState} from "react";
import {Link} from "react-router-dom";
import {Form,Button,Alert,Row,Col} from "react-bootstrap";
import logoImage from "../../../images/logo.png";

export default function LoginForm({
 onLogin,
 logo=logoImage,
 logoAlt="Everything In a Jar Logo",
 title="Everything In a Jar",
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

 const getObjectId=value=>{
  if(!value)return "";

  if(typeof value==="string")return value;

  if(typeof value==="object")
  {
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id==="string")return value.id;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
  }

  return "";
 };

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 const getCurrentBusiness=async()=>{
  const appKey=getRuntimeAppKey();

  try
  {
   const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`);
   const data=await res.json();

   if(!res.ok)
   {
    return null;
   }

   return data.business||data.data||data;
  }
  catch(err)
  {
   console.error("Current business load error",err);
   return null;
  }
 };

 const getUserRoleAssignments=async(userId,businessId)=>{
  if(!userId||!businessId)
  {
   return [];
  }

  try
  {
   const res=await fetch(`/api/users/role-assignments?user=${encodeURIComponent(userId)}&business=${encodeURIComponent(businessId)}&isActive=true`);
   const data=await res.json();

   if(!res.ok)
   {
    return [];
   }

   if(Array.isArray(data.data))return data.data;
   if(Array.isArray(data.assignments))return data.assignments;
   if(Array.isArray(data.userRoleAssignments))return data.userRoleAssignments;
   if(Array.isArray(data))return data;

   return [];
  }
  catch(err)
  {
   console.error("Role assignment load error",err);
   return [];
  }
 };

 const getUserDepartmentAssignments=async(userId,businessId)=>{
  if(!userId||!businessId)
  {
   return [];
  }

  try
  {
   const res=await fetch(`/api/users/department-assignments?user=${encodeURIComponent(userId)}&business=${encodeURIComponent(businessId)}&isActive=true`);
   const data=await res.json();

   if(!res.ok)
   {
    return [];
   }

   if(Array.isArray(data.data))return data.data;
   if(Array.isArray(data.assignments))return data.assignments;
   if(Array.isArray(data.userDepartmentAssignments))return data.userDepartmentAssignments;
   if(Array.isArray(data))return data;

   return [];
  }
  catch(err)
  {
   console.error("Department assignment load error",err);
   return [];
  }
 };

 const getFullUser=async(user)=>{
  const userId=getObjectId(user);

  if(!userId)
  {
   return user;
  }

  try
  {
   const userRes=await fetch(`/api/users/${userId}`);
   const userData=await userRes.json();

   const loadedUser=userRes.ok?(userData.data||userData.user||userData):user;
   const currentBusiness=getCurrentBusiness();
   const business=await currentBusiness;
   const businessId=getObjectId(loadedUser.business)||getObjectId(loadedUser.businessRef)||getObjectId(business);
   const roleAssignments=await getUserRoleAssignments(userId,businessId);
   const departmentAssignments=await getUserDepartmentAssignments(userId,businessId);

   return{
    ...loadedUser,
    roleAssignments,
    userRoleAssignments:roleAssignments,
    departmentAssignments,
    userDepartmentAssignments:departmentAssignments,
    currentBusiness:businessId
   };
  }
  catch(err)
  {
   console.error("Full user load error",err);
   return user;
  }
 };

 const clearAuthStorage=storage=>{
  storage.removeItem("token");
  storage.removeItem("user");
  storage.removeItem("userInfo");
  storage.removeItem("authUser");
  storage.removeItem("currentUser");
 };

 const setAuthStorage=(storage,token,user)=>{
  storage.setItem("token",token);

  if(user)
  {
   const serialized=JSON.stringify(user);

   storage.setItem("user",serialized);
   storage.setItem("userInfo",serialized);
   storage.setItem("authUser",serialized);
   storage.setItem("currentUser",serialized);
  }
 };

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
   const fullUser=await getFullUser(user);
   const storage=form.rememberMe?localStorage:sessionStorage;
   const clearStorage=form.rememberMe?sessionStorage:localStorage;

   if(!token)
   {
    throw new Error("Login succeeded but token was not returned");
   }

   clearAuthStorage(clearStorage);
   setAuthStorage(storage,token,fullUser);

   if(onLogin)
   {
    onLogin({token,user:fullUser,raw:data,rememberMe:form.rememberMe});
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
      <h1 className="login-form-title">{title}</h1>
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
