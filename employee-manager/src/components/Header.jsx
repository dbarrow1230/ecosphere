// src/components/Header.jsx
import {useEffect} from "react";
import logo from "../images/logo.png";
import {CurrentDateTime} from "@shared";
import "./Header.css";

function Header({
 logoAlt="Employee Manager",
 eyebrow="Employee Management",
 title="Employee Manager",
 text="Manage employees, payroll, scheduling, events, and employee records.",
 onTitleChange
}){

 useEffect(()=>{
  if(onTitleChange)onTitleChange(title);
 },[title,onTitleChange]);

 return(
  <header className="site-header">
   <div className="site-header-inner">
    <div className="site-header-content">

     <div className="site-header-col site-header-col-left">
      <div className="site-header-logo-wrap">
       {logo&&(
        <img src={logo} alt={logoAlt} className="site-header-logo"/>
       )}
      </div>

      <div className="site-header-text-wrap">
       <p className="site-header-eyebrow">{eyebrow}</p>

       <h1 className="site-header-title">
        <span className="site-header-title-leafy">{title}</span>
       </h1>

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