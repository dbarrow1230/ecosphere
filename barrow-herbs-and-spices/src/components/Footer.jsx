// Footer.jsx
import {Link} from "react-router-dom";
import {Container,Row,Col} from "react-bootstrap";
import {FaFacebook,FaInstagram,FaXTwitter,FaTiktok} from "react-icons/fa6";
import "./Footer.css";


const Footer=({
 variant="app",
 mapQuery="",
 branding="",
 startYear="",
 phone="",
 fax="",
 email="",
 title="",
 socials={},
 hours=[]
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
        &copy;{startYear?`${startYear} - `:""}{year} {branding} {title}&trade; All rights reserved
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
        <a href={socials.facebook||undefined} aria-disabled={!socials.facebook} className="site-footer-link site-footer-social-link"><FaFacebook/> Facebook</a>
        <a href={socials.instagram||undefined} aria-disabled={!socials.instagram} className="site-footer-link site-footer-social-link"><FaInstagram/> Instagram</a>
        <a href={socials.x||undefined} aria-disabled={!socials.x} className="site-footer-link site-footer-social-link"><FaXTwitter/> X</a>
        <a href={socials.tiktok||undefined} aria-disabled={!socials.tiktok} className="site-footer-link site-footer-social-link"><FaTiktok/> TikTok</a>
       </div>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Address</h3>
       <p className="site-footer-text">{mapQuery}</p>
       <p className="site-footer-text">Phone: {phone}</p>
       <p className="site-footer-text">Fax: {fax}</p>
       <p className="site-footer-text">Email: {email}</p>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Hours</h3>
       <p className="site-footer-text">{hours[0]||"Hours have not been published."}</p>
       <p className="site-footer-text">{hours[1]||""}</p>
       <p className="site-footer-text">{hours[2]||""}</p>
      </div>

      <div className="site-footer-col">
       <h3 className="site-footer-heading">Map</h3>
       {mapQuery&&<iframe
        title="Business Location"
        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
        className="site-footer-map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
       />}
      </div>
     </div>

     <div className="site-footer-bottom">
      <p className="site-footer-copy">
       &copy; {startYear?`${startYear} - `:""}{year} {branding} {title}&trade; All rights reserved.
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
