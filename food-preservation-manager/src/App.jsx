// src/App.jsx
import {Routes,Route,useNavigate,useLocation,Navigate,Link} from "react-router-dom";
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
import EnergyDashboard from "./pages/EnergyDashboard";
import DehydrationProjectsPage from "./pages/DehydrationProjectsPage";
import ElectricityAccountPage from "./pages/ElectricityAccountPage";
import DehydratorsPage from "./pages/DehydratorsPage";
import SaltPercentageCalculator from "./pages/refrenence/SaltPercentageCalculator.jsx";

//forms
import DehydrationSetupForm from "./pages/forms/DehydrationSetupForm.jsx";

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
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";
import AllergensPage from "./pages/allergens.jsx";
import AllergenForm from "./pages/admin/AllergenForm.jsx";
import Clients from "./pages/admin/Clients.jsx";
import Events from "./pages/admin/Events.jsx";
import Inventory from "./pages/admin/Inventory.jsx";
import MenuManager from "./pages/admin/MenuManager.jsx";
import Orders from "./pages/admin/Orders.jsx";
import ProductBatches from "./pages/admin/ProductBatches.jsx";
import Products from "./pages/admin/Products.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Statuses from "./pages/admin/Statuses.jsx";
import StorageLocations from "./pages/admin/StorageLocations.jsx";
import Suppliers from "./pages/admin/Suppliers.jsx";

//users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PermissionMatrix from "./pages/admin/users/PermissionMatrix";

//error pages
import Error400 from "./components/errorpages/Error400";
import Error401 from "./components/errorpages/Error401";
import Error403 from "./components/errorpages/Error403";
import Error404 from "./components/errorpages/Error404";
import Error500 from "./components/errorpages/Error500";
import Error502 from "./components/errorpages/Error502";
import Error503 from "./components/errorpages/Error503";
import Error504 from "./components/errorpages/Error504";


function RequireAuth({user,children}){
 const location=useLocation();
 return user?children:<Navigate to="/login" replace state={{from:location.pathname}}/>;
}

function App(){

 const navigate=useNavigate();
 const location=useLocation();

 const getObjectId=value=>{
  if(!value)return "";

  if(typeof value==="string")return value;

  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid;
   if(typeof value._id==="string")return value._id;
   if(typeof value.id==="string")return value.id;
   if(typeof value._id?.$oid==="string")return value._id.$oid;
   if(typeof value.id?.$oid==="string")return value.id.$oid;
  }

  return "";
 };

 const normalizeStoredUser=value=>{
  if(!value||typeof value!=="object")return null;

  const userId=getObjectId(value);
  const roleId=getObjectId(value.role);
  const detailsId=getObjectId(value.details);

  const normalizedUser={
   ...value,
   _id:userId,
   id:userId,
   role:roleId||value.role||"",
   details:detailsId||value.details||null
  };

  if(normalizedUser?._id||normalizedUser?.id||normalizedUser?.username||normalizedUser?.email)return normalizedUser;

  return null;
 };

 const getStoredUser=()=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key)||sessionStorage.getItem(key);
    if(!raw)continue;

    const parsed=JSON.parse(raw);

    const directUser=normalizeStoredUser(parsed);
    if(directUser)return directUser;

    const nestedUser=normalizeStoredUser(parsed?.user);
    if(nestedUser)return nestedUser;

    const dataUser=normalizeStoredUser(parsed?.data);
    if(dataUser)return dataUser;
   }catch(err){
    console.error(`Failed to parse stored user from ${key}`,err);
   }
  }

  return null;
 };

 const saveStoredUser=updatedUser=>{
  const keys=["userInfo","user","authUser","currentUser"];

  for(const key of keys){
   try{
    const raw=localStorage.getItem(key);

    if(raw){
     const parsed=JSON.parse(raw);

     if(parsed?.user){
      localStorage.setItem(key,JSON.stringify({...parsed,user:updatedUser}));
     }
     else if(parsed?.data){
      localStorage.setItem(key,JSON.stringify({...parsed,data:updatedUser}));
     }
     else{
      localStorage.setItem(key,JSON.stringify(updatedUser));
     }
    }

    const sessionRaw=sessionStorage.getItem(key);

    if(sessionRaw){
     const parsed=JSON.parse(sessionRaw);

     if(parsed?.user){
      sessionStorage.setItem(key,JSON.stringify({...parsed,user:updatedUser}));
     }
     else if(parsed?.data){
      sessionStorage.setItem(key,JSON.stringify({...parsed,data:updatedUser}));
     }
     else{
      sessionStorage.setItem(key,JSON.stringify(updatedUser));
     }
    }
   }catch(err){
    console.error(`Failed to update stored user from ${key}`,err);
   }
  }
 };

 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);
 const [headerTitle,setHeaderTitle]=useState("");

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
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   setUser(getStoredUser());
  },0);

  return()=>window.clearTimeout(timer);
 },[location.pathname]);

 useEffect(()=>{
  const currentUser=getStoredUser();
  const userId=getObjectId(currentUser);

  if(!userId)return;

  let ignore=false;

  const loadCurrentUser=async()=>{
   try{
    const res=await fetch(`/api/users/${userId}`);
    const data=await res.json();

    if(!res.ok)return;

    const loadedUser=data.data||data.user||data;

    if(ignore||!loadedUser)return;

    const refreshedUser={
     ...loadedUser,
     currentBusiness:getObjectId(loadedUser.currentBusiness)||getObjectId(currentUser?.currentBusiness)||getObjectId(currentUser?.business)||getObjectId(currentUser?.businessRef)||"",
     roleAssignments:loadedUser.roleAssignments||currentUser?.roleAssignments||currentUser?.userRoleAssignments||[],
     userRoleAssignments:loadedUser.userRoleAssignments||currentUser?.userRoleAssignments||currentUser?.roleAssignments||[]
    };

    setUser(refreshedUser);
    saveStoredUser(refreshedUser);
   }catch(err){
    console.error("Current user refresh failed",err);
   }
  };

  loadCurrentUser();

  return()=>{
   ignore=true;
  };
 },[location.pathname]);

 useEffect(()=>{
  const fieldSelector="input.form-control, select.form-select, textarea.form-control";

  const markFieldTouched=field=>{
   field.dataset.validationTouched="true";
  };

  const fieldWasTouched=field=>{
   return field.dataset.validationTouched==="true";
  };

  const validateField=field=>{
   field.classList.remove("is-valid","is-invalid");

   if(field.disabled||field.readOnly)return;

   if(!field.checkValidity()){
    field.classList.add("is-invalid");
    return;
   }

   if(fieldWasTouched(field)&&(field.required||String(field.value||"").trim()))field.classList.add("is-valid");
  };

  const prepareForms=()=>{
   document.querySelectorAll("form").forEach(form=>{
    if(form.dataset.skipBootstrapValidation==="true")return;

    form.noValidate=true;
   });
  };

  const handleFieldInput=event=>{
   const field=event.target;

   if(field instanceof HTMLElement&&field.matches(fieldSelector)){
    markFieldTouched(field);
    validateField(field);
   }
  };

  const handleFormSubmit=event=>{
   const form=event.target;

   if(!(form instanceof HTMLFormElement)||form.dataset.skipBootstrapValidation==="true")return;

   form.noValidate=true;
   form.querySelectorAll(fieldSelector).forEach(field=>validateField(field));

   if(!form.checkValidity()){
    event.preventDefault();
    event.stopPropagation();
   }
  };

  prepareForms();

  const observer=new MutationObserver(prepareForms);
  observer.observe(document.body,{childList:true,subtree:true});

  document.addEventListener("input",handleFieldInput,true);
  document.addEventListener("change",handleFieldInput,true);
  document.addEventListener("submit",handleFormSubmit,true);

  return()=>{
   observer.disconnect();
   document.removeEventListener("input",handleFieldInput,true);
   document.removeEventListener("change",handleFieldInput,true);
   document.removeEventListener("submit",handleFormSubmit,true);
  };
 },[]);

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
     return;
    }

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
   <Header userDetails={user} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>

   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    {location.pathname.startsWith("/admin/")&&location.pathname!=="/admin/dashboard"&&location.pathname!=="/admin"?
     <div className="admin-back-row">
      <Link className="btn btn-outline-primary btn-sm" to="/admin/dashboard">Back to Admin Dashboard</Link>
     </div>
    :null}

    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/salt-percentage-calculator" element={<SaltPercentageCalculator/>}/>

     {/** Dashboards */}
     <Route path="/dashboard" element={<Dashboard/>}/>
     <Route path="/energy-dashboard" element={<EnergyDashboard/>}/>

     {/** Food Preservation Pages */}
     <Route path="/electricity-accounts" element={<ElectricityAccountPage/>}/>
     <Route path="/dehydration/projects" element={<DehydrationProjectsPage/>}/>
     <Route path="/dehydrators" element={<DehydratorsPage/>}/>

     {/** Forms */}
     <Route path="/dehydration-setups" element={<DehydrationSetupForm/>}/>
     <Route path="/dehydration-setups/new" element={<DehydrationSetupForm/>}/>
     <Route path="/dehydration-setups/:id" element={<DehydrationSetupForm/>}/>
     <Route path="/dehydration-setups/:id/edit" element={<DehydrationSetupForm/>}/>

     {/** User */}
     <Route path="/users" element={<RequireAuth user={user}><Users/></RequireAuth>}/>
     <Route path="/admin/users" element={<RequireAuth user={user}><Users/></RequireAuth>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<RequireAuth user={user}><PermissionMatrix/></RequireAuth>}/>
     <Route path="/profile" element={<RequireAuth user={user}><UserProfilePage/></RequireAuth>}/>

     {/** Admin */}
     <Route path="/admin" element={<RequireAuth user={user}><AdminDashboard user={user}/></RequireAuth>}/>
     <Route path="/admin/dashboard" element={<RequireAuth user={user}><AdminDashboard user={user}/></RequireAuth>}/>
     <Route path="/admin/businesses" element={<RequireAuth user={user}><Businesses/></RequireAuth>}/>
     <Route path="/admin/business-types" element={<RequireAuth user={user}><BusinessTypes/></RequireAuth>}/>
     <Route path="/admin/app-keys" element={<RequireAuth user={user}><AppKeys/></RequireAuth>}/>
     <Route path="/admin/footers" element={<RequireAuth user={user}><Footers/></RequireAuth>}/>
     <Route path="/admin/seasons" element={<RequireAuth user={user}><Seasons/></RequireAuth>}/>
     <Route path="/admin/holidays" element={<RequireAuth user={user}><Holidays/></RequireAuth>}/>
     <Route path="/admin/occasions" element={<RequireAuth user={user}><Occasions/></RequireAuth>}/>
     <Route path="/admin/taglines" element={<RequireAuth user={user}><Taglines/></RequireAuth>}/>
     <Route path="/admin/vendors" element={<RequireAuth user={user}><Vendors/></RequireAuth>}/>
     <Route path="/admin/tax-rates" element={<RequireAuth user={user}><TaxRatesPage/></RequireAuth>}/>
     <Route path="/admin/business-roles-permissions" element={<RequireAuth user={user}><BusinessRolesPermissionsPage/></RequireAuth>}/>
     <Route path="/admin/allergens" element={<RequireAuth user={user}><AllergensPage/></RequireAuth>}/>
     <Route path="/admin/allergens/new" element={<RequireAuth user={user}><AllergenForm/></RequireAuth>}/>
     <Route path="/admin/allergens/:id/edit" element={<RequireAuth user={user}><AllergenForm/></RequireAuth>}/>
     <Route path="/admin/clients" element={<RequireAuth user={user}><Clients/></RequireAuth>}/>
     <Route path="/admin/events" element={<RequireAuth user={user}><Events/></RequireAuth>}/>
     <Route path="/admin/inventory" element={<RequireAuth user={user}><Inventory/></RequireAuth>}/>
     <Route path="/admin/menus" element={<RequireAuth user={user}><MenuManager/></RequireAuth>}/>
     <Route path="/admin/orders" element={<RequireAuth user={user}><Orders/></RequireAuth>}/>
     <Route path="/admin/product-batches" element={<RequireAuth user={user}><ProductBatches/></RequireAuth>}/>
     <Route path="/admin/products" element={<RequireAuth user={user}><Products/></RequireAuth>}/>
     <Route path="/admin/reports" element={<RequireAuth user={user}><Reports/></RequireAuth>}/>
     <Route path="/admin/statuses" element={<RequireAuth user={user}><Statuses/></RequireAuth>}/>
     <Route path="/admin/storage-locations" element={<RequireAuth user={user}><StorageLocations/></RequireAuth>}/>
     <Route path="/admin/suppliers" element={<RequireAuth user={user}><Suppliers/></RequireAuth>}/>

     {/** Error Pages */}
     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>

     {/** Catch All */}
     <Route path="*" element={<Error404/>}/>
    </Routes>
   </main>

   <Footer variant="app" title={headerTitle}/>
  </div>
 );
}

export default App;
