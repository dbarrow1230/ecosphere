// src/pages/seeds/components/SeedPropagationHarvestStorage.jsx
import { Card } from "react-bootstrap";
import { Sprout, Flower2, Scissors, Archive, Sparkles, Wheat } from "lucide-react";

export default function SeedPropagationHarvestStorage({
  propagationMethods,
  pollinationInformation,
  attractingPollinators,
  harvestingInformation,
  harvestingTechniques,
  storageTips
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
      if (typeof value.method === "string") return value.method;
      if (typeof value.note === "string") return value.note;
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

  const methods = getArray(propagationMethods?.method);
  const notes = getArray(propagationMethods?.notes);
  const pollination = getArray(pollinationInformation);
  const pollinators = getArray(attractingPollinators);
  const harvestData = harvestingInformation || {};
  const techniques = getArray(harvestData.techniques).length ? getArray(harvestData.techniques) : getArray(harvestingTechniques);
  const storage = getArray(storageTips);

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Propagation, Harvesting, and Storage
      </Card.Header>

      <Card.Body>
        <p>
          <Sprout size={iconSize} className="me-2" />
          <strong>Propagation Methods:</strong> {methods.length ? methods.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>

        <p>
          <Sparkles size={iconSize} className="me-2" />
          <strong>Propagation Notes:</strong> {notes.length ? notes.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>

        <p>
          <Flower2 size={iconSize} className="me-2" />
          <strong>Pollination:</strong> {pollination.length ? pollination.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>

        <p>
          <Flower2 size={iconSize} className="me-2" />
          <strong>Attracting Pollinators:</strong> {pollinators.length ? pollinators.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>

        <p>
          <Wheat size={iconSize} className="me-2" />
          <strong>Harvest Time:</strong> {getDisplay(harvestData.harvestTime)}
        </p>

        <p>
          <Wheat size={iconSize} className="me-2" />
          <strong>Harvest After Germination:</strong> {getDisplay(harvestData.harvestTimeAfterGermination)}
        </p>

        <p>
          <Scissors size={iconSize} className="me-2" />
          <strong>Harvesting Techniques:</strong> {techniques.length ? techniques.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>

        <p className="mb-0">
          <Archive size={iconSize} className="me-2" />
          <strong>Storage Tips:</strong> {storage.length ? storage.map((item) => getDisplay(item)).join(", ") : "Not listed"}
        </p>
      </Card.Body>
    </Card>
  );
}