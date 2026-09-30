import {Container,Nav,Navbar,NavDropdown} from "react-bootstrap";
import {Link,NavLink,useLocation} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

export default function Navigation({user,onLogout}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b"];
 const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
 const ADMIN_ROLE_IDS=["69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"];
 const MANAGER_ROLE_IDS=["69edf92e1e6593dd5369f71a","69d389f609a4ebea1c3f634f"];

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

 const getRoleName=value=>{
  if(typeof value==="string"&&!getObjectId(value).match(/^[a-f0-9]{24}$/))return value.trim().toLowerCase();
  if(!value||typeof value!=="object")return "";
  return String(value.name||value.title||value.label||"").trim().toLowerCase();
 };

 const assignments=[
  ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
  ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
  ...(Array.isArray(user?.departmentAssignments)?user.departmentAssignments:[]),
  ...(Array.isArray(user?.userDepartmentAssignments)?user.userDepartmentAssignments:[]),
  ...(Array.isArray(user?.assignments)?user.assignments:[])
 ].filter(assignment=>assignment?.isActive!==false);

 const assignmentRoles=assignments.map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole||assignment.department?.defaultRole).filter(Boolean);
 const directRoles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole].filter(Boolean);
 const roleIds=[...directRoles,...assignmentRoles].map(getObjectId).filter(Boolean);
 const roleNames=[...directRoles,...assignmentRoles].map(getRoleName).filter(Boolean);
 const userId=getObjectId(user?._id||user?.id||user);

 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));

 const isOwner=ADMIN_USER_IDS.includes(userId)||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);
 const canAdmin=isAdmin||isManager;

 const isInfoActive=location.pathname.startsWith("/contact")||location.pathname.startsWith("/about");
 const isAdminActive=location.pathname.startsWith("/admin")||location.pathname.startsWith("/users")||location.pathname.startsWith("/backups");

 return <Navbar expand="lg" className="app-nav"><Container>
  <Navbar.Brand as={Link} to="/"><span className="me-2">{FontAwesomeIcons.Home}</span>Regenerative Earth Cuisine</Navbar.Brand>
  <Navbar.Toggle aria-controls="main-nav"/><Navbar.Collapse id="main-nav"><Nav className="me-auto">
   <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link><Nav.Link as={NavLink} to="/recipes">Recipes</Nav.Link><Nav.Link as={NavLink} to="/menus">Menus</Nav.Link><Nav.Link as={NavLink} to="/ingredients">Ingredients</Nav.Link><Nav.Link as={NavLink} to="/resources">Resources</Nav.Link>
   <NavDropdown title={<>{FontAwesomeIcons.About} Info</>} id="info-nav" active={isInfoActive}>
    <NavDropdown.Item as={NavLink} to="/contact">{FontAwesomeIcons.Contact} Contact</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/about">{FontAwesomeIcons.About} About</NavDropdown.Item>
   </NavDropdown>
  </Nav><Nav className="ms-auto">
   {canAdmin&&<NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-menu" active={isAdminActive}>
    <NavDropdown.Item as={NavLink} to="/admin">Admin Dashboard</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/backups">Backups</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/businesses">Businesses</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/business-types">Business Types</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/app-keys">App Keys</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/footers">Footers</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/seasons">Seasons</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/holidays">Holidays</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/occasions">Occasions</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/taglines">Taglines</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/tax-rates">Tax Rates</NavDropdown.Item>
    <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">Roles & Permissions</NavDropdown.Item>
    <NavDropdown.Divider/>
    <NavDropdown.Item as={NavLink} to="/users">Users</NavDropdown.Item>
   </NavDropdown>}
   {user?<NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>} id="account-menu">
    <NavDropdown.Item as={NavLink} to="/profile"><span className="me-2">{FontAwesomeIcons.Profile}</span>Profile</NavDropdown.Item>
    <NavDropdown.Divider/>
    <NavDropdown.Item onClick={onLogout}><span className="me-2">{FontAwesomeIcons.Logout}</span>Logout</NavDropdown.Item>
   </NavDropdown>:<Nav.Link as={NavLink} to="/login"><span className="me-2">{FontAwesomeIcons.Login}</span>Login</Nav.Link>}
  </Nav></Navbar.Collapse>
 </Container></Navbar>;
}