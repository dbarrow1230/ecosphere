// /src/pages/seeds/components/SeedSpecies.jsx
import { Card } from "react-bootstrap";
import { Sprout, Leaf, Tags, FlaskConical, BookOpen, Flower2, FileText } from "lucide-react";

export default function SeedSpecies({ species }) {
  if (!species) return null;

  const iconSize = 18;

  const getValue = (value) => {
    if (!value) return "Not listed";

    if (typeof value === "object") {
      return value.name || value.commonName || value.botanicalName || "Not listed";
    }

    return value;
  };

  const getListValue = (value) => {
    if (!Array.isArray(value) || value.length === 0) return "Not listed";
    return value.filter(Boolean).join("; ");
  };

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Species Name and Classification
      </Card.Header>

      <Card.Body>
        <p>
          <Leaf size={iconSize} className="me-2" />
          <strong>Family:</strong> {getValue(species.family)}
        </p>

        <p>
          <Sprout size={iconSize} className="me-2" />
          <strong>Genus:</strong> {getValue(species.genus)}
        </p>

        <p>
          <FlaskConical size={iconSize} className="me-2" />
          <strong>Species:</strong> {species.species || "Not listed"}
        </p>

        <p>
          <BookOpen size={iconSize} className="me-2" />
          <strong>Botanical Name:</strong>{" "}
          {species.botanicalName || "Not listed"}
        </p>

        <p>
          <Flower2 size={iconSize} className="me-2" />
          <strong>Common Name:</strong> {species.commonName || "Not listed"}
        </p>

        <p>
          <Tags size={iconSize} className="me-2" />
          <strong>Variety:</strong> {getListValue(species.variety)}
        </p>

        <p className="mb-0">
          <FileText size={iconSize} className="me-2" />
          <strong>Synonyms:</strong> {getListValue(species.synonyms)}
        </p>
      </Card.Body>
    </Card>
  );
}