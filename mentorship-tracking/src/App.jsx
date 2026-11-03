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
import Reports from "./pages/Reports.jsx";
import ProgramPage from "./pages/ProgramPage.jsx";
import MeetingMethodPage from "./pages/MeetingMethodPage";
import FileOptionsPage from "./pages/FileOptionsPage.jsx";
import TaskListPage from "./pages/TaskListPage.jsx";

//Mentees
import MenteesPage from "./pages/menteePage.jsx";
import ResourcePage from "./pages/resourcePage.jsx";
import MentorReferencePage from "./pages/MentorReferencePage.jsx";
import MenteeSessionsPage from "./pages/MenteeSessionsPage.jsx";
import MenteeFilesPage from "./pages/MenteeFilesPage.jsx";
import MentorshipTrackerPage from "./pages/MentorshipTrackerPage.jsx";
import TimesheetsPage from "./pages/TimesheetsPage.jsx";

//Surveys
import SurveysPage from "../../mentorship-tracking/src/pages/MenteeSurvey.jsx";


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

 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);
 const [headerTitle,setHeaderTitle]=useState("");

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
  navigate("/",{replace:true});
 };

 return(
  <div className="app-layout">

   <Header userDetails={user} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>
   <main className="app-content">
    {location.state?.fromDashboard&&location.pathname!=="/dashboard"&&(
     <div className="d-flex justify-content-end px-4 pt-3">
      <button type="button" className="btn btn-outline-dark" onClick={()=>navigate("/dashboard")}>
       Back to Dashboard
      </button>
     </div>
    )}
    <Routes>
     <Route path="/" element={user?<Dashboard user={user}/>:<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>
     <Route path="/reports" element={<Reports user={user}/>}/>
     <Route path="/programs" element={<ProgramPage user={user}/>}/>
     <Route path="/meeting-methods" element={<MeetingMethodPage user={user}/>}/>
     <Route path="/tasks" element={<TaskListPage user={user}/>}/>
     <Route path="/mentees" element={<MenteesPage user={user}/>}/>
     <Route path="/mentees-page" element={<MenteesPage user={user}/>}/>
     <Route path="/mentees/:id" element={<MenteesPage user={user}/>}/>
     <Route path="/mentees/:id/tracker" element={<MentorshipTrackerPage user={user}/>}/>
     <Route path="/sessions" element={<MenteeSessionsPage user={user}/>}/>
     <Route path="/sessions/upcoming" element={<MenteeSessionsPage user={user} view="upcoming"/>}/>
     <Route path="/resources" element={<ResourcePage user={user}/>}/>
     <Route path="/mentor-reference" element={<MentorReferencePage page="mentee"/>}/>
     <Route path="/mentor-reference/initiating-a-conversation" element={<MentorReferencePage page="conversation"/>}/>
     <Route path="/mentor-reference/questions-for-mentee" element={<MentorReferencePage page="mentee"/>}/>
     <Route path="/mentor-reference/questions-for-mentor" element={<MentorReferencePage page="mentor"/>}/>
     <Route path="/mentees/:id/sessions" element={<MenteeSessionsPage user={user}/>}/>
     <Route path="/mentee-files" element={<MenteeFilesPage user={user}/>}/>
     <Route path="/timesheets" element={<TimesheetsPage user={user}/>}/>
      <Route path="/surveys" element={<SurveysPage/>}/>

     <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/businesses" element={<Businesses/>}/>
     <Route path="/admin/business-types" element={<BusinessTypes/>}/>
     <Route path="/admin/app-keys" element={<AppKeys/>}/>
     <Route path="/admin/footers" element={<Footers/>}/>
     <Route path="/admin/seasons" element={<Seasons/>}/>
     <Route path="/admin/holidays" element={<Holidays/>}/>
     <Route path="/admin/occasions" element={<Occasions/>}/>
     <Route path="/admin/taglines" element={<Taglines/>}/>
     <Route path="/admin/vendors" element={<Vendors/>}/>
     <Route path="/admin/meeting-methods" element={<MeetingMethodPage user={user}/>}/>
     <Route path="/admin/file-options" element={<FileOptionsPage user={user}/>}/>
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
    </Routes>

   </main>

   <Footer variant="app" title={headerTitle}/>

  </div>
 );
}

export default App;
