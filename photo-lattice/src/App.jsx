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
import PhotographyDashboard from "./pages/photography/DashboardPage.jsx";
import PhotosPage from "./pages/photography/PhotosPage.jsx";
import AlbumsPage from "./pages/photography/AlbumsPage.jsx";
import ShootsPage from "./pages/photography/ShootsPage.jsx";
import EquipmentPage from "./pages/photography/EquipmentPage.jsx";
import TagsPage from "./pages/photography/TagsPage.jsx";
import PhotographyReminders from "./pages/photography/RemindersPage.jsx";
import ExportPage from "./pages/photography/ExportPage.jsx";

//admin
import AdminDashboard from "./pages/admin/Dashboard";
import Businesses from "./pages/admin/Businesses.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";

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

   if(fieldWasTouched(field))field.classList.add("is-valid");
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
  document.addEventListener("input",handleFieldInput,true);
  document.addEventListener("change",handleFieldInput,true);
  document.addEventListener("submit",handleFormSubmit,true);
  return()=>{
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
   <Header onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>
   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    {location.pathname.startsWith("/admin/")&&location.pathname!=="/admin/dashboard"&&location.pathname!=="/admin"?
     <div className="admin-back-row">
      <Link className="btn btn-outline-primary btn-sm" to="/admin/dashboard">Back to Admin Dashboard</Link>
     </div>
    :null}
    <Routes>
     <Route path="/" element={<Home title={headerTitle||undefined}/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<PhotographyDashboard/>}/>
     <Route path="/photos" element={<PhotosPage/>}/>
     <Route path="/albums" element={<AlbumsPage/>}/>
     <Route path="/shoots" element={<ShootsPage/>}/>
     <Route path="/equipment" element={<EquipmentPage/>}/>
     <Route path="/tags" element={<TagsPage/>}/>
     <Route path="/favorites" element={<PhotosPage view="favorites"/>}/>
     <Route path="/archive" element={<PhotosPage view="archive"/>}/>
     <Route path="/reminders" element={<PhotographyReminders/>}/>
     <Route path="/backups" element={<ExportPage/>}/>

     {/**User */}
     <Route path="/users" element={<Navigate to="/admin/users" replace/>}/>
     <Route path="/admin/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
       <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

     {/**Admin */}
     <Route path="/admin" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
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
   <Footer variant="app" title={headerTitle}/>
  </div>
 );
}

export default App;
