// /src/pages/seeds/components/SeedGrowingConditions.jsx
import { Card } from "react-bootstrap";
import { CloudSun, Leaf, Scissors, Shield, TestTube } from "lucide-react";

export default function SeedGrowingConditions({ data }) {
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

  const seasonalCareTips = data.seasonalCareTips || {};

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Growing Conditions
      </Card.Header>

      <Card.Body>
        <p>
          <TestTube size={iconSize} className="me-2" />
          <strong>pH:</strong> {getDisplay(data.phRequirements)}
        </p>

        <p>
          <CloudSun size={iconSize} className="me-2" />
          <strong>Climate:</strong> {getDisplay(data.climateTolerance)}
        </p>

        <h5 className="mt-3">Seasonal Care</h5>

        <p>
          <Scissors size={iconSize} className="me-2" />
          <strong>Pruning:</strong>{" "}
          {getDisplay(seasonalCareTips.pruning)}
        </p>

        <p>
          <Leaf size={iconSize} className="me-2" />
          <strong>Fertilizing:</strong>{" "}
          {getDisplay(seasonalCareTips.fertilizing)}
        </p>

        <p className="mb-0">
          <Shield size={iconSize} className="me-2" />
          <strong>Protection:</strong>{" "}
          {getDisplay(seasonalCareTips.protection)}
        </p>
      </Card.Body>
    </Card>
  );
}