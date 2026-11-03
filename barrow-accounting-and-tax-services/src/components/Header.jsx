// src/components/Header.jsx
import {useEffect} from "react";
import logo from "../images/logo.png";
import {CurrentDateTime} from "@shared";
import "./Header.css";

function Header({
 logoAlt="Barrow Accounting & Tax Services logo",
 eyebrow="Barrow Enterprises",
 title="Barrow Accounting & Tax Services",
 text="Accounting, bookkeeping, and tax services.",
 onTitleChange
}){

 useEffect(()=>{
  if(onTitleChange)onTitleChange(title);
 },[onTitleChange,title]);

 return(
  <header className="site-header">
   <div className="site-header-inner">
    <div className="site-header-content">

     <div className="site-header-col site-header-col-left">
      <div className="site-header-logo-wrap">
       <img src={logo} alt={logoAlt} className="site-header-logo"/>
      </div>

      <div className="site-header-text-wrap">
       <p className="site-header-eyebrow">{eyebrow}</p>
       <h1 className="site-header-title">{title}</h1>
       <p className="site-header-text">{text}</p>
      </div>
     </div>

     <div className="site-header-col site-header-col-right">
      <div className="site-header-datetime">
       <CurrentDateTime/>
      </div>
     </div>

    </div>
   </div>
  </header>
 );
}

export default Header;
