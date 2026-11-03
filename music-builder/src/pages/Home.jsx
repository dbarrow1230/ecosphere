import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({
 title="Music Builder",
 text="Capture chord ideas, build progressions, develop lyrics and arrangements, explore music theory references, and connect your musical ideas across projects.",
 alt="Music Builder workspace preview"
}){
 return(
  <section className="home-hero">
   {hero&&(
    <img
     src={hero}
     alt={alt}
     className="home-hero-image"
    />
   )}
   <div className="home-hero-overlay">
    <div className="home-hero-content">
     <h1 className="home-hero-title">{title}</h1>
     <p className="home-hero-text">{text}</p>
     <Link to="/dashboard" className="home-hero-button">
      Go to Dashboard
     </Link>
    </div>
   </div>
  </section>
 );
}