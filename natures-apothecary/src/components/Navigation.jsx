import {getAdminAccess} from "../utils/adminAccess.js";
// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Nature's Apothecary"}){

 const location=useLocation();
 const {FontAwesomeIcons,LucideIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);

 const {isOwner,isAdmin}=getAdminAccess(user);
 const canSeeAdminMenus=isAdmin;

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">
     {FontAwesomeIcons.Leaf||FontAwesomeIcons.Home} {brand}
    </Navbar.Brand>

    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="site-nav">

     <Nav className="me-auto app-nav-links">

      <NavLink to="/shop" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
       {FontAwesomeIcons.Book} Shop
      </NavLink>

      <NavLink to="/products" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
       {FontAwesomeIcons.Box||FontAwesomeIcons.Book} Products
      </NavLink>

      <NavLink to="/about" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
       {FontAwesomeIcons.About} About
      </NavLink>

      <NavLink to="/contact" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
       {FontAwesomeIcons.Contact} Contact
      </NavLink>

      {canSeeAdminMenus&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>}
        id="admin-dropdown"
        className="app-nav-link"
        active={isActive("/dashboard")||isActive("/admin")||isActive("/permissions")}
       >
        {isAdmin&&(
         <NavDropdown.Item as={NavLink} to="/dashboard">
          <span className="me-2">{FontAwesomeIcons.Dashboard}</span>Dashboard
         </NavDropdown.Item>
        )}

        <NavDropdown.Item as={NavLink} to="/admin">
         <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/products">Products</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/ingredients">Ingredients</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/costings">Costings</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/categories">Categories</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/statuses">Statuses</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/parts">Parts</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/ingredient-forms">Ingredient Forms</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/metric-units">Metric Units</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/imperial-units">Imperial Units</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/location-types">Location Types</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/locations">Locations</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/events">Events</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/orders">Orders</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/reports">Reports</NavDropdown.Item>

        <NavDropdown.Divider/>

        {isOwner&&(
         <>
          <NavDropdown.Item as={NavLink} to="/admin/businesses">
           <span className="me-2">{FontAwesomeIcons.List}</span>Businesses
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/business-types">
           <span className="me-2">{FontAwesomeIcons.List}</span>Business Types
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/app-keys">
           <span className="me-2">{FontAwesomeIcons.List}</span>App Keys
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/footers">
           <span className="me-2">{FontAwesomeIcons.List}</span>Footers
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/seasons">
           <span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/holidays">
           <span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/occasions">
           <span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/taglines">
           <span className="me-2">{FontAwesomeIcons.List}</span>Taglines
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/vendors">
           <span className="me-2">{FontAwesomeIcons.List}</span>Vendors
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/tax-rates">
           <span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates
          </NavDropdown.Item>

          <NavDropdown.Divider/>
         </>
        )}

        <NavDropdown.Item as={NavLink} to="/admin/users">
         <span className="me-2">{FontAwesomeIcons.Account}</span>Users
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/permissions">
         <span className="me-2">{FontAwesomeIcons.List}</span>Permissions
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">
         <span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions
        </NavDropdown.Item>
       </NavDropdown>
      )}
     </Nav>

     <Nav className="ms-auto app-nav-account">
      {user?(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||user.email||"Account"}</>}
        id="account-dropdown"
        align="end"
       >
        <NavDropdown.Item as={NavLink} to="/profile">
         <span className="me-2">{FontAwesomeIcons.Profile}</span>Profile
        </NavDropdown.Item>

        <NavDropdown.Item onClick={onLogout}>
         <span className="me-2">{FontAwesomeIcons.Logout}</span>Logout
        </NavDropdown.Item>
       </NavDropdown>
      ):(
       <Nav.Link as={NavLink} to="/login" className="app-nav-link">
        <span className="me-2">{FontAwesomeIcons.Login}</span>Login
       </Nav.Link>
      )}
     </Nav>

    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;
