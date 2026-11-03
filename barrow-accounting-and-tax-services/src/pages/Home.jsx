import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({title="Barrow Accounting & Tax Services"}){
 return <section className="home-hero">
  <img src={hero} alt="Accounting workspace with a calculator, financial reports, and laptop" className="home-hero-image"/>
  <div className="home-hero-overlay"><div className="home-hero-content">
   <h1 className="home-hero-title">{title||"Barrow Accounting & Tax Services"}</h1>
   <p className="home-hero-text">Manage client work, service deadlines, and follow-up.</p>
   <Link to="/dashboard" className="home-hero-button">Dashboard</Link>
  </div></div>
 </section>;
}
