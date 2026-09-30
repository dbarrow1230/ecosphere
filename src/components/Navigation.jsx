// src/components/Navigation.jsx
import {Navbar,Nav,Container,NavDropdown} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

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
 if(!value)return "";
 if(typeof value==="string"&&!/^[a-f\d]{24}$/i.test(value))return value.toLowerCase().trim();
 if(typeof value==="object")return String(value.name||value.title||value.label||"").toLowerCase().trim();
 return "";
};

const getAdminAccess=user=>{
 const assignments=[
  ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
  ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
  ...(Array.isArray(user?.assignments)?user.assignments:[])
 ];
 const assignmentRoles=assignments
  .filter(assignment=>assignment?.isActive!==false)
  .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole)
  .filter(Boolean);
 const roles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...assignmentRoles].filter(Boolean);
 const roleIds=roles.map(getObjectId).filter(Boolean);
 const roleNames=roles.map(getRoleName).filter(Boolean);
 const userId=getObjectId(user);
 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));
 const owner=ADMIN_USER_IDS.includes(userId)||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const admin=owner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const manager=admin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);

 return {owner,admin,manager,canSeeAdminMenus:admin||manager};
};

function Navigation({user,onLogout,brand="Eco Sphere"}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const access=getAdminAccess(user);

 return(
  <Navbar expand="lg" className="border-bottom app-nav">
   <Container>

    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand"> {FontAwesomeIcons.Home} {brand} </Navbar.Brand>
    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="site-nav">
     <Nav className="me-auto app-nav-links">

       {/* public */}  
           <NavLink to="/contact" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}> {FontAwesomeIcons.Contact} Contact </NavLink>
      <NavLink to="/about" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}> {FontAwesomeIcons.About} About </NavLink>
          
      {/* core app */}
      {user&&(
       <NavLink to="/shell-dashboard" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
        {FontAwesomeIcons.Home} Dashboard
       </NavLink>
      )}
      {user&&(
       <NavLink to="/dashboard" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>
        {FontAwesomeIcons.Book} Applications
       </NavLink>
      )}

     </Nav>

     <Nav>
      {access.canSeeAdminMenus&&(
       <NavDropdown
        title={<>{FontAwesomeIcons.Admin} Admin</>}
        id="site-nav-admin"
        align="end"
        active={location.pathname.startsWith("/admin")||location.pathname.startsWith("/users")||location.pathname.startsWith("/permissions")}
       >
        <NavDropdown.Item as={NavLink} to="/admin/dashboard">Admin Dashboard</NavDropdown.Item>
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/businesses">Businesses</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/business-types">Business Types</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/app-keys">App Keys</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/footers">Footers</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/seasons">Seasons</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/holidays">Holidays</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/occasions">Occasions</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/taglines">Taglines</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/vendors">Vendors</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/tax-rates">Tax Rates</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/allergens">Allergens</NavDropdown.Item>}
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/admin/users">Users</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">Roles &amp; Permissions</NavDropdown.Item>
       </NavDropdown>
      )}

      {user?(
       <NavDropdown title={<>{FontAwesomeIcons.Profile} {user.username||"Account"}</>} id="site-nav-account" align="end">
        <NavDropdown.Item as={NavLink} to="/profile">
         {FontAwesomeIcons.Profile} Profile
        </NavDropdown.Item>

        <NavDropdown.Divider/>
        <NavDropdown.Item onClick={onLogout}>{FontAwesomeIcons.Logout} Logout  </NavDropdown.Item>
            </NavDropdown>
            ):(
            <NavLink to="/login" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}> {FontAwesomeIcons.Login} Login </NavLink>
            )}
            </Nav>
    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;
