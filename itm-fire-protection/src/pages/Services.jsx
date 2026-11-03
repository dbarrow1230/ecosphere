import ClientServiceLookup from "../components/ClientServiceLookup.jsx";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FireExtinguisher, Building2, CookingPot, Fuel, ClipboardCheck, ArrowRight } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function Services() {
  usePageMeta("Fire Protection Services | ITM Fire Protection & Equipment", "Fire protection inspection, testing and maintenance services.");

  const services=[
    {title:"Portable Fire Extinguishers",description:"Inspection, maintenance, recharge, testing, replacement, installation and extinguisher programs for commercial properties.",image:assets.extinguisher,icon:FireExtinguisher,to:"/portable-fire-extinguishers"},
    {title:"Standpipe Systems",description:"Inspection, testing, maintenance and component service for commercial standpipe and hose equipment.",image:assets.standpipe,icon:Building2,to:"/standpipe-systems"},
    {title:"Kitchen Hood Systems",description:"Commercial kitchen fire-suppression inspection, testing, maintenance and service.",image:assets.hood,icon:CookingPot,to:"/kitchen-hood-systems"},
    {title:"Gas Station Fire Protection",description:"Fire-protection service and equipment support for fuel stations, convenience stores and dispensing areas.",image:assets.gasPump,icon:Fuel,to:"/gas-station-fire-protection"},
    {title:"Inspections & Maintenance",description:"Recurring inspection, testing and maintenance services designed around commercial fire-protection equipment.",image:assets.clipboard,icon:ClipboardCheck,to:"/inspections-maintenance"}
  ];

  return (
    <main>
      <ClientServiceLookup systemType="All services"/>

      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">ITM service division</p>
              <h1>Fire Protection Services</h1>
              <p>Inspection, testing, maintenance, repair support and equipment service for commercial fire-protection needs.</p>
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
          <div className="mb-4">
            <p className="eyebrow red">Service categories</p>
            <h2>Choose the service you need</h2>
            <p>Each category below has its own service page with the work ITM can provide.</p>
          </div>

          <Row className="g-4">
            {services.map(({title,description,image,icon:Icon,to})=>(
              <Col key={title} md={6} lg={4}>
                <Card as={Link} to={to} className="h-100 border-0 shadow-sm text-decoration-none">
                  <Card.Img variant="top" src={image} alt="" className="img-fluid"/>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Icon size={32} strokeWidth={1.75} aria-hidden="true"/>
                      <Card.Title as="h2" className="h5 mb-0">{title}</Card.Title>
                    </div>
                    <Card.Text>{description}</Card.Text>
                    <span className="d-inline-flex align-items-center gap-2">View service <ArrowRight size={17}/></span>
                  </Card.Body>
                </Card>
              </Col>
            ))}
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