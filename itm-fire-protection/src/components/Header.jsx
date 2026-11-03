// src/components/Header.jsx
import {useEffect} from "react";
import {Image} from "react-bootstrap";
import {assets} from "../utils/assets";
import {CurrentDateTime} from "@shared";
import "./Header.css";

function Header({
 logoAlt="ITM Fire Protection & Equipment",
 eyebrow="Commercial Fire Protection & Equipment",
 title="ITM Fire Protection & Equipment",
 text="Inspection, testing, maintenance, and fire-protection equipment for businesses across Brooklyn and NYC.",
 onTitleChange
}){

 useEffect(()=>{
  if(onTitleChange)onTitleChange(title);
 },[title,onTitleChange]);

 return(
  <header className="site-header" style={{position:"static",top:"auto"}}>
   <div className="site-header-inner">
    <div className="site-header-content">

     <div className="site-header-col site-header-col-left">
      <div className="site-header-logo-wrap">
       {assets.logo&&(
        <Image src={assets.logo} alt={logoAlt} className="site-header-logo"/>
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