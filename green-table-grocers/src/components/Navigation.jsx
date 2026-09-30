import {Container,Nav,Navbar,NavDropdown} from "react-bootstrap";
import {Link,NavLink,useLocation} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

export default function Navigation({user,onLogout}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);

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

 const getUserId=()=>{return getObjectId(user?._id||user?.id||user);};

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
   ...(Array.isArray(user?.departmentAssignments)?user.departmentAssignments:[]),
   ...(Array.isArray(user?.userDepartmentAssignments)?user.userDepartmentAssignments:[]),
   ...(Array.isArray(user?.assignments)?user.assignments:[])
  ];

  return assignments
   .filter(assignment=>assignment?.isActive!==false)
   .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole||assignment.department?.defaultRole)
   .filter(Boolean);
 };

 const getAssignmentRoleIds=()=>{
  return getAssignmentRoles().map(role=>getObjectId(role)).filter(Boolean);
 };

 const getRoleName=value=>{
  if(!value||typeof value!=="object")return "";
  return String(value.name||value.title||value.label||"").trim().toLowerCase();
 };

 const getRoleNames=()=>{
  return [
   user?.role,
   user?.roleId,
   user?.currentRole,
   user?.activeRole,
   ...getAssignmentRoles()
  ].map(getRoleName).filter(Boolean);
 };

 const userId=getUserId();
 const directRoleIds=getDirectRoleIds();
 const assignmentRoleIds=getAssignmentRoleIds();
 const roleNames=getRoleNames();

 const allRoleIds=[...directRoleIds,...assignmentRoleIds];

 const hasRoleId=ids=>{
  return allRoleIds.some(id=>ids.includes(id));
 };

 const hasRoleName=names=>{
  return roleNames.some(name=>names.includes(name));
 };

 const isKnownAdminUser=ADMIN_USER_IDS.includes(userId);
 const isOwner=isKnownAdminUser||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);
 const canSeeAdminMenus=isAdmin||isManager;

 return <Navbar expand="lg" className="app-nav"><Container>
  <Navbar.Brand as={Link} to="/"><span className="me-2">{FontAwesomeIcons.Home}</span>Green Table Grocers</Navbar.Brand>
  <Navbar.Toggle aria-controls="main-nav"/>
  <Navbar.Collapse id="main-nav">
   <Nav className="me-auto">
    <Nav.Link as={NavLink} to="/shop">Shop</Nav.Link>
    <Nav.Link as={NavLink} to="/produce-boxes">Produce Boxes</Nav.Link>
    <Nav.Link as={NavLink} to="/how-it-works">How It Works</Nav.Link>
    <Nav.Link as={NavLink} to="/our-mission">Our Mission</Nav.Link>
    <Nav.Link as={NavLink} to="/basket">Basket</Nav.Link>

    <NavDropdown
     title={<>{FontAwesomeIcons.About} Info</>}
     id="info-nav"
     className="app-nav-dropdown"
     active={isActive("/contact")||isActive("/about")}
    >
     <NavDropdown.Item as={NavLink} to="/contact"> {FontAwesomeIcons.Contact} Contact </NavDropdown.Item>
     <NavDropdown.Item as={NavLink} to="/about"> {FontAwesomeIcons.About} About </NavDropdown.Item>
    </NavDropdown>

    {user&&(
     <NavDropdown
      title="Staff"
      id="staff-dropdown"
      className="app-nav-link"
      active={isActive("/dashboard")||isActive("/products")||isActive("/inventory")||isActive("/stores")||isActive("/orders")}
     >
      <NavDropdown.Item as={NavLink} to="/dashboard">Dashboard</NavDropdown.Item>
      <NavDropdown.Item as={NavLink} to="/products">Products</NavDropdown.Item>
      <NavDropdown.Item as={NavLink} to="/inventory">Inventory</NavDropdown.Item>
      <NavDropdown.Item as={NavLink} to="/stores">Stores</NavDropdown.Item>
      <NavDropdown.Item as={NavLink} to="/orders">Orders</NavDropdown.Item>
     </NavDropdown>
    )}

    {canSeeAdminMenus&&(
     <NavDropdown
      title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>}
      id="admin-dropdown"
      className="app-nav-link"
      active={isActive("/admin")||isActive("/users")||isActive("/backups")}
     >
      <NavDropdown.Item as={NavLink} to="/admin">
       <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard
      </NavDropdown.Item>

      <NavDropdown.Item as={NavLink} to="/backups">
       <span className="me-2">{FontAwesomeIcons.List}</span>Backups
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

      <NavDropdown.Item as={NavLink} to="/admin/tax-rates">
       <span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates
      </NavDropdown.Item>

      <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">
       <span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions
      </NavDropdown.Item>

      <NavDropdown.Divider/>

      <NavDropdown.Item as={NavLink} to="/users">
       <span className="me-2">{FontAwesomeIcons.Account}</span>Users
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
    ):null}
   </Nav>
  </Navbar.Collapse>
 </Container></Navbar>;
}
