// Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {BookOpen,Bug,Thermometer,Shield,Layers,CalendarDays,Carrot,Cherry,Droplets,Handshake,Heart,Leaf,ListChecks,Microscope,Package,Receipt,ShoppingBasket,ShoppingCart,Sprout,Wallet,Wrench} from "lucide-react";
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
      {user&&(<NavDropdown
         title={<>{FontAwesomeIcons.Book} Dashboards</>}
         id="dashboards-nav"
         className="app-nav-dropdown"
         active={isActive("/dashboard")||isActive("/journalboard")}
        >
         <NavDropdown.Item as={NavLink} to="/dashboard"> {FontAwesomeIcons.Book} Dashboard</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/journalboard"> {FontAwesomeIcons.Book} Seasonal Review</NavDropdown.Item>
        </NavDropdown>)}

      {/* public */}
      <NavDropdown
       title={<>{FontAwesomeIcons.Book} Reference</>}
       id="reference-nav"
       className="app-nav-dropdown"
       active={isActive("/soil-temperatures")||isActive("/microgreens-guide")||isActive("/hardiness-zones")||isActive("/hydroponic-companion-planting")}
      >
       <NavDropdown.Item as={NavLink} to="/soil-temperatures"><Thermometer size={16} aria-hidden="true"/> Soil Temperatures</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/microgreens-guide"><BookOpen size={16} aria-hidden="true"/> Microgreens Guide</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/hardiness-zones"> <Leaf size={16} aria-hidden="true"/> Hardiness Zones </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/hydroponic-companion-planting"> <Leaf size={16} aria-hidden="true"/> Hydroponic Companion Planting </NavDropdown.Item>

      </NavDropdown>

    
      {/* core app */}
      {user&&(
       <>

        <NavDropdown
         title={<><Leaf size={16} aria-hidden="true"/> Grow</>}
         id="grow-nav"
         className="app-nav-dropdown"
         active={isActive("/gardens")||isActive("/plantings")||isActive("/hydroponics")}
        >
         <NavDropdown.Item as={NavLink} to="/gardens"> <Sprout size={16} aria-hidden="true"/> Gardens </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/plantings"> <Leaf size={16} aria-hidden="true"/> Growing Run Register </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/hydroponics"><Droplets size={16} aria-hidden="true"/> Hydro Systems</NavDropdown.Item>
        </NavDropdown>


        <NavDropdown
         title={<><BookOpen size={16} aria-hidden="true"/> Library</>}
         id="library-nav"
         className="app-nav-dropdown"
         active={isActive("/plants")||isActive("/seeds")||isActive("/seed-collections")}
        >

         <NavDropdown.Item as={NavLink} to="/plants"> <Leaf size={16} aria-hidden="true"/> Plant Catalog </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/seeds"> <Sprout size={16} aria-hidden="true"/> Seed Catalog </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/seed-collections"> <Sprout size={16} aria-hidden="true"/> My Seed Collection </NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title={<><Handshake size={16} aria-hidden="true"/> Planting Relationships</>} id="planting-relationships-nav" className="app-nav-dropdown" active={isActive("/companion-planting")||isActive("/trap-crops")||isActive("/cover-crops")}>
         <NavDropdown.Item as={NavLink} to="/companion-planting"><Handshake size={16} aria-hidden="true"/> Companion Planting</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/trap-crops"><Shield size={16} aria-hidden="true"/> Trap Crops</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/cover-crops"><Layers size={16} aria-hidden="true"/> Cover Crops</NavDropdown.Item>
        </NavDropdown>

        <NavDropdown title={<><CalendarDays size={16} aria-hidden="true"/> Calendars</>} id="calendars-nav" className="app-nav-dropdown" active={isActive("/fruit-calendar")||isActive("/vegetable-calendar")}>
         <NavDropdown.Item as={NavLink} to="/fruit-calendar"><Cherry size={16} aria-hidden="true"/> Fruit Calendar</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/vegetable-calendar"><Carrot size={16} aria-hidden="true"/> Vegetable Calendar</NavDropdown.Item>
        </NavDropdown>


        <NavDropdown
         title={<><ListChecks size={16} aria-hidden="true"/> Work</>}
         id="work-nav"
         className="app-nav-dropdown"
         active={isExact("/journal")||isActive("/tasks")||isActive("/harvest")||isActive("/observations")||isActive("/fertilizer-applications")||isActive("/issues")||isActive("/pests")||isActive("/diseases")}
        >
         <NavDropdown.Item as={NavLink} to="/journal"> {FontAwesomeIcons.Book} Journal </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/tasks"> <ListChecks size={16} aria-hidden="true"/> Tasks </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/harvest"> <ShoppingBasket size={16} aria-hidden="true"/> Harvest </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/observations"> {FontAwesomeIcons.Book} Observations </NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/fertilizer-applications"> <Leaf size={16} aria-hidden="true"/> Fertilizer </NavDropdown.Item>
                 <NavDropdown.Divider/>
         <NavDropdown.Header>Plant Health</NavDropdown.Header>
         <NavDropdown.Item as={NavLink} to="/issues"> <Bug size={16} aria-hidden="true"/> Issues</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/pests"> <Bug size={16} aria-hidden="true"/> Pests</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/diseases"><Microscope size={16} aria-hidden="true"/> Diseases</NavDropdown.Item>
        
        </NavDropdown>


        <NavDropdown
         title={<><ShoppingCart size={16} aria-hidden="true"/> Purchasing</>}
         id="purchasing-nav"
         className="app-nav-dropdown"
         active={isActive("/vendors")||isActive("/garden-wishlist")||isActive("/supplies")||isActive("/equipment")||isActive("/garden-budgets")||isActive("/garden-expenses")}
        >
         <NavDropdown.Item as={NavLink} to="/garden-wishlist"><Heart size={16} aria-hidden="true"/> Garden Wish List</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/supplies"><Package size={16} aria-hidden="true"/> Supply Inventory</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/equipment"><Wrench size={16} aria-hidden="true"/> Equipment Inventory</NavDropdown.Item>
         <NavDropdown.Divider/>
         <NavDropdown.Header>Budgets & Spending</NavDropdown.Header>

         <NavDropdown.Item as={NavLink} to="/garden-budgets"><Wallet size={16} aria-hidden="true"/> Garden Budgets</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/garden-expenses"><Receipt size={16} aria-hidden="true"/> Garden Expenses</NavDropdown.Item>
        <NavDropdown.Divider/>
         <NavDropdown.Header>Vendors</NavDropdown.Header>
         <NavDropdown.Item as={NavLink} to="/vendors/equipment"> {FontAwesomeIcons.Book} Equipment Vendors</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/vendors/seeds"> <Sprout size={16} aria-hidden="true"/> Seed Vendors</NavDropdown.Item>
         <NavDropdown.Item as={NavLink} to="/vendors/supplies"> <Leaf size={16} aria-hidden="true"/> Supply Vendors</NavDropdown.Item>
        </NavDropdown>
       </>
      )}

      <NavDropdown
       title={<>{FontAwesomeIcons.About} Info</>}
       id="info-nav"
       className="app-nav-dropdown"
       active={isActive("/contact")||isActive("/about")}
      >
       <NavDropdown.Item as={NavLink} to="/contact"> {FontAwesomeIcons.Contact} Contact </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/about"> {FontAwesomeIcons.About} About </NavDropdown.Item>
      </NavDropdown>

      {canSeeAdminMenus&&(
        <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>} id="admin-dropdown" className="app-nav-dropdown"
         active={isActive("/admin")||isActive("/users")}  >
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
        <NavDropdown.Header>Access Management</NavDropdown.Header>
        <NavDropdown.Item as={NavLink} to="/users"> <span className="me-2">{FontAwesomeIcons.Account}</span>Users </NavDropdown.Item>
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
