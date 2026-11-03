import {assetUrl} from "@shared/public/usePublicBusiness.js";
import Locations from './pages/admin/Locations.jsx';
import LocationTypes from './pages/admin/LocationTypes.jsx';
import MetricUnits from './pages/admin/MetricUnits.jsx';
import ImperialUnits from './pages/admin/ImperialUnits.jsx';
import {applyBusinessTheme,clearBusinessTheme} from './utils/applyBusinessTheme.js';
import {getRuntimeAppKey} from './utils/currentBusiness.js';
import Businesses from './pages/admin/Businesses.jsx';
import BusinessTypes from './pages/admin/BusinessTypes.jsx';
import AppKeys from './pages/admin/AppKeys.jsx';
import Footers from './pages/admin/Footers.jsx';
import Seasons from './pages/admin/Seasons.jsx';
import Holidays from './pages/admin/Holidays.jsx';
import Occasions from './pages/admin/Occasions.jsx';
import Taglines from './pages/admin/Taglines.jsx';
import TaxRatesPage from './pages/admin/TaxRatesPage.jsx';
import BusinessRolesPermissionsPage from './pages/admin/BusinessRolesPermissionsPage.jsx';
import SharedVendors from './pages/admin/Vendors.jsx';
import Users from './pages/admin/users/Users.jsx';
import UserProfilePage from './pages/admin/users/UserProfilePage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import { StudioProvider, useStudio } from "./utils/studioContext.jsx";
import { storedSession } from '../../shared/public/websiteAccess.js';
import usePublicBusiness from '../../shared/public/usePublicBusiness.js';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BlendPage from "./pages/products/BlendsPage.jsx";
import BlendFormPage from "./pages/products/BlendFormPage.jsx";
import HerbPage from "./pages/admin/Herbs.jsx";
import SpicePage from "./pages/admin/Spices.jsx";
import StockPage from "./pages/admin/inventory/StockPage.jsx";
import ProductionPage from "./pages/Production.jsx";
import BatchPage from "./pages/Batches.jsx";
import OrderPage from "./pages/admin/Orders.jsx";
import VendorPage from "./pages/vendors/IngredientVendorPage.jsx";
import EquipmentPage from "./pages/equipment/EquipmentPage.jsx";
import KitchenEquipmentPage from "./pages/equipment/KitchenEquipmentPage.jsx";
import EquipmentVendorPage from "./pages/vendors/EquipmentVendorPage.jsx";
import CategoryPage from "./pages/admin/Categories.jsx";
import TypePage from "./pages/admin/Types.jsx";
import About from './pages/about.jsx';
import Contact from './pages/contactus.jsx';
import FAQ from './pages/faq.jsx';
import Privacy from './pages/privacy.jsx';
import Terms from './pages/termsofservice.jsx';
import Login from './pages/admin/users/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import NotFound from './components/errorpages/Error404.jsx';
function RequireAuth({
  user,
  children
}) {
  const {
    data,
    error,
    refresh
  } = useStudio();
  if (!user) return <Navigate to="/login" replace />;
  if (!data) return <section className="py-4"><p role={error ? 'alert' : 'status'}>{error || 'Loading Herbs & Spices…'}</p>{error && <button className="btn btn-primary" onClick={refresh}>Retry</button>}</section>;
  return children;
}
function Application() {
  const [headerTitle,setHeaderTitle]=useState("Herbs & Spices");
  const [user, setUser] = useState(storedSession),
    brand = usePublicBusiness(getRuntimeAppKey()||'herbs-spices');
  const location=useLocation(),navigate=useNavigate();
  useEffect(()=>{setUser(storedSession());},[location.pathname]);
  useEffect(()=>{if(brand.business)applyBusinessTheme(brand.business);else clearBusinessTheme();},[brand.business]);
  const logout=()=>{for(const storage of [localStorage,sessionStorage])for(const key of ['token','user','userInfo','authUser','currentUser'])storage.removeItem(key);setUser(null);navigate('/');};
  const {
    error,
    notice,
    refresh
  } = useStudio();
  useEffect(() => {
    const sync = () => setUser(storedSession());
    window.addEventListener('ECOSPHERE_AUTH_UPDATED', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ECOSPHERE_AUTH_UPDATED', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  useEffect(()=>{if(user)refresh();},[user?._id,user?.id,refresh]);
  const protect = page => <RequireAuth user={user}>{page}</RequireAuth>;
  return <div className="app-shell" style={brand.style}><Header logo={assetUrl(brand.business?.logo)} logoAlt={`${brand.business?.legalName||"Herbs & Spices"} logo`} title={brand.business?.legalName||"Herbs & Spices"} eyebrow={brand.tagline||undefined} userDetails={user} onTitleChange={setHeaderTitle}/><Navigation user={user} onLogout={logout} brand={headerTitle}/><main className="admin-content" id="main-content"><div className="container-fluid py-4">{user && error && <div className="alert alert-danger" role="alert">{error} <button className="btn btn-sm" onClick={refresh}>Retry</button></div>}{notice && <div className="alert alert-success" role="status">{notice}</div>}<Routes>
 <Route path="/" element={<Home title={headerTitle}/>} /><Route path="/dashboard" element={protect(<Dashboard />)} />
 <Route path="/blends" element={protect(<BlendPage />)} /><Route path="/blends/new" element={protect(<BlendFormPage />)} /><Route path="/blends/:id/edit" element={protect(<BlendFormPage />)} />
 <Route path="/herbs" element={protect(<HerbPage />)} /><Route path="/spices" element={protect(<SpicePage />)} /><Route path="/stock" element={protect(<StockPage />)} />
 <Route path="/production" element={protect(<ProductionPage />)} /><Route path="/batches" element={protect(<BatchPage />)} /><Route path="/orders" element={protect(<OrderPage />)} />
 <Route path="/vendors" element={protect(<VendorPage />)} /><Route path="/equipment" element={protect(<EquipmentPage />)} /><Route path="/kitchen-equipment" element={protect(<KitchenEquipmentPage />)} /><Route path="/equipment-vendors" element={protect(<EquipmentVendorPage />)} /><Route path="/categories" element={protect(<CategoryPage />)} /><Route path="/types" element={protect(<TypePage />)} />
 <Route path="/admin" element={protect(<AdminDashboard user={user}/>)} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/faq" element={<FAQ />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/login" element={<Login user={user} />} /><Route path="*" element={<NotFound />} />
 <Route path="/admin/businesses" element={user?<Businesses/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/business-types" element={user?<BusinessTypes/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/app-keys" element={user?<AppKeys/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/footers" element={user?<Footers/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/seasons" element={user?<Seasons/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/holidays" element={user?<Holidays/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/occasions" element={user?<Occasions/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/taglines" element={user?<Taglines/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/tax-rates" element={user?<TaxRatesPage/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/business-roles-permissions" element={user?<BusinessRolesPermissionsPage/>:<Navigate to="/login" replace/>}/>
<Route path="/permissions" element={user?<BusinessRolesPermissionsPage/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/vendors" element={user?<SharedVendors/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/users" element={user?<Users/>:<Navigate to="/login" replace/>}/>
<Route path="/users" element={user?<Users/>:<Navigate to="/login" replace/>}/>
<Route path="/profile" element={user?<UserProfilePage/>:<Navigate to="/login" replace/>}/>
<Route path="/admin/dashboard" element={user?<AdminDashboard user={user}/>:<Navigate to="/login" replace/>}/><Route path="/forgot-password" element={<ForgotPasswordPage/>}/><Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
<Route path="/admin/locations" element={user?<Locations/>:<Navigate to="/login" replace/>}/><Route path="/admin/location-types" element={user?<LocationTypes/>:<Navigate to="/login" replace/>}/><Route path="/admin/metric-units" element={user?<MetricUnits/>:<Navigate to="/login" replace/>}/><Route path="/admin/imperial-units" element={user?<ImperialUnits/>:<Navigate to="/login" replace/>}/></Routes></div></main><Footer variant="site" title={headerTitle} mapQuery={[brand.business?.addressLine1,brand.business?.addressLine2,brand.business?.city,brand.business?.postalCode].filter(Boolean).join(", ")} phone={brand.business?.phone||""} fax={brand.business?.fax||""} email={brand.business?.email||""}/></div>;
}
export default function App() {
  return <StudioProvider><Application /></StudioProvider>;
}
