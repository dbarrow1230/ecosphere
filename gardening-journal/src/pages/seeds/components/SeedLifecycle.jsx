// src/pages/seeds/components/SeedLifecycle.jsx
import { Card } from "react-bootstrap";
import { Repeat, Shield, Clock } from "lucide-react";

export default function SeedLifecycle({ data }) {
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

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Lifecycle Information
      </Card.Header>

      <Card.Body>
        <p>
          <Repeat size={iconSize} className="me-2" />
          <strong>Lifecycle Type:</strong> {getDisplay(data.lifecycleType)}
        </p>

        <p>
          <Shield size={iconSize} className="me-2" />
          <strong>Hardiness:</strong> {getDisplay(data.hardiness)}
        </p>

        <p className="mb-0">
          <Clock size={iconSize} className="me-2" />
          <strong>Lifespan:</strong> {getDisplay(data.lifespan)}
        </p>
      </Card.Body>
    </Card>
  );
}