import {Link} from "react-router-dom";
import hero from "../images/hero_image.webp";
import "../styles/Home.css";

export default function Home({title="Pro Edge Knife System",text="Design, configure, and manage professional knife sets with integrated sharpening systems.",alt="Pro Edge professional knife block and chef knife system"}){
 return <section className="home-hero"><img src={hero} alt={alt} className="home-hero-image"/><div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{title}</h1><p className="home-hero-text">{text}</p><Link to="/dashboard" className="home-hero-button">Open Dashboard</Link></div></div></section>;
}
