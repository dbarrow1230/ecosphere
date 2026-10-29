import {Navigate} from "react-router-dom";
import {Routes,Route} from "react-router-dom";
import {PublicWebsiteShell,NotFoundPage} from "../../../shared/public/PublicWebsite.jsx";
import content from "./siteContent.js";
import logo from "../images/logo.png";
import hero from "../images/hero_image.png";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Offerings from "./pages/Offerings.jsx";
const site={...content,logo,hero};
export default function PublicSite(){return <PublicWebsiteShell site={site}><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="faq" element={<FAQ/>}/>{site.pages.map(page=><Route key={page.slug} path={page.slug} element={<Offerings pageKey={page.slug}/>}/>)}<Route path="*" element={<NotFoundPage/>}/></Routes></PublicWebsiteShell>;}
