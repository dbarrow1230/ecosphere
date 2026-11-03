// src/pages/Home.jsx
import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

function Home(){

 return(
  <section className="home-hero">

   <img
    src={hero}
    alt="Eco Sphere connected application workspace"
    className="home-hero-image"
   />

   <div className="home-hero-overlay">
    <div className="home-hero-content">
     <h1 className="home-hero-title">Eco Sphere</h1>
     <p className="home-hero-text">Your connected application workspace.</p>
     <Link to="/dashboard" className="home-hero-button">Dashboard</Link>
    </div>
   </div>

  </section>
 );

}

export default Home;
