/* eslint-disable no-unused-vars */
// src/components/Navigation.jsx
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

function Navigation({user,onLogout,brand="Everything in a Jar"}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);
 const plannerMenus=[
  {
   title:"Study & Notes",
   id:"study-planners-dropdown",
   activePath:"/planners/study-notes",
   items:[
    {label:"Academic Planner",to:"/planners/study-notes/academic-planner"},
    {label:"Brain Dump",to:"/planners/study-notes/brain-dump"},
    {label:"Brain Dump Templates",to:"/planners/study-notes/brain-dump-templates"},
    {label:"General Note-Taking Guide",to:"/planners/study-notes/general-note-taking-guide"},
    {label:"Note Taking Methods",to:"/planners/study-notes/note-taking-methods"},
    {label:"Session Notes",to:"/planners/study-notes/session-notes"},
    {label:"Notes Reflection",to:"/planners/study-notes/notes-reflection"},
    {label:"Rapid Logging",to:"/planners/study-notes/rapid-logging"},
    {label:"Structured Note-Taking",to:"/planners/study-notes/structured-note-taking"},
    {label:"Visual Note-Taking",to:"/planners/study-notes/visual-note-taking"},
    {label:"Box and Bullet Method",to:"/planners/study-notes/box-and-bullet-method"},
    {label:"Boxing Method",to:"/planners/study-notes/boxing-method"},
    {label:"Charting Method",to:"/planners/study-notes/charting-method"},
    {label:"Cornell Method",to:"/planners/study-notes/cornell-method"},
    {label:"Flow Method",to:"/planners/study-notes/flow-method"},
    {label:"Mapping Method",to:"/planners/study-notes/mapping-method"},
    {label:"Outline Method",to:"/planners/study-notes/outline-method"},
    {label:"QA Method",to:"/planners/study-notes/qa-method"},
    {label:"QEC Method",to:"/planners/study-notes/qec-method"},
    {label:"Sentence Method",to:"/planners/study-notes/sentence-method"},
    {label:"T-Note Method",to:"/planners/study-notes/t-note-method"},
    {label:"WOS Method",to:"/planners/study-notes/wos-method"}
   ]
  },
  {
   title:"Daily & Productivity",
   id:"productivity-planners-dropdown",
   activePath:"/planners/daily-productivity",
   items:[
    {label:"Daily Planner",to:"/planners/daily-productivity/daily-planner"},
    {label:"Daily Checklist",to:"/planners/daily-productivity/daily-checklist"},
    {label:"Daily Focus Planner",to:"/planners/daily-productivity/daily-focus-planner"},
    {label:"Productivity Planner",to:"/planners/daily-productivity/productivity-planner"},
    {label:"Action Plan",to:"/planners/daily-productivity/action-plan"},
    {label:"Weekly Breakdown",to:"/planners/daily-productivity/weekly-breakdown"}
   ]
  },
  {
   title:"Goals & Trackers",
   id:"goals-planners-dropdown",
   activePath:"/planners/goals-trackers",
   items:[
    {label:"Top Goals",to:"/planners/goals-trackers/top-goals"},
    {label:"Monthly Goals",to:"/planners/goals-trackers/monthly-goals"},
    {label:"Progress Tracker",to:"/planners/goals-trackers/progress-tracker"},
    {label:"Habit Tracker",to:"/planners/goals-trackers/habit-tracker"},
    {label:"Trackers",to:"/planners/goals-trackers/trackers"},
    {label:"Temperature Log",to:"/planners/goals-trackers/temperature-log"},
    {label:"When Did I Last",to:"/planners/goals-trackers/when-did-i-last"}
   ]
  },
  {
   title:"Budget & Finance",
   id:"budget-finance-planners-dropdown",
   activePath:"/planners/budget-finance",
   items:[
    {label:"Budget Creator",to:"/planners/budget-finance/budget-creator"},
    {label:"Monthly Budget Overview",to:"/planners/budget-finance/monthly-budget-overview"},
    {label:"Bill Payment Tracker",to:"/planners/budget-finance/bill-payment-tracker"},
    {label:"Debt Snowball Tracker",to:"/planners/budget-finance/debt-snowball-tracker"},
    {label:"Expense Tracker",to:"/planners/budget-finance/expense-tracker"},
    {label:"Rent Payment Tracker",to:"/planners/budget-finance/rent-payment-tracker"},
    {label:"Monthly Retirement Budget",to:"/planners/budget-finance/monthly-retirement-budget"}
   ]
  },
  {
   title:"Automotive",
   id:"automotive-planners-dropdown",
   activePath:"/planners/automotive",
   items:[
    {label:"Auto Estimate",to:"/planners/automotive/auto-estimate"},
    {label:"Behind the Wheel Evaluation",to:"/planners/automotive/behind-the-wheel-evaluation"},
    {label:"250 Point Vehicle Inspection",to:"/planners/automotive/250-point-vehicle-inspection"},
    {label:"Vehicle Inspection Report",to:"/planners/automotive/vehicle-inspection-report"},
    {label:"Vehicle Safety Inspection",to:"/planners/automotive/vehicle-safety-inspection"},
    {label:"Refuse Vehicle Inspection Report",to:"/planners/automotive/refuse-vehicle-inspection-report"}
   ]
  },
  {
   title:"Home & Moving",
   id:"home-planners-dropdown",
   activePath:"/planners/home",
   items:[
    {label:"Apartment Hunting",to:"/planners/home/apartment-hunting"},
    {label:"Moving Box Inventory",to:"/planners/home/moving-box-inventory"},
    {label:"Storage Log",to:"/planners/home/storage-log"},
    {label:"Change of Address",to:"/planners/home/change-of-address"},
    {label:"End of Life Planner",to:"/planners/home/end-of-life-planner"},
    {label:"Password Tracker",to:"/planners/home/password-tracker"}
   ]
  },
  {
   title:"Records",
   id:"records-planners-dropdown",
   activePath:"/planners/records",
   items:[
    {label:"Employee Records",to:"/planners/records/employee-records"},
    {label:"Employment Application",to:"/planners/records/employment-application"}
   ]
  }
 ];

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

 const getUserId=()=>{return getObjectId(user?._id||user?.id||user);};

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
 const isManager=isAdmin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);
 const canSeeAdminMenus=isAdmin||isManager;

 return(
  <Navbar expand="lg" className="border-bottom app-nav">
   <Container>
    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">{FontAwesomeIcons.Home} {brand}</Navbar.Brand>
    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>
    <Navbar.Collapse id="site-nav">
     <Nav className="me-auto app-nav-links">

      <NavDropdown
       title={<>{FontAwesomeIcons.About} Info</>}
       id="info-nav"
       className="app-nav-dropdown"
       active={isActive("/contact")||isActive("/about")}
      >
       <NavDropdown.Item as={NavLink} to="/contact"> {FontAwesomeIcons.Contact} Contact </NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/about"> {FontAwesomeIcons.About} About </NavDropdown.Item>
      </NavDropdown>

      {user&&(
       <>
        {plannerMenus.map(menu=>(
         <NavDropdown
          key={menu.id}
          title={<><span className="me-2">{FontAwesomeIcons.List}</span>{menu.title}</>}
          id={menu.id}
          className="app-nav-link"
          active={isActive(menu.activePath)}
         >
          {menu.items.map(item=>(
           <NavDropdown.Item key={item.to} as={NavLink} to={item.to}>
            <span className="me-2">{FontAwesomeIcons.List}</span>{item.label}
           </NavDropdown.Item>
          ))}
         </NavDropdown>
        ))}

        <Nav.Link as={NavLink} to="/reminders" className="app-nav-link">
         <span className="me-2">{FontAwesomeIcons.Calendar}</span>Reminders
        </Nav.Link>
       </>
      )}

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

        <NavDropdown.Item as={NavLink} to="/admin/tax-rates">
         <span className="me-2">{FontAwesomeIcons.List}</span>Tax Rates
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
