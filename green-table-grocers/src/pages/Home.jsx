import {Link} from "react-router-dom";
import hero from "../images/hero_image.png";
import "../styles/Home.css";

export default function Home({
 title="Beautiful food. Imperfect looks.",
 text="Shop delicious rescued produce and pantry staples that are too good to waste.",
 alt="Fresh rescued produce from Green Table Grocers"
}){
 return(
  <div className="storefront-home">
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
      <p className="home-hero-kicker">Rescued locally. Priced fairly.</p>
      <h1 className="home-hero-title">{title}</h1>
      <p className="home-hero-text">{text}</p>
      <div className="home-hero-actions">
       <Link to="/shop" className="home-hero-button">Shop rescued groceries</Link>
       <Link to="/how-it-works" className="home-hero-button home-hero-button-secondary">How it works</Link>
      </div>
     </div>
    </div>
   </section>

   <section className="home-story" aria-labelledby="home-story-title">
    <div>
     <p className="storefront-eyebrow">A little different. Every bit delicious.</p>
     <h2 id="home-story-title">Groceries with character</h2>
     <p>Curvy carrots, undersized apples, surplus greens, and perfectly good pantry goods deserve a place at the table—not in a landfill.</p>
    </div>
    <div className="home-value-grid">
     <article><span>🥕</span><h3>Fresh finds</h3><p>Seasonal produce sourced from trusted growers and food partners.</p></article>
     <article><span>💚</span><h3>Kind prices</h3><p>Save on food that tastes great, even when it looks delightfully different.</p></article>
     <article><span>🌎</span><h3>Less waste</h3><p>Every rescued item helps conserve the water, soil, and energy used to grow it.</p></article>
    </div>
   </section>

   <section className="home-box-banner">
    <div><p className="storefront-eyebrow">Easy weekly goodness</p><h2>Let us pack the harvest for you</h2><p>Choose a produce box sized for your kitchen and discover something fresh each week.</p></div>
    <Link to="/produce-boxes" className="storefront-link-button">Explore produce boxes</Link>
   </section>
  </div>
 );
}
