import {Navigate} from "react-router-dom";
import Donations from "./Donations.jsx";
import {Routes,Route} from "react-router-dom";
import SiteShell from "./SiteShell.jsx";
import NotFoundPage from "./pages/NotFound.jsx";
import content from "./siteContent.js";
import logo from "../images/Logo.png";
import hero from "../images/hero_Image.png";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Offerings from "./pages/Offerings.jsx";
const site={...content,logo,hero};
export default function PublicSite(){return <SiteShell site={site}><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="faq" element={<FAQ/>}/>{site.pages.map(page=><Route key={page.slug} path={page.slug} element={<Offerings pageKey={page.slug}/>}/>)}<Route path="donate" element={<Donations/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></SiteShell>;}

