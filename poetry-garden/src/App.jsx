// src/App.jsx
import {Routes,Route,Navigate,useNavigate,useLocation,useParams} from "react-router-dom";
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
import Poems from "./pages/Poems.jsx";
import PoemStatusPage from "./pages/PoemStatusPage.jsx";
import AuthorsIndexPage from "./pages/AuthorsIndexPage.jsx";
import GenresIndexPage from "./pages/GenresIndexPage.jsx";
import PublishersIndexPage from "./pages/PublishersIndexPage.jsx";
import ReminderPage from "./pages/ReminderPage.jsx";
import PoetryWorkflowPage from "./pages/PoetryWorkflowPage.jsx";

//reference
import PoetryFormsReference from "./pages/referance/PoetryFormsReference";

//admin
import AdminDashboard from "./pages/admin/Dashboard";
import Businesses from "./pages/admin/Businesses.jsx";
import Footers from "./pages/admin/Footers.jsx";
import Seasons from "./pages/admin/Seasons.jsx";
import Holidays from "./pages/admin/Holidays.jsx";
import Occasions from "./pages/admin/Occasions.jsx";
import Taglines from "./pages/admin/Taglines.jsx";
import Vendors from "./pages/admin/Vendors.jsx";
import VendorCategories from "./pages/admin/VendorCategories.jsx";
import BusinessRolesPermissionsPage from "./pages/admin/BusinessRolesPermissionsPage.jsx";
import BusinessTypes from "./pages/admin/BusinessTypes.jsx";
import AppKeys from "./pages/admin/AppKeys.jsx";
import Reports from "./pages/admin/Reports.jsx";
import TaxRatesPage from "./pages/admin/TaxRatesPage.jsx";
import ReferenceDataPage from "./pages/recipes/ReferenceDataPage.jsx";
import AdminPlaceholderPage from "./pages/admin/AdminPlaceholderPage.jsx";

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

function RequireAuth({user,children}){
 const location=useLocation();
 return user?children:<Navigate to="/login" replace state={{from:location.pathname}}/>;
}

function IndexModalRedirect({base,action="new"}){
 const {id}=useParams();
 const query=id?`edit=${encodeURIComponent(id)}`:`modal=${encodeURIComponent(action)}`;
 return <Navigate to={`${base}?${query}`} replace/>;
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

 const handleLoginSuccess=authUser=>{
  setUser(authUser||getStoredUser());
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
     <Route path="/poems" element={<Poems/>}/>
     <Route path="/poems/featured" element={<RequireAuth user={user}><PoemStatusPage statusType="featured"/></RequireAuth>}/>
     <Route path="/poems/published" element={<RequireAuth user={user}><PoemStatusPage statusType="published"/></RequireAuth>}/>
     <Route path="/poems/new" element={<RequireAuth user={user}><IndexModalRedirect base="/poems"/></RequireAuth>}/>
     <Route path="/poems/:id/edit" element={<RequireAuth user={user}><IndexModalRedirect base="/poems"/></RequireAuth>}/>
     <Route path="/authors" element={<AuthorsIndexPage/>}/>
     <Route path="/authors/new" element={<RequireAuth user={user}><IndexModalRedirect base="/authors"/></RequireAuth>}/>
     <Route path="/authors/:id/edit" element={<RequireAuth user={user}><IndexModalRedirect base="/authors"/></RequireAuth>}/>
     <Route path="/genres" element={<GenresIndexPage/>}/>
     <Route path="/publishers" element={<PublishersIndexPage/>}/>
     <Route path="/publishers/new" element={<RequireAuth user={user}><IndexModalRedirect base="/publishers"/></RequireAuth>}/>
     <Route path="/publishers/:id/edit" element={<RequireAuth user={user}><IndexModalRedirect base="/publishers"/></RequireAuth>}/>
     <Route path="/reminders" element={<RequireAuth user={user}><ReminderPage/></RequireAuth>}/>
     <Route path="/workflow/drafts" element={<RequireAuth user={user}><PoetryWorkflowPage mode="drafts"/></RequireAuth>}/>
     <Route path="/workflow/recent-poems" element={<RequireAuth user={user}><PoetryWorkflowPage mode="recentPoems"/></RequireAuth>}/>
     <Route path="/workflow/follow-ups" element={<RequireAuth user={user}><PoetryWorkflowPage mode="followUps"/></RequireAuth>}/>
     <Route path="/publications/planned" element={<RequireAuth user={user}><PoetryWorkflowPage mode="plannedPublications"/></RequireAuth>}/>

     <Route path="/reference/poetry-forms" element={<PoetryFormsReference isLoggedIn={Boolean(user)}/>}/>

     {/**User */}
     <Route path="/users" element={<RequireAuth user={user}><Users/></RequireAuth>}/>
     <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess}/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<RequireAuth user={user}><BusinessRolesPermissionsPage/></RequireAuth>}/>
     <Route path="/profile" element={<RequireAuth user={user}><UserProfilePage/></RequireAuth>}/>

     {/**Admin */}
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
     <Route path="/admin/vendor-categories" element={<RequireAuth user={user}><VendorCategories/></RequireAuth>}/>
     <Route path="/admin/tax-rates" element={<RequireAuth user={user}><TaxRatesPage/></RequireAuth>}/>
     <Route path="/admin/business-roles-permissions" element={<RequireAuth user={user}><BusinessRolesPermissionsPage/></RequireAuth>}/>
     <Route path="/admin/reports" element={<RequireAuth user={user}><Reports/></RequireAuth>}/>
     <Route path="/categories" element={<RequireAuth user={user}><ReferenceDataPage title="Recipe Categories" singular="Recipe Category" endpoint="/api/categories" description="Manage category values used by recipe records."/></RequireAuth>}/>
     <Route path="/cuisines" element={<RequireAuth user={user}><ReferenceDataPage title="Cuisines" singular="Cuisine" endpoint="/api/cuisines" description="Manage cuisine classifications for recipes."/></RequireAuth>}/>
     <Route path="/courses" element={<RequireAuth user={user}><ReferenceDataPage title="Courses" singular="Course" endpoint="/api/courses" description="Manage course classifications for recipes."/></RequireAuth>}/>
     <Route path="/recipes" element={<RequireAuth user={user}><AdminPlaceholderPage title="Recipes" description="Recipe records have backend routes, but the full recipe editor needs its required business, cuisine, course, category, and ingredient selectors connected before saving is safe."/></RequireAuth>}/>
     <Route path="/ingredients" element={<RequireAuth user={user}><AdminPlaceholderPage title="Ingredients" description="Ingredient navigation is wired to this safe page because ingredient API routes are not mounted in this app yet."/></RequireAuth>}/>
     <Route path="/meal-types" element={<RequireAuth user={user}><AdminPlaceholderPage title="Meal Types" description="Meal type navigation is wired to this safe page because meal type API routes are not mounted in this app yet."/></RequireAuth>}/>
     <Route path="/menus" element={<RequireAuth user={user}><AdminPlaceholderPage title="Menus" description="Menu navigation is wired to this safe page because menu API routes are not mounted in this app yet."/></RequireAuth>}/>
     <Route path="/admin/recipe-book-import" element={<RequireAuth user={user}><AdminPlaceholderPage title="Recipe Book Import" description="The import workflow page exists, but its parser and several lookup API routes are not mounted. This safe route prevents a broken import screen while those endpoints are connected."/></RequireAuth>}/>

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