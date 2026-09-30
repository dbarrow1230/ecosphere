// src/App.jsx
import {Routes,Route,useNavigate,useLocation,Navigate} from "react-router-dom";
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
import Menus from "./pages/Menus";
import ReminderPage from "./pages/ReminderPage";
import CateringOrderForm from "./pages/forms/CateringOrderForm.jsx";
import CateringContractForm from "./pages/forms/CateringContractForm.jsx";
import EventForm from "./pages/forms/EventForm.jsx";
import ClientForm from "./pages/forms/ClientForm.jsx";
import InventoryItemForm from "./pages/forms/InventoryItemForm.jsx";
import MenuForm from "./pages/forms/MenuForm.jsx";

//events
import Events from "./pages/admin/Events.jsx";

//clients
import Clients from "./pages/admin/Clients.jsx";
import Orders from "./pages/admin/Orders.jsx";
import Contracts from "./pages/admin/Contracts.jsx";

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
import Inventory from "./pages/admin/Inventory.jsx";
import Reports from "./pages/admin/Reports.jsx";
import MenuManager from "./pages/admin/MenuManager.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";

//referenece
import WinePairing from "./pages/referance/winePairing.jsx";

//users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";


//error pages
import Error400 from "./components/errorpages/Error400";
import Error401 from "./components/errorpages/Error401";
import Error403 from "./components/errorpages/Error403";
import Error404 from "./components/errorpages/Error404";
import Error500 from "./components/errorpages/Error500";
import Error502 from "./components/errorpages/Error502";
import Error503 from "./components/errorpages/Error503";
import Error504 from "./components/errorpages/Error504";

function ProtectedRoute({user,children}){
 const hasToken=!!(localStorage.getItem("token")||sessionStorage.getItem("token"));

 if(!user&&!hasToken){
  return <Navigate to="/login" replace/>;
 }

 return children;
}

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

 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data?.business&&typeof data.business==="object")return data.business;
  if(data?.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 const getRuntimeAppKey=()=>{
  const meta=document.querySelector('meta[name="app-key"]');
  const candidates=[
   import.meta.env?.VITE_APP_KEY,
   import.meta.env?.VITE_APP_CODE,
   import.meta.env?.VITE_BUSINESS_CODE,
   window?.APP_CONFIG?.APP_KEY,
   window?.APP_CONFIG?.APP_CODE,
   window?.APP_CONFIG?.BUSINESS_CODE,
   meta?.getAttribute("content"),
   "catering-management"
  ];

  return String(candidates.find(value=>String(value||"").trim())||"")
   .trim()
   .toLowerCase();
 };

 const [headerTitle,setHeaderTitle]=useState("");
 const [businessTitle,setBusinessTitle]=useState("");
 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);

 useEffect(()=>{
  setUser(getStoredUser());
 },[location.pathname]);

 useEffect(()=>{
  const appKey=getRuntimeAppKey();

  if(!appKey){
   clearBusinessTheme();
   return;
  }

  let ignore=false;

  const loadBusinessTheme=async()=>{
   try{
    const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
     headers:{"Content-Type":"application/json"}
    });

    if(res.status===404){
     if(!ignore)clearBusinessTheme();
     return;
    }

    if(!res.ok)throw new Error("Failed to load current app business");

    const data=await res.json();
    const business=unwrapBusiness(data);

    if(ignore)return;
    if(!business){
     clearBusinessTheme();
     setBusinessTitle("");
     return;
    }

    applyBusinessTheme(business);
    setBusinessTitle(business.legalName||business.name||business.title||"");
   }catch(err){
    console.error("Business theme load failed",err);
    if(!ignore){
     clearBusinessTheme();
     setBusinessTitle("");
    }
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
   <Header title={businessTitle||undefined} onTitleChange={setHeaderTitle}/>
    <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>
   <main className="app-content">
    <Routes>
     <Route path="/events" element={<ProtectedRoute user={user}><Events/></ProtectedRoute>}/>
     <Route path="/events/new" element={<ProtectedRoute user={user}><EventForm/></ProtectedRoute>}/>
     <Route path="/events/:id" element={<ProtectedRoute user={user}><EventForm/></ProtectedRoute>}/>
     <Route path="/events/:id/edit" element={<ProtectedRoute user={user}><EventForm/></ProtectedRoute>}/>
     <Route path="/clients" element={<ProtectedRoute user={user}><Clients/></ProtectedRoute>}/>
     <Route path="/clients/new" element={<ProtectedRoute user={user}><ClientForm/></ProtectedRoute>}/>
     <Route path="/clients/:id" element={<ProtectedRoute user={user}><ClientForm/></ProtectedRoute>}/>
     <Route path="/clients/:id/edit" element={<ProtectedRoute user={user}><ClientForm/></ProtectedRoute>}/>
     <Route path="/menus" element={<Menus/>}/>
     <Route path="/orders" element={<ProtectedRoute user={user}><Orders/></ProtectedRoute>}/>
     <Route path="/orders/new" element={<ProtectedRoute user={user}><CateringOrderForm/></ProtectedRoute>}/>
     <Route path="/orders/:id" element={<ProtectedRoute user={user}><CateringOrderForm readOnly/></ProtectedRoute>}/>
     <Route path="/orders/:id/edit" element={<ProtectedRoute user={user}><CateringOrderForm/></ProtectedRoute>}/>
     <Route path="/contracts" element={<ProtectedRoute user={user}><Contracts/></ProtectedRoute>}/>
     <Route path="/contracts/new" element={<ProtectedRoute user={user}><CateringContractForm/></ProtectedRoute>}/>
     <Route path="/contracts/:id" element={<ProtectedRoute user={user}><CateringContractForm readOnly/></ProtectedRoute>}/>
     <Route path="/contracts/:id/edit" element={<ProtectedRoute user={user}><CateringContractForm/></ProtectedRoute>}/>
     <Route path="/inventory" element={<ProtectedRoute user={user}><Inventory/></ProtectedRoute>}/>
     <Route path="/inventory/new" element={<ProtectedRoute user={user}><InventoryItemForm/></ProtectedRoute>}/>
     <Route path="/inventory/:id" element={<ProtectedRoute user={user}><InventoryItemForm/></ProtectedRoute>}/>
     <Route path="/inventory/:id/edit" element={<ProtectedRoute user={user}><InventoryItemForm/></ProtectedRoute>}/>
     <Route path="/reports" element={<ProtectedRoute user={user}><Reports/></ProtectedRoute>}/>
     <Route path="/admin/menus" element={<ProtectedRoute user={user}><MenuManager/></ProtectedRoute>}/>
     <Route path="/admin/menus/new" element={<ProtectedRoute user={user}><MenuForm/></ProtectedRoute>}/>
     <Route path="/admin/menus/:id" element={<ProtectedRoute user={user}><MenuForm/></ProtectedRoute>}/>
     <Route path="/admin/menus/:id/edit" element={<ProtectedRoute user={user}><MenuForm/></ProtectedRoute>}/>

      <Route path="/" element={<Home title={headerTitle}/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user}/></ProtectedRoute>}/>
     <Route path="/wine-pairing" element={<WinePairing/>}/>
      <Route path="/reminders" element={<ProtectedRoute user={user}><ReminderPage user={user}/></ProtectedRoute>}/>
        <Route path="/catering-order" element={<CateringOrderForm/>}/>
        <Route path="/catering-contract" element={<CateringContractForm/>}/>
 {/**User */}
     <Route path="/users" element={<ProtectedRoute user={user}><Users/></ProtectedRoute>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
         <Route path="/profile" element={<ProtectedRoute user={user}><UserProfilePage/></ProtectedRoute>}/>

    {/**Admin */}
     <Route path="/admin" element={<ProtectedRoute user={user}><AdminDashboard user={user}/></ProtectedRoute>}/>
     <Route path="/admin/dashboard" element={<ProtectedRoute user={user}><AdminDashboard user={user}/></ProtectedRoute>}/>
     <Route path="/admin/businesses" element={<ProtectedRoute user={user}><Businesses/></ProtectedRoute>}/>
     <Route path="/admin/business-types" element={<ProtectedRoute user={user}><BusinessTypes/></ProtectedRoute>}/>
     <Route path="/admin/app-keys" element={<ProtectedRoute user={user}><AppKeys/></ProtectedRoute>}/>
     <Route path="/admin/footers" element={<ProtectedRoute user={user}><Footers/></ProtectedRoute>}/>
     <Route path="/admin/seasons" element={<ProtectedRoute user={user}><Seasons/></ProtectedRoute>}/>
     <Route path="/admin/holidays" element={<ProtectedRoute user={user}><Holidays/></ProtectedRoute>}/>
     <Route path="/admin/occasions" element={<ProtectedRoute user={user}><Occasions/></ProtectedRoute>}/>
     <Route path="/admin/taglines" element={<ProtectedRoute user={user}><Taglines/></ProtectedRoute>}/>
     <Route path="/admin/vendors" element={<ProtectedRoute user={user}><Vendors/></ProtectedRoute>}/>
     <Route path="/admin/business-roles-permissions" element={<ProtectedRoute user={user}><BusinessRolesPermissionsPage/></ProtectedRoute>}/>
     <Route path="/admin/inventory" element={<ProtectedRoute user={user}><Inventory/></ProtectedRoute>}/>
     <Route path="/admin/reports" element={<ProtectedRoute user={user}><Reports/></ProtectedRoute>}/>
     <Route path="/admin/tax-rates" element={<ProtectedRoute user={user}><TaxRatesPage/></ProtectedRoute>}/>
     <Route path="/permissions" element={<ProtectedRoute user={user}><BusinessRolesPermissionsPage/></ProtectedRoute>}/>

        {/**Reference */}
     <Route path="/reference/wine-pairing" element={<WinePairing/>}/>


     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>

     {/**Catch All */}
     <Route path="*" element={<Error404/>}/>
    </Routes>
   </main>
   <Footer variant="site" title={headerTitle}/>
  </div>
 );
}

export default App;
