// src/components/Navigation.jsx
import {Navbar,Nav,Container,NavDropdown} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import { House, Wrench, ShoppingCart, Building2, Info, LayoutDashboard, ShieldUser, UserCircle, LogOut} from "lucide-react";
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

 const roles=[
  user?.role,
  user?.roleId,
  user?.currentRole,
  user?.activeRole,
  ...assignmentRoles
 ].filter(Boolean);

 const roleIds=roles.map(getObjectId).filter(Boolean);
 const roleNames=roles.map(getRoleName).filter(Boolean);
 const userId=getObjectId(user);

 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));

 const owner=
  ADMIN_USER_IDS.includes(userId)||
  hasRoleId(OWNER_ROLE_IDS)||
  hasRoleName(["owner","business owner","app owner","super admin"]);

 const admin=
  owner||
  hasRoleId(ADMIN_ROLE_IDS)||
  hasRoleName(["admin","administrator"]);

 const manager=
  admin||
  hasRoleId(MANAGER_ROLE_IDS)||
  hasRoleName(["manager"]);

 return {owner,admin,manager,canSeeAdminMenus:admin||manager};
};

function Navigation({
 user,
 onLogout,
 brand=""
}){

 const location=useLocation();
 const access=getAdminAccess(user);

 return(
  <Navbar expand="lg" className="border-bottom app-nav">
   <Container fluid>

    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">
     <House size={20}/>
     <span>{brand}</span>
    </Navbar.Brand>

    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="site-nav">

     <Nav className="me-auto app-nav-links">

      <NavDropdown
       title={
        <>
         <Wrench size={18}/>
         <span>Services</span>
        </>
       }
       id="site-nav-services"
       active={
        location.pathname.startsWith("/services")||
        location.pathname.startsWith("/portable-fire-extinguishers")||
        location.pathname.startsWith("/standpipe-systems")||
        location.pathname.startsWith("/kitchen-hood-systems")||
        location.pathname.startsWith("/gas-station-fire-protection")
       }
      >
       <NavDropdown.Item as={NavLink} to="/services">  Services </NavDropdown.Item>
       <NavDropdown.Divider/>
       <NavDropdown.Item as={NavLink} to="/portable-fire-extinguishers">  Fire Extinguishers   </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/standpipe-systems">   Standpipe Systems       </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/kitchen-hood-systems">     Kitchen Hood Systems   </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/gas-station-fire-protection">    Gas Station      </NavDropdown.Item>
      </NavDropdown>

      <NavLink  to="/shop"       className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}      >
       <ShoppingCart size={18}/>     <span>Shop</span>   </NavLink>

      <NavLink  to="/industries"    className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}  >   <Building2 size={18}/>
       <span>Industries</span>      </NavLink>

      <NavDropdown   title={    <>         <Info size={18}/>         <span>Info</span>        </>       }
       id="site-nav-info"
       active={
        location.pathname.startsWith("/about")||
        location.pathname.startsWith("/contact")||
        location.pathname.startsWith("/service-request")||
        location.pathname.startsWith("/equipment-quote")
       }
      >
       <NavDropdown.Item as={NavLink} to="/about">   About      </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/contact"> Contact    </NavDropdown.Item>
       <NavDropdown.Divider/>
       <NavDropdown.Item as={NavLink} to="/service-request">    Request Service      </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/equipment-quote">      Request Equipment      </NavDropdown.Item>
      </NavDropdown>

      {user&&(
       <NavLink   to="/dashboard"        className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}       >
        <LayoutDashboard size={18}/>
        <span>Dashboard</span>
       </NavLink>
      )}

     </Nav>

     <Nav className="app-nav-right">

      {access.canSeeAdminMenus&&(
       <NavDropdown
        title={
         <>
          <ShieldUser size={18}/>
          <span>Admin</span>
         </>
        }
        id="site-nav-admin"
        align="end"
        active={
         location.pathname.startsWith("/admin")||
         location.pathname.startsWith("/users")||
         location.pathname.startsWith("/permissions")||
         location.pathname.startsWith("/inspections-maintenance")||
         location.pathname.startsWith("/service-tracking")
        }
       >
        <NavDropdown.Item as={NavLink} to="/admin/dashboard">     Admin Dashboard      </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/requests">        Customer Requests      </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/clients">      Clients        </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/inventory">      Equipment &amp; Inventory      </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/inspections-maintenance">     Inspections &amp; Maintenance        </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/service-tracking">     Service &amp; Inspection Tracking     </NavDropdown.Item>

        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/businesses">   Businesses       </NavDropdown.Item>  )}
        {access.owner&&(
                <NavDropdown.Item as={NavLink} to="/admin/business-types">          Business Types         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/app-keys">          App Keys         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/footers">          Footers         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/seasons">          Seasons         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/holidays">          Holidays         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/occasions">          Occasions         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/taglines">          Taglines         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/vendors">          Vendors         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/tax-rates">          Tax Rates         </NavDropdown.Item>        )}
        {access.owner&&(
         <NavDropdown.Item as={NavLink} to="/admin/allergens">          Allergens         </NavDropdown.Item>        )}
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/admin/users">         Users        </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">         Roles &amp; Permissions        </NavDropdown.Item>
       </NavDropdown>
      )}

      {user?(
       <NavDropdown
        title={
         <>
          <UserCircle size={18}/>
          <span>{user.username||"Account"}</span>
         </>
        }
        id="site-nav-account"
        align="end"
       >
        <NavDropdown.Item as={NavLink} to="/profile">
         <UserCircle size={17}/>
         <span>Profile</span>
        </NavDropdown.Item>

        <NavDropdown.Divider/>

        <NavDropdown.Item onClick={onLogout}>
         <LogOut size={17}/>
         <span>Logout</span>
        </NavDropdown.Item>
       </NavDropdown>
      ):(
       <NavLink
        to="/login"
        className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}
       >
        <UserCircle size={18}/>
        <span>Login</span>
       </NavLink>
      )}

     </Nav>

    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;