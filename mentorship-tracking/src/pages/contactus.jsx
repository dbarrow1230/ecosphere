import {Row,Col,Form,Button} from "react-bootstrap";

function ContactUs(){

 return(
  <>
   <header className="pt-5 px-3 px-lg-4 mb-4">
     <h1 className="mb-3">Contact Us</h1>
     <p className="text-muted">
      Have a question, suggestion, or issue? Send us a message and we'll get back to you.
     </p>
   </header>

       <Form className="px-3 px-lg-4 pb-5">

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

  </>
 );

}

export default ContactUs;
