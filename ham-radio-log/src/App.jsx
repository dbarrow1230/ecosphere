// src/App.jsx
import {Link,Navigate,Route,Routes,useLocation,useNavigate} from "react-router-dom";
import {useEffect,useState} from "react";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

//components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import PermissionRoute from "./components/PermissionRoute.jsx";

//pages
import Home from "./pages/Home.jsx";
import HamRadioDashboard from "./pages/HamRadioDashboard.jsx";
import HamRadioLogbook from "./pages/HamRadioLogbook.jsx";
import ContactUs from "./pages/contactus.jsx";
import FAQ from "./pages/faq.jsx";
import Privacy from "./pages/privacy.jsx";
import TermsOfService from "./pages/termsofservice.jsx";
import About from "./pages/about.jsx";

//morse
import MorsePracticePage from "./pages/MorsePracticePage.jsx";
import MorsePracticeLibrary from "./pages/MorsePracticeLibrary.jsx";
import MorsePracticeReview from "./pages/MorsePracticeReview.jsx";
import MorseLearningPage from "./pages/MorseLearningPage.jsx";

//reference
import RadioTermsReferencePage from "./pages/reference/RadioTermsReferencePage.jsx";
import AntennaReferencePage from "./pages/reference/AntennaReferencePage.jsx";
import CwReferencePage from "./pages/reference/CwReferencePage.jsx";
import TechnicalReferencePage from "./pages/reference/TechnicalReferencePage.jsx";
import FrequencyReferencePage from "./pages/reference/FrequencyReferencePage.jsx";
import PhoneticAlphabetReferencePage from "./pages/reference/PhoneticAlphabetReferencePage.jsx";
import MarineCodesReferencePage from "./pages/reference/MarineCodesReferencePage.jsx";
import NycPoliceTenCodesPage from "./pages/reference/NycPoliceTenCodesPage.jsx";
import ReferenceOrganizationsPage from "./pages/reference/ReferenceOrganizationsPage.jsx";

//admin
import AdminDashboard from "./pages/admin/Dashboard.jsx";
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
import Vendors from "./pages/admin/Vendors.jsx";

//users
import Users from "./pages/admin/users/Users.jsx";
import Login from "./pages/admin/users/Login.jsx";
import UserProfilePage from "./pages/admin/users/UserProfilePage.jsx";
import PermissionMatrix from "./pages/admin/users/PermissionMatrix.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";

//error pages
import Error400 from "./components/errorpages/Error400.jsx";
import Error401 from "./components/errorpages/Error401.jsx";
import Error403 from "./components/errorpages/Error403.jsx";
import Error404 from "./components/errorpages/Error404.jsx";
import Error500 from "./components/errorpages/Error500.jsx";
import Error502 from "./components/errorpages/Error502.jsx";
import Error503 from "./components/errorpages/Error503.jsx";
import Error504 from "./components/errorpages/Error504.jsx";

const getStoredUser=()=>{
 for(const key of ["userInfo","user","authUser","currentUser"]){
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

const unwrapBusiness=data=>{
 if(!data||typeof data!=="object")return null;
 if(data.business&&typeof data.business==="object")return data.business;
 if(data.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
 return data;
};

const getRuntimeAppKey=()=>{
 const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
 if(envKey)return envKey;
 const configKey=String(window.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
 if(configKey)return configKey;
 return String(document.querySelector('meta[name="app-key"]')?.getAttribute("content")||"").trim().toLowerCase();
};

export default function App(){
 const navigate=useNavigate();
 const location=useLocation();
 const [headerTitle,setHeaderTitle]=useState("");
 const [user,setUser]=useState(getStoredUser);

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);

 useEffect(()=>{setUser(getStoredUser());},[location.pathname]);

 useEffect(()=>{
  const storedUser=getStoredUser();
  const token=localStorage.getItem("token")||sessionStorage.getItem("token");
  const appKey=getRuntimeAppKey();
  if(!storedUser||!token||!appKey)return undefined;

  let ignore=false;

  const ensureAccess=async()=>{
   try{
    const response=await fetch("/api/users/ensure-business-access",{
     method:"POST",
     headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
     body:JSON.stringify({appKey})
    });

    const data=await response.json();
    if(!response.ok)throw new Error(data.message||"Failed to load business access");
    if(ignore||!data.user)return;

    const serialized=JSON.stringify(data.user);

    for(const storage of [localStorage,sessionStorage]){
     if(storage.getItem("token")){
      for(const key of ["user","userInfo","authUser","currentUser"])storage.setItem(key,serialized);
     }
    }

    setUser(data.user);
   }catch(error){
    console.error("Business access load failed",error);
   }
  };

  ensureAccess();

  return()=>{ignore=true;};
 },[]);

 useEffect(()=>{
  const appKey=getRuntimeAppKey();
  if(!appKey){
   clearBusinessTheme();
   return undefined;
  }

  let ignore=false;

  const loadBusinessTheme=async()=>{
   try{
    const response=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`);

    if(response.status===404){
     if(!ignore)clearBusinessTheme();
     return;
    }

    if(!response.ok)throw new Error("Failed to load current app business");

    const business=unwrapBusiness(await response.json());

    if(!ignore){
     if(business)applyBusinessTheme(business);
     else clearBusinessTheme();
    }
   }catch(error){
    console.error("Business theme load failed",error);
    if(!ignore)clearBusinessTheme();
   }
  };

  loadBusinessTheme();

  return()=>{ignore=true;};
 },[]);

 const handleLogout=()=>{
  for(const storage of [localStorage,sessionStorage]){
   for(const key of ["token","user","userInfo","authUser","currentUser"])storage.removeItem(key);
  }

  setUser(null);
  navigate("/",{replace:true});
 };

 return(
  <div className="app-layout">
   <Header userDetails={user} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>

   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    {location.pathname.startsWith("/admin/")&&location.pathname!=="/admin/dashboard"?<div className="admin-back-row"><Link className="btn btn-outline-primary btn-sm" to="/admin/dashboard">Back to Admin Dashboard</Link></div>:null}

    <Routes>
     {/**Main */}
     <Route path="/" element={<Home title={headerTitle||undefined}/>}/>
     <Route path="/dashboard" element={<PermissionRoute user={user} module="dashboard"><HamRadioDashboard user={user}/></PermissionRoute>}/>
     <Route path="/logbook" element={<PermissionRoute user={user} module="qso"><HamRadioLogbook user={user}/></PermissionRoute>}/>

     {/**Morse */}
     <Route path="/morse" element={<Navigate to="/morse/practice" replace/>}/>
     <Route path="/morse/learn" element={<PermissionRoute user={user} module="morse_practice"><MorseLearningPage/></PermissionRoute>}/>
     <Route path="/morse/practice" element={<PermissionRoute user={user} module="morse_practice"><MorsePracticePage currentUser={user}/></PermissionRoute>}/>
     <Route path="/morse/library" element={<PermissionRoute user={user} module="morse_practice"><MorsePracticeLibrary currentUser={user}/></PermissionRoute>}/>
     <Route path="/morse/review" element={<PermissionRoute user={user} module="morse_practice"><MorsePracticeReview currentUser={user}/></PermissionRoute>}/>

     {/**Reference */}
     <Route path="/radio-terms" element={<Navigate to="/references/radio-terms" replace/>}/>
     <Route path="/references/radio-terms" element={<PermissionRoute user={user} module="radio_terms"><RadioTermsReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/antennas" element={<PermissionRoute user={user} module="antenna_reference"><AntennaReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/cw" element={<PermissionRoute user={user} module="cw_reference"><CwReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/technical" element={<PermissionRoute user={user} module="technical_reference"><TechnicalReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/frequencies" element={<PermissionRoute user={user} module="frequency_reference"><FrequencyReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/phonetic-alphabet" element={<PermissionRoute user={user} module="phonetic_alphabet_reference"><PhoneticAlphabetReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/marine-codes" element={<PermissionRoute user={user} module="marine_codes"><MarineCodesReferencePage user={user}/></PermissionRoute>}/>
     <Route path="/references/nyc-police-ten-codes" element={<PermissionRoute user={user} module="nyc_police_codes"><NycPoliceTenCodesPage user={user}/></PermissionRoute>}/>
     <Route path="/references/organizations" element={<PermissionRoute user={user} module="reference_organizations"><ReferenceOrganizationsPage user={user}/></PermissionRoute>}/>

     {/**Public */}
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>

     {/**User */}
     <Route path="/users" element={<Navigate to="/admin/users" replace/>}/>
     <Route path="/admin/users" element={<PermissionRoute user={user} module="users"><Users authenticatedUser={user}/></PermissionRoute>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/profile" element={<PermissionRoute user={user} module="profile"><UserProfilePage/></PermissionRoute>}/>
     <Route path="/permissions" element={<PermissionRoute user={user} module="permission_matrix"><PermissionMatrix/></PermissionRoute>}/>

     {/**Admin */}
     <Route path="/admin" element={<PermissionRoute user={user} module="admin_dashboard"><AdminDashboard user={user}/></PermissionRoute>}/>
     <Route path="/admin/dashboard" element={<PermissionRoute user={user} module="admin_dashboard"><AdminDashboard user={user}/></PermissionRoute>}/>
     <Route path="/admin/businesses" element={<PermissionRoute user={user} module="businesses"><Businesses/></PermissionRoute>}/>
     <Route path="/admin/business-types" element={<PermissionRoute user={user} module="business_types"><BusinessTypes/></PermissionRoute>}/>
     <Route path="/admin/app-keys" element={<PermissionRoute user={user} module="app_keys"><AppKeys/></PermissionRoute>}/>
     <Route path="/admin/footers" element={<PermissionRoute user={user} module="footers"><Footers/></PermissionRoute>}/>
     <Route path="/admin/seasons" element={<PermissionRoute user={user} module="seasons"><Seasons/></PermissionRoute>}/>
     <Route path="/admin/holidays" element={<PermissionRoute user={user} module="holidays"><Holidays/></PermissionRoute>}/>
     <Route path="/admin/occasions" element={<PermissionRoute user={user} module="occasions"><Occasions/></PermissionRoute>}/>
     <Route path="/admin/taglines" element={<PermissionRoute user={user} module="taglines"><Taglines/></PermissionRoute>}/>
     <Route path="/admin/vendors" element={<PermissionRoute user={user} module="vendors"><Vendors/></PermissionRoute>}/>
     <Route path="/admin/tax-rates" element={<PermissionRoute user={user} module="tax_rates"><TaxRatesPage/></PermissionRoute>}/>
     <Route path="/admin/business-roles-permissions" element={<PermissionRoute user={user} module="roles_permissions"><BusinessRolesPermissionsPage/></PermissionRoute>}/>

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