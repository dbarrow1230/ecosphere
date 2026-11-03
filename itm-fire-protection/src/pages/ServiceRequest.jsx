import ClientServiceLookup from "../components/ClientServiceLookup.jsx";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { ClipboardCheck, Phone, Send } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";
import useRequestForm from "../utils/useRequestForm.js";
import RequestFeedback from "../components/RequestFeedback.jsx";

export default function ServiceRequest() {
  const request=useRequestForm("service");
  usePageMeta("Request Service | ITM Fire Protection & Equipment", "Request fire-protection inspection, testing, maintenance, or service.");
  return (
    <main>
      <ClientServiceLookup systemType="Service Request"/>

      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Service Request</p>
              <h1>Schedule Service or Inspection</h1>
              <p>Request inspection, testing, maintenance, repair, recharge, or other fire-protection service for your property.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="danger" href="tel:+17185550123" className="d-inline-flex align-items-center gap-2"><Phone size={18}/>Call (718) 555-0123</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request Equipment Pricing</Button>
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
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-lg-5">
              <div className="d-flex align-items-center gap-3 mb-3">
                <ClipboardCheck size={36} strokeWidth={1.75} aria-hidden="true"/>
                <div>
                  <p className="eyebrow red mb-1">Service request</p>
                  <h2 className="mb-0">Schedule service or inspection</h2>
                </div>
              </div>

              <Form id="service-form" onSubmit={request.onSubmit}>
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
                      <Form.Control type="tel" name="phone" required/>
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
                      <Form.Label>Service Address</Form.Label>
                      <Form.Control type="text" name="address"/>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Property Type</Form.Label>
                      <Form.Select name="property">
                        <option>Restaurant / Commercial Kitchen</option>
                        <option>Gas Station</option>
                        <option>Apartment Building</option>
                        <option>Office</option>
                        <option>Warehouse</option>
                        <option>Retail</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Service Needed</Form.Label>
                      <Form.Select name="service">
                        <option>Portable Fire Extinguishers</option>
                        <option>Standpipe Systems</option>
                        <option>Kitchen Hood Systems</option>
                        <option>Gas Station Fire Protection</option>
                        <option>Inspection & Maintenance</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Details</Form.Label>
                      <Form.Control as="textarea" name="details" rows={5} placeholder="Tell us what equipment you have and what service is needed."/>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Button variant="danger" type="submit" disabled={request.pending} className="d-inline-flex align-items-center gap-2">
                      <Send size={18}/>
                      {request.pending?"Saving...":"Submit Service Request"}
                    </Button>
                  </Col>
                </Row>

                <RequestFeedback {...request}/>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </main>
  );
}