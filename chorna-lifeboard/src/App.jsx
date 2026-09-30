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

//lifeboard pages
import JournalPage from "./pages/journal/JournalPage.jsx";
import DailyJournalForm from "./pages/journal/DailyJournalForm.jsx";
import PrivateJournalPage from "./pages/journal/PrivateJournalPage.jsx";
import TasksPage from "./pages/task/TasksPage.jsx";
import PrioritiesPage from "./pages/priority/PrioritiesPage.jsx";
import GoalsPage from "./pages/goal/GoalsPage.jsx";
import MilestonesPage from "./pages/goal/MilestonesPage.jsx";
import HabitsPage from "./pages/habit/HabitsPage.jsx";
import RoutinesPage from "./pages/routine/RoutinesPage.jsx";
import MindfulnessPage from "./pages/mindfulness/MindfulnessPage.jsx";
import MoodLogPage from "./pages/moodLog/MoodLogPage.jsx";
import NotesPage from "./pages/notes/NotesPage.jsx";
import CalendarPage from "./pages/calendar/CalendarPage.jsx";
import RemindersPage from "./pages/reminder/RemindersPage.jsx";
import ReviewsPage from "./pages/review/ReviewsPage.jsx";
import TimelinePage from "./pages/timeline/TimelinePage.jsx";
import VisionBoardsPage from "./pages/visionBoard/VisionBoardsPage.jsx";
import LifeThemesPage from "./pages/lifeTheme/LifeThemesPage.jsx";
import CategoriesPage from "./pages/category/CategoriesPage.jsx";
import UserSettingsPage from "./pages/settings/UserSettingsPage.jsx";
import LifeAreasPage from "./pages/lifeArea/LifeAreasPage.jsx";
import TagsPage from "./pages/tag/TagsPage.jsx";

//forms
import PrivateJournalForm from "./pages/journal/PrivateJournalForm.jsx";
import ReflectionForm from "./pages/journal/ReflectionForm.jsx";
import GratitudeForm from "./pages/journal/GratitudeForm.jsx";
import TaskForm from "./pages/task/TaskForm.jsx";
import PriorityForm from "./pages/priority/PriorityForm.jsx";
import GoalForm from "./pages/goal/GoalForm.jsx";
import MilestoneForm from "./pages/goal/MilestoneForm.jsx";
import HabitForm from "./pages/habit/HabitForm.jsx";
import RoutineForm from "./pages/routine/RoutineForm.jsx";
import MindfulnessForm from "./pages/mindfulness/MindfulnessForm.jsx";
import MoodLogForm from "./pages/moodLog/MoodLogForm.jsx";
import NoteForm from "./pages/notes/NoteForm.jsx";
import CalendarEventForm from "./pages/calendar/CalendarEventForm.jsx";
import ReminderForm from "./pages/reminder/ReminderForm.jsx";
import ReviewForm from "./pages/review/ReviewForm.jsx";
import TimelineForm from "./pages/timeline/TimelineForm.jsx";
import VisionBoardForm from "./pages/visionBoard/VisionBoardForm.jsx";
import LifeThemeForm from "./pages/lifeTheme/LifeThemeForm.jsx";
import CategoryForm from "./pages/category/CategoryForm.jsx";
import LifeAreaForm from "./pages/lifeArea/LifeAreaForm.jsx";

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
import Inventory from "./pages/admin/inventory/Inventory.jsx";

//users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
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

 const normalizeStoredUser=value=>{
  if(!value||typeof value!=="object")return null;

  const normalizedUser={
   ...value,
   _id:value?._id?.$oid||value?._id||value?.id?.$oid||value?.id||"",
   id:value?.id?.$oid||value?.id||value?._id?.$oid||value?._id||"",
   role:value?.role?.$oid||value?.role||""
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
   <Header onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>

   <main className="app-content">
    <Routes>
     <Route path="/" element={<Home title={headerTitle}/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>

     {/**Lifeboard */}
     <Route path="/journal" element={<JournalPage user={user}/>}/>
     <Route path="/journal/daily/new" element={<DailyJournalForm user={user}/>}/>
     <Route path="/journal/private" element={<PrivateJournalPage user={user}/>}/>
     <Route path="/tasks" element={<TasksPage user={user}/>}/>
     <Route path="/priorities" element={<PrioritiesPage user={user}/>}/>
     <Route path="/goals" element={<GoalsPage user={user}/>}/>
     <Route path="/milestones" element={<MilestonesPage user={user}/>}/>
     <Route path="/habits" element={<HabitsPage user={user}/>}/>
     <Route path="/routines" element={<RoutinesPage user={user}/>}/>
     <Route path="/mindfulness" element={<MindfulnessPage user={user}/>}/>
     <Route path="/mood-log" element={<MoodLogPage user={user}/>}/>
     <Route path="/notes" element={<NotesPage user={user}/>}/>
     <Route path="/calendar" element={<CalendarPage user={user}/>}/>
     <Route path="/reminders" element={<RemindersPage user={user}/>}/>
     <Route path="/reviews" element={<ReviewsPage user={user}/>}/>
     <Route path="/timeline" element={<TimelinePage user={user}/>}/>
     <Route path="/vision-boards" element={<VisionBoardsPage user={user}/>}/>
     <Route path="/life-themes" element={<LifeThemesPage user={user}/>}/>
     <Route path="/categories" element={<CategoriesPage user={user}/>}/>
     <Route path="/settings" element={<UserSettingsPage user={user}/>}/>
     <Route path="/life-areas" element={<LifeAreasPage user={user}/>}/>

     <Route path="/journal/private/new" element={<PrivateJournalForm user={user}/>}/>
     <Route path="/journal/reflection/new" element={<ReflectionForm user={user}/>}/>
     <Route path="/journal/gratitude/new" element={<GratitudeForm user={user}/>}/>

     <Route path="/tasks/new" element={<TaskForm user={user}/>}/>
     <Route path="/priorities/new" element={<PriorityForm user={user}/>}/>
     <Route path="/goals/new" element={<GoalForm user={user}/>}/>
     <Route path="/milestones/new" element={<MilestoneForm user={user}/>}/>
     <Route path="/habits/new" element={<HabitForm user={user}/>}/>
     <Route path="/routines/new" element={<RoutineForm user={user}/>}/>
     <Route path="/mindfulness/new" element={<MindfulnessForm user={user}/>}/>
     <Route path="/mood-log/new" element={<MoodLogForm user={user}/>}/>
     <Route path="/notes/new" element={<NoteForm user={user}/>}/>
     <Route path="/calendar/new" element={<CalendarEventForm user={user}/>}/>
     <Route path="/reminders/new" element={<ReminderForm user={user}/>}/>
     <Route path="/reviews/new" element={<ReviewForm user={user}/>}/>
     <Route path="/timeline/new" element={<TimelineForm user={user}/>}/>
     <Route path="/vision-boards/new" element={<VisionBoardForm user={user}/>}/>
     <Route path="/life-themes/new" element={<LifeThemeForm user={user}/>}/>
     <Route path="/categories/new" element={<CategoryForm user={user}/>}/>
     <Route path="/life-areas/new" element={<LifeAreaForm user={user}/>}/>
     <Route path="/tags" element={<TagsPage/>}/>

     <Route path="/businesses" element={<Businesses/>}/>

     {/**Admin */}
     <Route path="/admin" element={<PermissionMatrix/>}/>
     <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
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
     <Route path="/admin/inventory" element={<Inventory/>}/>

     {/**User */}
     <Route path="/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<PermissionMatrix/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

     {/**Errors */}
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