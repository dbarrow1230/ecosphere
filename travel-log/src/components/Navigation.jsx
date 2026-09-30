// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const isActive=p=>location.pathname.startsWith(p);
 const ADMIN_USER_IDS=[ "69af088d21b4580a8cb6614b" ];
 const OWNER_ROLE_IDS=[ "69edf92e1e6593dd5369f718" ];
 const ADMIN_ROLE_IDS=[ "69edf92e1e6593dd5369f719", "69d389f609a4ebea1c3f634e",  "69d46bce86ec944e3cab4566" ];
 const MANAGER_ROLE_IDS=[ "69edf92e1e6593dd5369f71a",  "69d389f609a4ebea1c3f634f" ];

 const getObjectId=value=>{
  if(!value)return "";
  if(typeof value==="string")return value.toLowerCase().trim();
  if(typeof value==="object"){
   if(typeof value.$oid==="string")return value.$oid.toLowerCase().trim();
   if(typeof value._id==="string")return value._id.toLowerCase().trim();
   if(typeof value.id==="string")return value.id.toLowerCase().trim();
   if(typeof value._id?.$oid==="string")return value._id.$oid.toLowerCase().trim();
   if(typeof value.id?.$oid==="string")return value.id.$oid.toLowerCase().trim();
  }
  return "";
 };

 const getUserId=()=>{  return getObjectId(user); };

 const getDirectRoleIds=()=>{
  return [
   getObjectId(user?.role),
   getObjectId(user?.roleId),
   getObjectId(user?.currentRole),
   getObjectId(user?.activeRole)
  ].filter(Boolean);
 };

 const getAssignmentRoles=()=>{
  const assignments=[
   ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
   ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
   ...(Array.isArray(user?.assignments)?user.assignments:[])
  ];

  return assignments
   .filter(assignment=>assignment?.isActive!==false)
   .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole)
   .filter(Boolean);
 };

 const getAssignmentRoleIds=()=>{
  return getAssignmentRoles().map(role=>getObjectId(role)).filter(Boolean);
 };

 const userId=getUserId();
 const directRoleIds=getDirectRoleIds();
 const assignmentRoleIds=getAssignmentRoleIds();

 const allRoleIds=[...directRoleIds,...assignmentRoleIds];

 const hasRoleId=ids=>{
  return allRoleIds.some(id=>ids.includes(id));
 };

 const isKnownAdminUser=ADMIN_USER_IDS.includes(userId);
 const isOwner=hasRoleId(OWNER_ROLE_IDS);
 const isAdmin=isKnownAdminUser||isOwner||hasRoleId(ADMIN_ROLE_IDS);
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS);

 const canSeeAdminMenus=isAdmin||isManager;

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={Link} to="/" className="app-nav-brand"> <span className="me-2">{FontAwesomeIcons.Home}</span>Home  </Navbar.Brand>
    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="main-nav">
     <Nav className="me-auto app-nav-links">
      <Nav.Link as={NavLink} to="/dashboard" className="app-nav-link"> <span className="me-2">{FontAwesomeIcons.Home}</span>Dashboard </Nav.Link>

      <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.List}</span>Dropdown</>}  id="inventory-dropdown"   className="app-nav-link"   active={isActive("/items")||isActive("/pantry")||isActive("/household")}      >
   
      </NavDropdown>
   
      <Nav.Link as={NavLink} to="/contact" className="app-nav-link"> {FontAwesomeIcons.Contact} Contact </Nav.Link>
      <Nav.Link as={NavLink} to="/about" className="app-nav-link"> {FontAwesomeIcons.About} About</Nav.Link>

      {canSeeAdminMenus&&(
       <NavDropdown  title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown"  className="app-nav-link"
        active={isActive("/admin")||isActive("/users")||isActive("/permissions")}   >
        <NavDropdown.Item as={NavLink} to="/admin">  <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/businesses"> <span className="me-2">{FontAwesomeIcons.List}</span>Businesses </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-types"><span className="me-2">{FontAwesomeIcons.List}</span>Business Types </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/app-keys"> <span className="me-2">{FontAwesomeIcons.List}</span>App Keys </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/footers"> <span className="me-2">{FontAwesomeIcons.List}</span>Footers  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/seasons"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/holidays"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/occasions"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/taglines">  <span className="me-2">{FontAwesomeIcons.List}</span>Taglines  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/vendors"> <span className="me-2">{FontAwesomeIcons.List}</span>Vendors  </NavDropdown.Item>
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/users"> <span className="me-2">{FontAwesomeIcons.Account}</span>Users </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/permissions"> <span className="me-2">{FontAwesomeIcons.List}</span>Permissions </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">  <span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions </NavDropdown.Item>
       </NavDropdown>
      )}

     </Nav>

     <Nav>
      {user?(
       <NavDropdown   title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>}>
        <NavDropdown.Item as={NavLink} to="/profile"> <span className="me-2">{FontAwesomeIcons.Profile}</span>Profile  </NavDropdown.Item>
        <NavDropdown.Item onClick={onLogout}>  <span className="me-2">{FontAwesomeIcons.Logout}</span>Logout   </NavDropdown.Item>
       </NavDropdown>
      ):(
       <Nav.Link as={NavLink} to="/login"> <span className="me-2">{FontAwesomeIcons.Login}</span>Login </Nav.Link> )}
     </Nav>

    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;