import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Utensils, Fuel, Building2, BriefcaseBusiness, Warehouse, Store, Hotel, GraduationCap, Hospital, HardHat, Factory } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function Industries() {
  usePageMeta("Industries We Serve | ITM Fire Protection & Equipment", "Industries served by ITM Fire Protection & Equipment.");

  const industries=[
    {title:"Restaurants & Commercial Kitchens",icon:Utensils},
    {title:"Gas Stations & Convenience Stores",icon:Fuel},
    {title:"Apartment Buildings",icon:Building2},
    {title:"Office Buildings",icon:BriefcaseBusiness},
    {title:"Warehouses",icon:Warehouse},
    {title:"Retail Stores",icon:Store},
    {title:"Hotels",icon:Hotel},
    {title:"Schools",icon:GraduationCap},
    {title:"Healthcare Facilities",icon:Hospital},
    {title:"Construction Sites",icon:HardHat},
    {title:"Industrial Facilities",icon:Factory}
  ];

  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Commercial customers</p>
              <h1>Industries We Serve</h1>
              <p>Fire-protection service and equipment support for businesses and properties throughout Brooklyn and NYC.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/service-request">Request Service</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request a Quote</Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0">
              <img src={assets.standpipe} alt="" aria-hidden="true" className="img-fluid" />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <div className="mb-4">
            <p className="eyebrow red">Property types</p>
            <h2>Commercial and multi-unit properties</h2>
          </div>

          <Row className="g-4">
            {industries.map(({title,icon:Icon})=>(
              <Col key={title} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-4">
                    <Icon size={40} strokeWidth={1.75} className="mb-3" aria-hidden="true" />
                    <Card.Title as="h3" className="h5">{title}</Card.Title>
                    <Card.Text>Inspection, service and equipment support based on the facility’s fire-protection needs.</Card.Text>
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