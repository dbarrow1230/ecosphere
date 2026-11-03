import {Container,Row,Col} from "react-bootstrap";
import {Link} from "react-router-dom";
import "./Footer.css";

export default function Footer({variant="app",mapQuery="",branding="",startYear="2023",phone="",fax="",email="",title="Food Preservation Manager"}){
 const year=new Date().getFullYear();
 if(variant==="site")return <footer className="site-footer"><div className="site-footer-inner"><div className="site-footer-top"><div className="site-footer-col"><h3 className="site-footer-heading">Contact</h3><p className="site-footer-text">{phone}</p><p className="site-footer-text">{fax}</p><p className="site-footer-text">{email}</p></div><div className="site-footer-col"><h3 className="site-footer-heading">Address</h3><p className="site-footer-text">{mapQuery}</p></div></div><div className="site-footer-bottom"><p className="site-footer-copy">&copy; {startYear} - {year} {branding} &trade; {title} All rights reserved.</p><div className="site-footer-links"><Link to="/faq" className="site-footer-link">FAQ</Link><Link to="/terms" className="site-footer-link">Terms</Link><Link to="/contact" className="site-footer-link">Contact</Link></div></div></div></footer>;
 return <footer className="app-footer"><Container><Row className="mb-2"><Col className="text-center"><Link to="/terms" className="footer-link">Terms of Service</Link><Link to="/faq" className="footer-link">FAQ</Link><Link to="/privacy" className="footer-link">Privacy</Link><Link to="/contact" className="footer-link">Contact</Link></Col></Row><Row><Col className="text-center"><p className="app-footer-copy m-0">&copy;{startYear} - {year} {branding} {title}&trade; All rights reserved</p></Col></Row></Container></footer>;
}
