// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const isActive=p=>location.pathname.startsWith(p);
 const isMenteePath=()=>location.pathname==="/mentees"||location.pathname==="/mentees-page";
 const isMenteeFilterActive=filter=>isMenteePath()&&new URLSearchParams(location.search).get("filter")===filter;
 const isAllMenteesActive=()=>isMenteePath()&&(!new URLSearchParams(location.search).get("filter")||new URLSearchParams(location.search).get("filter")==="all");
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
      {user&&(
       <>
        <Nav.Link as={NavLink} to="/dashboard" className="app-nav-link">
         <span className="me-2">{FontAwesomeIcons.Home||FontAwesomeIcons.List}</span>Dashboard
        </Nav.Link>
        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>Mentees</>} id="mentees-dropdown" className="app-nav-link" active={isActive("/mentees")}>
         <NavDropdown.Item as={Link} to="/mentees?filter=all" active={isAllMenteesActive()}>   <span className="me-2">{FontAwesomeIcons.List}</span>All Mentees </NavDropdown.Item>
         <NavDropdown.Item as={Link} to="/mentees?filter=active" active={isMenteeFilterActive("active")}> <span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Active Mentees         </NavDropdown.Item>
         <NavDropdown.Item as={Link} to="/mentees?filter=incoming" active={isMenteeFilterActive("incoming")}> <span className="me-2">{FontAwesomeIcons.Account||FontAwesomeIcons.List}</span>Incoming Mentees </NavDropdown.Item>
         <NavDropdown.Item as={Link} to="/mentees?filter=completed" active={isMenteeFilterActive("completed")}>  <span className="me-2">{FontAwesomeIcons.Check}</span>Completed Mentees    </NavDropdown.Item>
         <NavDropdown.Item as={Link} to="/mentees?filter=dropped" active={isMenteeFilterActive("dropped")}>   <span className="me-2">{FontAwesomeIcons.Logout}</span>Dropped Mentees        </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Sessions</>} id="sessions-dropdown" className="app-nav-link" active={isActive("/sessions")}>
         <NavDropdown.Item as={NavLink} to="/sessions"><span className="me-2">{FontAwesomeIcons.List}</span>Weekly Sessions</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/sessions/upcoming"><span className="me-2">{FontAwesomeIcons.Date||FontAwesomeIcons.Calendar||FontAwesomeIcons.List}</span>Upcoming Sessions</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.List}</span>Tracking</>} id="tracking-dropdown" className="app-nav-link" active={isActive("/timesheets")||isActive("/mentee-files")}>
         <NavDropdown.Item as={NavLink} to="/timesheets"><span className="me-2">{FontAwesomeIcons.List}</span>Timesheets</NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/mentee-files"><span className="me-2">{FontAwesomeIcons.Book}</span>Images & Documents</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/tasks"><span className="me-2">{FontAwesomeIcons.List}</span>My Task List</NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/surveys"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Surveys  </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Book}</span>Resources</>} id="resources-dropdown" className="app-nav-link" active={isActive("/resources")||isActive("/mentor-reference")}>
         <NavDropdown.Item as={NavLink} to="/resources"><span className="me-2">{FontAwesomeIcons.Book}</span>Mentee Resources</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/mentor-reference/initiating-a-conversation"><span className="me-2">{FontAwesomeIcons.List}</span>Initiating a Conversation</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/mentor-reference/questions-for-mentee"><span className="me-2">{FontAwesomeIcons.List}</span>Questions for Mentee</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/mentor-reference/questions-for-mentor"><span className="me-2">{FontAwesomeIcons.List}</span>Questions for Mentor</NavDropdown.Item>
        </NavDropdown>
        <Nav.Link as={NavLink} to="/reports"><span className="me-2">{FontAwesomeIcons.About}</span>Reports</Nav.Link>
        <Nav.Link as={NavLink} to="/programs"><span className="me-2">{FontAwesomeIcons.List}</span>Programs</Nav.Link>

      {canSeeAdminMenus&&(
       <NavDropdown  title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown"  className="app-nav-link"
        active={isActive("/admin")||isActive("/users")}   >
        <NavDropdown.Item as={NavLink} to="/admin">  <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/businesses"> <span className="me-2">{FontAwesomeIcons.List}</span>Businesses </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-types"><span className="me-2">{FontAwesomeIcons.List}</span>Business Types </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/app-keys"> <span className="me-2">{FontAwesomeIcons.List}</span>App Keys </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/meeting-methods"> <span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.List}</span>Meeting Methods </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/file-options"> <span className="me-2">{FontAwesomeIcons.List}</span>File Types &amp; Categories </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/footers"> <span className="me-2">{FontAwesomeIcons.List}</span>Footers  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/seasons"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/holidays"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/occasions"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/taglines">  <span className="me-2">{FontAwesomeIcons.List}</span>Taglines  </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/vendors"> <span className="me-2">{FontAwesomeIcons.List}</span>Vendors  </NavDropdown.Item>
        <NavDropdown.Divider/>
        <NavDropdown.Item as={NavLink} to="/users"> <span className="me-2">{FontAwesomeIcons.Account}</span>Users </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions">  <span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions </NavDropdown.Item>
       </NavDropdown>
      )}

       </>
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
