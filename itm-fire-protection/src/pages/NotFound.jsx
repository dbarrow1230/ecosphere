import { Link } from "react-router-dom";
import { Container, Button, Card } from "react-bootstrap";
import { CircleX, House } from "lucide-react";
import usePageMeta from "../utils/usePageMeta";

export default function NotFound() {
  usePageMeta("Page Not Found | ITM Fire Protection & Equipment", "The requested page could not be found.");
  return (
    <main>
      <section className="py-5">
        <Container>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="p-4 p-lg-5">
              <CircleX size={48} strokeWidth={1.75} className="mb-3" aria-hidden="true"/>
              <p className="eyebrow red">404</p>
              <h2>Page Not Found</h2>
              <p>The page you requested could not be found.</p>
              <Button as={Link} variant="danger" to="/" className="d-inline-flex align-items-center gap-2"><House size={18}/>Return Home</Button>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </main>
  );
}