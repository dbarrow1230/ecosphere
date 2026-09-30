// src/pages/Home.jsx
import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

function Home({
 title="",
 text="From the Ground Up is a community-powered movement where people experiencing homelessness rebuild their lives by rebuilding the spaces around them. We combine housing stabilization, real skills, and everyday dignity into one ecosystem.",
 alt="From the Ground Up"
}){


  return(
   <section className="home-hero">
    <img src={hero} alt={alt} className="home-hero-image" />
 
    <div className="home-hero-overlay">
     <div className="home-hero-content">
      <h1 className="home-hero-title">{title}</h1>
      <p className="home-hero-text">{text}</p>
      <Link to="/dashboard" className="home-hero-button">Open Dashboard</Link>
     </div>
    </div>
 
   </section>
  );
 
 }
 
 export default Home;