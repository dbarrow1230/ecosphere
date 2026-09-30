import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Table, Alert } from "react-bootstrap";
import { BellRing, ShieldCheck, ArrowLeft } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function SmokeDetectors() {
  usePageMeta("Smoke & CO Detectors | ITM Fire Protection & Equipment", "Smoke, carbon-monoxide and combination detection products for compatible residential and commercial applications.");
  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Equipment</p>
              <h1>Smoke & CO Detectors</h1>
              <p>Smoke, carbon-monoxide and combination detection products for compatible residential and commercial applications.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/equipment-quote">Request Equipment Quote</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request a Quote</Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0">
              <img src={assets.smokeDetector} alt="" aria-hidden="true" className="img-fluid"/>
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
                  <div className="text-center mb-4">
                    <img src={assets.smokeDetector} alt="Smoke & CO Detectors" className="img-fluid"/>
                  </div>

                  <p className="eyebrow red">Product category</p>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <BellRing size={36} strokeWidth={1.75} aria-hidden="true"/>
                    <h2 className="mb-0">Smoke & CO Detectors</h2>
                  </div>

                  <p>Smoke, carbon-monoxide and combination detection products for compatible residential and commercial applications.</p>

                  <Table responsive bordered className="mt-4">
                    <tbody>
                      <tr>
                        <th>Product types</th>
                        <td>Smoke detectors, CO detectors, combination smoke/CO units and heat detectors</td>
                      </tr>
                      <tr>
                        <th>Use cases</th>
                        <td>Apartments, offices, commercial spaces and other compatible occupancies</td>
                      </tr>
                      <tr>
                        <th>Accessories</th>
                        <td>Replacement bases, batteries or related accessories where applicable</td>
                      </tr>
                      <tr>
                        <th>Ordering</th>
                        <td>Contact ITM for product availability and quantity quotes</td>
                      </tr>
                    </tbody>
                  </Table>

                  <Alert variant="warning" className="mb-0">
                    <strong>Product selection:</strong> Exact manufacturer, model, listing, rating, size and compatibility should be confirmed before ordering or installation.
                  </Alert>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <ShieldCheck size={36} strokeWidth={1.75} className="mb-3" aria-hidden="true"/>
                  <Card.Title as="h3">Request pricing</Card.Title>
                  <Card.Text>Send the quantity, size or model you need. ITM can use the request to prepare an equipment quote.</Card.Text>
                  <Button as={Link} variant="danger" className="w-100 mb-3" to="/equipment-quote">Request Quote</Button>
                  <Link className="d-inline-flex align-items-center gap-2 text-decoration-none" to="/shop"><ArrowLeft size={17}/>All equipment</Link>
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