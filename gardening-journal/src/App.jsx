// src/App.jsx
import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {useState,useEffect} from "react";
import {Modal,Button} from "react-bootstrap";
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
import Dashboard from "./pages/dashboard.jsx";
import GardeningJournalBoard from "./pages/GardeningJournalBoard.jsx";
import HydroSystemsPage from "./pages/hydroponics/HydroSystemsPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import JournalPage from "./pages/journal/JournalPage.jsx";
import PlantingsPage from "./pages/plantings/PlantingsPage.jsx";
import GardensPage from "./pages/gardens/GardensPage.jsx";
import GardenWorkspacePage from "./pages/gardens/GardenWorkspacePage.jsx";
import SuppliesPage from "./pages/supplies/SuppliesPage.jsx";
import ObservationsPage from "./pages/observations/ObservationsPage.jsx";
import FertilizerApplicationsPage from "./pages/fertilizers/FertilizerApplicationsPage.jsx";
import IssuesPage from "./pages/issues/IssuesPage.jsx";
import HarvestPage from "./pages/harvest/HarvestPage.jsx";

import TasksPage from "./pages/task/TasksPage.jsx";

//reference
import HydroponicCompanionPlantingPage from "./pages/reference/HydroponicCompanionPlantingPage.jsx";
import USDAZonesReference from "./pages/reference/USDAZonesReference.jsx";

//vendors
import EquipmentVendor from "./pages/vendors/equipmentVendor.jsx";
import SeedVendor from "./pages/vendors/seedVendor.jsx";
import SupplyVendor from "./pages/vendors/supplyVendor.jsx";

//diseases
import DiseasesPage from "./pages/diseases/diseases.jsx";
import PestsPage from "./pages/pests/PestsPage.jsx";

//seeds & plants
import SeedPage from "./pages/seeds/SeedPage.jsx";
import SeedCollectionsPage from "./pages/seeds/SeedCollectionsPage.jsx";
import PlantPage from "./pages/plants/PlantPage.jsx";
//users
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
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";
import Inventory from "./pages/admin/inventory/Inventory.jsx";

//forms
import SeedForm from "./pages/forms/seeds/SeedFormPage.jsx";

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
  const hardinessZoneId=getObjectId(value.hardinessZone);

  const normalizedUser={
   ...value,
   _id:userId,
   id:userId,
   role:roleId||value.role||"",
   details:detailsId||value.details||null,
   hardinessZone:hardinessZoneId||value.hardinessZone||null
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

 const [headerTitle,setHeaderTitle]=useState("");
 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);
 const [showReminderModal,setShowReminderModal]=useState(false);
 const [dueReminders,setDueReminders]=useState([]);

 useEffect(()=>{
  setUser(getStoredUser());
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

    setUser(loadedUser);
    saveStoredUser(loadedUser);
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
    if(!business?.themeColors)throw new Error("Business theme missing");

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
  setDueReminders([]);
  setShowReminderModal(false);
  navigate("/",{replace:true});
 };



 return(
  <div className="app-layout">
   <Header userDetails={user||{}} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>
   <main className="app-content">

    <Routes>
    <Route path="/" element={<Home title={headerTitle} user={user}/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>
     <Route path="/journalboard" element={<GardeningJournalBoard user={user}/>}/>
     <Route path="/hydroponics" element={<HydroSystemsPage user={user}/>}/>
     <Route path="/equipment" element={<EquipmentPage user={user}/>}/>
     <Route path="/journal" element={<JournalPage user={user}/>}/>
     <Route path="/plantings" element={<PlantingsPage user={user}/>}/>
     <Route path="/gardens" element={<GardensPage user={user}/>}/>
     <Route path="/gardens/:id" element={<GardenWorkspacePage user={user}/>}/>
     <Route path="/supplies" element={<SuppliesPage user={user}/>}/>
     <Route path="/observations" element={<ObservationsPage user={user}/>}/>
     <Route path="/fertilizer-applications" element={<FertilizerApplicationsPage user={user}/>}/>
     <Route path="/issues" element={<IssuesPage user={user}/>}/>
     <Route path="/harvest" element={<HarvestPage user={user}/>}/>
     <Route path="/pests" element={<PestsPage/>}/>

     <Route path="/tasks" element={<TasksPage/>}/>
     <Route path="/seeds/form" element={<SeedForm user={user}/>}/>

     {/**reference */}
     <Route path="/hardiness-zones" element={<USDAZonesReference user={user}/>}/>
     <Route path="/hydroponic-companion-planting" element={<HydroponicCompanionPlantingPage/>}/>

     {/**diseases */}
     <Route path="/diseases" element={<DiseasesPage/>}/>

     {/**seeds */}
     <Route path="/seeds" element={<SeedPage user={user}/>}/>
     <Route path="/seed-collections" element={<SeedCollectionsPage user={user}/>}/>
        {/**plants */}  
        <Route path="/plants" element={<PlantPage user={user}/>}/>

     {/**vendors*/}
     <Route path="/vendors/equipment" element={<EquipmentVendor user={user}/>}/>
     <Route path="/vendors/seeds" element={<SeedVendor user={user}/>}/>
     <Route path="/vendors/supplies" element={<SupplyVendor user={user}/>}/>

     {/**User */}
     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

    <Route path="/businesses" element={<Businesses/>}/>

     {/**Admin */}
     <Route path="/admin" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/businesses" element={<Businesses/>}/>
     <Route path="/admin/business-types" element={<BusinessTypes/>}/>
     <Route path="/admin/app-keys" element={<AppKeys/>}/>
     <Route path="/admin/tax-rates" element={<TaxRatesPage/>}/>
     <Route path="/admin/footers" element={<Footers/>}/>
     <Route path="/admin/seasons" element={<Seasons/>}/>
     <Route path="/admin/holidays" element={<Holidays/>}/>
     <Route path="/admin/occasions" element={<Occasions/>}/>
     <Route path="/admin/taglines" element={<Taglines/>}/>
     <Route path="/admin/vendors" element={<Vendors/>}/>
     <Route path="/admin/business-roles-permissions" element={<BusinessRolesPermissionsPage/>}/>
     <Route path="/admin/inventory" element={<Inventory/>}/>
     
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

   <Modal show={showReminderModal} onHide={()=>setShowReminderModal(false)} centered backdrop="static">
    <Modal.Header closeButton>
     <Modal.Title>Task Reminder</Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {dueReminders.map(reminder=>(
      <div key={reminder._id} className="mb-3">
       <div className="fw-bold">{reminder.task?.name||"Task"}</div>
       <div>{reminder.message||""}</div>
       <small className="text-muted">{reminder.remindAt?new Date(reminder.remindAt).toLocaleString():""}</small>
      </div>
     ))}
    </Modal.Body>
    <Modal.Footer>
     <Button variant="secondary" onClick={()=>setShowReminderModal(false)}>Close</Button>
    </Modal.Footer>
   </Modal>
   <Footer variant="app" title={headerTitle}/>
  </div>
 );

}

export default App;

