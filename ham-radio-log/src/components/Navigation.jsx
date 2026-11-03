// src/components/Navigation.jsx
import {Container,Nav,Navbar,NavDropdown} from "react-bootstrap";
import {useEffect,useState} from "react";
import {NavLink,useLocation} from "react-router-dom";
import {useIcons} from "@shared";
import "./Navigation.css";

const getRoleName=value=>typeof value==="string"?value.trim().toLowerCase():typeof value==="object"?String(value.name||value.title||value.label||value.code||value.role||"").trim().toLowerCase():"";
const getId=value=>String(value?._id?.$oid||value?._id||value?.$oid||value||"");

function Navigation({user,onLogout,brand="Ham Radio"}){
 const location=useLocation();
 const {FontAwesomeIcons}=useIcons();

 const isActive=p=>location.pathname.startsWith(p);

 const assignments=[
  ...(Array.isArray(user?.roleAssignments)?user.roleAssignments:[]),
  ...(Array.isArray(user?.userRoleAssignments)?user.userRoleAssignments:[]),
  ...(Array.isArray(user?.assignments)?user.assignments:[])
 ].filter(item=>item?.isActive!==false);

 const roles=[
  user?.role,
  user?.roleId,
  user?.currentRole,
  user?.activeRole,
  ...assignments.map(item=>item.role||item.userRole||item.assignedRole)
 ].filter(Boolean);

 const roleNames=roles.map(getRoleName).filter(Boolean);

 const isOwner=roleNames.some(name=>["owner","business owner","app owner","super admin"].includes(name));
 const isAdmin=isOwner||roleNames.some(name=>["admin","administrator"].includes(name));
 const canSeeAdminMenus=!!user&&isAdmin;
 const[effectivePermissions,setEffectivePermissions]=useState([]);

 useEffect(()=>{
  if(!user||isOwner||isAdmin){
   setEffectivePermissions([]);
   return;
  }

  const userId=getId(user);
  const businessId=getId(user.currentBusiness||user.business||user.businessRef);

  if(!userId||!businessId){
   setEffectivePermissions([]);
   return;
  }

  let ignore=false;

  fetch(`/api/users/effective-permissions?user=${encodeURIComponent(userId)}&business=${encodeURIComponent(businessId)}`)
   .then(response=>response.ok?response.json():{data:[]})
   .then(data=>{
    if(!ignore)setEffectivePermissions(Array.isArray(data.data)?data.data:[]);
   })
   .catch(()=>{
    if(!ignore)setEffectivePermissions([]);
   });

  return()=>{
   ignore=true;
  };
 },[user,isOwner,isAdmin]);

 const canRead=module=>isOwner||isAdmin||effectivePermissions.some(permission=>permission.module===module&&(permission.read||permission.admin));

 return(
  <Navbar expand="lg" className="app-nav">
   <Container fluid className="app-nav-container">
    <Navbar.Brand as={NavLink} to="/" className="app-nav-brand">
     <span className="me-2">{FontAwesomeIcons.Home}</span>{brand||"Ham Radio"}
    </Navbar.Brand>

    <Navbar.Toggle aria-controls="site-nav" className="app-nav-toggle"/>

    <Navbar.Collapse id="site-nav">
     <Nav className="me-auto app-nav-links">
      <Nav.Link as={NavLink} to="/" end className="app-nav-link">
       <span className="me-2">{FontAwesomeIcons.Home}</span>Home
      </Nav.Link>

      {(canRead("dashboard")||canRead("qso"))&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Dashboard||FontAwesomeIcons.List}</span>Ham Radio</>}
        id="ham-radio-dropdown"
        className="app-nav-link"
        active={isActive("/dashboard")||isActive("/logbook")}
       >
        {canRead("dashboard")&&(
         <NavDropdown.Item as={NavLink} to="/dashboard">
          <span className="me-2">{FontAwesomeIcons.Dashboard||FontAwesomeIcons.List}</span>Dashboard
         </NavDropdown.Item>
        )}

        {canRead("qso")&&(
         <NavDropdown.Item as={NavLink} to="/logbook">
          <span className="me-2">{FontAwesomeIcons.List}</span>Logbook
         </NavDropdown.Item>
        )}
       </NavDropdown>
      )}

      {canRead("morse_practice")&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Keyboard||FontAwesomeIcons.Book}</span>Morse</>}
        id="morse-dropdown"
        className="app-nav-link"
        active={isActive("/morse")}
       >
        <NavDropdown.Item as={NavLink} to="/morse/learn">
         <span className="me-2">{FontAwesomeIcons.Book}</span>Learn Morse
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/morse/practice">
         <span className="me-2">{FontAwesomeIcons.Keyboard||FontAwesomeIcons.List}</span>Practice
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/morse/library">
         <span className="me-2">{FontAwesomeIcons.Library||FontAwesomeIcons.Book}</span>Library
        </NavDropdown.Item>

        <NavDropdown.Item as={NavLink} to="/morse/review">
         <span className="me-2">{FontAwesomeIcons.Check||FontAwesomeIcons.List}</span>Review
        </NavDropdown.Item>
       </NavDropdown>
      )}

      {(canRead("radio_terms")||
       canRead("antenna_reference")||
       canRead("cw_reference")||
       canRead("technical_reference")||
       canRead("frequency_reference")||
       canRead("phonetic_alphabet_reference")||
       canRead("marine_codes")||
       canRead("nyc_police_codes")||
       canRead("reference_organizations"))&&(
       <NavDropdown
        title={<><span className="me-2">{FontAwesomeIcons.Book}</span>Reference</>}
        id="reference-dropdown"
        className="app-nav-link"
        active={isActive("/references")||isActive("/radio-terms")}
       >
        {canRead("radio_terms")&&(
         <NavDropdown.Item as={NavLink} to="/references/radio-terms">
          <span className="me-2">{FontAwesomeIcons.Book}</span>Radio Terms
         </NavDropdown.Item>
        )}

        {canRead("antenna_reference")&&(
         <NavDropdown.Item as={NavLink} to="/references/antennas">
          <span className="me-2">{FontAwesomeIcons.Broadcast||FontAwesomeIcons.List}</span>Antennas
         </NavDropdown.Item>
        )}

        {canRead("cw_reference")&&(
         <NavDropdown.Item as={NavLink} to="/references/cw">
          <span className="me-2">{FontAwesomeIcons.Keyboard||FontAwesomeIcons.List}</span>CW Reference
         </NavDropdown.Item>
        )}

        {canRead("technical_reference")&&(
         <NavDropdown.Item as={NavLink} to="/references/technical">
          <span className="me-2">{FontAwesomeIcons.Tools||FontAwesomeIcons.List}</span>Technical
         </NavDropdown.Item>
        )}

        {canRead("frequency_reference")&&(
         <NavDropdown.Item as={NavLink} to="/references/frequencies">
          <span className="me-2">{FontAwesomeIcons.Broadcast||FontAwesomeIcons.List}</span>Frequencies
         </NavDropdown.Item>
        )}

        {canRead("phonetic_alphabet_reference")&&(
         <NavDropdown.Item as={NavLink} to="/references/phonetic-alphabet">
          <span className="me-2">{FontAwesomeIcons.Language||FontAwesomeIcons.List}</span>Phonetic Alphabet
         </NavDropdown.Item>
        )}

        {canRead("marine_codes")&&(
         <NavDropdown.Item as={NavLink} to="/references/marine-codes">
          <span className="me-2">{FontAwesomeIcons.Water||FontAwesomeIcons.List}</span>Marine Codes
         </NavDropdown.Item>
        )}

        {canRead("nyc_police_codes")&&(
         <NavDropdown.Item as={NavLink} to="/references/nyc-police-ten-codes">
          <span className="me-2">{FontAwesomeIcons.List}</span>NYC Police Ten-Codes
         </NavDropdown.Item>
        )}

        {canRead("reference_organizations")&&(
         <NavDropdown.Item as={NavLink} to="/references/organizations">
          <span className="me-2">{FontAwesomeIcons.Organization||FontAwesomeIcons.List}</span>Organizations
         </NavDropdown.Item>
        )}
       </NavDropdown>
      )}

      <NavDropdown
       title={<><span className="me-2">{FontAwesomeIcons.About}</span>Info</>}
       id="info-dropdown"
       className="app-nav-link"
       active={isActive("/about")||isActive("/contact")||isActive("/faq")||isActive("/privacy")||isActive("/terms")}
      >
       <NavDropdown.Item as={NavLink} to="/about">
        <span className="me-2">{FontAwesomeIcons.About}</span>About
       </NavDropdown.Item>

       <NavDropdown.Item as={NavLink} to="/contact">
        <span className="me-2">{FontAwesomeIcons.Contact}</span>Contact
       </NavDropdown.Item>

     
      </NavDropdown>
     </Nav>

     <div className="app-nav-account-group">
      <Nav className="app-nav-admin-group">
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

           <NavDropdown.Divider/>
          </>
         )}

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

      <Nav className="app-nav-user-group">
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
     </div>
    </Navbar.Collapse>
   </Container>
  </Navbar>
 );
}

export default Navigation;