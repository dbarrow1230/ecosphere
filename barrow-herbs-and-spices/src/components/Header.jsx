import defaultLogo from "../images/logo.png";
import {useEffect} from "react";
import {CurrentDateTime} from "@shared";
import "./Header.css";

export default function Header({logo=defaultLogo,logoAlt="Herbs & Spices logo",eyebrow="Herbs · Spices · Original Blends",title="Herbs & Spices",text="Blend recipes, production, inventory, and sales.",userDetails=null,onTitleChange}){
 useEffect(()=>{if(onTitleChange)onTitleChange(title);},[title,onTitleChange]);
 const details=userDetails?.userDetails||userDetails?.details||{};
 const fullName=[details.firstName,details.lastName].filter(Boolean).join(" ");
 return <header className="site-header"><div className="site-header-inner"><div className="site-header-content">
  <div className="site-header-col site-header-col-left"><div className="site-header-logo-wrap"><img src={logo||defaultLogo} alt={logoAlt} className="site-header-logo" onError={event=>{if(event.currentTarget.getAttribute("src")!==defaultLogo)event.currentTarget.src=defaultLogo;}}/></div><div className="site-header-text-wrap"><p className="site-header-eyebrow">{eyebrow}</p><h1 className="site-header-title">{fullName&&<span className="site-header-user">{fullName}'s </span>}<span className="site-header-title-leafy">{title}</span></h1><p className="site-header-text">{text}</p></div></div>
  <div className="site-header-col site-header-col-right"><div className="site-header-datetime"><CurrentDateTime/></div></div>
 </div></div></header>;
}
