import {Navigate} from "react-router-dom";
import KitchenMenu from "./KitchenMenu.jsx";
import {Routes,Route} from "react-router-dom";
import SiteShell from "./SiteShell.jsx";
import NotFoundPage from "./pages/NotFound.jsx";
import content from "./siteContent.js";
import logo from "../images/logo.png";
import hero from "../images/hero_image.png";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Offerings from "./pages/Offerings.jsx";
const site={...content,logo,hero};
export default function PublicSite(){return <SiteShell site={site}><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="faq" element={<FAQ/>}/>{site.pages.map(page=><Route key={page.slug} path={page.slug} element={page.slug==="menu"?<KitchenMenu/>:<Offerings pageKey={page.slug}/>}/>)}<Route path="food" element={<Navigate to="/menu" replace/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></SiteShell>;}

