// /src/pages/seeds/components/SeedUsesBenefits.jsx
import { Card, ListGroup } from "react-bootstrap";
import { Apple, HeartPulse, Salad, Skull, Sparkles } from "lucide-react";

export default function SeedUsesBenefits({ data, nutritionalInformation }) {
  if (!data) return null;

  const iconSize = 18;

  const getText = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (Array.isArray(value)) {
      return value.map((item) => getText(item)).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
      if (typeof value.name === "string") return value.name;
      if (typeof value.title === "string") return value.title;
      if (typeof value.label === "string") return value.label;
      if (typeof value.description === "string") return value.description;
      if (typeof value.pros === "string") return value.pros;
      if (typeof value.cons === "string") return value.cons;
      if (typeof value._id === "string") return value._id;
      if (typeof value.id === "string") return value.id;
      if (typeof value._id?.$oid === "string") return value._id.$oid;
      if (typeof value.id?.$oid === "string") return value.id.$oid;
    }

    return "";
  };

  const getDisplay = (value) => {
    const text = getText(value);
    return text || "Not listed";
  };

  const getArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value];
    return [];
  };

  const medicinalUses = data.medicinalUses || {};
  const nutrition = getArray(nutritionalInformation);

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold"> Uses and Benefits </Card.Header>

      <Card.Body>
        <p>
          <Salad size={iconSize} className="me-2" />
          <strong>Edibility:</strong> {getDisplay(data.edibility)}
        </p>

        <p>
          <HeartPulse size={iconSize} className="me-2" />
          <strong>Medicinal:</strong> {data.medicinal ? "Yes" : "No"}
        </p>

        <p>
          <HeartPulse size={iconSize} className="me-2" />
          <strong>Medicinal Pros:</strong>{" "}
          {getDisplay(medicinalUses.pros)}
        </p>

        <p>
          <HeartPulse size={iconSize} className="me-2" />
          <strong>Medicinal Cons:</strong>{" "}
          {getDisplay(medicinalUses.cons)}
        </p>

        <p>
          <Skull size={iconSize} className="me-2" />
          <strong>Toxicity:</strong> {getDisplay(data.toxicity)}
        </p>

        <h5 className="mt-3">
          <Apple size={iconSize} className="me-2" />
          Nutrition
        </h5>

        {nutrition.length > 0 ? (
          <ListGroup variant="flush">
            {nutrition.map((item, index) => (
              <ListGroup.Item key={index}>
                <Sparkles size={iconSize} className="me-2" />
                {getDisplay(item)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted mb-0">None listed.</p>
        )}
      </Card.Body>
    </Card>
  );
}