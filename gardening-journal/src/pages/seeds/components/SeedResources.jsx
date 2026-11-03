// /src/pages/seeds/components/SeedResources.jsx
import { Card, ListGroup } from "react-bootstrap";
import { ExternalLink, FileText, HeartPulse, Sprout } from "lucide-react";

const getUrl = (value) => {
  const match = String(value || "").match(/https?:\/\/[^\s]+/);
  return match ? match[0] : "";
};

export default function SeedResources({ data, medicalDisclaimer }) {
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
      if (typeof value.url === "string") return value.url;
      if (typeof value.link === "string") return value.link;
      if (typeof value.href === "string") return value.href;
      if (typeof value.description === "string") return value.description;
      if (typeof value._id === "string") return value._id;
      if (typeof value.id === "string") return value.id;
      if (typeof value._id?.$oid === "string") return value._id.$oid;
      if (typeof value.id?.$oid === "string") return value.id.$oid;
    }

    return "";
  };

  const getArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value];
    return [];
  };

  const renderLinks = (links, Icon) => {
    const list = getArray(links);

    if (list.length === 0) {
      return <p className="text-muted">None listed.</p>;
    }

    return (
      <ListGroup variant="flush">
        {list.map((link, index) => {
          const text = getText(link);
          const url = getUrl(text);

          return (
            <ListGroup.Item key={index}>
              <Icon size={iconSize} className="me-2" />
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {text}
                  <ExternalLink size={14} className="ms-2" />
                </a>
              ) : (
                text || "Not listed"
              )}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  };

  const notableReferenceLinks = getArray(data.notableReferenceLinks);
  const suggestedSeedLinks = getArray(data.suggestedSeedLinks);
  const disclaimer = getText(medicalDisclaimer);

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Resources
      </Card.Header>

      <Card.Body>
        <h5>
          <FileText size={iconSize} className="me-2" />
          Reference Links
        </h5>

        {renderLinks(notableReferenceLinks, FileText)}

        <h5 className="mt-3">
          <Sprout size={iconSize} className="me-2" />
          Seed Links
        </h5>

        {renderLinks(suggestedSeedLinks, Sprout)}

        {disclaimer && (
          <>
            <h5 className="mt-3">
              <HeartPulse size={iconSize} className="me-2" />
              Medical Disclaimer
            </h5>
            <p className="mb-0">{disclaimer}</p>
          </>
        )}
      </Card.Body>
    </Card>
  );
}