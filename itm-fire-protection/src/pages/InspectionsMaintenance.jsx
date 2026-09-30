import ClientServiceLookup from "../components/ClientServiceLookup.jsx";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, ListGroup } from "react-bootstrap";
import { ClipboardCheck, CheckCircle2, Wrench, ArrowLeft } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function InspectionsMaintenance() {
  usePageMeta("Inspections & Maintenance | ITM Fire Protection & Equipment", "Recurring inspection, testing and maintenance services designed around commercial fire-protection equipment.");

  const services=[
    "Portable fire extinguisher inspections",
    "Standpipe and hose equipment inspections",
    "Kitchen hood suppression inspections",
    "Fire hose inspections",
    "Routine equipment maintenance",
    "Recharge and testing services",
    "Repair and replacement recommendations",
    "Service and inspection documentation"
  ];

  return (
    <main>
      <ClientServiceLookup systemType="Inspections & Maintenance"/>

      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Inspection • Testing • Maintenance</p>
              <h1>Inspections & Maintenance</h1>
              <p>Recurring inspection, testing and maintenance services designed around commercial fire-protection equipment.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/service-request">Request Service</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request a Quote</Button>
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
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4 p-lg-5">
                  <p className="eyebrow red">Service overview</p>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <ClipboardCheck size={36} strokeWidth={1.75} aria-hidden="true"/>
                    <h2 className="mb-0">Inspections & Maintenance service</h2>
                  </div>
                  <p>Recurring inspection, testing and maintenance services designed around commercial fire-protection equipment.</p>

                  <ListGroup variant="flush">
                    {services.map(service=>(
                      <ListGroup.Item key={service} className="d-flex align-items-start gap-2 px-0">
                        <CheckCircle2 size={20} className="flex-shrink-0 mt-1" aria-hidden="true"/>
                        <span>{service}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Wrench size={36} strokeWidth={1.75} className="mb-3" aria-hidden="true"/>
                  <Card.Title as="h3">Need this service?</Card.Title>
                  <Card.Text>Tell ITM what equipment or system you have, your property type, and what service is needed.</Card.Text>
                  <Button as={Link} variant="danger" className="w-100 mb-3" to="/service-request">Request Service</Button>
                  <Link className="d-inline-flex align-items-center gap-2 text-decoration-none" to="/services"><ArrowLeft size={17}/>All services</Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="cta-band">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={5}>
              <h2>Need service or equipment?</h2>
              <p className="mb-0">Request an inspection, service visit, quote, or product information.</p>
            </Col>
            <Col lg={4}>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/service-request">Request Service</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Get a Quote</Button>
              </div>
            </Col>
            <Col lg={3}>
              <strong className="d-block">BROOKLYN, NY</strong>
              <span>Commercial fire protection & equipment</span>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}