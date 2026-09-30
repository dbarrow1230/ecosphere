// src/pages/ContactUs.jsx
import {Container,Row,Col,Form,Button,Card,InputGroup} from "react-bootstrap";
import bannerImage from "../images/hero_image 1.png";
import "../styles/About.css";

function ContactUs(){

 return(
  <main>
   <div className="about-banner"><img src={bannerImage} alt="Contact banner"/><div className="about-banner-overlay"><h1>Contact Us</h1></div></div>
   <Container className="py-5">
    <Row className="justify-content-center mb-4">
     <Col lg={8} className="text-center">
      <p className="text-muted">Have a question, suggestion, or issue? Send us a message and we'll get back to you.</p>
     </Col>
    </Row>
    <Row className="justify-content-center">
     <Col lg={8}>
      <Card className="shadow-sm">
       <Card.Body>
        <Form>
         <Row className="mb-3">
          <Col md={6}><InputGroup><InputGroup.Text>First Name</InputGroup.Text><Form.Control type="text" placeholder="First name" id="contactFirstName"/></InputGroup></Col>
          <Col md={6}><InputGroup><InputGroup.Text>Last Name</InputGroup.Text><Form.Control type="text" placeholder="Last name" id="contactLastName"/></InputGroup></Col>
         </Row>
         <Row className="mb-3">
          <Col md={12}><InputGroup><InputGroup.Text>Email</InputGroup.Text><Form.Control type="email" placeholder="name@example.com" id="contactEmail"/></InputGroup></Col>
         </Row>
         <Row className="mb-3">
          <Col md={12}><InputGroup><InputGroup.Text>Subject</InputGroup.Text><Form.Control type="text" placeholder="What is this about?" id="contactSubject"/></InputGroup></Col>
         </Row>
         <Row className="mb-4">
          <Col md={12}><InputGroup><InputGroup.Text>Message</InputGroup.Text><Form.Control as="textarea" rows={6} placeholder="Write your message here..." id="contactMessage"/></InputGroup></Col>
         </Row>
         <div className="d-grid"><Button type="submit" variant="primary" size="lg">Send Message</Button></div>
        </Form>
       </Card.Body>
      </Card>
     </Col>
    </Row>
   </Container>
  </main>
 );

}

export default ContactUs;