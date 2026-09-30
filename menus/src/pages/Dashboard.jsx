import {Card,Col,Container,Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {BookOpen,LayoutList,ListTree} from "lucide-react";

const dashboardTools=[
 {title:"Menus",text:"Create and manage menu collections, descriptions, and publishing status.",to:"/menus",icon:BookOpen},
 {title:"Menu Items",text:"Manage the individual dishes and items assigned to your menus.",to:"/menu-items",icon:LayoutList},
 {title:"Menu Categories",text:"Organize menu items with reusable menu categories.",to:"/menu-categories",icon:ListTree}
];

function Dashboard(){
 return(
  <section className="py-4">
   <Container fluid="lg">
    <Card className="border-0 shadow-sm mb-4">
     <Card.Body className="p-4">
      <div className="text-uppercase fw-bold small text-success mb-2">Menu Management</div>
      <h1 className="mb-2">Dashboard</h1>
      <p className="mb-0 text-muted">Manage menus, menu items, and the categories used to organize them.</p>
     </Card.Body>
    </Card>

    <Row className="g-3">
     {dashboardTools.map(tool=>{
      const Icon=tool.icon;
      return(
       <Col lg={4} md={6} key={tool.to}>
        <Card as={Link} to={tool.to} className="h-100 text-decoration-none border-0 shadow-sm">
         <Card.Body className="p-4">
          <Icon size={28} className="text-success mb-3"/>
          <h2 className="h4 text-body">{tool.title}</h2>
          <p className="mb-0 text-muted">{tool.text}</p>
         </Card.Body>
        </Card>
       </Col>
      );
     })}
    </Row>
   </Container>
  </section>
 );
}

export default Dashboard;
