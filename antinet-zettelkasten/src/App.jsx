import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {useState,useEffect} from "react";
import {Modal} from "react-bootstrap";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

// Components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import ReminderNotifications from "./components/ReminderNotifications.jsx";

// Pages
import Home from "./pages/Home";
import ContactUs from "./pages/contactus";
import FAQ from "./pages/faq";
import Privacy from "./pages/privacy";
import TermsOfService from "./pages/termsofservice";
import About from "./pages/about";
import ReminderPage from "./pages/ReminderPage";
import BackupPage from "./pages/BackupPage.jsx";
import ReadingNoteReference from "./pages/ReadingNoteReference.jsx";

// Notes
import Notes from "./pages/notes";
import NoteDetails from "./pages/NoteDetails";
import NoteForm from "./pages/forms/NoteForm.jsx";
import Projects from "./pages/ProjectsPage.jsx";
import DomainsPage from "./pages/DomainsPage.jsx";
import ProjectTypesPage from "./pages/ProjectTypesPage.jsx";
import RecordSubtypesPage from "./pages/forms/RecordSubtypesPage.jsx";
import RelationTypesPage from "./pages/RelationTypesPage.jsx";
import PrefixesPage from "./pages/PrefixesPage.jsx";
import AttachmentsPage from "./pages/AttachmentsPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Settings from "./pages/Settings.jsx";
import NewNote from "./pages/NewNote.jsx";
import FleetingInboxPage from "./pages/FleetingInboxPage.jsx";
import SourcesPage from "./pages/SourcesPage.jsx";
import EntitiesPage from "./pages/EntitiesPage.jsx";
import ConnectionsPage from "./pages/ConnectionsPage.jsx";
import StructureNotesPage from "./pages/StructureNotesPage.jsx";
import QuestionPoolsPage from "./pages/QuestionPoolsPage.jsx";
import OutputsPage from "./pages/OutputsPage.jsx";
import RevisionsPage from "./pages/RevisionsPage.jsx";
import Notebooks from "./pages/notebooks.jsx";
import Tags from "./pages/tags.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";



// Users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Admin
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

// Error pages
import Error400 from "./components/errorpages/Error400";
import Error401 from "./components/errorpages/Error401";
import Error403 from "./components/errorpages/Error403";
import Error404 from "./components/errorpages/Error404";
import Error500 from "./components/errorpages/Error500";
import Error502 from "./components/errorpages/Error502";
import Error503 from "./components/errorpages/Error503";
import Error504 from "./components/errorpages/Error504";

Modal.defaultProps={...(Modal.defaultProps||{}),backdrop:"static",keyboard:false};

function App(){
 const navigate=useNavigate();
 const location=useLocation();

 // Helper: locate the stored authenticated user
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
   }catch(error){
    console.error(`Failed to parse stored user from ${key}`,error);
   }
  }

  return null;
 };

 // Helper: normalize the business API response
 const unwrapBusiness=data=>{
  if(!data||typeof data!=="object")return null;
  if(data.business&&typeof data.business==="object")return data.business;
  if(data.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
  return data;
 };

 // Helper: read the current application key
 const getRuntimeAppKey=()=>{
  const envKey=String(import.meta.env?.VITE_APP_KEY||"").trim().toLowerCase();
  if(envKey)return envKey;

  const configKey=String(window.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
  if(configKey)return configKey;

  const meta=document.querySelector('meta[name="app-key"]');
  return String(meta?.getAttribute("content")||"").trim().toLowerCase();
 };

 // Helper: normalize IDs from user records
 const getObjectId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
  return "";
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
 const [showAddNoteModal,setShowAddNoteModal]=useState(false);

 useEffect(()=>{
  queueMicrotask(()=>setUser(getStoredUser()));
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
    const response=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`,{
     headers:{"Content-Type":"application/json"}
    });

    if(response.status===404){
     if(!ignore)clearBusinessTheme();
     return;
    }

    if(!response.ok)throw new Error("Failed to load current app business");

    const data=await response.json();
    const business=unwrapBusiness(data);

    if(ignore)return;

    if(!business){
     clearBusinessTheme();
     return;
    }

    applyBusinessTheme(business);
   }catch(error){
    console.error("Business theme load failed",error);
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

 const handleAddNoteSuccess=()=>{
  setShowAddNoteModal(false);
  navigate("/notes",{replace:false});
 };

 return(
 
   <div className="app-layout">
    <Header userDetails={user} onTitleChange={setHeaderTitle}/>

    <Navigation
     user={user}
     onLogout={handleLogout}
     brand={headerTitle||"Antinet Zettelkasten"}
     onAddNote={()=>setShowAddNoteModal(true)}
    />

    <ReminderNotifications user={user}/>

    <main className="app-content">
     <Routes>
      <Route path="/" element={<Home title={headerTitle}/>}/>
      <Route path="/contact" element={<ContactUs/>}/>
      <Route path="/faq" element={<FAQ/>}/>
      <Route path="/privacy" element={<Privacy/>}/>
      <Route path="/terms" element={<TermsOfService/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/reminders" element={<ReminderPage user={user}/>}/>
      <Route path="/dashboard" element={<Dashboard user={user}/>}/>
      <Route path="/backups" element={<BackupPage user={user}/>}/>
      <Route path="/reading-note-reference" element={<ReadingNoteReference/>}/>
      <Route path="/notes" element={<Notes/>}/>
      <Route path="/notes/new" element={<NewNote user={user}/>}/>
      <Route path="/notes/:id" element={<NoteDetails/>}/>
      <Route path="/inbox" element={<FleetingInboxPage/>}/>
      <Route path="/references" element={<SourcesPage/>}/>
      <Route path="/references/:id" element={<SourcesPage/>}/>
      <Route path="/entities" element={<EntitiesPage/>}/>
      <Route path="/entities/:id" element={<EntitiesPage/>}/>
      <Route path="/zettels" element={<Notes/>}/>
      <Route path="/links" element={<ConnectionsPage/>}/>
      <Route path="/structures" element={<StructureNotesPage/>}/>
      <Route path="/structures/:id" element={<StructureNotesPage/>}/>
      <Route path="/question-pools" element={<QuestionPoolsPage/>}/>
      <Route path="/outputs" element={<OutputsPage/>}/>
      <Route path="/outputs/:id" element={<OutputsPage/>}/>
      <Route path="/note-history" element={<RevisionsPage/>}/>
      <Route path="/favorites" element={<FavoritesPage/>}/>
      <Route path="/archive" element={<ArchivePage/>}/>
      <Route path="/tags" element={<Tags/>}/>
      <Route path="/projects" element={<Projects user={user}/>}/>
      <Route path="/domains" element={<DomainsPage/>}/>
      <Route path="/project-types" element={<ProjectTypesPage/>}/>
      <Route path="/record-subtypes" element={<RecordSubtypesPage/>}/>
      <Route path="/relation-types" element={<RelationTypesPage/>}/>
      <Route path="/prefixes" element={<PrefixesPage/>}/>
      <Route path="/attachments" element={<AttachmentsPage/>}/>
      <Route path="/notebooks" element={<Notebooks/>}/>
      <Route path="/settings" element={<Settings/>}/>
     

      {/* User */}
      <Route path="/users" element={<Users/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
      <Route path="/profile" element={<UserProfilePage/>}/>

      {/* Admin */}
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

      {/* Error pages */}
      <Route path="/400" element={<Error400/>}/>
      <Route path="/401" element={<Error401/>}/>
      <Route path="/403" element={<Error403/>}/>
      <Route path="/404" element={<Error404/>}/>
      <Route path="/500" element={<Error500/>}/>
      <Route path="/502" element={<Error502/>}/>
      <Route path="/503" element={<Error503/>}/>
      <Route path="/504" element={<Error504/>}/>

      {/* Catch all */}
      <Route path="*" element={<Error404/>}/>
     </Routes>
    </main>

    <Footer variant="app" title={headerTitle}/>

    <Modal
     show={showAddNoteModal}
     onHide={()=>setShowAddNoteModal(false)}
     centered
     size="lg"
     dialogClassName="ztk-note-modal"
    >
     <Modal.Header closeButton>
      <Modal.Title>Add Note</Modal.Title>
     </Modal.Header>

     <Modal.Body>
      <NoteForm userId={getObjectId(user)} autoFocusTitle onSuccess={handleAddNoteSuccess}/>
     </Modal.Body>
    </Modal>
   </div>
 
 );
}

export default App;
