import {Link} from "react-router-dom";
import "../../styles/StorefrontPages.css";

const steps=[
 ["1","We find good food","We partner with growers and suppliers to rescue fresh food that may be oddly shaped, overstocked, or outside conventional retail standards."],
 ["2","You choose your groceries","Shop individual rescued finds or pick a seasonal produce box that fits your household."],
 ["3","We pack with care","Your order is checked for quality and prepared for pickup with minimal, practical packaging."],
 ["4","Good food gets eaten","You save money, enjoy delicious groceries, and help keep valuable food out of landfills."]
];

export default function HowItWorks(){return <div className="storefront-page">
 <header className="storefront-page-header centered"><div><p className="storefront-eyebrow">Simple from rescue to table</p><h1>How it works</h1><p>Shopping imperfect produce should feel as easy as shopping anywhere else—and a lot more meaningful.</p></div></header>
 <section className="steps-grid">{steps.map(([number,title,text])=><article className="step-card" key={number}><span>{number}</span><h2>{title}</h2><p>{text}</p></article>)}</section>
 <section className="storefront-cta"><h2>Ready to rescue something delicious?</h2><Link to="/shop" className="storefront-link-button">See today’s groceries</Link></section>
 </div>;}
