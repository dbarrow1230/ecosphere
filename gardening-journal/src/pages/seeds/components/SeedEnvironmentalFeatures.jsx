// src/pages/seeds/components/SeedEnvironmentalFeatures.jsx
import { Card } from "react-bootstrap";
import { Leaf, Sparkles, Home } from "lucide-react";

export default function SeedEnvironmentalFeatures({
  environmentalImpact,
  specialFeatures,
  apartmentGardening,
  plantingInformation
}) {
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

  const getList = (items) => {
    if (Array.isArray(items)) {
      const list = items.map((item) => getText(item)).filter(Boolean);
      return list.length ? list.join(", ") : "Not listed";
    }

    const text = getText(items);
    return text || "Not listed";
  };

  const impact = environmentalImpact?.impact;
  const features = specialFeatures;
  const apartment = apartmentGardening || plantingInformation?.apartmentGardening;

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Environmental Impact and Features
      </Card.Header>

      <Card.Body>
        <p>
          <Leaf size={iconSize} className="me-2" />
          <strong>Environmental Impact:</strong> {getList(impact)}
        </p>

        <p>
          <Sparkles size={iconSize} className="me-2" />
          <strong>Special Features:</strong> {getList(features)}
        </p>

        <p className="mb-0">
          <Home size={iconSize} className="me-2" />
          <strong>Apartment Gardening:</strong> {getList(apartment)}
        </p>
      </Card.Body>
    </Card>
  );
}