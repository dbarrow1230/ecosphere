import {Alert,Card,Container} from "react-bootstrap";

function AdminPlaceholderPage({title,description}){
 return(
  <section className="py-4">
   <Container fluid="lg">
    <Card className="border-0 shadow-sm">
     <Card.Body className="p-4">
      <p className="text-uppercase fw-bold small text-success mb-2">Admin</p>
      <h1 className="h3 mb-3">{title}</h1>
      <Alert variant="info" className="mb-0">
       {description||"This admin workflow is available from navigation and has a safe landing page while its full data flow is being connected."}
      </Alert>
     </Card.Body>
    </Card>
   </Container>
  </section>
 );
}

export default AdminPlaceholderPage;
