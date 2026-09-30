import {Container,Row,Col,Form,Button,Card,InputGroup} from "react-bootstrap";

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

        <Form.Group as={Row} className="mb-3 align-items-center" controlId="contactName">
         <Form.Label column sm={3} className="mb-0">
          Name
         </Form.Label>
         <Col sm={9}>
          <InputGroup>
           <Form.Control type="text" placeholder="Your name"/>
          </InputGroup>
         </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 align-items-center" controlId="contactEmail">
         <Form.Label column sm={3} className="mb-0">
          Email
         </Form.Label>
         <Col sm={9}>
          <InputGroup>
           <Form.Control type="email" placeholder="name@example.com"/>
          </InputGroup>
         </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 align-items-center" controlId="contactSubject">
         <Form.Label column sm={3} className="mb-0">
          Subject
         </Form.Label>
         <Col sm={9}>
          <InputGroup>
           <Form.Control type="text" placeholder="What is this about?"/>
          </InputGroup>
         </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-4" controlId="contactMessage">
         <Form.Label column sm={3} className="mb-0">
          Message
         </Form.Label>
         <Col sm={9}>
          <InputGroup>
           <Form.Control as="textarea" rows={6} placeholder="Write your message here..."/>
          </InputGroup>
         </Col>
        </Form.Group>

        <Row>
         <Col sm={{span:9,offset:3}}>
          <div className="d-grid">
           <Button type="submit" variant="primary" size="lg">
            Send Message
           </Button>
          </div>
         </Col>
        </Row>

       </Form>

      </Card.Body>
     </Card>

    </Col>
   </Row>

  </Container>
 );

}

export default ContactUs;