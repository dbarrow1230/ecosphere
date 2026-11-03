import {Routes,Route,useNavigate,useLocation,Navigate} from "react-router-dom";
import {useState,useEffect} from "react";
import {loadBusinessTheme} from "@shared/theme/businessTheme.js";

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


//forms

//admin
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ProjectsPage from "./pages/projects/ProjectsPage.jsx";
import TasksPage from "./pages/tasks/TasksPage.jsx";
import MyTasksPage from "./pages/tasks/MyTasksPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import KanbanPage from "./pages/boards/KanbanPage.jsx";
import TimelinePage from "./pages/boards/TimelinePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import BackupPage from "./pages/BackupPage.jsx";
import Businesses from "./pages/admin/Businesses.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";



//users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PermissionMatrix from "./pages/admin/users/PermissionMatrix";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";

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
 useEffect(()=>{loadBusinessTheme("project-tracker");},[]);

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

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);
 const [headerTitle,setHeaderTitle]=useState("");

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

   <Header userDetails={user} onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle||"Project Tracker"}/>
   <main className="app-content">
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>
     <Route path="/projects" element={<ProjectsPage/>}/>
     <Route path="/tasks" element={<TasksPage/>}/>
     <Route path="/tasks/my-tasks" element={<MyTasksPage/>}/>
     <Route path="/calendar" element={<CalendarPage/>}/>
     <Route path="/boards/kanban" element={<KanbanPage/>}/>
     <Route path="/boards/timeline" element={<TimelinePage/>}/>
     <Route path="/reports" element={<ReportsPage/>}/>
     <Route path="/team" element={<TeamPage/>}/>
     <Route path="/settings" element={<SettingsPage/>}/>
     <Route path="/backups" element={<BackupPage user={user}/>}/>
    

     {/**Forms */}
     

     {/**User */}
     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<Navigate to="/admin/permissions" replace/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

     {/**Admin */}
     <Route path="/admin" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>}/>
     <Route path="/admin/users" element={<Users/>}/>
     <Route path="/admin/permissions" element={<PermissionMatrix/>}/>
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
