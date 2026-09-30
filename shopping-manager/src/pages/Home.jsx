import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({title="Shopping Manager",text="Plan your daily life with clarity, purpose, and direction.",alt="Chorna Lifeboard home page"}){
 return <section className="home-hero">{hero&&<img src={hero} alt={alt} className="home-hero-image"/>}<div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{title}</h1><p className="home-hero-text">{text}</p><Link to="/dashboard" className="home-hero-button">Go to Dashboard</Link></div></div></section>;
}
