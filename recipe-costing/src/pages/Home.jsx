import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({title="Application Template",text="A generic base app with reference records, users, roles, departments, and admin setup.",alt="Application template"}){
 return <section className="home-hero">{hero&&<img src={hero} alt={alt} className="home-hero-image"/>}<div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{title}</h1><p className="home-hero-text">{text}</p><Link to="/dashboard" className="home-hero-button">Go to Dashboard</Link></div></div></section>;
}
