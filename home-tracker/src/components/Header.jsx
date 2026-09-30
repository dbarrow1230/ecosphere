// src/components/Header.jsx
import logo from "../images/logo.png";
import {CurrentDateTime} from "@shared";
import "./Header.css";

function Header({
 logoAlt="Home Tracker Logo",
 eyebrow="Inventory System",
 title="Home Tracker",
 text="Track your pantry and household items in one place."
}){

 return(
  <header className="site-header">
   <div className="site-header-inner">
    <div className="site-header-content">

     <div className="site-header-logo-wrap">
      {logo&&(
       <img src={logo} alt={logoAlt} className="site-header-logo"/>
      )}
     </div>

     <div className="site-header-text-wrap">
      <p className="site-header-eyebrow">{eyebrow}</p>
      <h1 className="site-header-title">{title}</h1>
      <p className="site-header-text">{text}</p>
     </div>

     <div className="site-header-datetime">
      <CurrentDateTime/>
     </div>

    </div>
   </div>
  </header>
 );
}

export default Header;