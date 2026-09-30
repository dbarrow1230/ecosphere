// src/App.jsx
import {Routes,Route,Navigate,Link,useNavigate,useLocation,useParams} from "react-router-dom";
import {useState,useEffect} from "react";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

//components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";

//pages
import Home from "./pages/Home.jsx";
import ContactUs from "./pages/contactus.jsx";
import FAQ from "./pages/faq.jsx";
import Privacy from "./pages/privacy.jsx";
import TermsOfService from "./pages/termsofservice.jsx";
import About from "./pages/about.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Recipes from "./pages/recipes/Recipes.jsx";
import Ingredients from "./pages/recipes/Ingredients.jsx";
import Categories from "./pages/recipes/Categories.jsx";
import Cuisines from "./pages/recipes/Cuisines.jsx";
import MealTypes from "./pages/recipes/MealTypes.jsx";
import Courses from "./pages/recipes/Courses.jsx";
import RecipeCostingWorksheetsPage from "./pages/recipes/recipe-costing/RecipeWorksheetsPage.jsx";
import CostingWorksheetPage from "./pages/recipes/recipe-costing/CostingWorksheetPage.jsx";

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
import MenuManager from "./pages/admin/MenuManager.jsx";
import RecipeBookImport from "./pages/admin/RecipeBookImport.jsx";

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
 const [currentBusiness,setCurrentBusiness]=useState(null);

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
   setCurrentBusiness(null);
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
     if(!ignore){
      setCurrentBusiness(null);
      clearBusinessTheme();
     }
     return;
    }

    if(!res.ok)throw new Error("Failed to load current app business");

    const data=await res.json();
    const business=unwrapBusiness(data);

    if(ignore)return;
    if(!business?.themeColors)throw new Error("Business theme missing");

    setCurrentBusiness(business);
    applyBusinessTheme(business);
   }catch(err){
    console.error("Business theme load failed",err);

    if(!ignore){
     setCurrentBusiness(null);
     clearBusinessTheme();
    }
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
   <Header userDetails={user} business={currentBusiness} onTitleChange={setHeaderTitle}/>
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
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>
     <Route path="/recipes" element={<Recipes/>}/>
     <Route path="/ingredients" element={<Ingredients/>}/>
     <Route path="/categories" element={<Categories/>}/>
     <Route path="/cuisines" element={<Cuisines/>}/>
     <Route path="/meal-types" element={<MealTypes/>}/>
     <Route path="/courses" element={<Courses/>}/>
     <Route path="/menus" element={<MenuManager/>}/>
     <Route path="/contacts" element={<ContactUs/>}/>
     <Route path="/recipes/costing-worksheets" element={<RecipeCostingWorksheetsPage/>}/>
     <Route path="/recipes/costing-worksheets/:worksheet" element={<CostingWorksheetPage/>}/>

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
     <Route path="/admin/vendors" element={<Vendors/>}/>
     <Route path="/admin/vendor-categories" element={<VendorCategories/>}/>
     <Route path="/admin/reports" element={<Reports/>}/>
     <Route path="/admin/recipe-book-import" element={<RecipeBookImport/>}/>
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
