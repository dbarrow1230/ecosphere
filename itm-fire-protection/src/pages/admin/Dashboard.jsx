import {Badge,Card,Col,Container,Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {BookOpen,BriefcaseBusiness,CalendarDays,ClipboardList,KeyRound,Settings,ShieldCheck,Tags,Users} from "lucide-react";

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

const getRoleName=value=>{
 if(!value)return "";
 if(typeof value==="string")return "";
 return String(value.name||value.title||value.label||"").trim().toLowerCase();
};

const getAssignmentRoles=user=>{
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

const getAccess=user=>{
 const userId=getObjectId(user);
 const directRoles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole].filter(Boolean);
 const assignmentRoles=getAssignmentRoles(user);
 const roleIds=[...directRoles,...assignmentRoles].map(getObjectId).filter(Boolean);
 const roleNames=[...directRoles,...assignmentRoles].map(getRoleName).filter(Boolean);
 const hasRoleId=ids=>roleIds.some(id=>ids.includes(id));
 const hasRoleName=names=>roleNames.some(name=>names.includes(name));

 const owner=ADMIN_USER_IDS.includes(userId)||hasRoleId(OWNER_ROLE_IDS)||hasRoleName(["owner","business owner","app owner","super admin"]);
 const admin=owner||hasRoleId(ADMIN_ROLE_IDS)||hasRoleName(["admin","administrator"]);
 const manager=admin||hasRoleId(MANAGER_ROLE_IDS)||hasRoleName(["manager"]);

 return {owner,admin,manager,roleNames};
};

const ownerTools=[
 {title:"Businesses",text:"Business profile, branding, theme colors, receipt settings, and app identity.",to:"/admin/businesses",icon:BriefcaseBusiness},
 {title:"Business Types",text:"Business classification values used by business profiles.",to:"/admin/business-types",icon:Settings},
 {title:"App Keys",text:"Connect this app to the correct business theme and runtime settings.",to:"/admin/app-keys",icon:KeyRound},
 {title:"Footers",text:"Footer content assigned to the business and used across the app.",to:"/admin/footers",icon:BookOpen},
 {title:"Taglines",text:"Reusable tagline text for headers, receipts, and business display.",to:"/admin/taglines",icon:Tags},
 {title:"Seasons",text:"Season records used by date-aware business reference content.",to:"/admin/seasons",icon:CalendarDays},
 {title:"Holidays",text:"Holiday records for date-aware scheduling and business content.",to:"/admin/holidays",icon:CalendarDays},
 {title:"Occasions",text:"Occasion records tied into reusable seasonal content.",to:"/admin/occasions",icon:CalendarDays},
 {title:"Tax Rates",text:"Reusable tax-rate values for business records.",to:"/admin/tax-rates",icon:ClipboardList},
 {title:"Roles & Permissions",text:"Define roles and what admin sections each role can manage.",to:"/admin/business-roles-permissions",icon:ShieldCheck}
];

const adminTools=[
 {title:"Clients",text:"Client contacts, property details, equipment, and service history.",to:"/admin/clients",icon:Users},
 {title:"Equipment & Inventory",text:"Extinguishers, serial numbers, client assignments, parts, and due dates.",to:"/admin/inventory",icon:ClipboardList},
 {title:"Service & Inspection Tracking",text:"Schedule visits, record findings, complete service, and review history.",to:"/service-tracking",icon:CalendarDays},
 {title:"Customer Requests",text:"Review saved service requests, equipment quotes, and contact inquiries.",to:"/admin/requests",icon:ClipboardList},
 {title:"Users",text:"Create users, assign departments and optional role overrides, and manage profile details.",to:"/admin/users",icon:Users},
 {title:"Roles & Permissions",text:"Manage business roles, departments, permission modules, and overrides.",to:"/admin/business-roles-permissions",icon:ShieldCheck}
];

function AdminDashboard({user}){
 const access=getAccess(user);
 const visibleOwnerTools=access.owner?ownerTools:[];
 const visibleAdminTools=access.admin||access.manager?adminTools:[];
 const roleLabel=access.owner?"Owner":access.admin?"Admin":access.manager?"Manager":"No admin role";

 return(
  <section className="py-4">
   <Container fluid="lg">
    <Card className="border-0 shadow-sm mb-4">
     <Card.Body className="p-4">
      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
       <div>
        <div className="text-uppercase fw-bold small text-success mb-2">App Admin</div>
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="mb-0 text-muted">
         Manage the app setup, users, reference records, and business-level settings available to your role.
        </p>
       </div>

       <Badge bg={access.owner?"success":access.admin?"primary":access.manager?"secondary":"warning"} className="fs-6 px-3 py-2">
        {roleLabel}
       </Badge>
      </div>
     </Card.Body>
    </Card>

    {!access.admin&&!access.manager&&(
     <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
       <h2 className="h4">No Admin Access</h2>
       <p className="mb-0 text-muted">Your account does not currently have an admin role assigned.</p>
      </Card.Body>
     </Card>
    )}

    {visibleOwnerTools.length>0&&(
     <AdminToolSection
      title="Owner Settings"
      text="Business and app-wide settings. These stay owner-only so admins do not see business, footer, app key, or branding controls."
      tools={visibleOwnerTools}
     />
    )}

    {visibleAdminTools.length>0&&(
     <AdminToolSection
      title="User Administration"
      text="Operational tools for admins and managers working inside the base application."
      tools={visibleAdminTools}
     />
    )}
   </Container>
  </section>
 );
}

function AdminToolSection({title,text,tools}){
 return(
  <section className="mb-4">
   <div className="mb-3">
    <h2 className="h4 mb-1">{title}</h2>
    <p className="text-muted mb-0">{text}</p>
   </div>

   <Row className="g-3">
    {tools.map(tool=>{
     const Icon=tool.icon;

     return(
      <Col lg={4} md={6} key={tool.to}>
       <Card as={Link} to={tool.to} className="h-100 text-decoration-none border-0 shadow-sm">
        <Card.Body className="p-3">
         <div className="d-flex gap-3">
          <span className="d-inline-flex align-items-center justify-content-center rounded border text-success" style={{width:"42px",height:"42px",flex:"0 0 42px"}}>
           <Icon size={21}/>
          </span>

          <div>
           <h3 className="h5 mb-1 text-body">{tool.title}</h3>
           <p className="mb-0 text-muted">{tool.text}</p>
          </div>
         </div>
        </Card.Body>
       </Card>
      </Col>
     );
    })}
   </Row>
  </section>
 );
}

export default AdminDashboard;
