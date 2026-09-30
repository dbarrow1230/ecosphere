import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {NavLink,useLocation} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b"];
const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
const ADMIN_ROLE_IDS=["69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"];
const MANAGER_ROLE_IDS=["69edf92e1e6593dd5369f71a","69d389f609a4ebea1c3f634f"];

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value.toLowerCase().trim();
 if(typeof value!=="object")return "";
 return String(value.$oid||value._id?.$oid||value._id||value.id?.$oid||value.id||"").toLowerCase().trim();
};

const getRoleName=value=>{
 if(!value)return "";
 if(typeof value==="string"&&!/^[a-f\d]{24}$/i.test(value))return value.toLowerCase().trim();
 if(typeof value!=="object")return "";
 return String(value.name||value.title||value.label||"").toLowerCase().trim();
};

const getAssignmentRoles=user=>[
 ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
 ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
 ...(Array.isArray(user?.departmentAssignments)?user.departmentAssignments:[]),
 ...(Array.isArray(user?.userDepartmentAssignments)?user.userDepartmentAssignments:[]),
 ...(Array.isArray(user?.assignments)?user.assignments:[])
]
 .filter(assignment=>assignment?.isActive!==false)
 .map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole||assignment.department?.defaultRole)
 .filter(Boolean);

const getAdminAccess=user=>{
 const userId=getObjectId(user?._id||user?.id||user);
 const roles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...getAssignmentRoles(user)].filter(Boolean);
 const roleIds=roles.map(getObjectId).filter(Boolean);
 const roleNames=roles.map(getRoleName).filter(Boolean);
 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));
 const owner=ADMIN_USER_IDS.includes(userId)||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const admin=owner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const manager=admin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);
 return {owner,canSeeAdmin:admin||manager};
};

function Navigation({user,onLogout}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const access=getAdminAccess(user);
 const isAdminPath=location.pathname.startsWith("/admin")||location.pathname==="/permissions";

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>
    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand"><span className="me-2">{FontAwesomeIcons.Home}</span>Home</Navbar.Brand>
    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="main-nav">
     <Nav className="me-auto app-nav-links">
      {user&&<Nav.Link as={NavLink} to="/dashboard"><span className="me-2">{FontAwesomeIcons.Home}</span>Dashboard</Nav.Link>}
      <Nav.Link as={NavLink} to="/menu"><span className="me-2">{FontAwesomeIcons.List}</span>Menu</Nav.Link>
      <Nav.Link as={NavLink} to="/about"><span className="me-2">{FontAwesomeIcons.About}</span>About</Nav.Link>
      <Nav.Link as={NavLink} to="/contact"><span className="me-2">{FontAwesomeIcons.Contact}</span>Contact</Nav.Link>
     </Nav>

     <Nav className="ms-lg-auto">
      {access.canSeeAdmin&&(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown" active={isAdminPath}>
        <NavDropdown.Item as={NavLink} to="/admin/dashboard"><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard</NavDropdown.Item>
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/admin/menu"><span className="me-2">{FontAwesomeIcons.List}</span>Menu Manager</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/inventory"><span className="me-2">{FontAwesomeIcons.List}</span>Inventory</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/orders"><span className="me-2">{FontAwesomeIcons.Book}</span>Orders</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/clients"><span className="me-2">{FontAwesomeIcons.Account}</span>Clients</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/events"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Events</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/reports"><span className="me-2">{FontAwesomeIcons.List}</span>Reports</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/vendors"><span className="me-2">{FontAwesomeIcons.List}</span>Vendors</NavDropdown.Item>
        <NavDropdown.Divider/>
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/businesses">Businesses</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/business-types">Business Types</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/app-keys">App Keys</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/footers">Footers</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/seasons">Seasons</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/holidays">Holidays</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/occasions">Occasions</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/taglines">Taglines</NavDropdown.Item>}
        {access.owner&&<NavDropdown.Item as={NavLink} to="/admin/tax-rates">Tax Rates</NavDropdown.Item>}
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/admin/users"><span className="me-2">{FontAwesomeIcons.Account}</span>Users</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">Roles & Permissions</NavDropdown.Item>
       </NavDropdown>
      )}

      {user?(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>} id="account-dropdown">
        <NavDropdown.Item as={NavLink} to="/profile"><span className="me-2">{FontAwesomeIcons.Profile}</span>Profile</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/reminders">Reminders</NavDropdown.Item>
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
