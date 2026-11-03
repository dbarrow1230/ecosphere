import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FireExtinguisher, Flame, BellRing, Box, Tags, ArrowRight } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function Shop() {
  usePageMeta("Shop Fire Equipment | ITM Fire Protection & Equipment", "Fire extinguishers, detectors, cabinets, signs and accessories.");

  const products=[
    {title:"ABC Fire Extinguishers",description:"Multipurpose dry-chemical extinguishers commonly used for Class A, B and C fire hazards.",image:assets.extinguisher,icon:FireExtinguisher,to:"/abc-fire-extinguishers"},
    {title:"Purple-K Extinguishers",description:"High-performance dry-chemical extinguishers intended for Class B and C hazards, especially flammable-liquid risks.",image:assets.purpleK,icon:Flame,to:"/purple-k-extinguishers"},
    {title:"CO₂ Fire Extinguishers",description:"Carbon-dioxide extinguishers for Class B and C hazards where a clean, residue-free agent is useful.",image:assets.co2,icon:FireExtinguisher,to:"/co2-fire-extinguishers"},
    {title:"Smoke & CO Detectors",description:"Smoke, carbon-monoxide and combination detection products for compatible residential and commercial applications.",image:assets.smokeDetector,icon:BellRing,to:"/smoke-detectors"},
    {title:"Fire Cabinets",description:"Cabinets for portable extinguishers, hose equipment and valves in surface, semi-recessed and recessed configurations.",image:assets.cabinet,icon:Box,to:"/fire-cabinets"},
    {title:"Signs & Accessories",description:"Mounting hardware, signs, tags, tamper seals and other accessories used with fire-protection equipment.",image:assets.exitSign,icon:Tags,to:"/signs-accessories"}
  ];

  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Fire protection equipment</p>
              <h1>Shop Fire Equipment</h1>
              <p>Browse extinguisher types, detectors, cabinets, signs and accessories. Contact ITM for current models, quantities and quotes.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/equipment-quote">Request Equipment Quote</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request a Quote</Button>
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
          <div className="mb-4">
            <p className="eyebrow red">Equipment categories</p>
            <h2>Commercial fire-protection equipment</h2>
            <p>Select a category for product information and quote requests.</p>
          </div>

          <Row className="g-4">
            {products.map(({title,description,image,icon:Icon,to})=>(
              <Col key={title} md={6} lg={4}>
                <Card as={Link} to={to} className="h-100 border-0 shadow-sm text-decoration-none">
                  <Card.Img variant="top" src={image} alt={title} className="img-fluid"/>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Icon size={32} strokeWidth={1.75} aria-hidden="true"/>
                      <Card.Title as="h2" className="h5 mb-0">{title}</Card.Title>
                    </div>
                    <Card.Text>{description}</Card.Text>
                    <span className="d-inline-flex align-items-center gap-2">View equipment <ArrowRight size={17}/></span>
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