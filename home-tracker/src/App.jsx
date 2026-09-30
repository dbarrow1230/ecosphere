import WorkflowPreview from "../../shared/components/WorkflowPreview.jsx";
// src/App.jsx
import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {useState,useEffect} from "react";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

//components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";

//pages
import Home from "./pages/Home";
import ContactUs from "./pages/contactus";
import FAQ from "./pages/faq";
import Privacy from "./pages/privacy";
import TermsOfService from "./pages/termsofservice";
import About from "./pages/about";
import Dashboard from "./pages/Dashboard";
import HomeInventoryPage from "./pages/home/HomeInventoryPage.jsx";
import HomeReferencePage from "./pages/home/HomeReferencePage.jsx";
import TasksPage from "./pages/task/TasksPage.jsx";

//admin
import AdminDashboard from "./pages/admin/Dashboard";
import Businesses from "./pages/admin/Businesses.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import Vendors from "./pages/admin/Vendors.jsx";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";

//users
import Users from "./pages/users/Users";
import Login from "./pages/users/Login";
import UserProfilePage from "./pages/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PermissionMatrix from "./pages/users/PermissionMatrix";

//error pages
import Error400 from "./components/errorpages/Error400";
import Error401 from "./components/errorpages/Error401";
import Error403 from "./components/errorpages/Error403";
import Error404 from "./components/errorpages/Error404";
import Error500 from "./components/errorpages/Error500";
import Error502 from "./components/errorpages/Error502";
import Error503 from "./components/errorpages/Error503";
import Error504 from "./components/errorpages/Error504";

function App(){

 const navigate=useNavigate();
 const location=useLocation();

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
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const getStoredBusinessId=()=>{
  return localStorage.getItem("activeBusinessId")||sessionStorage.getItem("activeBusinessId")||"";
 };

 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  setUser(getStoredUser());
 },[location.pathname]);

 useEffect(()=>{
  const businessId=getStoredBusinessId();

  if(!businessId){
   clearBusinessTheme();
   return;
  }

  let ignore=false;

  const loadBusinessTheme=async()=>{
   try{
    const res=await fetch(`/api/businesses/${businessId}`,{
     headers:{"Content-Type":"application/json"}
    });

    if(!res.ok)throw new Error("Failed to load business theme");

    const business=await res.json();
    if(ignore)return;

    applyBusinessTheme(business);
   }catch(err){
    console.error("Business theme load failed",err);
    if(!ignore)clearBusinessTheme();
   }
  };

  loadBusinessTheme();

  return()=>{
   ignore=true;
  };
 },[]);

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
   <Header/>
   <Navigation user={user} onLogout={handleLogout} brand="Home"/>

   <main className="app-content">
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/items" element={<HomeInventoryPage mode="all"/>}/>
     <Route path="/items/add" element={<HomeInventoryPage mode="all" startAdding/>}/>
     <Route path="/pantry" element={<HomeInventoryPage mode="pantry"/>}/>
     <Route path="/fridge" element={<HomeInventoryPage mode="fridge"/>}/>
     <Route path="/freezer" element={<HomeInventoryPage mode="freezer"/>}/>
     <Route path="/household" element={<HomeInventoryPage mode="household"/>}/>
     <Route path="/expiring" element={<HomeInventoryPage mode="expiring"/>}/>
     <Route path="/low-stock" element={<HomeInventoryPage mode="lowStock"/>}/>
     <Route path="/shopping-list" element={<HomeInventoryPage mode="shoppingList"/>}/>
     <Route path="/tasks" element={<TasksPage/>}/>
     <Route path="/categories" element={<HomeReferencePage kind="categories"/>}/>
     <Route path="/locations" element={<HomeReferencePage kind="locations"/>}/>
     <Route path="/businesses" element={<Businesses/>}/>

     <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
     <Route path="/admin" element={<PermissionMatrix/>}/>
     <Route path="/admin/businesses" element={<Businesses/>}/>
     <Route path="/admin/business-types" element={<BusinessTypes/>}/>
     <Route path="/admin/app-keys" element={<AppKeys/>}/>
     <Route path="/admin/footers" element={<Footers/>}/>
     <Route path="/admin/seasons" element={<Seasons/>}/>
     <Route path="/admin/holidays" element={<Holidays/>}/>
     <Route path="/admin/occasions" element={<Occasions/>}/>
     <Route path="/admin/taglines" element={<Taglines/>}/>
     <Route path="/admin/vendors" element={<Vendors/>}/>
     <Route path="/admin/business-roles-permissions" element={<BusinessRolesPermissionsPage/>}/>

     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<PermissionMatrix/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>

     <Route path="*" element={<Error404/>}/>
         <Route path="/admin/inventory" element={<HomeInventoryPage mode="all"/>}/>
     <Route path="/equipment" element={<WorkflowPreview key="/equipment" title="Equipment"/>}/>
     <Route path="/hydroponics" element={<WorkflowPreview key="/hydroponics" title="Hydroponics"/>}/>
     <Route path="/diseases" element={<WorkflowPreview key="/diseases" title="Diseases"/>}/>
     <Route path="/pests" element={<WorkflowPreview key="/pests" title="Pests"/>}/>
     <Route path="/journal" element={<WorkflowPreview key="/journal" title="Journal"/>}/>
    </Routes>
   </main>

   <Footer variant="app"/>
  </div>
 );
}

export default App;
