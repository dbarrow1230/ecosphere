import {Navigate} from "react-router-dom";
import {ShopPage,ProductPage,BasketPage} from "../../../shared/public/Commerce.jsx";
import KnifeBuilder from "../../../shared/public/KnifeBuilder.jsx";
import {Routes,Route} from "react-router-dom";
import {PublicWebsiteShell,NotFoundPage} from "../../../shared/public/PublicWebsite.jsx";
import content from "./siteContent.js";
import logo from "../images/logo.svg";
import hero from "../images/hero_image.webp";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Offerings from "./pages/Offerings.jsx";
const site={...content,logo,hero};
export default function PublicSite(){return <PublicWebsiteShell site={site}><Routes><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="faq" element={<FAQ/>}/>{site.pages.map(page=><Route key={page.slug} path={page.slug} element={page.slug==="shop"?<ShopPage/>:<Offerings pageKey={page.slug}/>}/>)}<Route path="shop/:productId" element={<ProductPage/>}/><Route path="basket" element={<BasketPage/>}/><Route path="custom-builder" element={<KnifeBuilder/>}/><Route path="knife-systems" element={<Navigate to="/shop" replace/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></PublicWebsiteShell>;}
