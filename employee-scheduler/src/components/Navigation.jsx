// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=(p)=>location.pathname.startsWith(p);

 const ADMIN_ROLE_ID="69d389f609a4ebea1c3f634e";
 const MANAGER_ROLE_ID="69d389f609a4ebea1c3f634f";

 const getRoleId=(role)=>{
  if(!role)return "";
  if(typeof role==="string")return role;
  if(typeof role==="object"){
   if(typeof role._id==="string")return role._id;
   if(role._id?.$oid)return role._id.$oid;
  }
  return "";
 };

 const getRoleName=role=>typeof role==="string"&&!/^[a-f\d]{24}$/i.test(role)?role.toLowerCase().trim():typeof role==="object"?String(role.name||role.title||role.label||"").toLowerCase().trim():"";
 const assignments=[...(user?.roleAssignments||[]),...(user?.userRoleAssignments||[]),...(user?.assignments||[])];
 const roles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...assignments.filter(item=>item?.isActive!==false).map(item=>item.role||item.userRole||item.assignedRole)].filter(Boolean);
 const roleIds=roles.map(getRoleId);
 const roleNames=roles.map(getRoleName);
 const isAdmin=roleIds.some(id=>[ADMIN_ROLE_ID,"69edf92e1e6593dd5369f718","69edf92e1e6593dd5369f719","69d46bce86ec944e3cab4566"].includes(id))||roleNames.some(name=>["owner","admin","administrator","super admin"].includes(name));
 const isManager=roleIds.some(id=>[MANAGER_ROLE_ID,"69edf92e1e6593dd5369f71a"].includes(id))||roleNames.includes("manager");
 const canSeeAdminMenus=isAdmin||isManager;

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={Link} to="/" className="app-nav-brand">
     <span className="me-2">{FontAwesomeIcons.Calendar}</span>Home
    </Navbar.Brand>

    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="main-nav">

     <Nav className="me-auto app-nav-links">

      <Nav.Link as={NavLink} to="/dashboard" className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Home}</span>Dashboard
      </Nav.Link>

      <Nav.Link as={NavLink} to="/employees" className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Account}</span>Employees
      </Nav.Link>

      <Nav.Link as={NavLink} to="/timeclock" className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Clock}</span>Time Clock
      </Nav.Link>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.Clock||FontAwesomeIcons.Calendar}</span>Shifts</>}
       id="shifts-dropdown"
       className="app-nav-link"
       active={isActive("/shifts")||isActive("/shifst-avail")}
      >
       <NavDropdown.Item as={NavLink} to="/shifts">
        <span className="me-2">{FontAwesomeIcons.Calendar}</span>All Shifts
       </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/shifst-avail">
        <span className="me-2">{FontAwesomeIcons.Check}</span>Availability
       </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.List}</span>Payroll</>}
       id="payroll-dropdown"
       className="app-nav-link"
       active={isActive("/payroll")}
      >
       <NavDropdown.Item as={NavLink} to="/payroll/process">
        <span className="me-2">{FontAwesomeIcons.List}</span>Process Payroll
       </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/payroll/time-off">
        <span className="me-2">{FontAwesomeIcons.Calendar}</span>Time Off
       </NavDropdown.Item>
      </NavDropdown>

      {canSeeAdminMenus&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>}
        id="admin-dropdown"
        className="app-nav-link"
        active={
         isActive("/admin")||
         isActive("/users")||
         isActive("/permissions")||
         isActive("/employees")
        }
       >
        <NavDropdown.Item as={NavLink} to="/admin/dashboard">
         <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/employees">
         <span className="me-2">{FontAwesomeIcons.Account}</span>Employees
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/users">
         <span className="me-2">{FontAwesomeIcons.Account}</span>Users
        </NavDropdown.Item>

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
         <span className="me-2">{FontAwesomeIcons.List}</span>Seasons
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

        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">
         <span className="me-2">{FontAwesomeIcons.List}</span>Business Roles Permissions
        </NavDropdown.Item>

        <NavDropdown.Divider/>

        <NavDropdown.Item as={NavLink} to="/permissions">
         <span className="me-2">{FontAwesomeIcons.List}</span>Permissions
        </NavDropdown.Item>
       </NavDropdown>
      )}

     </Nav>

     <Nav>
      {user?(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>}
       >
        <NavDropdown.Item as={NavLink} to="/profile">
         <span className="me-2">{FontAwesomeIcons.Profile}</span>Profile
        </NavDropdown.Item>
        <NavDropdown.Item onClick={onLogout}>
         <span className="me-2">{FontAwesomeIcons.Logout}</span>Logout
        </NavDropdown.Item>
       </NavDropdown>
      ):(
       <Nav.Link as={NavLink} to="/login">
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
