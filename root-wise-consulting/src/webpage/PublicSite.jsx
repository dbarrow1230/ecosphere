import {Routes,Route} from "react-router-dom";
import {Link} from "react-router-dom";
import RootWiseShell from "./RootWiseShell.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Approach from "./pages/Approach.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
export default function PublicSite(){return <RootWiseShell><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="services" element={<Services/>}/><Route path="approach" element={<Approach/>}/><Route path="contact" element={<Contact/>}/><Route path="faq" element={<FAQ/>}/><Route path="*" element={<section className="rw-page"><h1>Page not found.</h1><Link to="/">Return to Root Wise</Link></section>}/></Routes></RootWiseShell>;}
