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
import ContactUs from "./pages/contactus";
import FAQ from "./pages/faq";
import Privacy from "./pages/privacy";
import TermsOfService from "./pages/termsofservice";
import About from "./pages/about";
import Shop from "./pages/storefront/Shop.jsx";
import ProduceBoxes from "./pages/storefront/ProduceBoxes.jsx";
import HowItWorks from "./pages/storefront/HowItWorks.jsx";
import OurMission from "./pages/storefront/OurMission.jsx";
import Basket from "./pages/storefront/Basket.jsx";
import StaffPortal from "./pages/storefront/StaffPortal.jsx";
import Dashboard from "./pages/OperationalDashboard.jsx";
import BackupPage from "./pages/BackupPage.jsx";
import Products from "./pages/admin/inventory/Products.jsx";
import OperationalInventory from "./pages/admin/inventory/InventoryManagement.jsx";
import Stores from "./pages/admin/Stores.jsx";
import Orders from "./pages/admin/OrdersManagement.jsx";

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

//users
import Users from "./pages/admin/users/Users";
import Login from "./pages/admin/users/Login";
import UserProfilePage from "./pages/admin/users/UserProfilePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

//Reference
import AllergensPage from "./pages/allergens.jsx";

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

function ProtectedRoute({user,children,admin=false}){
 const location=useLocation();

 if(!user)return <Navigate to="/login" replace state={{from:location.pathname}}/>;

 if(admin){
  const getObjectId=value=>{
   if(!value)return "";
   if(typeof value==="string")return value.toLowerCase().trim();

   if(typeof value==="object"){
    if(typeof value.$oid==="string")return value.$oid.toLowerCase().trim();
    if(typeof value._id==="string")return value._id.toLowerCase().trim();
    if(typeof value.id==="string")return value.id.toLowerCase().trim();
    if(typeof value._id?.$oid==="string")return value._id.$oid.toLowerCase().trim();
    if(typeof value.id?.$oid==="string")return value.id.$oid.toLowerCase().trim();
   }

   return "";
  };

  const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b"];
  const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
  const ADMIN_ROLE_IDS=["69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"];
  const MANAGER_ROLE_IDS=["69edf92e1e6593dd5369f71a","69d389f609a4ebea1c3f634f"];

  const getRoleName=value=>{
   if(!value||typeof value!=="object")return "";
   return String(value.name||value.title||value.label||"").trim().toLowerCase();
  };

  const assignments=[
   ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
   ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
   ...(Array.isArray(user?.departmentAssignments)?user.departmentAssignments:[]),
   ...(Array.isArray(user?.userDepartmentAssignments)?user.userDepartmentAssignments:[]),
   ...(Array.isArray(user?.assignments)?user.assignments:[])
  ].filter(assignment=>assignment?.isActive!==false);

  const assignmentRoles=assignments
   .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole||assignment.department?.defaultRole)
   .filter(Boolean);

  const userId=getObjectId(user?._id||user?.id||user);

  const roleIds=[
   getObjectId(user?.role),
   getObjectId(user?.roleId),
   getObjectId(user?.currentRole),
   getObjectId(user?.activeRole),
   ...assignmentRoles.map(role=>getObjectId(role))
  ].filter(Boolean);

  const roleNames=[
   user?.role,
   user?.roleId,
   user?.currentRole,
   user?.activeRole,
   ...assignmentRoles
  ].map(getRoleName).filter(Boolean);

  const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
  const hasRoleName=names=>roleNames.some(name=>names.includes(name));

  const isKnownAdminUser=ADMIN_USER_IDS.includes(userId);
  const isOwner=isKnownAdminUser||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
  const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
  const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);

  if(!isAdmin&&!isManager)return <Navigate to="/403" replace/>;
 }

 return children;
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

   if(fieldWasTouched(field)&&(field.required||String(field.value||"").trim()))field.classList.add("is-valid");
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

 const showAdminBackLink=location.pathname.startsWith("/admin/")&&location.pathname!=="/admin/dashboard";

 return(
  <div className="app-layout">
   <Header onTitleChange={setHeaderTitle}/>
   <Navigation user={user} onLogout={handleLogout} brand={headerTitle}/>

   <main className={`app-content${location.pathname.startsWith("/admin")?" admin-content":""}`}>
    {showAdminBackLink&&location.pathname!=="/admin"?
     <div className="admin-back-row">
      <Link className="btn btn-outline-primary btn-sm" to="/admin/dashboard">Back to Admin Dashboard</Link>
     </div>
    :null}

    <Routes>
     <Route path="/" element={<Home/>}/>
     <Route path="/contact" element={<ContactUs/>}/>
     <Route path="/faq" element={<FAQ/>}/>
     <Route path="/privacy" element={<Privacy/>}/>
     <Route path="/terms" element={<TermsOfService/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="/shop" element={<Shop/>}/>
     <Route path="/produce-boxes" element={<ProduceBoxes/>}/>
     <Route path="/how-it-works" element={<HowItWorks/>}/>
     <Route path="/our-mission" element={<OurMission/>}/>
     <Route path="/basket" element={<Basket/>}/>
     <Route path="/staff" element={<StaffPortal user={user}/>}/>
     <Route path="/dashboard" element={<RequireAuth user={user}><Dashboard user={user}/></RequireAuth>}/>
     <Route path="/products" element={<RequireAuth user={user}><Products/></RequireAuth>}/>
     <Route path="/inventory" element={<RequireAuth user={user}><OperationalInventory/></RequireAuth>}/>
     <Route path="/stores" element={<RequireAuth user={user}><Stores/></RequireAuth>}/>
     <Route path="/orders" element={<RequireAuth user={user}><Orders/></RequireAuth>}/>
     <Route path="/backups" element={<ProtectedRoute user={user} admin><BackupPage user={user}/></ProtectedRoute>}/>
     <Route path="/referance/allergens" element={<ProtectedRoute user={user} admin><AllergensPage/></ProtectedRoute>}/>

     {/**User */}
     <Route path="/users" element={<ProtectedRoute user={user} admin><Users/></ProtectedRoute>}/>
     <Route path="/login" element={<Login/>}/>
     <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
     <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
     <Route path="/permissions" element={<ProtectedRoute user={user} admin><BusinessRolesPermissionsPage/></ProtectedRoute>}/>
     <Route path="/profile" element={<RequireAuth user={user}><UserProfilePage/></RequireAuth>}/>

     {/**Admin */}
     <Route path="/admin" element={<ProtectedRoute user={user} admin><AdminDashboard user={user}/></ProtectedRoute>}/>
     <Route path="/admin/dashboard" element={<ProtectedRoute user={user} admin><AdminDashboard user={user}/></ProtectedRoute>}/>
     <Route path="/admin/businesses" element={<ProtectedRoute user={user} admin><Businesses/></ProtectedRoute>}/>
     <Route path="/admin/business-types" element={<ProtectedRoute user={user} admin><BusinessTypes/></ProtectedRoute>}/>
     <Route path="/admin/app-keys" element={<ProtectedRoute user={user} admin><AppKeys/></ProtectedRoute>}/>
     <Route path="/admin/footers" element={<ProtectedRoute user={user} admin><Footers/></ProtectedRoute>}/>
     <Route path="/admin/seasons" element={<ProtectedRoute user={user} admin><Seasons/></ProtectedRoute>}/>
     <Route path="/admin/holidays" element={<ProtectedRoute user={user} admin><Holidays/></ProtectedRoute>}/>
     <Route path="/admin/occasions" element={<ProtectedRoute user={user} admin><Occasions/></ProtectedRoute>}/>
     <Route path="/admin/taglines" element={<ProtectedRoute user={user} admin><Taglines/></ProtectedRoute>}/>
     <Route path="/admin/vendors" element={<ProtectedRoute user={user} admin><Vendors/></ProtectedRoute>}/>
     <Route path="/admin/business-roles-permissions" element={<ProtectedRoute user={user} admin><BusinessRolesPermissionsPage/></ProtectedRoute>}/>
     <Route path="/admin/tax-rates" element={<ProtectedRoute user={user} admin><TaxRatesPage/></ProtectedRoute>}/>
     <Route path="/admin/inventory" element={<ProtectedRoute user={user} admin><OperationalInventory/></ProtectedRoute>}/>

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

   <Footer variant="site" title={headerTitle}/>
  </div>
 );

}

export default App;
