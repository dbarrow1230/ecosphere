import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({title="Fresh Roots Flavor Kitchen",text="A modern kitchen grounded in sustainable practices. We transform responsibly sourced ingredients into refined, flavor-forward dishes that honor both craft and environment.",alt="Antinet Zettelkasten Knowledge System"}){
 return <section className="home-hero">{hero&&<img src={hero} alt={alt} className="home-hero-image"/>}<div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{title}</h1><p className="home-hero-text">{text}</p><Link to="/dashboard" className="home-hero-button">Dashboard</Link></div></div></section>;
}
