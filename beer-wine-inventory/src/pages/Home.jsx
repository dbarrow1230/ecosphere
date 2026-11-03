import {Link} from "react-router-dom";
import hero from "../images/heroimage.png";
import "../styles/Home.css";

export default function Home({title="Beverage Inventory Management System",text="Track stock levels, manage suppliers, and monitor your beer, wine, and beverage inventory with accuracy and control.",alt="Beer Wine Beverage Inventory System"}){
 return <section className="home-hero">{hero&&<img src={hero} alt={alt} className="home-hero-image"/>}<div className="home-hero-overlay"><div className="home-hero-content"><h1 className="home-hero-title">{title}</h1><p className="home-hero-text">{text}</p><Link to="/dashboard" className="home-hero-button">Dashboard</Link></div></div></section>;
}
