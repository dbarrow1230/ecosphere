// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink,Link} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout}){

 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const isActive=p=>location.pathname.startsWith(p);
 const ADMIN_USER_IDS=[ "69af088d21b4580a8cb6614b" ];
 const OWNER_ROLE_IDS=[ "69edf92e1e6593dd5369f718" ];
 const ADMIN_ROLE_IDS=[ "69edf92e1e6593dd5369f719", "69d389f609a4ebea1c3f634e", "69d46bce86ec944e3cab4566" ];
 const MANAGER_ROLE_IDS=[ "69edf92e1e6593dd5369f71a", "69d389f609a4ebea1c3f634f" ];

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

 const getUserId=()=>getObjectId(user?._id||user?.id||user);

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
  if(!value)return "";
  if(typeof value==="string")return value.toLowerCase().trim();
  if(typeof value==="object")return String(value.name||value.title||value.label||value.code||value.role||"").trim().toLowerCase();
  return "";
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
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager","business manager"]);
 const canSeeAdminMenus=!!user&&(isOwner||isAdmin||isManager);

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={Link} to="/" className="app-nav-brand"><span className="me-2">{FontAwesomeIcons.Home}</span>Home</Navbar.Brand>
    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="main-nav">
     <Nav className="me-auto app-nav-links">

      {user&&(
       <NavLink to="/dashboard" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>{FontAwesomeIcons.Home} Dashboard</NavLink>
      )}

      <NavDropdown
       title={<>{FontAwesomeIcons.Tools} Food Preservation</>}
       id="site-nav-food-preservation"
       className={"app-nav-dropdown"+((isActive("/dehydration")||isActive("/dehydration-setups")||isActive("/dehydrators"))?" active":"")}
      >
       <NavDropdown.Item as={NavLink} to="/dehydration/projects">{FontAwesomeIcons.List} Projects</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/dehydration-setups">{FontAwesomeIcons.Settings} Dehydration Setups</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/dehydration-setups/new">{FontAwesomeIcons.Add||FontAwesomeIcons.Settings} New Setup</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/dehydrators">{FontAwesomeIcons.List} Dehydrators</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/salt-percentage-calculator">{FontAwesomeIcons.List} Salt Percentage Calculator</NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
       title={<>{FontAwesomeIcons.Lightbulb||FontAwesomeIcons.Columns} Energy</>}
       id="site-nav-energy"
       className={"app-nav-dropdown"+((isActive("/energy-dashboard")||isActive("/electricity-accounts"))?" active":"")}
      >
       <NavDropdown.Item as={NavLink} to="/energy-dashboard">{FontAwesomeIcons.Columns} Dashboard</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/electricity-accounts">{FontAwesomeIcons.List} Electricity Accounts</NavDropdown.Item>
      </NavDropdown>

      <NavLink to="/contact" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>{FontAwesomeIcons.Contact} Contact</NavLink>
      <NavLink to="/about" className={({isActive})=>"nav-link app-nav-link"+(isActive?" active":"")}>{FontAwesomeIcons.About} About</NavLink>
     </Nav>

     <Nav>
      {canSeeAdminMenus&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Admin}</span>Admin</>}
        id="admin-dropdown"
        className="app-nav-link"
        active={isActive("/admin")||isActive("/permissions")}
       >
        <NavDropdown.Item as={NavLink} to="/admin">
         <span className="me-2">{FontAwesomeIcons.Admin}</span>Admin Dashboard
        </NavDropdown.Item>

        {isOwner&&(
         <>
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

          <NavDropdown.Item as={NavLink} to="/admin/tax-rates">
           <span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/allergens">
           <span className="me-2">{FontAwesomeIcons.List}</span>Allergens
          </NavDropdown.Item>

          <NavDropdown.Item as={NavLink} to="/admin/statuses">
           <span className="me-2">{FontAwesomeIcons.List}</span>Statuses
          </NavDropdown.Item>

          <NavDropdown.Divider/>
         </>
        )}

        <NavDropdown.Item as={NavLink} to="/admin/clients">
         <span className="me-2">{FontAwesomeIcons.Account}</span>Clients
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/events">
         <span className="me-2">{FontAwesomeIcons.Calendar}</span>Events
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/orders">
         <span className="me-2">{FontAwesomeIcons.List}</span>Orders
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/products">
         <span className="me-2">{FontAwesomeIcons.List}</span>Products
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/product-batches">
         <span className="me-2">{FontAwesomeIcons.List}</span>Product Batches
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/inventory">
         <span className="me-2">{FontAwesomeIcons.List}</span>Inventory
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/storage-locations">
         <span className="me-2">{FontAwesomeIcons.List}</span>Storage Locations
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/suppliers">
         <span className="me-2">{FontAwesomeIcons.List}</span>Suppliers
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/menus">
         <span className="me-2">{FontAwesomeIcons.List}</span>Menus
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/admin/reports">
         <span className="me-2">{FontAwesomeIcons.List}</span>Reports
        </NavDropdown.Item>

        <NavDropdown.Divider/>

        <NavDropdown.Item as={NavLink} to="/admin/users">
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
       <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.Account}</span>{user.username||user.name||user.email||"Account"}</>}>
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
