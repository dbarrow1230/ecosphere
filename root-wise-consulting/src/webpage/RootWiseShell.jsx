import {createContext,useContext,useEffect,useState} from "react";
import {Link,NavLink,useLocation} from "react-router-dom";
import {ArrowUpRight,ChefHat,Menu,X} from "lucide-react";
import usePublicBusiness,{assetUrl} from "../../../shared/public/usePublicBusiness.js";
import content from "./siteContent.js";
import logo from "../images/logo.png";
import hero from "../images/hero_image.png";
const Context=createContext(null);
export const useRootWise=()=>useContext(Context);
const links=[["/","The starting point"],["/services","Consulting expertise"],["/approach","Working together"],["/about","About Root Wise"],["/faq","Your questions"]];
export default function RootWiseShell({children}){
 const brand=usePublicBusiness("root-wise-consulting"),{pathname}=useLocation();
 const [open,setOpen]=useState(false);
 const name=brand.business?.legalName||content.name;
 useEffect(()=>{setOpen(false);document.title=`${pathname==="/"?"Culinary consulting":pathname.slice(1).replaceAll('-',' ')} | ${name}`;window.scrollTo(0,0);document.getElementById("root-wise-content")?.focus();},[pathname,name]);
 return <Context.Provider value={{...brand,name,content,hero}}><div className="rw-site" style={brand.style}>
  <a className="rw-skip" href="#root-wise-content">Skip to content</a>
  <header className="rw-rail">
   <Link className="rw-wordmark" to="/"><img src={assetUrl(brand.business?.logo)||logo} alt=""/><span>{name}</span></Link>
   {brand.tagline&&<p className="rw-saved-tagline">{brand.tagline}</p>}
   <button className="rw-menu" onClick={()=>setOpen(value=>!value)} aria-label={open?"Close navigation":"Open navigation"} aria-controls="rw-navigation" aria-expanded={open}>{open?<X/>:<Menu/>}</button>
   <nav id="rw-navigation" className={open?"is-open":""} aria-label="Root Wise navigation">{links.map(([to,label])=><NavLink key={to} to={to} end={to==="/"}><span>{label}</span><ArrowUpRight size={16}/></NavLink>)}</nav>
   <div className="rw-rail-bottom"><ChefHat size={30} aria-hidden="true"/><Link className="rw-action" to="/contact">Bring your challenge<ArrowUpRight size={18}/></Link></div>
  </header>
  <div className="rw-content-frame"><main id="root-wise-content" tabIndex={-1}>{!brand.business&&<div className="rw-settings-note" role="status">Connecting to your business settings. <button onClick={()=>window.location.reload()}>Retry</button></div>}{children}</main>
   <footer className="rw-endnote"><div><span>{name}</span><small>Culinary & food-service consulting</small></div><Link to="/contact">Let’s talk about your operation<ArrowUpRight size={18}/></Link><small>© {new Date().getFullYear()}</small></footer>
  </div>
 </div></Context.Provider>;
}
