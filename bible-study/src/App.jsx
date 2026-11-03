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
import ReminderPage from "./pages/ReminderPage";
import DailyNotesPage from "./pages/DailyNotesPage.jsx";

//reference
import StudyBibleGuidePage from "./pages/StudyBibleGuidePage.jsx";

//task
import StudyTaskPage from "./pages/StudyTaskPage.jsx";

//lookups
import Translations from "./pages/Translations.jsx";

//methods
import BibleStudyMethodPage from "./pages/methods/BibleStudyMethodPage.jsx";
import BibleStudyMethodPrintPage from "./pages/methods/BibleStudyMethodPrintPage.jsx";
import BookStudyMethod from "./pages/methods/BookStudyMethod.jsx";
import ChapterStudyMethod from "./pages/methods/ChapterStudyMethod.jsx";
import InductiveBibleStudyMethod from "./pages/methods/InductiveBibleStudyMethod.jsx";
import SOAPMethod from "./pages/methods/SOAPMethod.jsx";
import HistoricalBibleStudyMethod from "./pages/methods/HistoricalBibleStudyMethod.jsx";
import ParallelPassageStudyMethod from "./pages/methods/ParallelPassageStudyMethod.jsx";
import CrossReferenceStudyMethod from "./pages/methods/CrossReferenceStudyMethod.jsx";
import DevotionalStudyMethod from "./pages/methods/DevotionalStudyMethod.jsx";
import MeditationStudyMethod from "./pages/methods/MeditationStudyMethod.jsx";
import LectioDivinaMethod from "./pages/methods/LectioDivinaMethod.jsx";
import CharacterStudyMethod from "./pages/methods/CharacterStudyMethod.jsx";
import LeadershipStudyMethod from "./pages/methods/LeadershipStudyMethod.jsx";
import BiographicalStudyMethod from "./pages/methods/BiographicalStudyMethod.jsx";
import WordStudyMethod from "./pages/methods/WordStudyMethod.jsx";
import KeyWordStudyMethod from "./pages/methods/KeyWordStudyMethod.jsx";
import OriginalLanguageStudyMethod from "./pages/methods/OriginalLanguageStudyMethod";
import TopicalStudyMethod from "./pages/methods/TopicalStudyMethod";
import DoctrinalStudyMethod from "./pages/methods/DoctrinalStudyMethod";
import ThematicStudyMethod from "./pages/methods/ThematicStudyMethod";
import OutlineStudyMethod from "./pages/methods/OutlineStudyMethod";
import ExpositoryStudyMethod from "./pages/methods/ExpositoryStudyMethod";
import VerseByVerseStudyMethod from "./pages/methods/VerseByVerseStudyMethod";
import PassageStudyMethod from "./pages/methods/PassageStudyMethod";
import ObservationStudyMethod from "./pages/methods/ObservationStudyMethod";
import ApplicationStudyMethod from "./pages/methods/ApplicationStudyMethod";
import ACTSMethod from "./pages/methods/ACTSMethod.jsx";
import FeastMethod from "./pages/methods/FeastMethod.jsx";

//calendar
import CalendarPage from "./pages/calendar/CalendarPage.jsx";

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

//forms
import CrossReferenceForm from "./pages/forms/studies/CrossReferenceForm.jsx";
import LibraryItemForm from "./pages/forms/studies/LibraryItemForm.jsx";
import MemoryVerseForm from "./pages/forms/studies/MemoryVerseForm.jsx";
import StudyEnteryForm from "./pages/forms/studies/StudyEnteryForm.jsx";
import StudyForm from "./pages/forms/studies/StudyForm.jsx";
import StudyRecommendationForm from "./pages/forms/studies/StudyRecommendationForm.jsx";
import StudySessionForm from "./pages/forms/studies/StudySessionForm.jsx";
import StudyTaskForm from "./pages/forms/studies/StudyTaskForm.jsx";
import TranslationForm from "./pages/forms/lookups/TranslationForm.jsx";

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

function RequireAuth({children}){
 const token=localStorage.getItem("token")||sessionStorage.getItem("token");

 if(!token){
  return <Navigate to="/login" replace/>;
 }

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
   <main className="app-content">
    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/dashboard" element={<RequireAuth><Dashboard/></RequireAuth>}/>
     <Route path="/businesses" element={<RequireAuth><Businesses/></RequireAuth>}/>
     <Route path="/reminders" element={<RequireAuth><ReminderPage user={user}/></RequireAuth>}/>

     {/**Admin */}
     <Route path="/admin" element={<RequireAuth><AdminDashboard user={user}/></RequireAuth>}/>
     <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard user={user}/></RequireAuth>}/>
     <Route path="/admin/businesses" element={<RequireAuth><Businesses/></RequireAuth>}/>
     <Route path="/admin/business-types" element={<RequireAuth><BusinessTypes/></RequireAuth>}/>
     <Route path="/admin/app-keys" element={<RequireAuth><AppKeys/></RequireAuth>}/>
     <Route path="/admin/footers" element={<RequireAuth><Footers/></RequireAuth>}/>
     <Route path="/admin/seasons" element={<RequireAuth><Seasons/></RequireAuth>}/>
     <Route path="/admin/holidays" element={<RequireAuth><Holidays/></RequireAuth>}/>
     <Route path="/admin/occasions" element={<RequireAuth><Occasions/></RequireAuth>}/>
     <Route path="/admin/taglines" element={<RequireAuth><Taglines/></RequireAuth>}/>
     <Route path="/admin/vendors" element={<RequireAuth><Vendors/></RequireAuth>}/>
     <Route path="/admin/tax-rates" element={<RequireAuth><TaxRatesPage/></RequireAuth>}/>
     <Route path="/admin/business-roles-permissions" element={<RequireAuth><BusinessRolesPermissionsPage/></RequireAuth>}/>

     {/**Study Tasks Page */}
     <Route path="/study-tasks" element={<StudyTaskPage/>}/>
     <Route path="/studies" element={<StudyForm/>}/>
     <Route path="/studies/:id" element={<StudyForm/>}/>
     <Route path="/calendar" element={<CalendarPage/>}/>

     {/**lookups*/}
     <Route path="/translations" element={<Translations/>}/>
     <Route path="/study-bible" element={<StudyBibleGuidePage/>}/>
     <Route path="/study-bible-guide" element={<StudyBibleGuidePage/>}/>

     {/**methods*/}
     <Route path="/methods" element={<BibleStudyMethodPage/>}/>
     <Route path="/methods/print" element={<BibleStudyMethodPrintPage/>}/>
     <Route path="/methods/print/:slug" element={<BibleStudyMethodPrintPage/>}/>
     <Route path="/methods/book-bible-study-method" element={<BookStudyMethod/>}/>
     <Route path="/methods/book-study-method" element={<BookStudyMethod/>}/>
     <Route path="/methods/chapter-bible-study-method" element={<ChapterStudyMethod/>}/>
     <Route path="/methods/chapter-study-method" element={<ChapterStudyMethod/>}/>
     <Route path="/methods/inductive-bible-study-method" element={<InductiveBibleStudyMethod/>}/>
     <Route path="/methods/inductive-study-method" element={<InductiveBibleStudyMethod/>}/>
     <Route path="/methods/soap-bible-study-method" element={<SOAPMethod/>}/>
     <Route path="/methods/soap-method" element={<SOAPMethod/>}/>
     <Route path="/methods/feast-method" element={<FeastMethod/>}/>
     <Route path="/methods/feast-study-method" element={<FeastMethod/>}/>
     <Route path="/methods/feast-bible-study-method" element={<FeastMethod/>}/>
     <Route path="/methods/historical-bible-study-method" element={<HistoricalBibleStudyMethod/>}/>
     <Route path="/methods/parallel-passage-bible-study-method" element={<ParallelPassageStudyMethod/>}/>
     <Route path="/methods/parallel-passage-study-method" element={<ParallelPassageStudyMethod/>}/>
     <Route path="/methods/cross-reference-bible-study-method" element={<CrossReferenceStudyMethod/>}/>
     <Route path="/methods/cross-reference-study-method" element={<CrossReferenceStudyMethod/>}/>
     <Route path="/methods/devotional-bible-study-method" element={<DevotionalStudyMethod/>}/>
     <Route path="/methods/devotional-study-method" element={<DevotionalStudyMethod/>}/>
     <Route path="/methods/meditation-bible-study-method" element={<MeditationStudyMethod/>}/>
     <Route path="/methods/meditation-study-method" element={<MeditationStudyMethod/>}/>
     <Route path="/methods/lectio-divina-bible-study-method" element={<LectioDivinaMethod/>}/>
     <Route path="/methods/lectio-divina-method" element={<LectioDivinaMethod/>}/>
     <Route path="/methods/character-bible-study-method" element={<CharacterStudyMethod/>}/>
     <Route path="/methods/character-study-method" element={<CharacterStudyMethod/>}/>
     <Route path="/methods/leadership-bible-study-method" element={<LeadershipStudyMethod/>}/>
     <Route path="/methods/leadership-study-method" element={<LeadershipStudyMethod/>}/>
     <Route path="/methods/biographical-bible-study-method" element={<BiographicalStudyMethod/>}/>
     <Route path="/methods/biographical-study-method" element={<BiographicalStudyMethod/>}/>
     <Route path="/methods/word-bible-study-method" element={<WordStudyMethod/>}/>
     <Route path="/methods/word-study-method" element={<WordStudyMethod/>}/>
     <Route path="/methods/key-word-bible-study-method" element={<KeyWordStudyMethod/>}/>
     <Route path="/methods/key-word-study-method" element={<KeyWordStudyMethod/>}/>
     <Route path="/methods/original-language-bible-study-method" element={<OriginalLanguageStudyMethod/>}/>
     <Route path="/methods/original-language-study-method" element={<OriginalLanguageStudyMethod/>}/>
     <Route path="/methods/topical-bible-study-method" element={<TopicalStudyMethod/>}/>
     <Route path="/methods/topical-study-method" element={<TopicalStudyMethod/>}/>
     <Route path="/methods/doctrinal-bible-study-method" element={<DoctrinalStudyMethod/>}/>
     <Route path="/methods/doctrinal-study-method" element={<DoctrinalStudyMethod/>}/>
     <Route path="/methods/thematic-bible-study-method" element={<ThematicStudyMethod/>}/>
     <Route path="/methods/thematic-study-method" element={<ThematicStudyMethod/>}/>
     <Route path="/methods/outline-bible-study-method" element={<OutlineStudyMethod/>}/>
     <Route path="/methods/outline-study-method" element={<OutlineStudyMethod/>}/>
     <Route path="/methods/expository-bible-study-method" element={<ExpositoryStudyMethod/>}/>
     <Route path="/methods/expository-study-method" element={<ExpositoryStudyMethod/>}/>
     <Route path="/methods/verse-by-verse-bible-study-method" element={<VerseByVerseStudyMethod/>}/>
     <Route path="/methods/verse-by-verse-study-method" element={<VerseByVerseStudyMethod/>}/>
     <Route path="/methods/passage-bible-study-method" element={<PassageStudyMethod/>}/>
     <Route path="/methods/passage-study-method" element={<PassageStudyMethod/>}/>
     <Route path="/methods/observation-bible-study-method" element={<ObservationStudyMethod/>}/>
     <Route path="/methods/observation-study-method" element={<ObservationStudyMethod/>}/>
     <Route path="/methods/application-bible-study-method" element={<ApplicationStudyMethod/>}/>
     <Route path="/methods/application-study-method" element={<ApplicationStudyMethod/>}/>
     <Route path="/methods/acts-bible-study-method" element={<ACTSMethod/>}/>
     <Route path="/methods/acts-method" element={<ACTSMethod/>}/>
     <Route path="/methods/acts-study-method" element={<ACTSMethod/>}/>
     <Route path="/methods/:slug" element={<BibleStudyMethodPage/>}/>

     {/**Forms */}
     <Route path="/forms/studies/cross-reference" element={<CrossReferenceForm/>}/>
     <Route path="/forms/studies/cross-reference/:id" element={<CrossReferenceForm/>}/>
     <Route path="/forms/studies/daily-note" element={<DailyNotesPage/>}/>
     <Route path="/forms/studies/daily-note/:id" element={<Navigate to="/forms/studies/daily-note" replace/>}/>
     <Route path="/forms/studies/library-item" element={<LibraryItemForm/>}/>
     <Route path="/forms/studies/library-item/:id" element={<LibraryItemForm/>}/>
     <Route path="/forms/studies/memory-verse" element={<MemoryVerseForm/>}/>
     <Route path="/forms/studies/memory-verse/:id" element={<MemoryVerseForm/>}/>
     <Route path="/forms/studies/study-entry" element={<StudyEnteryForm/>}/>
     <Route path="/forms/studies/study-entry/:id" element={<StudyEnteryForm/>}/>
     <Route path="/forms/studies/study" element={<StudyForm/>}/>
     <Route path="/forms/studies/study/:id" element={<StudyForm/>}/>
     <Route path="/forms/studies/study-recommendation" element={<StudyRecommendationForm/>}/>
     <Route path="/forms/studies/study-recommendation/:id" element={<StudyRecommendationForm/>}/>
     <Route path="/forms/studies/study-session" element={<StudySessionForm/>}/>
     <Route path="/forms/studies/study-session/:id" element={<StudySessionForm/>}/>
     <Route path="/forms/studies/study-task" element={<StudyTaskForm/>}/>
     <Route path="/forms/studies/study-task/:id" element={<StudyTaskForm/>}/>
     <Route path="/forms/lookups/translation" element={<TranslationForm/>}/>
     <Route path="/forms/lookups/translation/:id" element={<TranslationForm/>}/>

     {/**User/Admin */}
     <Route path="/users" element={<RequireAuth><Users/></RequireAuth>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<RequireAuth><PermissionMatrix/></RequireAuth>}/>
     <Route path="/profile" element={<RequireAuth><UserProfilePage/></RequireAuth>}/>

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
