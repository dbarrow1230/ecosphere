// Footer.jsx
import {Link} from "react-router-dom";
import {Container,Row,Col} from "react-bootstrap";
import {FaFacebook,FaInstagram,FaXTwitter,FaTiktok} from "react-icons/fa6";
import "./Footer.css";

const Footer=({
 variant="app",
 mapQuery="679 Van Sinderen Ave, Brooklyn, NY 11207",
 branding="",
 startYear="2025",
 phone="",
 fax="",
 email="",
 licenseNumber="W29159",
 title=""
})=>{
 const year=new Date().getFullYear();

 if(variant==="app"){
      
  return(
   <footer className="app-footer">
    <Container>
     <Row className="mb-2">
      <Col className="text-center">
       <Link to="/terms" className="footer-link">Terms of Service</Link>
       <Link to="/faq" className="footer-link">FAQ</Link>
       <Link to="/privacy" className="footer-link">Privacy</Link>
       <Link to="/contact" className="footer-link">Contact</Link>
      </Col>
     </Row>
     <Row>
      <Col className="text-center">
       <p className="app-footer-copy m-0">
        &copy;{startYear} - {year} {branding}  {title}&trade; All rights reserved
       </p>
      </Col>
     </Row>
    </Container>
   </footer>
  );
 }

 if(variant==="site"){
  return(
   <footer className="site-footer">
    <div className="site-footer-inner">

     <div className="site-footer-top">
      <div className="site-footer-col">
       <h3 className="site-footer-heading">Social Media</h3>
       <div className="site-footer-social">
        <a href="#" className="site-footer-link site-footer-social-link"><FaFacebook/> Facebook</a>
        <a href="#" className="site-footer-link site-footer-social-link"><FaInstagram/> Instagram</a>
        <a href="#" className="site-footer-link site-footer-social-link"><FaXTwitter/> X</a>
        <a href="#" className="site-footer-link site-footer-social-link"><FaTiktok/> TikTok</a>
       </div>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Quick Links</h3>
       <div className="site-footer-links-column">
        <Link to="/" className="site-footer-link">Home</Link>
        <Link to="/services" className="site-footer-link">Services</Link>
        <Link to="/shop" className="site-footer-link">Shop</Link>
        <Link to="/industries" className="site-footer-link">Industries</Link>
        <Link to="/about" className="site-footer-link">About</Link>
        <Link to="/contact" className="site-footer-link">General Contact</Link>
        <Link to="/service-request" className="site-footer-link">Service Request</Link>
        <Link to="/equipment-quote" className="site-footer-link">Equipment Quote</Link>
       </div>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Service Categories</h3>
       <div className="site-footer-links-column">
        <Link to="/portable-fire-extinguishers" className="site-footer-link">Portable Fire Extinguishers</Link>
        <Link to="/standpipe-systems" className="site-footer-link">Standpipe Systems</Link>
        <Link to="/kitchen-hood-systems" className="site-footer-link">Kitchen Hood Systems</Link>
        <Link to="/gas-station-fire-protection" className="site-footer-link">Gas Station Fire Protection</Link>
        <Link to="/inspections-maintenance" className="site-footer-link">Inspections &amp; Maintenance</Link>
       </div>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Address</h3>
       <p className="site-footer-text">{mapQuery}</p>
       <p className="site-footer-text">Phone: {phone}</p>
       <p className="site-footer-text">Fax: {fax}</p>
       <p className="site-footer-text">Email: {email}</p>
       <p className="site-footer-text">License No: {licenseNumber}</p>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Hours</h3>
       <p className="site-footer-text">Mon - Fri: 8:00 AM - 6:00 PM</p>
       <p className="site-footer-text">Sat: 9:00 AM - 7:00 PM</p>
       <p className="site-footer-text">Sun: Closed</p>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Map</h3>
       <iframe
        title="Business Location"
        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
        className="site-footer-map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
       />
      </div>
     </div>

     <div className="site-footer-bottom">
      <p className="site-footer-copy">
       &copy; {startYear} - {year} {branding} &trade; {title} All rights reserved.
      </p>

      <div className="site-footer-links">
       <Link to="/faq" className="site-footer-link">FAQ</Link>
       <Link to="/terms" className="site-footer-link">Terms</Link>
       <Link to="/contact" className="site-footer-link">Contact</Link>
      </div>
     </div>

    </div>
   </footer>
  );
 }

 return null;
};

export default Footer;