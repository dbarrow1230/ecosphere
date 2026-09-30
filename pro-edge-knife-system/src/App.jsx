import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {useState,useEffect} from "react";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

// Components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";

// App pages
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tiers from "./pages/Tiers.jsx";
import CustomBuilder from "./pages/CustomBuilder.jsx";
import Orders from "./pages/Orders.jsx";

// Reference and information pages
import ContactUs from "./pages/contactus.jsx";
import FAQ from "./pages/faq.jsx";
import Privacy from "./pages/privacy.jsx";
import TermsOfService from "./pages/termsofservice.jsx";
import About from "./pages/about.jsx";

// Users
import Users from "./pages/admin/users/Users.jsx";
import Login from "./pages/admin/users/Login.jsx";
import UserProfilePage from "./pages/admin/users/UserProfilePage.jsx";
import PermissionMatrix from "./pages/admin/users/PermissionMatrix.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";

// Admin
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import KnifeTypesAdmin from "./pages/admin/KnifeTypesAdmin.jsx";
import TiersAdmin from "./pages/admin/TiersAdmin.jsx";
import Businesses from "./pages/admin/Businesses.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";

// Error pages
import Error400 from "./components/errorpages/Error400.jsx";
import Error401 from "./components/errorpages/Error401.jsx";
import Error403 from "./components/errorpages/Error403.jsx";
import Error404 from "./components/errorpages/Error404.jsx";
import Error500 from "./components/errorpages/Error500.jsx";
import Error502 from "./components/errorpages/Error502.jsx";
import Error503 from "./components/errorpages/Error503.jsx";
import Error504 from "./components/errorpages/Error504.jsx";

import "./App.css";

function App(){
 const navigate=useNavigate();
 const location=useLocation();

 // Helper: locate the stored authenticated user
 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    if(parsed?._id||parsed?.username||parsed?.email)return parsed;
    if(parsed?.user?._id||parsed?.user?.username||parsed?.user?.email)return parsed.user;
    if(parsed?.data?._id||parsed?.data?.username||parsed?.data?.email)return parsed.data;
   }catch(error){
    console.error(`Failed to parse stored user from ${key}`,error);
   }
  }

  return null;
 };

 // Helper: normalize IDs from user records
 const getObjectId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value.toLowerCase();
  return String(value?._id?.$oid||value?._id||value?.id?.$oid||value?.id||value?.$oid||"").toLowerCase();
 };

 const [headerTitle,setHeaderTitle]=useState("");
 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);

 useEffect(()=>{
  queueMicrotask(()=>setUser(getStoredUser()));
 },[location.pathname]);

 useEffect(()=>{
  let ignore=false;

  const loadBusinessTheme=async()=>{
   try{
    const response=await fetch("/api/app/current-business/pro-edge-knife-system",{
     headers:{"Content-Type":"application/json"}
    });

    if(response.status===404){
     if(!ignore)clearBusinessTheme();
     return;
    }

    if(!response.ok)throw new Error("Failed to load current app business");

    const data=await response.json();
    const business=data?.business||data?.data||data;

    if(!ignore&&business)applyBusinessTheme(business);
   }catch(error){
    console.error("Business theme load failed",error);
    if(!ignore)clearBusinessTheme();
   }
  };

  loadBusinessTheme();

  return()=>{
   ignore=true;
  };
 },[]);

 const roleCandidates=[
  user?.role,
  user?.roleId,
  user?.currentRole,
  user?.activeRole,
  ...(user?.roleAssignments||[]).map(item=>item.role),
  ...(user?.userRoleAssignments||[]).map(item=>item.role)
 ];

 const adminRoleIds=[
  "69edf92e1e6593dd5369f718",
  "69edf92e1e6593dd5369f719",
  "69edf92e1e6593dd5369f71a",
  "69d389f609a4ebea1c3f634e",
  "69d389f609a4ebea1c3f634f",
  "69d46bce86ec944e3cab4566"
 ];

 const roleNames=roleCandidates.map(role=>String(
  role?.name||
  role?.title||
  role?.label||
  (typeof role==="string"&&!/^[a-f\d]{24}$/i.test(role)?role:"")
 ).toLowerCase());

 const roleIds=roleCandidates.map(getObjectId);
 const isAdmin=Boolean(user)&&(
  getObjectId(user)==="69af088d21b4580a8cb6614b"||
  roleIds.some(id=>adminRoleIds.includes(id))||
  roleNames.some(name=>["owner","business owner","app owner","super admin","admin","administrator","manager"].includes(name))
 );

 const handleLogout=()=>{
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("authUser");
  localStorage.removeItem("currentUser");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("authUser");
  sessionStorage.removeItem("currentUser");

  setUser(null);
  navigate("/",{replace:true});
 };

 return(
  <div className="app-layout">
   <Header userDetails={user} onTitleChange={setHeaderTitle}/>

   <Navigation
    user={user}
    isAdmin={isAdmin}
    onLogout={handleLogout}
    brand={headerTitle||"Pro Edge Knife System"}
   />

   <main className="app-content">
    <Routes>
     {/* App pages */}
     <Route path="/" element={<Home title={headerTitle||"Pro Edge Knife System"}/>}/>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/tiers" element={<Tiers/>}/>
     <Route path="/custom-builder" element={<CustomBuilder/>}/>
     <Route path="/orders" element={<Orders/>}/>

     {/* Reference and information pages */}
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>

     {/* Users */}
     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>
     <Route path="/permissions" element={<PermissionMatrix/>}/>

     {/* Admin */}
     <Route path="/admin" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/knife-types" element={<KnifeTypesAdmin/>}/>
     <Route path="/admin/tiers" element={<TiersAdmin/>}/>
     <Route path="/admin/businesses" element={<Businesses/>}/>
     <Route path="/admin/business-types" element={<BusinessTypes/>}/>
     <Route path="/admin/app-keys" element={<AppKeys/>}/>
     <Route path="/admin/footers" element={<Footers/>}/>
     <Route path="/admin/seasons" element={<Seasons/>}/>
     <Route path="/admin/holidays" element={<Holidays/>}/>
     <Route path="/admin/occasions" element={<Occasions/>}/>
     <Route path="/admin/taglines" element={<Taglines/>}/>
     <Route path="/admin/tax-rates" element={<TaxRatesPage/>}/>
     <Route path="/admin/business-roles-permissions" element={<BusinessRolesPermissionsPage/>}/>

     {/* Error pages */}
     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>

     {/* Catch all */}
     <Route path="*" element={<Error404/>}/>
    </Routes>
   </main>

   <Footer variant="site" title={headerTitle||"Pro Edge Knife System"}/>
  </div>
 );
}

export default App;
