import {useEffect} from "react";
import logo from "../images/logo.png";
import {CurrentDateTime} from "@shared";
import "./Header.css";

export default function Header({logoAlt="Ham Radio Logger",eyebrow="Ham Radio Logger",title="Ham Radio Logger",text="Log contacts, track stations, manage bands, modes, and QSO records.",userDetails=null,onTitleChange}){
 useEffect(()=>{if(onTitleChange)onTitleChange(title);},[title,onTitleChange]);
 const details=userDetails?.userDetails||userDetails?.details||{};
 const fullName=[details.firstName,details.lastName].filter(Boolean).join(" ");
 return <header className="site-header"><div className="site-header-inner"><div className="site-header-content">
  <div className="site-header-col site-header-col-left"><div className="site-header-logo-wrap">{logo&&<img src={logo} alt={logoAlt} className="site-header-logo"/>}</div><div className="site-header-text-wrap"><p className="site-header-eyebrow">{eyebrow}</p><h1 className="site-header-title">{fullName&&<span className="site-header-user">{fullName}'s </span>}<span className="site-header-title-leafy">{title}</span></h1><p className="site-header-text">{text}</p></div></div>
  <div className="site-header-col site-header-col-right"><div className="site-header-datetime"><CurrentDateTime/></div></div>
 </div></div></header>;
}
