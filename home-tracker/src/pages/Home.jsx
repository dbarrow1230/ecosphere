// src/pages/Home.jsx
import hero from "../images/hero_image.png";
import "../styles/Home.css";

function Home({
 title="Home Tracker",
 text="Keep track of your pantry and household items in one place. Stay organized, reduce waste, and always know what you have at home.",
 alt="Home inventory with pantry and household items organized on a kitchen counter"
}){

 return(
  <section className="home-hero">

   <img
    src={hero}
    alt={alt}
    className="home-hero-image"
   />

   <div className="home-hero-overlay">
    <div className="home-hero-content">
     <h1 className="home-hero-title">{title}</h1>
     <p className="home-hero-text">{text}</p>
    </div>
   </div>

  </section>
 );

}

export default Home;