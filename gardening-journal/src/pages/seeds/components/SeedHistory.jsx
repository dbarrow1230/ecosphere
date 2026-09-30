// /src/pages/seeds/components/SeedHistory.jsx
import { Card, Table, ListGroup } from "react-bootstrap";
import { CalendarDays, Globe2, Landmark } from "lucide-react";

export default function SeedHistory({ data, culturalInformation }) {
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
      if (typeof value.date === "string") return value.date;
      if (typeof value.timePeriod === "string") return value.timePeriod;
      if (typeof value.event === "string") return value.event;
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

  const events = Array.isArray(data.events) ? data.events : [];
  const culture = Array.isArray(culturalInformation) ? culturalInformation : [];

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Historical Information
      </Card.Header>

      <Card.Body>
        <p>
          <Globe2 size={iconSize} className="me-2" />
          {getDisplay(data.foodOrigin)}
        </p>

        {events.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th><CalendarDays size={iconSize} className="me-2" />Date</th>
                <th>Time Period</th>
                <th>Event</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>{getDisplay(event?.date)}</td>
                  <td>{getDisplay(event?.timePeriod)}</td>
                  <td>{getDisplay(event?.event)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <h5 className="mt-3">
          <Landmark size={iconSize} className="me-2" />
          Cultural Information
        </h5>

        {culture.length > 0 ? (
          <ListGroup variant="flush">
            {culture.map((item, index) => (
              <ListGroup.Item key={index}>
                <Landmark size={iconSize} className="me-2" />
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