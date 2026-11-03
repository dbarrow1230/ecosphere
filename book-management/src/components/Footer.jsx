import {Link} from "react-router-dom";
import {Container,Row,Col} from "react-bootstrap";
import {FaFacebook,FaInstagram,FaXTwitter,FaTiktok} from "react-icons/fa6";
import "./Footer.css";

const Footer=({
 variant="app",
 address="679 Van Sindern Ave",
 mapQuery="Brooklyn, NY, 11207,USA",
 branding="Book Managment",
  startYear="2021"
})=>{
 const year=new Date().getFullYear();

 // app footer (your original simple one)
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
        &copy;{startYear} - {year} {branding} &trade; All rights reserved
       </p>
      </Col>
     </Row>
    </Container>
   </footer>
  );
 }

 // site footer (your full version)
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
       <h3 className="site-footer-heading">Address</h3>
       <p className="site-footer-text">{address}</p>
        <p className="site-footer-text">{mapQuery}</p>
        <p className="site-footer-text">Phone: (123) 456-7890</p>
        <p className="site-footer-text">Email: info@catering.com</p>
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
       &copy;{startYear} - {year} {branding} &trade; All rights reserved
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

 // fallback (safety)
 return null;
};

export default Footer;
