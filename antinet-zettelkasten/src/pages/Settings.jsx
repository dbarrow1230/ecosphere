import {Card,Container} from "react-bootstrap";

function Settings(){
 return(
  <Container className="py-4">
   <Card className="border-0 shadow-sm">
    <Card.Body className="p-4">
     <p className="text-uppercase fw-bold small text-success mb-2">Settings</p>
     <h1 className="h3 mb-3">Settings</h1>
     <p className="text-muted mb-0">
      This route is wired for the Settings navigation item. Add settings controls here as the workflow is built out.
     </p>
    </Card.Body>
   </Card>
  </Container>
 );
}

export default Settings;
