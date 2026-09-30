import {Container,Row,Col,Form,Button,Card} from "react-bootstrap";

function ContactUs(){

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Contact Us</h1>
     <p className="text-muted">
      Have a question, suggestion, or issue? Send us a message and we'll get back to you.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={8}>

     <Card className="shadow-sm">
      <Card.Body>

       <Form>

        <Row className="mb-3">
         <Col md={6}>
          <Form.Group controlId="contactName">
           <Form.Label>Name</Form.Label>
           <Form.Control type="text" placeholder="Your name"/>
          </Form.Group>
         </Col>

         <Col md={6}>
          <Form.Group controlId="contactEmail">
           <Form.Label>Email</Form.Label>
           <Form.Control type="email" placeholder="name@example.com"/>
          </Form.Group>
         </Col>
        </Row>

        <Form.Group className="mb-3" controlId="contactSubject">
         <Form.Label>Subject</Form.Label>
         <Form.Control type="text" placeholder="What is this about?"/>
        </Form.Group>

        <Form.Group className="mb-4" controlId="contactMessage">
         <Form.Label>Message</Form.Label>
         <Form.Control as="textarea" rows={6} placeholder="Write your message here..."/>
        </Form.Group>

        <div className="d-grid">
         <Button type="submit" variant="primary" size="lg">
          Send Message
         </Button>
        </div>

       </Form>

      </Card.Body>
     </Card>

    </Col>
   </Row>

  </Container>
 );

}

export default ContactUs;