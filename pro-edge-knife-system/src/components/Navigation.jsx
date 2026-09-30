import {Container,Nav,Navbar,NavDropdown} from "react-bootstrap";
import {Link,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

export default function Navigation({user,isAdmin=false,onLogout,brand="Pro Edge Knife System"}){
 const {FontAwesomeIcons}=useIcons();
 return <Navbar expand="lg" className="app-nav"><Container>
  <Navbar.Brand as={Link} to="/" className="app-nav-brand"><span className="me-2">{FontAwesomeIcons.Home}</span>{brand}</Navbar.Brand>
  <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/><Navbar.Collapse id="main-nav"><Nav className="me-auto app-nav-links">
   <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link><Nav.Link as={NavLink} to="/tiers">Knife Sets</Nav.Link><Nav.Link as={NavLink} to="/custom-builder">Build a Custom Set</Nav.Link><Nav.Link as={NavLink} to="/orders">Orders</Nav.Link>
   {isAdmin&&<Nav.Link as={NavLink} to="/admin/knife-types">Admin: Knife Types</Nav.Link>}{isAdmin&&<Nav.Link as={NavLink} to="/admin/tiers">Admin: Tiers</Nav.Link>}
   <NavDropdown title={<>{FontAwesomeIcons.About} Info</>} id="info-dropdown"><NavDropdown.Item as={NavLink} to="/contact">{FontAwesomeIcons.Contact} Contact</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/about">{FontAwesomeIcons.About} About</NavDropdown.Item></NavDropdown>
  </Nav><Nav className="app-nav-account-group">{isAdmin&&<NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown"><NavDropdown.Item as={NavLink} to="/admin">Admin Dashboard</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/businesses">Businesses</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/business-types">Business Types</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/app-keys">App Keys</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/footers">Footers</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/seasons">Seasons</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/holidays">Holidays</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/occasions">Occasions</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/taglines">Taglines</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/tax-rates">Tax Rates</NavDropdown.Item><NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">Roles &amp; Permissions</NavDropdown.Item><NavDropdown.Divider/><NavDropdown.Item as={NavLink} to="/users">Users</NavDropdown.Item></NavDropdown>}{user?<NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>} id="account-dropdown"><NavDropdown.Item as={NavLink} to="/profile"><span className="me-2">{FontAwesomeIcons.Profile}</span>Profile</NavDropdown.Item><NavDropdown.Item onClick={onLogout}><span className="me-2">{FontAwesomeIcons.Logout}</span>Logout</NavDropdown.Item></NavDropdown>:<Nav.Link as={NavLink} to="/login"><span className="me-2">{FontAwesomeIcons.Login}</span>Login</Nav.Link>}</Nav></Navbar.Collapse>
 </Container></Navbar>;
}
