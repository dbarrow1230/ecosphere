// src/components/Navigation.jsx
import {useEffect,useMemo,useState} from "react";
import {Navbar,Nav,NavDropdown,Container} from "react-bootstrap";
import {Link,useLocation,NavLink} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

const normalizeList=payload=>{
 if(Array.isArray(payload))return payload;
 if(Array.isArray(payload?.data))return payload.data;
 if(Array.isArray(payload?.items))return payload.items;
 if(Array.isArray(payload?.results))return payload.results;
 return [];
};

const slugify=value=>String(value||"")
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\s+/g,"-")
 .replace(/-+/g,"-");

const getMethodSlug=method=>method?.slug||slugify(method?.title||method?.name||"");

const getMethodTitle=method=>method?.title||method?.name||method?.label||"Study Method";

const sortByOrderThenTitle=(a,b)=>(a?.order||0)-(b?.order||0)||getMethodTitle(a).localeCompare(getMethodTitle(b));

const getMethodUrl=method=>{
 const slug=getMethodSlug(method);
 return slug?`/methods/${slug}`:"/methods";
};

const getSubMethodUrl=(method,subMethod)=>{
 const methodUrl=getMethodUrl(method);
 const subSlug=getMethodSlug(subMethod);
 return subSlug?`${methodUrl}?sub=${encodeURIComponent(subSlug)}`:methodUrl;
};

function Navigation({user,onLogout}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const [studyMethods,setStudyMethods]=useState([]);

 const isActive=p=>location.pathname.startsWith(p);
 const isPrefixActive=p=>location.pathname.startsWith(p);
 const isExactPath=p=>location.pathname===p;
 const isBibleStudyMethodsActive=isExactPath("/methods");
 const isStudiesActive=location.pathname.startsWith("/studies")||location.pathname.startsWith("/forms/studies/study");
 const isStudyMethodsActive=location.pathname.startsWith("/methods/");

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

 const getUserId=()=>{ return getObjectId(user); };

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
 const methodMenuGroups=useMemo(()=>{
  return studyMethods
   .filter(method=>method&&method.active!==false)
   .slice()
   .sort(sortByOrderThenTitle)
   .map(method=>({
    method,
    subMethods:(Array.isArray(method.subMethods)?method.subMethods:[])
     .filter(subMethod=>subMethod&&subMethod.active!==false)
     .slice()
     .sort(sortByOrderThenTitle)
   }))
   .filter(group=>group.subMethods.length>0);
 },[studyMethods]);

 useEffect(()=>{
  let isMounted=true;

  const loadStudyMethods=async()=>{
   try{
    const res=await fetch("/api/methods");
    const data=await res.json().catch(()=>({data:[]}));
    if(!res.ok)throw new Error(data?.message||"Failed to load study methods");
    if(isMounted)setStudyMethods(normalizeList(data));
   }catch{
    if(isMounted)setStudyMethods([]);
   }
  };

  loadStudyMethods();

  return()=>{
   isMounted=false;
  };
 },[]);

 return(
  <Navbar expand="lg" className="app-nav">
   <Container>
    <Navbar.Brand as={Link} to="/" className="app-nav-brand"> <span className="me-2">{FontAwesomeIcons.Home}</span>Home</Navbar.Brand>
    <Navbar.Toggle aria-controls="main-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="main-nav">
     <Nav className="me-auto app-nav-links">
      {user?(
       <Nav.Link as={NavLink} to="/dashboard" end className={isExactPath("/dashboard")?"active":""}>
        <span className="me-2">{FontAwesomeIcons.Feedback}</span>Dashboard
       </Nav.Link>
      ):null}

      <Nav.Link as={NavLink} to="/studies" end className={isStudiesActive?"active":""}>
       <span className="me-2">{FontAwesomeIcons.Book}</span>Studies
      </Nav.Link>

      <Nav.Link as={NavLink} to="/methods" end className={isBibleStudyMethodsActive?"active":""}> <span className="me-2">{FontAwesomeIcons.Book}</span> Bible Study Methods </Nav.Link>

      <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.StudyMethods}</span>Study Methods</>} id="study-methods-dropdown" className="app-nav-link" active={isStudyMethodsActive}>
       {methodMenuGroups.length?methodMenuGroups.map(({method,subMethods})=>(
        <NavDropdown title={getMethodTitle(method)} drop="end" key={getMethodSlug(method)||getMethodTitle(method)}>
         {subMethods.map(subMethod=>(
          <NavDropdown.Item
           as={NavLink}
           to={getSubMethodUrl(method,subMethod)}
           key={`${getMethodSlug(method)}-${getMethodSlug(subMethod)||getMethodTitle(subMethod)}`}
          >
           <span className="me-2">{FontAwesomeIcons.List}</span>{getMethodTitle(subMethod)}
          </NavDropdown.Item>
         ))}
        </NavDropdown>
       )):(
        <NavDropdown.Item as={NavLink} to="/methods">
         <span className="me-2">{FontAwesomeIcons.Book}</span>Browse Study Methods
        </NavDropdown.Item>
       )}
      </NavDropdown>

      <NavDropdown title={<><span className="me-2">{FontAwesomeIcons.List}</span>Tasks</>} id="tasks-dropdown" className="app-nav-link" active={isPrefixActive("/study-tasks")||isPrefixActive("/calendar")}>
       <NavDropdown.Item as={NavLink} to="/forms/studies/study?mode=create"><span className="me-2">{FontAwesomeIcons.Book}</span>Create Bible Study</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/forms/studies/daily-note"><span className="me-2">{FontAwesomeIcons.Book}</span>Daily Notes Journal</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/study-tasks"><span className="me-2">{FontAwesomeIcons.List}</span>Study Tasks</NavDropdown.Item>
       <NavDropdown.Item as={NavLink} to="/calendar"><span className="me-2">{FontAwesomeIcons.Calendar||FontAwesomeIcons.Date||FontAwesomeIcons.List}</span>Calendar</NavDropdown.Item>
      </NavDropdown>

      <Nav.Link as={NavLink} to="/translations" end className={isExactPath("/translations")?"active":""}><span className="me-2">{FontAwesomeIcons.About}</span>Bible Translations</Nav.Link>
      <Nav.Link as={NavLink} to="/about" end className={isExactPath("/about")?"active":""}><span className="me-2">{FontAwesomeIcons.About}</span>About</Nav.Link>
      <Nav.Link as={NavLink} to="/contact" end className={isExactPath("/contact")?"active":""}><span className="me-2">{FontAwesomeIcons.Contact}</span>Contact</Nav.Link>
     </Nav>

     <Nav>
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
