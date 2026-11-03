// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import {isTimeClockOnlyUser} from "../utils/userAccess.js";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Employee Manager"}){
 const location=useLocation();
 const {FontAwesomeIcons,LucideIcons}=useIcons();
 const isActive=p=>location.pathname.startsWith(p);
 const canSeeAdminMenus=!!user;
 const timeClockOnly=isTimeClockOnlyUser(user);

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>
    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">{brand}</Navbar.Brand>
    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="site-nav">
     <Nav className="me-auto app-nav-links">
      {timeClockOnly?<Nav.Link as={NavLink} to="/time-clock" className="app-nav-link"><span className="me-2">{LucideIcons.Clock3}</span>Time Clock</Nav.Link>:<>
      <Nav.Link as={NavLink} to="/dashboard" end className="app-nav-link"><span className="me-2">{FontAwesomeIcons.Dashboard}</span>Dashboard</Nav.Link>
      <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>Employees</>} id="employees-dropdown" active={isActive("/employees")||isActive("/attachments")}>
       <NavDropdown.Item as={NavLink} to="/employees"><span className="me-2">{FontAwesomeIcons.Account}</span>Employee directory</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/attachments"><span className="me-2">{LucideIcons.FileText}</span>Attachments</NavDropdown.Item>
      </NavDropdown>
      <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Calendar}</span>Scheduling</>} id="scheduling-dropdown" active={isActive("/scheduling")||isActive("/events")}>
       <NavDropdown.Item as={NavLink} to="/scheduling" end><span className="me-2">{FontAwesomeIcons.Calendar}</span>Weekly schedules</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/scheduling/calendar"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Calendar</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/scheduling/availability"><span className="me-2">{LucideIcons.Clock3}</span>Availability</NavDropdown.Item>
       <NavDropdown.Divider/>
       <NavDropdown.Item as={NavLink} to="/events"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Events</NavDropdown.Item>
      </NavDropdown>
      <NavDropdown title={<><span className="me-2">{LucideIcons.Clock3}</span>Time &amp; Pay</>} id="time-pay-dropdown" active={isActive("/time-clock")||isActive("/leave")||isActive("/payroll")}>
       <NavDropdown.Item as={NavLink} to="/time-clock"><span className="me-2">{LucideIcons.Clock3}</span>Time Clock</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/leave"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Leave</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/payroll"><span className="me-2">{FontAwesomeIcons.List}</span>Payroll</NavDropdown.Item>
      </NavDropdown>
      <Nav.Link as={NavLink} to="/reports" className="app-nav-link"><span className="me-2">{FontAwesomeIcons.List}</span>Reports</Nav.Link>
      </>}
     </Nav>

     <Nav>
      {canSeeAdminMenus&&!timeClockOnly&&(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown" className="app-nav-link" active={isActive("/admin")}>
        <NavDropdown.Item as={NavLink} to="/admin"><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/employee-settings"><span className="me-2">{FontAwesomeIcons.List}</span>Employee Settings</NavDropdown.Item>
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/admin/users"><span className="me-2">{FontAwesomeIcons.Account}</span>Users</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/businesses"><span className="me-2">{FontAwesomeIcons.List}</span>Businesses</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-types"><span className="me-2">{FontAwesomeIcons.List}</span>Business Types</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/app-keys"><span className="me-2">{FontAwesomeIcons.List}</span>App Keys</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/footers"><span className="me-2">{FontAwesomeIcons.List}</span>Footers</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/seasons"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/holidays"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/occasions"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/taglines"><span className="me-2">{FontAwesomeIcons.List}</span>Taglines</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/tax-rates"><span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions"><span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions</NavDropdown.Item>
       </NavDropdown>
      )}
     </Nav>

     <Nav>
      {user?(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||user.email||"Account"}</>}>
        <NavDropdown.Item as={NavLink} to="/profile"><span className="me-2">{FontAwesomeIcons.Profile}</span>Profile</NavDropdown.Item>
        <NavDropdown.Item onClick={onLogout}><span className="me-2">{FontAwesomeIcons.Logout}</span>Logout</NavDropdown.Item>
       </NavDropdown>
      ):(
       <Nav.Link as={NavLink} to="/login"><span className="me-2">{FontAwesomeIcons.Login}</span>Login</Nav.Link>
      )}
     </Nav>
    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;
