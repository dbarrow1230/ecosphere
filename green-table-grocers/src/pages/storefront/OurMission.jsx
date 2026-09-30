import {Link} from "react-router-dom";
import "../../styles/StorefrontPages.css";

export default function OurMission(){return <div className="storefront-page">
 <header className="storefront-page-header mission-header"><div><p className="storefront-eyebrow">Food belongs on tables</p><h1>Our mission</h1><p>Green Table Grocers makes nutritious food more accessible while giving overlooked groceries the welcome they deserve.</p></div></header>
 <section className="mission-grid"><article><span>🌱</span><h2>Respect the harvest</h2><p>Appearance does not determine flavor or nourishment. We celebrate produce in all its natural variety.</p></article><article><span>🤝</span><h2>Feed our neighborhood</h2><p>Fair pricing helps more Brooklyn households bring fresh ingredients home.</p></article><article><span>♻️</span><h2>Waste less together</h2><p>Rescuing surplus food protects the land, water, energy, and labor already invested in growing it.</p></article></section>
 <section className="storefront-note"><p className="storefront-eyebrow">Join the good-food movement</p><h2>Every cart is a small act with a real impact.</h2><p>Choose the carrot with two legs. Take home the apple with a freckle. Cook something wonderful.</p><Link to="/shop" className="storefront-link-button">Shop with purpose</Link></section>
 </div>;}
