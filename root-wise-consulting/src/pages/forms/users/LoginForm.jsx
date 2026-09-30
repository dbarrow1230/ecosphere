import {useState} from "react";
import {Link} from "react-router-dom";
import {Form,Button,Alert,Row,Col} from "react-bootstrap";
import logoImage from "../../../images/logo.png";

export default function LoginForm({
 onLogin,
 logo=logoImage,
 logoAlt="Root Wise Consulting Logo",
 title="Root Wise Consulting",
 subtitle="Sign in to continue."
}){
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

  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
   if(typeof value.id==="string")return value.id;
  }

  return "";
 };

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window?.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"recipe-costing").trim().toLowerCase();
 };

 const getCurrentBusiness=async()=>{
  const appKey=getRuntimeAppKey();

  if(!appKey)return null;

  try{
   const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
    cache:"no-store",
    headers:{
     "Cache-Control":"no-cache",
     "Pragma":"no-cache"
    }
   });

   const data=await res.json().catch(()=>null);

   if(!res.ok)return null;

   return unwrapBusiness(data);
  }catch(err){
   console.error("Current business load error",err);
   return null;
  }
 };

 const getScopedUser=async({user,business})=>{
  const userId=getObjectId(user);
  const businessId=getObjectId(business);

  if(!userId)return user;

  try{
   const url=businessId
    ?`/api/users/${encodeURIComponent(userId)}?business=${encodeURIComponent(businessId)}`
    :`/api/users/${encodeURIComponent(userId)}`;

   const res=await fetch(url,{
    cache:"no-store",
    headers:{
     "Cache-Control":"no-cache",
     "Pragma":"no-cache"
    }
   });

   const data=await res.json().catch(()=>null);
   const loadedUser=res.ok?(data?.data||data?.user||data):user;

   return{
    ...(loadedUser||user||{}),
    _id:getObjectId(loadedUser)||userId,
    currentBusiness:business||null,
    currentBusinessId:businessId||"",
    businessRoleAssignment:loadedUser?.businessRoleAssignment||null,
    businessDepartmentAssignments:Array.isArray(loadedUser?.businessDepartmentAssignments)?loadedUser.businessDepartmentAssignments:[]
   };
  }catch(err){
   console.error("Scoped user load error",err);

   return{
    ...(user||{}),
    _id:userId,
    currentBusiness:business||null,
    currentBusinessId:businessId||"",
    businessRoleAssignment:null,
    businessDepartmentAssignments:[]
   };
  }
 };

 const clearAuthStorage=storage=>{
  storage.removeItem("token");
  storage.removeItem("user");
  storage.removeItem("currentUser");
  storage.removeItem("currentBusiness");
  storage.removeItem("userInfo");
  storage.removeItem("authUser");
 };

 const setAuthStorage=(storage,{token,user,business})=>{
  storage.setItem("token",token);

  if(user){
   const serializedUser=JSON.stringify(user);
   storage.setItem("user",serializedUser);
   storage.setItem("currentUser",serializedUser);
  }

  if(business){
   storage.setItem("currentBusiness",JSON.stringify(business));
  }
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;

  setForm(prev=>({
   ...prev,
   [name]:type==="checkbox"?checked:value
  }));
 };

 const handleSubmit=async e=>{
  e.preventDefault();

  setLoading(true);
  setError("");

  try{
   const res=await fetch("/api/users/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     username:form.username,
     password:form.password
    })
   });

   const data=await res.json().catch(()=>null);

   if(!res.ok)
    throw new Error(data?.error||data?.message||"Login failed");

   const token=data?.token||data?.data?.token||"";
   const baseUser=data?.user||data?.data?.user||data?.data||null;

   if(!token)
    throw new Error("Login succeeded but token was not returned");

   if(!baseUser)
    throw new Error("Login succeeded but user was not returned");

   const business=await getCurrentBusiness();
   const fullUser=await getScopedUser({user:baseUser,business});

   const activeStorage=form.rememberMe?localStorage:sessionStorage;
   const inactiveStorage=form.rememberMe?sessionStorage:localStorage;

   clearAuthStorage(activeStorage);
   clearAuthStorage(inactiveStorage);

   setAuthStorage(activeStorage,{
    token,
    user:fullUser,
    business
   });

   if(onLogin){
    onLogin({
     token,
     user:fullUser,
     business,
     raw:data,
     rememberMe:form.rememberMe
    });
   }
  }catch(err){
   setError(err.message||"Login failed");
  }finally{
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