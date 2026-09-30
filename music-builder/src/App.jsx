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
import MusicProjectsPage from "./pages/MusicProjectsPage.jsx";
import ChordIdeasPage from "./pages/ChordIdeasPage.jsx";
import ChordProgressionsPage from "./pages/ChordProgressionsPage.jsx";
import LyricIdeasPage from "./pages/LyricIdeasPage.jsx";
import ArrangementIdeasPage from "./pages/ArrangementIdeasPage.jsx";
import MusicNotesPage from "./pages/MusicNotesPage.jsx";
import CircleReferencePage from "./pages/CircleReferencePage.jsx";
import ChordBuilderPage from "./pages/ChordBuilderPage.jsx";
import ModesReferencePage from "./pages/ModesReferencePage.jsx";
import ChordTypesReferencePage from "./pages/ChordTypesReferencePage.jsx";

// Users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

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

// Error pages
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
 if(!user&&!hasToken)return <Navigate to="/login" replace/>;
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
   }catch(err){console.error(`Failed to parse stored user from ${key}`,err);}
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
   "music-builder"
  ];
  return String(candidates.find(value=>String(value||"").trim())||"").trim().toLowerCase();
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
  const timer=window.setTimeout(()=>setUser(getStoredUser()),0);
  return()=>window.clearTimeout(timer);
 },[location.pathname]);

 useEffect(()=>{
  const handleAuthSync=event=>{
   if(event.source!==window.parent||event.data?.type!=="ECOSPHERE_AUTH_SYNC"||event.data?.version!==1)return;
   const storage=event.data.storage||{};
   for(const [key,value] of Object.entries(storage.localStorage||{}))localStorage.setItem(key,value);
   for(const [key,value] of Object.entries(storage.sessionStorage||{}))sessionStorage.setItem(key,value);
   setUser(getStoredUser());
  };
  window.addEventListener("message",handleAuthSync);
  return()=>window.removeEventListener("message",handleAuthSync);
 },[]);

 useEffect(()=>{
  const appKey=getRuntimeAppKey();
  if(!appKey){clearBusinessTheme();return;}
  let ignore=false;
  const loadBusinessTheme=async()=>{
   try{
    const res=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{headers:{"Content-Type":"application/json"}});
    if(res.status===404){if(!ignore)clearBusinessTheme();return;}
    if(!res.ok)throw new Error("Failed to load current app business");
    const data=await res.json();
    const business=unwrapBusiness(data);
    if(ignore)return;
    if(!business){clearBusinessTheme();setBusinessTitle("");return;}
    applyBusinessTheme(business);
    setBusinessTitle(business.legalName||business.name||business.title||"");
   }catch(err){
    console.error("Business theme load failed",err);
    if(!ignore){clearBusinessTheme();setBusinessTitle("");}
   }
  };
  loadBusinessTheme();
  return()=>{ignore=true;};
 },[]);

 const handleLogout=()=>{
  ["token","user","userInfo","authUser","currentUser"].forEach(key=>{
   localStorage.removeItem(key);
   sessionStorage.removeItem(key);
  });
  setUser(null);
  navigate("/",{replace:true});
 };

 return(
  <div className="app-layout">
   <Header title={businessTitle||undefined} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>
   <main className="app-content">
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user}/></ProtectedRoute>}/>
     <Route path="/music-projects" element={<ProtectedRoute user={user}><MusicProjectsPage/></ProtectedRoute>}/>
     <Route path="/chord-ideas" element={<ProtectedRoute user={user}><ChordIdeasPage/></ProtectedRoute>}/>
     <Route path="/chord-progressions" element={<ProtectedRoute user={user}><ChordProgressionsPage/></ProtectedRoute>}/>
     <Route path="/lyric-ideas" element={<ProtectedRoute user={user}><LyricIdeasPage/></ProtectedRoute>}/>
     <Route path="/arrangement-ideas" element={<ProtectedRoute user={user}><ArrangementIdeasPage/></ProtectedRoute>}/>
     <Route path="/music-notes" element={<ProtectedRoute user={user}><MusicNotesPage/></ProtectedRoute>}/>
     <Route path="/reference/circle-of-fifths" element={<CircleReferencePage/>}/>
     <Route path="/reference/circle-of-fourths" element={<CircleReferencePage/>}/>
     <Route path="/reference/chord-builder" element={<ChordBuilderPage/>}/>
     <Route path="/reference/modes" element={<ModesReferencePage/>}/>
     <Route path="/reference/chord-types" element={<ChordTypesReferencePage/>}/>

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

     {/**Error Pages */}
     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>
     <Route path="*" element={<Error404/>}/>
    </Routes>
   </main>
   <Footer variant="app" title={headerTitle}/>
  </div>
 );
}

export default App;
