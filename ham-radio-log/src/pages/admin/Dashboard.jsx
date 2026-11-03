import {Badge,Card,Col,Container,Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {BookOpen,Building2,KeyRound,Radio,Settings,ShieldCheck,Store,Users} from "lucide-react";

const getRoleName=value=>typeof value==="string"?value.trim().toLowerCase():typeof value==="object"?String(value.name||value.title||value.label||"").trim().toLowerCase():"";

const getAccess=user=>{
 const assignments=[...(user?.roleAssignments||[]),...(user?.userRoleAssignments||[]),...(user?.assignments||[])].filter(item=>item?.isActive!==false);
 const roles=[user?.role,user?.roleId,user?.currentRole,user?.activeRole,...assignments.map(item=>item.role||item.userRole||item.assignedRole)].filter(Boolean);
 const roleNames=roles.map(getRoleName).filter(Boolean);
 const owner=roleNames.some(name=>["owner","business owner","app owner","super admin"].includes(name));
 const admin=owner||roleNames.some(name=>["admin","administrator"].includes(name));
 return {owner,admin};
};

const ownerTools=[
 {title:"Businesses",text:"Station organization, branding, theme, and app identity settings.",to:"/admin/businesses",icon:Building2},
 {title:"Business Types",text:"Organization classifications retained by the shared administration layer.",to:"/admin/business-types",icon:Settings},
 {title:"App Keys",text:"Connect this ham-radio app to its runtime business configuration.",to:"/admin/app-keys",icon:KeyRound},
 {title:"Footers",text:"Maintain footer content used by the shared application shell.",to:"/admin/footers",icon:BookOpen},
 {title:"Vendors",text:"Manage equipment and service vendor records.",to:"/admin/vendors",icon:Store}
];

const adminTools=[
 {title:"QSO Logbook",text:"Review the operational contact log and verify save/load behavior.",to:"/logbook",icon:Radio},
 {title:"Users",text:"Create users and maintain account details.",to:"/admin/users",icon:Users},
 {title:"Permissions",text:"Review role and user permission assignments.",to:"/permissions",icon:ShieldCheck},
 {title:"Roles & Permissions",text:"Configure business roles and module access.",to:"/admin/business-roles-permissions",icon:ShieldCheck}
];

function ToolSection({title,text,tools}){
 return <section className="mb-4"><div className="mb-3"><h2 className="h4 mb-1">{title}</h2><p className="text-muted mb-0">{text}</p></div><Row className="g-3">{tools.map(tool=>{const Icon=tool.icon;return <Col lg={4} md={6} key={tool.to}><Card as={Link} to={tool.to} className="h-100 text-decoration-none border-0 shadow-sm"><Card.Body className="p-3"><div className="d-flex gap-3"><span className="d-inline-flex align-items-center justify-content-center rounded border text-primary" style={{width:42,height:42,flex:"0 0 42px"}}><Icon size={21}/></span><div><h3 className="h5 mb-1 text-body">{tool.title}</h3><p className="mb-0 text-muted">{tool.text}</p></div></div></Card.Body></Card></Col>;})}</Row></section>;
}

export default function AdminDashboard({user}){
 const access=getAccess(user);
 const roleLabel=access.owner?"Owner":access.admin?"Admin":"No admin role";
 return <section className="py-4"><Container fluid="lg"><Card className="border-0 shadow-sm mb-4"><Card.Body className="p-4"><div className="d-flex flex-wrap justify-content-between gap-3 align-items-start"><div><div className="text-uppercase fw-bold small text-primary mb-2">Ham Radio Logger Administration</div><h1 className="mb-2">Admin Dashboard</h1><p className="mb-0 text-muted">Manage QSO access, users, roles, and shared application settings available to your account.</p></div><Badge bg={access.owner?"success":access.admin?"primary":"warning"} className="fs-6 px-3 py-2">{roleLabel}</Badge></div></Card.Body></Card>{!access.admin?<Card className="border-0 shadow-sm"><Card.Body className="p-4"><h2 className="h4">No Admin Access</h2><p className="mb-0 text-muted">Your account does not currently have an admin role assigned.</p></Card.Body></Card>:<>{access.owner&&<ToolSection title="Owner Settings" text="Shared application and organization settings reserved for owners." tools={ownerTools}/>}<ToolSection title="Ham Radio Administration" text="Operational logbook, account, and access-control tools." tools={adminTools}/></>}</Container></section>;
}
