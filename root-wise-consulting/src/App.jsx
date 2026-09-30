import WorkflowPlaceholder from "@shared/components/WorkflowPlaceholder.jsx";
// src/App.jsx
import {Routes,Route,useNavigate,useLocation,Navigate,Link} from "react-router-dom";
import {useState,useEffect} from "react";
import {applyBusinessTheme,clearBusinessTheme} from "./utils/applyBusinessTheme.js";

//components
import Header from "./components/Header.jsx";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";

//pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/contactus";
import FAQ from "./pages/faq";
import Privacy from "./pages/privacy";
import TermsOfService from "./pages/termsofservice";
import About from "./pages/about";

//admin
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
import Vendors from "./pages/admin/Vendors.jsx";
import CategoryPage from "./pages/admin/CategoryPage.jsx";
import CoursePage from "./pages/admin/CoursePage.jsx";
import Cuisines from "./pages/admin/Cuisines.jsx";
import DietaryPage from "./pages/admin/DietaryPage.jsx";
import VendorCategories from "./pages/admin/VendorCategoriesPage.jsx";
import VendorIngredientPrices from "./pages/admin/VendorIngredientPricesPage.jsx";

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

 const [headerTitle,setHeaderTitle]=useState("");
 const [user,setUser]=useState(()=>getStoredUser());

 useEffect(()=>{
  const syncUser=()=>setUser(getStoredUser());
  window.addEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
  // Catch authentication received between the first render and effect setup.
  syncUser();
  return()=>window.removeEventListener("ECOSPHERE_AUTH_UPDATED",syncUser);
 },[]);

 useEffect(()=>setUser(getStoredUser()),[location.pathname]);

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
    if(!business)clearBusinessTheme();
    else applyBusinessTheme(business);
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
  const keys=["token","user","userInfo","authUser","currentUser"];
  keys.forEach(k=>{
   localStorage.removeItem(k);
   sessionStorage.removeItem(k);
  });
  setUser(null);
  navigate("/",{replace:true});
 };

 return(
  <div className="app-layout">
   <Header onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>

   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    {location.pathname.startsWith("/admin/")&&!["/admin","/admin/dashboard"].includes(location.pathname)&&
     <div className="admin-back-row">
      <Link className="btn btn-outline-primary btn-sm" to="/admin/dashboard">Back to Admin Dashboard</Link>
     </div>
    }

    <Routes>
     <Route path="/" element={<Home title={headerTitle||undefined}/>}/>
     <Route path="/dashboard" element={<Dashboard user={user}/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>

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
     <Route path="/admin/vendors" element={<Vendors/>}/>
     <Route path="/admin/tax-rates" element={<TaxRatesPage/>}/>
     <Route path="/admin/business-roles-permissions" element={<BusinessRolesPermissionsPage/>}/>

     <Route path="/users" element={<Navigate to="/admin/users" replace/>}/>
     <Route path="/admin/users" element={<Users/>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/profile" element={<UserProfilePage/>}/>

     <Route path="/admin/categories" element={<CategoryPage/>}/>
     <Route path="/admin/courses" element={<CoursePage/>}/>
     <Route path="/admin/cuisines" element={<Cuisines/>}/>
     <Route path="/admin/dietaries" element={<DietaryPage/>}/>
     <Route path="/admin/vendor-categories" element={<VendorCategories/>}/>
     <Route path="/admin/vendor-ingredient-prices" element={<VendorIngredientPrices/>}/>

     <Route path="/400" element={<Error400/>}/>
     <Route path="/401" element={<Error401/>}/>
     <Route path="/403" element={<Error403/>}/>
     <Route path="/404" element={<Error404/>}/>
     <Route path="/500" element={<Error500/>}/>
     <Route path="/502" element={<Error502/>}/>
     <Route path="/503" element={<Error503/>}/>
     <Route path="/504" element={<Error504/>}/>

     <Route path="*" element={<Error404/>}/>
         <Route path="/low-stock" element={<WorkflowPlaceholder title="Low Stock"/>}/>
     <Route path="/expiring" element={<WorkflowPlaceholder title="Expiring"/>}/>
     <Route path="/items" element={<WorkflowPlaceholder title="Items"/>}/>
     <Route path="/shopping-list" element={<WorkflowPlaceholder title="Shopping List"/>}/>
     <Route path="/items/add" element={<WorkflowPlaceholder title="Items / Add"/>}/>
     <Route path="/categories" element={<CategoryPage/>}/>
     <Route path="/services/menu-review" element={<WorkflowPlaceholder title="Services / Menu Review"/>}/>
     <Route path="/services/menu-development" element={<WorkflowPlaceholder title="Services / Menu Development"/>}/>
     <Route path="/services/opening-support" element={<WorkflowPlaceholder title="Services / Opening Support"/>}/>
     <Route path="/process" element={<WorkflowPlaceholder title="Process"/>}/>
     <Route path="/case-studies" element={<WorkflowPlaceholder title="Case Studies"/>}/>
     <Route path="/results" element={<WorkflowPlaceholder title="Results"/>}/>
     <Route path="/journal" element={<WorkflowPlaceholder title="Journal"/>}/>
     <Route path="/resources" element={<WorkflowPlaceholder title="Resources"/>}/>
     <Route path="/permissions" element={<BusinessRolesPermissionsPage/>}/>
    </Routes>
   </main>

   <Footer variant="site" title={headerTitle}/>
  </div>
 );
}

export default App;