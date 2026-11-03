import {Button,Card,Col,Container,Row} from "react-bootstrap";
import {Link} from "react-router-dom";

function Shop(){
 return(
  <section className="py-4">
   <Container fluid="lg">
    <Row className="g-4 align-items-stretch">
     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>
        <p className="text-muted mb-2">Shop</p>
        <h1 className="mb-3">Shop Products</h1>
        <p className="text-muted mb-4">
         Product browsing is wired through the Products page while checkout and cart workflows are still being connected.
        </p>
        <Button as={Link} to="/products">View Products</Button>
       </Card.Body>
      </Card>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <h2 className="h4 mb-3">Availability</h2>
        <p className="text-muted mb-0">
         Use this page as a safe test target for the Shop navigation link until the full storefront flow is ready.
        </p>
       </Card.Body>
      </Card>
     </Col>
    </Row>
   </Container>
  </section>
 );
}

export default Shop;
