import {useBusinessBrand} from "./BusinessBrand.jsx";
import {useEffect} from "react";
import {Link,Route,Routes,useLocation} from "react-router-dom";
import PublicNavigation from "./components/PublicNavigation.jsx";
import PublicFooter from "./components/PublicFooter.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import FAQ from "./pages/FAQ.jsx";
import Contact from "./pages/Contact.jsx";
import "./public.css";
const titles={"/":"Accounting, tax & notary services","/about":"About us","/services":"Our services","/faq":"Frequently asked questions","/contact":"Contact us"};
export default function PublicSite(){const {pathname,hash}=useLocation();const {business}=useBusinessBrand();useEffect(()=>{document.title=(titles[pathname]||"Page not found")+" | "+(business?.legalName||"Barrow Accounting & Tax Services");if(hash){document.getElementById(hash.slice(1))?.scrollIntoView();}else{window.scrollTo(0,0);document.getElementById("public-main")?.focus();}},[pathname,hash,business?.legalName]);return <div className="bats-public"><a className="bats-skip" href="#public-main">Skip to content</a><PublicNavigation/><main id="public-main" tabIndex={-1}><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="services" element={<Services/>}/><Route path="faq" element={<FAQ/>}/><Route path="contact" element={<Contact/>}/><Route path="*" element={<section className="bats-section bats-wrap"><h1>Page not found</h1><Link to="/">Return home</Link></section>}/></Routes></main><PublicFooter/></div>;}
