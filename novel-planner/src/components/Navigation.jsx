// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import {plannerWorkflowSections as sharedPlannerWorkflowSections} from "../data/plannerWorkflowSections.js";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Novel Planner"}){
 const location=useLocation();
 const {FontAwesomeIcons,LucideIcons}=useIcons();
 const getSelectedBookId=()=>{
  try{
   const raw=localStorage.getItem("activePlannerBook");
   if(!raw)return "";
   const book=JSON.parse(raw);
   return getObjectId(book?._id||book?.id||book);
  }catch{return "";}
 };

 const isActive=p=>location.pathname.startsWith(p);
 const workflowActive=location.pathname.startsWith("/planner")||location.pathname.includes("/planner/");
 const referenceActive=location.pathname.startsWith("/referance");
 const bookDashboardActive=location.pathname.startsWith("/books")&&!location.pathname.includes("/planner/");

 const ADMIN_USER_IDS=["69af088d21b4580a8cb6614b"];
 const OWNER_ROLE_IDS=["69edf92e1e6593dd5369f718"];
 const ADMIN_ROLE_IDS=["69edf92e1e6593dd5369f719","69d389f609a4ebea1c3f634e","69d46bce86ec944e3cab4566"];

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
 const selectedBookId=getSelectedBookId();
 const workflowIsActive=!!selectedBookId&&workflowActive;

 const getUserId=()=>getObjectId(user?._id||user?.id||user);

 const getDirectRoleIds=()=>[
  getObjectId(user?.role),
  getObjectId(user?.roleId),
  getObjectId(user?.currentRole),
  getObjectId(user?.activeRole)
 ].filter(Boolean);

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

 const getAssignmentRoleIds=()=>getAssignmentRoles().map(role=>getObjectId(role)).filter(Boolean);

 const getRoleName=value=>{
  if(!value)return "";
  if(typeof value==="string")return value.toLowerCase().trim();
  if(typeof value==="object")return String(value.name||value.title||value.label||value.code||value.role||"").trim().toLowerCase();
  return "";
 };

 const getRoleNames=()=>[
  user?.role,
  user?.roleId,
  user?.currentRole,
  user?.activeRole,
  ...getAssignmentRoles()
 ].map(getRoleName).filter(Boolean);

 const userId=getUserId();
 const allRoleIds=[...getDirectRoleIds(),...getAssignmentRoleIds()];
 const roleNames=getRoleNames();

 const hasRoleId=ids=>allRoleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));

 const isKnownAdminUser=ADMIN_USER_IDS.includes(userId);
 const isOwner=isKnownAdminUser||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const isAdmin=isOwner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const canSeeAdminMenus=!!user&&(isOwner||isAdmin);
 const plannerPath=path=>selectedBookId?`/books/${selectedBookId}${path}`:"/books/dashboard";

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>

    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">{brand}</Navbar.Brand>

    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="site-nav">

     <Nav className="me-auto app-nav-links">
      <Nav.Link as={NavLink} to="/dashboard" className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Dashboard}</span>Dashboard
      </Nav.Link>

      <Nav.Link as={NavLink} to="/books/dashboard" className={`app-nav-link${bookDashboardActive?" active":""}`}>
       <span className="me-2">{FontAwesomeIcons.List}</span>Book Dashboard
      </Nav.Link>

      {selectedBookId&&<NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.List}</span>Planner Workflow</>}
       id="planner-workflow-dropdown"
       className="app-nav-link planner-workflow-dropdown"
       active={workflowIsActive}
      >
       {sharedPlannerWorkflowSections.map(section=>(
        <div className="planner-menu-group" key={section.path}>
         <NavDropdown.Item as={NavLink} to={plannerPath(section.path)} className="planner-root-item">
          <span>{section.label}</span>
          <span className="planner-root-arrow">›</span>
         </NavDropdown.Item>

         <div className="planner-submenu">
          {section.items.map(([label,path])=>(
           <NavDropdown.Item as={NavLink} to={plannerPath(path)} className="planner-sub-item" key={path}>
            {label}
           </NavDropdown.Item>
          ))}
         </div>
        </div>
       ))}
      </NavDropdown>}

      <NavDropdown
       title={<><span className="me-2">{LucideIcons.FileText}</span>Reference</>}
       id="reference-dropdown"
       className="app-nav-link"
       active={referenceActive}
      >
       <NavDropdown.Item as={NavLink} to="/referance/theme-exploration">
        Theme Exploration
       </NavDropdown.Item>

       <NavDropdown.Item as={NavLink} to="/referance/setting-exploration">
        Setting Exploration
       </NavDropdown.Item>
      </NavDropdown>

      <Nav.Link as={NavLink} to="/about" className="app-nav-link">
       <span className="me-2">{LucideIcons.FileText}</span>About
      </Nav.Link>

      <Nav.Link as={NavLink} to="/contact" className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Contact}</span>Contact
      </Nav.Link>
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

          <NavDropdown.Divider/>
         </>
        )}

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
