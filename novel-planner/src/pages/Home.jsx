// src/pages/Home.jsx
import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

function Home({
 title="Novel Planner",
 text="A writing workspace for planning characters, plot, scenes, chapters, daily work, and word-count progress.",
 alt="Novel planner"
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
