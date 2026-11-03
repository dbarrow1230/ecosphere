// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=(p)=>location.pathname.startsWith(p);
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

 const assignments=[
  ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
  ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
  ...(Array.isArray(user?.departmentAssignments)?user.departmentAssignments:[]),
  ...(Array.isArray(user?.userDepartmentAssignments)?user.userDepartmentAssignments:[]),
  ...(Array.isArray(user?.assignments)?user.assignments:[])
 ].filter(assignment=>assignment?.isActive!==false);

 const roles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...assignments.map(assignment=>assignment.role||assignment.userRole||assignment.assignedRole||assignment.department?.defaultRole)].filter(Boolean);
 const roleIds=roles.map(getObjectId).filter(Boolean);
 const roleNames=roles.filter(value=>typeof value==="object").map(value=>String(value.name||value.title||value.label||"").trim().toLowerCase()).filter(Boolean);
 const userId=getObjectId(user?._id||user?.id||user);
 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));
 const isOwner=ADMIN_USER_IDS.includes(userId)||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const canSeeAdminMenus=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={Link} to="/dashboard" className="app-nav-brand">
     <span className="me-2">{FontAwesomeIcons.Dashboard||FontAwesomeIcons.Home}</span>Dashboard
    </Navbar.Brand>

    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="main-nav">

     {/* Projects */}
     <Nav.Link as={NavLink} to="/projects">
      <span className="me-2">{FontAwesomeIcons.Folder||FontAwesomeIcons.List}</span>Projects
     </Nav.Link>

     {/* Tasks */}
     <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.List}</span>Tasks</>} id="tasks-dropdown" className="app-nav-link" active={isActive("/tasks")||isActive("/calendar")}>

      <NavDropdown.Item as={NavLink} to="/tasks">
       <span className="me-2">{FontAwesomeIcons.List}</span>All Tasks
      </NavDropdown.Item>

      <NavDropdown.Item as={NavLink} to="/tasks/my-tasks">
       <span className="me-2">{FontAwesomeIcons.Account}</span>My Tasks
      </NavDropdown.Item>

      <NavDropdown.Item as={NavLink} to="/calendar">
       <span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Calendar
      </NavDropdown.Item>

     </NavDropdown>

     {/* Boards / Workflow */}
     <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Columns}</span>Boards</>} id="boards-dropdown" className="app-nav-link" active={isActive("/boards")}>

      <NavDropdown.Item as={NavLink} to="/boards/kanban">
       <span className="me-2">{FontAwesomeIcons.Columns}</span>Kanban Board
      </NavDropdown.Item>

      <NavDropdown.Item as={NavLink} to="/boards/timeline">
       <span className="me-2">{FontAwesomeIcons.Chart||FontAwesomeIcons.List}</span>Timeline
      </NavDropdown.Item>

     </NavDropdown>

     {/* Reports */}
     <Nav.Link as={NavLink} to="/reports">
      <span className="me-2">{FontAwesomeIcons.Chart||FontAwesomeIcons.List}</span>Reports
     </Nav.Link>

     <Nav className="me-auto app-nav-links">

      <Nav.Link as={NavLink} to="/team">
       <span className="me-2">{FontAwesomeIcons.Account}</span>Team
      </Nav.Link>

      <Nav.Link as={NavLink} to="/settings">
       <span className="me-2">{FontAwesomeIcons.Settings||FontAwesomeIcons.Admin}</span>Settings
      </Nav.Link>

      {/* restored */}
      <Nav.Link as={NavLink} to="/about">
       <span className="me-2">{FontAwesomeIcons.About}</span>About
      </Nav.Link>

      <Nav.Link as={NavLink} to="/contact">
       <span className="me-2">{FontAwesomeIcons.Contact}</span>Contact
      </Nav.Link>

      {canSeeAdminMenus&&(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown" className="app-nav-link" active={isActive("/admin")||isActive("/users")||isActive("/backups")}>
        <NavDropdown.Item as={NavLink} to="/admin"><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/backups"><span className="me-2">{FontAwesomeIcons.List}</span>Backups</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/businesses"><span className="me-2">{FontAwesomeIcons.List}</span>Businesses</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-types"><span className="me-2">{FontAwesomeIcons.List}</span>Business Types</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/app-keys"><span className="me-2">{FontAwesomeIcons.List}</span>App Keys</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/footers"><span className="me-2">{FontAwesomeIcons.List}</span>Footers</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/seasons"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/holidays"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/occasions"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/taglines"><span className="me-2">{FontAwesomeIcons.List}</span>Taglines</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/tax-rates"><span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions"><span className="me-2">{FontAwesomeIcons.List}</span>Roles &amp; Permissions</NavDropdown.Item>
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/users"><span className="me-2">{FontAwesomeIcons.Account}</span>Users</NavDropdown.Item>
       </NavDropdown>
      )}

     </Nav>

     <Nav>
      {user?(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>}>
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
