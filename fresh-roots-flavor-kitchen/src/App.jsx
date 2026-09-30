import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {useState,useEffect} from "react";
import {applyBusinessTheme} from "./utils/applyBusinessTheme.js";
import {getRuntimeAppKey,loadCurrentBusiness} from "./utils/currentBusiness.js";

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

//menu
import Menu from "./pages/menu/Menu.jsx";

//inventory
import Inventory from "./pages/inventory/Inventory.jsx";

//orders
import Orders from "./pages/orders/Orders.jsx";

//calendar
import Calendar from "./pages/calendar/Calendar.jsx";

//forms

//admin
import Dashboard from "./pages/Dashboard";

//staff
import Staff from "./pages/staff/Staff.jsx";
import Scheduler from "./pages/staff/Scheduler.jsx";



//users
import Users from "./pages/users/Users";
import Login from "./pages/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PermissionMatrix from "./pages/users/PermissionMatrix";
import ReminderPage from "./pages/ReminderPage.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";
import Businesses from "./pages/admin/Businesses.jsx";
import Clients from "./pages/admin/Clients.jsx";
import Events from "./pages/admin/Events.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import AdminInventory from "./pages/admin/Inventory.jsx";
import MenuManager from "./pages/admin/MenuManager.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";
import Vendors from "./pages/admin/Vendors.jsx";
import AdminUsers from "./pages/admin/users/Users.jsx";

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
 const [business,setBusiness]=useState(null);

 useEffect(()=>{
  const appKey=getRuntimeAppKey();
  if(!appKey){
   console.error("Theme loading skipped because the runtime app key is not configured.");
   return;
  }

  let ignore=false;
  let retryTimer=null;
  const retryDelays=[0,400,1000,2000,4000];

  const loadTheme=async attempt=>{
   try{
    const business=await loadCurrentBusiness();
    if(!ignore){
     applyBusinessTheme(business);
     setBusiness(business);
    }
   }catch(error){
    if(ignore)return;
    if(attempt<retryDelays.length-1){
     retryTimer=window.setTimeout(()=>loadTheme(attempt+1),retryDelays[attempt+1]);
     return;
    }
    console.error(`Failed to load the business theme for ${appKey}.`,error);
   }
  };

  loadTheme(0);

  return()=>{
   ignore=true;
   if(retryTimer)window.clearTimeout(retryTimer);
  };
 },[]);

 const navigate=useNavigate();
  const location=useLocation();
  
   const getStoredUser=()=>{
     const keys=["userInfo","user","authUser","currentUser"];
     
       for(const key of keys){
          try{
              const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
              
                  if(!raw){
                       continue;
                           }
                           
                               const parsed=JSON.parse(raw);
                               
                                   if(parsed?._id||parsed?.username||parsed?.email){
                                        return parsed;
                                            }
                                            
                                                if(parsed?.user?._id||parsed?.user?.username||parsed?.user?.email){
     return parsed.user;
    }

    if(parsed?.data?._id||parsed?.data?.username||parsed?.data?.email){
     return parsed.data;
    }
   }
   catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const [user,setUser]=useState(()=>getStoredUser());

 const businessAddress=[business?.addressLine1,business?.addressLine2,business?.city,business?.stateRef?.abbreviation||business?.stateRef?.name,business?.postalCode,business?.countryRef?.name].filter(Boolean).join(", ");
 const businessLogo=business?.logo?(/^([a-z]+:|\/)/i.test(business.logo)?business.logo:`/logos/${business.logo}`):undefined;

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

   <Header logoSrc={businessLogo} logoAlt={business?.legalName?`${business.legalName} logo`:"Fresh Roots Flavor Kitchen logo"} eyebrow={business?.taglineId?.text||undefined} title={business?.legalName||undefined}/>
   <Navigation user={user} onLogout={handleLogout} brand="Home"/>
   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard/>}/>
    
    {/**Menu */}
        <Route path="/menu" element={<Menu/>}/>

        {/*inventory */}
        <Route path="/inventory" element={<Inventory/>}/>
        <Route path="/inventory/new" element={<Inventory/>}/>
        <Route path="/inventory/restock" element={<Inventory/>}/>
            {/*orders */}
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/orders/new" element={<Orders/>}/>
        <Route path="/orders/history" element={<Orders/>}/>
            {/*calendar */}
        <Route path="/calendar" element={<Calendar/>}/>

     {/**Forms */}
     

     {/**User */}
     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<PermissionMatrix/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>
     <Route path="/reminders" element={<ReminderPage/>}/>

{/**Admin */}
      <Route path="/admin" element={<AdminDashboard user={user}/>}/>
      <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
      <Route path="/admin/app-keys" element={<AppKeys/>}/>
      <Route path="/admin/business-types" element={<BusinessTypes/>}/>
      <Route path="/admin/business-roles-permissions" element={<BusinessRolesPermissionsPage/>}/>
      <Route path="/admin/businesses" element={<Businesses/>}/>
      <Route path="/admin/clients" element={<Clients/>}/>
      <Route path="/admin/events" element={<Events/>}/>
      <Route path="/admin/footers" element={<Footers/>}/>
      <Route path="/admin/holidays" element={<Holidays/>}/>
      <Route path="/admin/inventory" element={<AdminInventory/>}/>
      <Route path="/admin/menu" element={<MenuManager/>}/>
      <Route path="/admin/occasions" element={<Occasions/>}/>
      <Route path="/admin/orders" element={<AdminOrders/>}/>
      <Route path="/admin/reports" element={<Reports/>}/>
      <Route path="/admin/seasons" element={<Seasons/>}/>
      <Route path="/admin/taglines" element={<Taglines/>}/>
      <Route path="/admin/tax-rates" element={<TaxRatesPage/>}/>
      <Route path="/admin/vendors" element={<Vendors/>}/>
      <Route path="/admin/users" element={<AdminUsers/>}/>
      <Route path="/staff" element={<Staff/>}/>
      <Route path="/staff/new" element={<Staff/>}/>
      <Route path="/scheduler" element={<Scheduler/>}/>
      <Route path="/staff/schedule" element={<Scheduler/>}/>
  

     {/**Error Pages */}
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

    <Footer variant="site" mapQuery={businessAddress||undefined} branding={business?.legalName||"Fresh Roots Flavor Kitchen"} phone={business?.phone||""} fax={business?.fax||""} email={business?.email||""}/>

  </div>
 );

}

export default App;
