import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Table, Alert } from "react-bootstrap";
import { Box, ShieldCheck, ArrowLeft } from "lucide-react";
import { assets } from "../utils/assets";
import usePageMeta from "../utils/usePageMeta";

export default function FireCabinets() {
  usePageMeta("Fire Cabinets | ITM Fire Protection & Equipment", "Cabinets for portable extinguishers, hose equipment and valves in surface, semi-recessed and recessed configurations.");
  return (
    <main>
      <section className="inner-hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <p className="eyebrow">Equipment</p>
              <h1>Fire Cabinets</h1>
              <p>Cabinets for portable extinguishers, hose equipment and valves in surface, semi-recessed and recessed configurations.</p>
              <div className="d-flex flex-wrap gap-3">
                <Button as={Link} variant="danger" to="/equipment-quote">Request Equipment Quote</Button>
                <Button as={Link} variant="light" to="/equipment-quote">Request a Quote</Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0">
              <img src={assets.cabinet} alt="" aria-hidden="true" className="img-fluid"/>
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
                    <img src={assets.cabinet} alt="Fire Cabinets" className="img-fluid"/>
                  </div>

                  <p className="eyebrow red">Product category</p>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <Box size={36} strokeWidth={1.75} aria-hidden="true"/>
                    <h2 className="mb-0">Fire Cabinets</h2>
                  </div>

                  <p>Cabinets for portable extinguishers, hose equipment and valves in surface, semi-recessed and recessed configurations.</p>

                  <Table responsive bordered className="mt-4">
                    <tbody>
                      <tr>
                        <th>Cabinet types</th>
                        <td>Extinguisher, hose and valve cabinets</td>
                      </tr>
                      <tr>
                        <th>Mounting styles</th>
                        <td>Surface, semi-recessed and recessed</td>
                      </tr>
                      <tr>
                        <th>Applications</th>
                        <td>Commercial corridors, lobbies, service areas and standpipe locations</td>
                      </tr>
                      <tr>
                        <th>Ordering</th>
                        <td>Sizing and model selection based on equipment and wall conditions</td>
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