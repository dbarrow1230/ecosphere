// Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Chorna Lifeboard"}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);
 const isExact=p=>location.pathname===p;

 const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b" ];
 const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
 const ADMIN_ROLE_IDS=[ "69edf92e1e6593dd5369f719", "69d389f609a4ebea1c3f634e", "69d46bce86ec944e3cab4566"];
 const MANAGER_ROLE_IDS=["69edf92e1e6593dd5369f71a", "69d389f609a4ebea1c3f634f" ];

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
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager","garden manager"]);
 const canSeeAdminMenus=isAdmin||isManager;

 return(
  <Navbar expand="lg" className="border-bottom app-nav">
   <Container>
    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand"> {FontAwesomeIcons.Home} {brand} </Navbar.Brand>
    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="site-nav">
     <Nav className="me-auto app-nav-links">

      {/* public */}
      <NavDropdown
       title={<>{FontAwesomeIcons.Book} Reference</>}
       id="reference-nav"
       className="app-nav-dropdown"
       active={isActive("/hardiness-zones")||isActive("/hydroponic-companion-planting")}
      >
       <NavDropdown.Item as={NavLink} to="/hardiness-zones"> {FontAwesomeIcons.Leaf} Hardiness Zones </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/hydroponic-companion-planting"> {FontAwesomeIcons.Leaf} Hydroponic Companion Planting </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<>{FontAwesomeIcons.About} Info</>}
       id="info-nav"
       className="app-nav-dropdown"
       active={isActive("/contact")||isActive("/about")}
      >
       <NavDropdown.Item as={NavLink} to="/contact"> {FontAwesomeIcons.Contact} Contact </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/about"> {FontAwesomeIcons.About} About </NavDropdown.Item>
      </NavDropdown>
    
      {/* core app */}
      {user&&(
       <>
        <NavDropdown
         title={<>{FontAwesomeIcons.Book} Dashboards</>}
         id="dashboards-nav"
         className="app-nav-dropdown"
         active={isActive("/dashboard")||isActive("/journalboard")}
        >
         <NavDropdown.Item as={NavLink} to="/dashboard"> {FontAwesomeIcons.Book} Dashboard</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/journalboard"> {FontAwesomeIcons.Book} Journal Board</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown
         title={<>{FontAwesomeIcons.Leaf} Grow</>}
         id="grow-nav"
         className="app-nav-dropdown"
         active={isActive("/gardens")||isActive("/plantings")}
        >
         <NavDropdown.Item as={NavLink} to="/gardens"> {FontAwesomeIcons.Seedling} Gardens </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/plantings"> {FontAwesomeIcons.Leaf} All Growing Runs </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown
         title={<>{FontAwesomeIcons.Book} Library</>}
         id="library-nav"
         className="app-nav-dropdown"
         active={isActive("/plants")||isActive("/seeds")||isActive("/seed-collections")}
        >
         <NavDropdown.Item as={NavLink} to="/plants"> {FontAwesomeIcons.Leaf} Plant Catalog </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/seeds"> {FontAwesomeIcons.Seedling} Seed Catalog </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/seed-collections"> {FontAwesomeIcons.Seedling} My Seed Collection </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown
         title={<>{FontAwesomeIcons.Tasks} Work</>}
         id="work-nav"
         className="app-nav-dropdown"
         active={isExact("/journal")||isActive("/tasks")||isActive("/harvest")||isActive("/equipment")||isActive("/supplies")||isActive("/observations")||isActive("/fertilizer-applications")}
        >
         <NavDropdown.Item as={NavLink} to="/journal"> {FontAwesomeIcons.Book} Journal </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/tasks"> {FontAwesomeIcons.Tasks} Tasks </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/harvest"> {FontAwesomeIcons.Basket} Harvest </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/equipment"> {FontAwesomeIcons.Book} Equipment </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/supplies"> {FontAwesomeIcons.Leaf} Supplies </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/observations"> {FontAwesomeIcons.Book} Observations </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/fertilizer-applications"> {FontAwesomeIcons.Leaf} Fertilizer </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/hydroponics"> {FontAwesomeIcons.Leaf} Hydro Systems </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown
         title={<>{FontAwesomeIcons.Bug} Health</>}
         id="health-nav"
         className="app-nav-dropdown"
         active={isActive("/issues")||isActive("/pests")||isActive("/diseases")}
        >
         <NavDropdown.Item as={NavLink} to="/issues"> {FontAwesomeIcons.Bug} Issues</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/pests"> {FontAwesomeIcons.Bug} Pests</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/diseases">{FontAwesomeIcons.Microscope} Diseases</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown
         title={<>{FontAwesomeIcons.Book} Vendors</>}
         id="vendors-nav"
         className="app-nav-dropdown"
         active={isActive("/vendors")}
        >
         <NavDropdown.Item as={NavLink} to="/vendors/equipment"> {FontAwesomeIcons.Book} Equipment Vendors</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/vendors/seeds"> {FontAwesomeIcons.Seedling} Seed Vendors</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/vendors/supplies"> {FontAwesomeIcons.Leaf} Supply Vendors</NavDropdown.Item>
        </NavDropdown>
       </>
      )}

      {canSeeAdminMenus&&(
        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown" className="app-nav-dropdown"
         active={isActive("/admin")||isActive("/users")||isActive("/equipment")||isActive("/hydroponics")||isActive("/diseases")||isActive("/pests")||isActive("/tasks")||isExact("/journal")}  >
        <NavDropdown.Item as={NavLink} to="/admin"> <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard </NavDropdown.Item>
        {isOwner&&(
         <>
          <NavDropdown.Divider/>
          <NavDropdown.Header>Owner Settings</NavDropdown.Header>
          <NavDropdown.Item as={NavLink} to="/admin/businesses"> <span className="me-2">{FontAwesomeIcons.List}</span>Businesses </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/business-types"> <span className="me-2">{FontAwesomeIcons.List}</span>Business Types </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/app-keys"><span className="me-2">{FontAwesomeIcons.List}</span>App Keys </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/tax-rates"> <span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/footers"> <span className="me-2">{FontAwesomeIcons.List}</span>Footers </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/seasons"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Seasons </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/holidays"> <span className="me-2">{FontAwesomeIcons.Calendar}</span>Holidays </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/occasions"><span className="me-2">{FontAwesomeIcons.Calendar}</span>Occasions </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/taglines"> <span className="me-2">{FontAwesomeIcons.List}</span>Taglines </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/vendors"> <span className="me-2">{FontAwesomeIcons.List}</span>Vendors </NavDropdown.Item>
          <NavDropdown.Item as={NavLink} to="/admin/business-roles-permissions"><span className="me-2">{FontAwesomeIcons.List}</span>Roles & Permissions </NavDropdown.Item>
         </>
        )}
        <NavDropdown.Divider/>
        <NavDropdown.Header>Garden Admin</NavDropdown.Header>
        <NavDropdown.Item as={NavLink} to="/users"> <span className="me-2">{FontAwesomeIcons.Account}</span>Users </NavDropdown.Item>
        <NavDropdown.Item as={NavLink} to="/admin/inventory"> <span className="me-2">{FontAwesomeIcons.List}</span>Inventory </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/equipment"> <span className="me-2">{FontAwesomeIcons.Book}</span>Equipment </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/hydroponics"> <span className="me-2">{FontAwesomeIcons.Leaf}</span>Hydro Systems </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/diseases"> <span className="me-2">{FontAwesomeIcons.Microscope}</span>Diseases </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/pests"> <span className="me-2">{FontAwesomeIcons.Bug}</span>Pests </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/tasks"> <span className="me-2">{FontAwesomeIcons.Tasks}</span>Tasks </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/journal"> <span className="me-2">{FontAwesomeIcons.Book}</span>Journal </NavDropdown.Item>
        </NavDropdown>
      )}

     </Nav>

     <Nav>
      {user?(
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||"Account"}</>} className="app-nav-dropdown">
        <NavDropdown.Item as={NavLink} to="/profile">  <span className="me-2">{FontAwesomeIcons.Profile}</span>Profile  </NavDropdown.Item>
        <NavDropdown.Item onClick={onLogout}> <span className="me-2">{FontAwesomeIcons.Logout}</span>Logout </NavDropdown.Item>
       </NavDropdown>
      ):(
       <Nav.Link as={NavLink} to="/login">  <span className="me-2">{FontAwesomeIcons.Login}</span>Login </Nav.Link> )}
     </Nav>

    </Navbar.Collapse>

   </Container>
  </Navbar>
 );
}

export default Navigation;
