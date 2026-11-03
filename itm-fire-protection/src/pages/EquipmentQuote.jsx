import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { FireExtinguisher, Phone, Send } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";
import useRequestForm from "../utils/useRequestForm.js";
import RequestFeedback from "../components/RequestFeedback.jsx";

export default function EquipmentQuote() {
  const request=useRequestForm("quote");
  usePageMeta("Equipment Quote | ITM Fire Protection & Equipment", "Request pricing and information for fire-protection equipment.");
  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Equipment Quote</p>
              <h1>Request Equipment Pricing</h1>
              <p>Request pricing and product information for fire extinguishers, detectors, cabinets, signs, accessories, and other fire-protection equipment.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="danger" href="tel:+17185550123" className="d-inline-flex align-items-center gap-2"><Phone size={18}/>Call (718) 555-0123</Button>
                <Button as={Link} variant="light" to="/service-request">Request Service</Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0">
              <img src={assets.extinguisher} alt="" aria-hidden="true" className="img-fluid"/>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-lg-5">
              <div className="d-flex align-items-center gap-3 mb-3">
                <FireExtinguisher size={36} strokeWidth={1.75} aria-hidden="true"/>
                <div>
                  <p className="eyebrow red mb-1">Equipment quote</p>
                  <h2 className="mb-0">Request equipment pricing</h2>
                </div>
              </div>

              <Form id="quote-form" onSubmit={request.onSubmit}>
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

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Equipment</Form.Label>
                      <Form.Select name="equipment">
                        <option>ABC Fire Extinguishers</option>
                        <option>Purple-K Extinguishers</option>
                        <option>CO2 Fire Extinguishers</option>
                        <option>Smoke / CO Detectors</option>
                        <option>Fire Cabinets</option>
                        <option>Signs & Accessories</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control type="number" min="1" name="quantity"/>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Product Details</Form.Label>
                      <Form.Control as="textarea" name="details" rows={5} placeholder="Include size, model, manufacturer, rating or other requirements if known."/>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Button variant="danger" type="submit" disabled={request.pending} className="d-inline-flex align-items-center gap-2">
                      <Send size={18}/>
                      {request.pending?"Saving...":"Submit Quote Request"}
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