// Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Chorna Lifeboard"}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);

 const ADMIN_ROLE_IDS=[
  "69d389f609a4ebea1c3f634e",
  "69d46bce86ec944e3cab4566"
 ];
 const MANAGER_ROLE_IDS=[
  "69d389f609a4ebea1c3f634f"
 ];
 const STAFF_ROLE_IDS=[
  "69d389f609a4ebea1c3f6350"
 ];

 const getRoleValue=role=>{
  if(!role)return "";
  if(typeof role==="string")return role.toLowerCase().trim();
  if(typeof role==="object"){
   if(typeof role.name==="string")return role.name.toLowerCase().trim();
   if(typeof role.code==="string")return role.code.toLowerCase().trim();
   if(typeof role.role==="string")return role.role.toLowerCase().trim();
   if(typeof role.title==="string")return role.title.toLowerCase().trim();
   if(typeof role.label==="string")return role.label.toLowerCase().trim();
   if(typeof role._id==="string")return role._id.toLowerCase().trim();
   if(typeof role.id==="string")return role.id.toLowerCase().trim();
   if(typeof role.$oid==="string")return role.$oid.toLowerCase().trim();
  }
  return "";
 };

 const assignments=[...(user?.roleAssignments||[]),...(user?.userRoleAssignments||[]),...(user?.assignments||[])];
 const roleValues=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...assignments.filter(item=>item?.isActive!==false).map(item=>item.role||item.userRole||item.assignedRole)].map(getRoleValue).filter(Boolean);
 const isAdmin=roleValues.some(role=>["owner","business owner","app owner","super admin","admin","administrator","69edf92e1e6593dd5369f718","69edf92e1e6593dd5369f719",...ADMIN_ROLE_IDS].includes(role));
 const isManager=roleValues.some(role=>["manager","staff","69edf92e1e6593dd5369f71a",...MANAGER_ROLE_IDS,...STAFF_ROLE_IDS].includes(role));
 const canSeeAdminMenus=isAdmin||isManager;

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={Link} to="/" className="app-nav-brand">
     <span className="me-2">{FontAwesomeIcons.Home}</span>{brand}  </Navbar.Brand>
    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="main-nav">

     <Nav className="me-auto app-nav-links">

      <Nav.Link as={NavLink} to="/dashboard" className="app-nav-link">    <span className="me-2">{FontAwesomeIcons.Home}</span>Dashboard  </Nav.Link>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.List}</span>Life Board</>}
       id="lifeboard-dropdown"
       className="app-nav-link"
       active={isActive("/goals")||isActive("/habits")||isActive("/tasks")||isActive("/priorities")||isActive("/routines")||isActive("/milestones")}
      >
       <NavDropdown.Item as={NavLink} to="/goals">   <span className="me-2">{FontAwesomeIcons.List}</span>Goals   </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/milestones">   <span className="me-2">{FontAwesomeIcons.Check}</span>Milestones   </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/habits">     <span className="me-2">{FontAwesomeIcons.Check}</span>Habits    </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/routines">     <span className="me-2">{FontAwesomeIcons.List}</span>Routines    </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/tasks">     <span className="me-2">{FontAwesomeIcons.Book}</span>Tasks     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/priorities">     <span className="me-2">{FontAwesomeIcons.Home}</span>Priorities     </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.Book}</span>Journal</>}
       id="journal-dropdown"
       className="app-nav-link"
       active={isActive("/journal")||isActive("/mindfulness")||isActive("/mood-log")||isActive("/notes")}
      >
       <NavDropdown.Item as={NavLink} to="/journal">     <span className="me-2">{FontAwesomeIcons.Book}</span>Journal Entries     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/journal/daily/new">     <span className="me-2">{FontAwesomeIcons.Check}</span>Daily Journal     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/journal/private">     <span className="me-2">{FontAwesomeIcons.Account}</span>Private Journal     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/mindfulness">     <span className="me-2">{FontAwesomeIcons.Check}</span>Mindfulness     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/mood-log">     <span className="me-2">{FontAwesomeIcons.List}</span>Mood Log     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/notes">     <span className="me-2">{FontAwesomeIcons.Book}</span>Notes     </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Timeline</>}
       id="timeline-dropdown"
       className="app-nav-link"
       active={isActive("/calendar")||isActive("/reminders")||isActive("/reviews")||isActive("/timeline")}
      >
       <NavDropdown.Item as={NavLink} to="/calendar">     <span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Calendar       </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/reminders">     <span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Reminders       </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/reviews">     <span className="me-2">{FontAwesomeIcons.Book}</span>Reviews     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/timeline">       <span className="me-2">{FontAwesomeIcons.List}</span>Timeline     </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.List}</span>Vision</>}
       id="vision-dropdown"
       className="app-nav-link"
       active={isActive("/vision-boards")||isActive("/life-themes")}
      >
       <NavDropdown.Item as={NavLink} to="/vision-boards">   <span className="me-2">{FontAwesomeIcons.List}</span>Vision Boards     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/life-themes">      <span className="me-2">{FontAwesomeIcons.Check}</span>Life Themes      </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.Book}</span>Manage</>}
       id="manage-dropdown"
       className="app-nav-link"
       active={isActive("/categories")||isActive("/life-areas")||isActive("/tags")||isActive("/settings")}
      >
       <NavDropdown.Item as={NavLink} to="/categories">   <span className="me-2">{FontAwesomeIcons.List}</span>Categories     </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/life-areas">      <span className="me-2">{FontAwesomeIcons.Home}</span>Life Areas      </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/tags">      <span className="me-2">{FontAwesomeIcons.List}</span>Tags      </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/settings">      <span className="me-2">{FontAwesomeIcons.Account}</span>Settings      </NavDropdown.Item>
      </NavDropdown>

      <Nav.Link as={NavLink} to="/contact" className={({isActive})=>isActive?"site-navigation-link active":"site-navigation-link"}>{FontAwesomeIcons.Contact} Contact</Nav.Link>
      <Nav.Link as={NavLink} to="/about" className={({isActive})=>isActive?"site-navigation-link active":"site-navigation-link"}>{FontAwesomeIcons.About} About</Nav.Link>

      {canSeeAdminMenus&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>}
        id="admin-dropdown"
        className="app-nav-link"
        active={isActive("/admin")||isActive("/users")||isActive("/permissions")}
      >
        <NavDropdown.Item as={NavLink} to="/admin">
         <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard
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

        <NavDropdown.Item as={NavLink} to="/admin/vendors">
         <span className="me-2">{FontAwesomeIcons.List}</span>Vendors
        </NavDropdown.Item>

        <NavDropdown.Divider/>

        <NavDropdown.Item as={NavLink} to="/users">
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
