// src/pages/Home.jsx
import {Link} from "react-router-dom";
import {Card,Button,Image} from "react-bootstrap";
import {
 ArrowRight,
 Building2,
 BriefcaseBusiness,
 Check,
 Fuel,
 LayoutGrid,
 ShoppingCart,
 Store,
 Utensils,
 Warehouse,
 Wrench,
 Zap
} from "lucide-react";
import hero from "../images/hero_image.png";
import {assets} from "../utils/assets";
import "../styles/Home.css";

export default function Home({
 title="ITM Fire Protection & Equipment",
 text="Inspection, testing, maintenance, fire-protection services and equipment sales for commercial properties.",
 alt="ITM Fire Protection & Equipment"
}){

 return(
  <main>

   <section className="home-hero">
    {hero&&<img src={hero} alt={alt} className="home-hero-image"/>}

    <div className="home-hero-overlay">
     <div className="home-hero-content">

      <h1 className="home-hero-title">{title}</h1>

      <p className="home-hero-text">{text}</p>

      <div className="hero-actions">
       <Link className="btn btn-primary" to="/service-request">
        Schedule an Inspection
       </Link>

       <Link className="btn btn-light" to="/shop">
        Shop Equipment
       </Link>

       <Link className="btn btn-dark" to="/equipment-quote">
        Request a Quote
       </Link>
      </div>

      <div className="trust-row">
       <span><Check size={15}/> Inspection</span>
       <span><Check size={15}/> Testing</span>
       <span><Check size={15}/> Maintenance</span>
      </div>

     </div>
    </div>
   </section>

   <section className="customer-paths">
    <div className="paths-grid">

     <Card as="article" className="path-card path-service">

      <div className="path-icon">
       <Wrench size={24}/>
      </div>

      <div className="path-copy">
       <h2>I Need Fire Protection Service</h2>
       <p>Schedule inspections, testing, maintenance or repairs for your building or business.</p>
      </div>

      <Button as={Link} variant="primary" to="/services">
       View Services
      </Button>

     </Card>

     <Card as="article" className="path-card path-equipment">

      <div className="path-icon path-icon-dark">
       <ShoppingCart size={24}/>
      </div>

      <div className="path-copy">
       <h2>I Need Fire Protection Equipment</h2>
       <p>Shop fire extinguishers, cabinets, detectors, signs and more.</p>
      </div>

      <Button as={Link} variant="dark" to="/shop">
       Shop Equipment
      </Button>

     </Card>

    </div>
   </section>

   <section className="content-section">
    <div className="split-sections">

     <div className="section-block">

      <div className="section-heading">
       <h2>Our Services</h2>
       <Link to="/services">All Services <ArrowRight size={14}/></Link>
      </div>

      <div className="service-grid">

       <Card as={Link} to="/portable-fire-extinguishers" className="service-card">
        <Image src={assets.extinguisher} alt="Portable Fire Extinguishers"/>
        <h3>Portable Fire Extinguishers</h3>
        <p>Inspection, maintenance, recharge, testing, replacement, installation and extinguisher programs for commercial properties.</p>
        <span className="card-link">View Service <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/standpipe-systems" className="service-card">
        <Image src={assets.standpipe} alt="Standpipe Systems"/>
        <h3>Standpipe Systems</h3>
        <p>Inspection, testing, maintenance and component service for commercial standpipe and hose equipment.</p>
        <span className="card-link">View Service <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/kitchen-hood-systems" className="service-card">
        <Image src={assets.hood} alt="Kitchen Hood Systems"/>
        <h3>Kitchen Hood Systems</h3>
        <p>Commercial kitchen fire-suppression inspection, testing, maintenance and service.</p>
        <span className="card-link">View Service <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/gas-station-fire-protection" className="service-card">
        <Image src={assets.gasPump} alt="Gas Station Fire Protection"/>
        <h3>Gas Station Fire Protection</h3>
        <p>Fire-protection service and equipment support for fuel stations, convenience stores and dispensing areas.</p>
        <span className="card-link">View Service <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/inspections-maintenance" className="service-card">
        <Image src={assets.clipboard} alt="Inspections & Maintenance"/>
        <h3>Inspections &amp; Maintenance</h3>
        <p>Recurring inspection, testing and maintenance services designed around commercial fire-protection equipment.</p>
        <span className="card-link">View Service <ArrowRight size={13}/></span>
       </Card>

      </div>
     </div>

     <div className="section-block">

      <div className="section-heading">
       <h2>Shop Fire Equipment</h2>
       <Link to="/shop">All Equipment <ArrowRight size={14}/></Link>
      </div>

      <div className="product-grid">

       <Card as={Link} to="/abc-fire-extinguishers" className="product-card">
        <Image src={assets.extinguisher} alt="ABC Fire Extinguishers"/>
        <h3>ABC Fire Extinguishers</h3>
        <p>Multipurpose extinguishers for common Class A, B and C fire hazards.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/purple-k-extinguishers" className="product-card">
        <Image src={assets.purpleK} alt="Purple-K Extinguishers"/>
        <h3>Purple-K Extinguishers</h3>
        <p>High-performance dry chemical extinguishers for flammable-liquid fire hazards.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/co2-fire-extinguishers" className="product-card">
        <Image src={assets.co2} alt="CO₂ Fire Extinguishers"/>
        <h3>CO₂ Fire Extinguishers</h3>
        <p>Clean-agent extinguishers for electrical equipment and flammable-liquid fires.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/smoke-detectors" className="product-card">
        <Image src={assets.smokeDetector} alt="Smoke & CO Detectors"/>
        <h3>Smoke &amp; CO Detectors</h3>
        <p>Detection equipment for smoke and carbon-monoxide warning and protection.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/fire-cabinets" className="product-card">
        <Image src={assets.cabinet} alt="Fire Cabinets"/>
        <h3>Fire Cabinets</h3>
        <p>Protective cabinets for secure and visible fire-extinguisher storage.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

       <Card as={Link} to="/signs-accessories" className="product-card">
        <Image src={assets.exitSign} alt="Signs & Accessories"/>
        <h3>Signs &amp; Accessories</h3>
        <p>Fire-safety signs, mounting hardware and equipment accessories.</p>
        <span className="card-link">View Equipment <ArrowRight size={13}/></span>
       </Card>

      </div>
     </div>

    </div>
   </section>

   <section className="lower-content">
    <div className="lower-grid">

     <div className="industry-panel">

      <div className="section-heading">
       <h2>Industries We Serve</h2>
       <Link to="/industries">View Industries <ArrowRight size={14}/></Link>
      </div>

      <div className="industry-grid">

       <div className="industry-card">
        <Utensils size={22}/>
        <strong>Restaurants</strong>
       </div>

       <div className="industry-card">
        <Fuel size={22}/>
        <strong>Gas Stations</strong>
       </div>

       <div className="industry-card">
        <Building2 size={22}/>
        <strong>Apartment Buildings</strong>
       </div>

       <div className="industry-card">
        <BriefcaseBusiness size={22}/>
        <strong>Offices</strong>
       </div>

       <div className="industry-card">
        <Warehouse size={22}/>
        <strong>Warehouses</strong>
       </div>

       <div className="industry-card">
        <Store size={22}/>
        <strong>Retail Stores</strong>
       </div>

      </div>
     </div>

     <div className="why-panel">

      <div className="section-heading">
       <h2>Why ITM</h2>
       <span>Inspection. Testing. Maintenance.</span>
      </div>

      <div className="why-grid">

       <Card as="article" className="why-card">
        <div className="why-icon">
         <Check size={20}/>
        </div>

        <div>
         <h3>Service + Equipment</h3>
         <p>One company for recurring service and product needs.</p>
        </div>
       </Card>

       <Card as="article" className="why-card">
        <div className="why-icon">
         <Zap size={20}/>
        </div>

        <div>
         <h3>Commercial Focus</h3>
         <p>Built around businesses, properties and recurring compliance work.</p>
        </div>
       </Card>

       <Card as="article" className="why-card">
        <div className="why-icon">
         <LayoutGrid size={20}/>
        </div>

        <div>
         <h3>Clear Categories</h3>
         <p>Separate pages for each service and equipment category.</p>
        </div>
       </Card>

      </div>
     </div>

    </div>
   </section>

  </main>
 );

}