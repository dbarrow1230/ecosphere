import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { ClipboardCheck, Phone, Send, Mail, MapPin, BadgeCheck } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";
import useRequestForm from "../utils/useRequestForm.js";
import RequestFeedback from "../components/RequestFeedback.jsx";

export default function Contact() {
  const request=useRequestForm("contact");
  usePageMeta("Contact | ITM Fire Protection & Equipment", "Contact ITM Fire Protection & Equipment for general questions and business inquiries.");
  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Contact ITM</p>
              <h1>General Contact</h1>
              <p>Use this page for general questions, company information, business inquiries, or anything that is not specifically a service request or equipment quote.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="danger" href="tel:+17185550123" className="d-inline-flex align-items-center gap-2"><Phone size={18}/>Call (718) 555-0123</Button>
                <Button as={Link} variant="light" to="/service-request">Request Service</Button>
                <Button as={Link} variant="dark" to="/equipment-quote">Request Equipment Pricing</Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0">
              <img src={assets.clipboard} alt="" aria-hidden="true" className="img-fluid"/>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4 p-lg-5">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <ClipboardCheck size={36} strokeWidth={1.75} aria-hidden="true"/>
                    <div>
                      <p className="eyebrow red mb-1">General inquiry</p>
                      <h2 className="mb-0">Send Us a Message</h2>
                    </div>
                  </div>

                  <p>For inspections, testing, maintenance, repairs, or equipment pricing, use the dedicated request pages instead.</p>

                  <Form id="contact-form" onSubmit={request.onSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Company Name</Form.Label>
                          <Form.Control type="text" name="company"/>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Contact Name</Form.Label>
                          <Form.Control type="text" name="name" required/>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control type="tel" name="phone"/>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type="email" name="email" required/>
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Subject</Form.Label>
                          <Form.Control type="text" name="subject" required/>
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Message</Form.Label>
                          <Form.Control as="textarea" name="message" rows={6} placeholder="Enter your message."/>
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Button variant="danger" type="submit" disabled={request.pending} className="d-inline-flex align-items-center gap-2">
                          <Send size={18}/>
                          {request.pending?"Saving...":"Send Message"}
                        </Button>
                      </Col>
                    </Row>

                    <RequestFeedback {...request}/>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Card.Title as="h3">Contact Information</Card.Title>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <Phone size={20} className="flex-shrink-0 mt-1"/>
                    <div><strong>Phone</strong><br/>(718) 555-0123</div>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <Mail size={20} className="flex-shrink-0 mt-1"/>
                    <div><strong>Email</strong><br/>info@example.com</div>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <MapPin size={20} className="flex-shrink-0 mt-1"/>
                    <div><strong>Location</strong><br/>Brooklyn, NY</div>
                  </div>

                  <div className="d-flex align-items-start gap-3 mb-4">
                    <BadgeCheck size={20} className="flex-shrink-0 mt-1"/>
                    <div><strong>License No.</strong><br/>__________</div>
                  </div>

                  <Button as={Link} variant="danger" className="w-100 mb-2" to="/service-request">Service / Inspection Request</Button>
                  <Button as={Link} variant="dark" className="w-100" to="/equipment-quote">Equipment Quote Request</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}