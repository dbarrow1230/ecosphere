import React from "react";
import {NavLink,Outlet} from "react-router-dom";
import {Container,Row,Col,Button,Alert} from "react-bootstrap";
import {LayoutDashboard,Users,Calculator,FileText,BookOpen,FolderLock,UserCog,ChartNoAxesCombined} from "lucide-react";

const nav=[{to:"/business",name:"Dashboard",icon:LayoutDashboard,end:true},{to:"/business/clients",name:"Clients",icon:Users},{to:"/business/accounting",name:"Accounting",icon:Calculator},{to:"/business/tax-services",name:"Tax Services",icon:FileText},{to:"/business/bookkeeping",name:"Bookkeeping",icon:BookOpen},{to:"/business/documents",name:"Documents",icon:FolderLock},{to:"/business/employees",name:"Employees",icon:UserCog},{to:"/business/reports",name:"Reports",icon:ChartNoAxesCombined}];
export default function BusinessLayout(){
 return <Container fluid><Row><Col md={3} lg={2} className="sidebar p-3"><div className="text-white fw-bold mb-4">BATS · Workspace</div>{nav.map(({to,name,icon:Icon,end})=><NavLink key={to} to={to} end={end}><Icon size={16} className="me-2"/>{name}</NavLink>)}<Button href="/" variant="outline-light" size="sm" className="mt-4">Public website</Button></Col><Col md={9} lg={10} className="p-4"><Alert variant="warning">Protected business data is accessible only after connecting an authorized EcoSphere login. This starter does not include a login or store credentials in the browser.</Alert><Outlet/></Col></Row></Container>;
}
