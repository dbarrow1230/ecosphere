// src/pages/seeds/components/SeedStressRisk.jsx
import { Card } from "react-bootstrap";
import { AlertTriangle, Thermometer, Droplets, Activity, Sun, MoveRight, ShieldCheck } from "lucide-react";

export default function SeedStressRisk({ data }) {
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
      if (typeof value.overview === "string") return value.overview;
      if (typeof value.above === "string") return value.above;
      if (typeof value.below === "string") return value.below;
      if (typeof value.overwatering === "string") return value.overwatering;
      if (typeof value.underwatering === "string") return value.underwatering;
      if (typeof value.deficiency === "string") return value.deficiency;
      if (typeof value.excess === "string") return value.excess;
      if (typeof value.lowLight === "string") return value.lowLight;
      if (typeof value.excessLight === "string") return value.excessLight;
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

  const getListItems = (value) => {
    return getArray(value)
      .flatMap((item) => getText(item).split(/\r?\n|;|•|\s+-\s+/))
      .map((item) => item.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
  };

  const temperatureStress = data.temperatureStress || {};
  const waterStress = data.waterStress || {};
  const nutrientStress = data.nutrientStress || {};
  const lightStress = data.lightStress || {};
  const mitigationTips = getListItems(data.mitigationTips);

  return (
    <Card className="seed-stress-card h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Stress Risk
      </Card.Header>

      <Card.Body>
        <div className="seed-stress-layout">
          <section className="seed-stress-summary">
            <p>
              <AlertTriangle size={iconSize} className="me-2" />
              <strong>Title:</strong> {getDisplay(data.title)}
            </p>

            <p className="mb-0">
              <ShieldCheck size={iconSize} className="me-2" />
              <strong>Overview:</strong> {getDisplay(data.overview)}
            </p>
          </section>

          <div className="seed-stress-panel">
            <div className="seed-stress-block">
              <h5>
                <Thermometer size={iconSize} className="me-2" />
                Temperature Stress
              </h5>

              <p><strong>Above:</strong> {getDisplay(temperatureStress.above)}</p>
              <p className="mb-0"><strong>Below:</strong> {getDisplay(temperatureStress.below)}</p>
            </div>

            <div className="seed-stress-block">
              <h5>
                <Droplets size={iconSize} className="me-2" />
                Water Stress
              </h5>

              <p><strong>Overwatering:</strong> {getDisplay(waterStress.overwatering)}</p>
              <p className="mb-0"><strong>Underwatering:</strong> {getDisplay(waterStress.underwatering)}</p>
            </div>

            <div className="seed-stress-block">
              <h5>
                <Activity size={iconSize} className="me-2" />
                Nutrient Stress
              </h5>

              <p><strong>Deficiency:</strong> {getDisplay(nutrientStress.deficiency)}</p>
              <p className="mb-0"><strong>Excess:</strong> {getDisplay(nutrientStress.excess)}</p>
            </div>

            <div className="seed-stress-block">
              <h5>
                <Sun size={iconSize} className="me-2" />
                Light Stress
              </h5>

              <p><strong>Low Light:</strong> {getDisplay(lightStress.lowLight)}</p>
              <p className="mb-0"><strong>Excess Light:</strong> {getDisplay(lightStress.excessLight)}</p>
            </div>

            <div className="seed-stress-block">
              <h5>
                <MoveRight size={iconSize} className="me-2" />
                Transplant Shock
              </h5>

              <p className="mb-0">{getDisplay(data.transplantShock)}</p>
            </div>
          </div>

          <aside className="seed-stress-mitigation">
            <div className="seed-stress-block">
              <h5>
                <ShieldCheck size={iconSize} className="me-2" />
                Mitigation Tips
              </h5>

              {mitigationTips.length > 0 ? (
                <ul className="seed-stress-tip-list">
                  {mitigationTips.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0">Not listed</p>
              )}
            </div>
          </aside>
        </div>
      </Card.Body>
    </Card>
  );
}
