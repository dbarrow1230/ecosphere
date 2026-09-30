// /src/pages/seeds/components/SeedPlantingInfo.jsx
import { Card, ListGroup } from "react-bootstrap";
import { FlaskConical, PackageCheck, Recycle, Sprout } from "lucide-react";

export default function SeedPlantingInfo({ data }) {
  if (!data) return null;

  const iconSize = 18;
  const objectIdPattern = /^[a-f\d]{24}$/i;

  const getText = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return objectIdPattern.test(value.trim()) ? "" : value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (Array.isArray(value)) {
      return value.map((item) => getText(item)).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
      if (typeof value.plantName === "string") return value.plantName;
      if (typeof value.commonName === "string") return value.commonName;
      if (typeof value.name === "string") return value.name;
      if (typeof value.title === "string") return value.title;
      if (typeof value.label === "string") return value.label;
      if (typeof value.description === "string") return value.description;
      if (typeof value.timing === "string") return value.timing;
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

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const getMonthName = (value) => {
    const month = Number(value);
    if (!Number.isInteger(month) || month < 1 || month > 12) return "";
    return monthNames[month - 1];
  };

  const getPlantingSeasonDisplay = (value) => {
    const seasons = Array.isArray(value) ? value : value ? [value] : [];
    const labels = seasons.map((item) => {
      if (typeof item !== "object" || item === null) return getText(item);

      const name = getText(item.name || item.title || item.label);
      const seasonName = typeof item.season === "object" ? getText(item.season) : getText(item.season);
      const monthRange = [getMonthName(item.startMonth), getMonthName(item.endMonth)].filter(Boolean).join("-");
      const windows = [
        item.indoorStartWeeksBeforeLastFrost !== undefined && item.indoorStartWeeksBeforeLastFrost !== null ? `Indoor ${item.indoorStartWeeksBeforeLastFrost}w before frost` : "",
        item.transplantWeeksAfterLastFrost !== undefined && item.transplantWeeksAfterLastFrost !== null ? `Transplant ${item.transplantWeeksAfterLastFrost}w after frost` : "",
        item.directSowWeeksBeforeLastFrost !== undefined && item.directSowWeeksBeforeLastFrost !== null ? `Direct sow ${item.directSowWeeksBeforeLastFrost}w before frost` : "",
        item.directSowWeeksAfterLastFrost !== undefined && item.directSowWeeksAfterLastFrost !== null ? `Direct sow ${item.directSowWeeksAfterLastFrost}w after frost` : "",
        item.fallPlantingWeeksBeforeFirstFrost !== undefined && item.fallPlantingWeeksBeforeFirstFrost !== null ? `Fall ${item.fallPlantingWeeksBeforeFirstFrost}w before frost` : ""
      ].filter(Boolean);
      const details = [seasonName, monthRange, ...windows, item.notes].filter(Boolean).join(" • ");

      return details ? `${name || "Planting season"} (${details})` : name;
    }).filter(Boolean);

    return labels.join(", ") || "Not listed";
  };

  const renderBasicRow = ({ label, value, icon }) => (
    <div className="seed-planting-basic-row">
      {icon}
      <span>
        <strong>{label}:</strong> {value}
      </span>
    </div>
  );

  const renderListSection = ({ title, icon, items, emptyText = "None listed." }) => (
    <section className="seed-planting-section">
      <h5>
        {icon}
        {title}
      </h5>

      {items.length > 0 ? (
        <ListGroup variant="flush" className="seed-planting-list">
          {items.map((item, index) => (
            <ListGroup.Item key={index}>
              {icon}
              <span>{getDisplay(item)}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-muted mb-0">{emptyText}</p>
      )}
    </section>
  );

  const startIndoors = data.startIndoors || {};
  const directSowOutdoors = data.directSowOutdoors || {};
  const materialsNeeded = getArray(startIndoors.materialsNeeded);
  const careTips = getArray(startIndoors.careTips);
  const directSowGuidelines = getArray(directSowOutdoors.guidelines);
  const growingFromScraps = getArray(data.growingFromScraps);
  const apartmentGardening = getArray(data.apartmentGardening);
  const companionPlants = getArray(data.companionPlants);
  const coverCrops = getArray(data.coverCrops);
  const trapCrops = getArray(data.trapCrops);

  const sproutIcon = <Sprout size={iconSize} className="me-2" />;
  const packageIcon = <PackageCheck size={iconSize} className="me-2" />;
  const recycleIcon = <Recycle size={iconSize} className="me-2" />;
  const hydroIcon = <FlaskConical size={iconSize} className="me-2" />;

  return (
    <Card className="h-100 shadow-sm border-0 seed-planting-info-card">
      <Card.Header className="bg-success text-white fw-bold">
        Planting Information
      </Card.Header>

      <Card.Body>
        <section className="seed-planting-basics-card">
          <h5>
            {sproutIcon}
            Planting Basics
          </h5>

          <div className="seed-planting-basics-grid">
            {renderBasicRow({
              label: "Planting Season",
              value: getPlantingSeasonDisplay(data.plantingSeasons),
              icon: sproutIcon
            })}

            {renderBasicRow({
              label: "Start Indoors",
              value: getDisplay(startIndoors.timing),
              icon: sproutIcon
            })}

            {renderBasicRow({
              label: "Hydroponic",
              value: data.hydroponicGrowth ? "Yes" : "No",
              icon: hydroIcon
            })}
          </div>
        </section>

        <div className="seed-planting-section-grid">
          {renderListSection({
            title: "Companion Plants",
            icon: sproutIcon,
            items: companionPlants
          })}

          {renderListSection({
            title: "Cover Crops",
            icon: sproutIcon,
            items: coverCrops
          })}

          {renderListSection({
            title: "Trap Crops",
            icon: sproutIcon,
            items: trapCrops
          })}

          {renderListSection({
            title: "Materials Needed",
            icon: packageIcon,
            items: materialsNeeded
          })}

          {renderListSection({
            title: "Indoor Care Tips",
            icon: sproutIcon,
            items: careTips
          })}

          {renderListSection({
            title: "Direct Sow Outdoors",
            icon: sproutIcon,
            items: directSowGuidelines
          })}

          {renderListSection({
            title: "Growing From Scraps",
            icon: recycleIcon,
            items: growingFromScraps
          })}

          {renderListSection({
            title: "Apartment Gardening",
            icon: sproutIcon,
            items: apartmentGardening
          })}
        </div>
      </Card.Body>
    </Card>
  );
}
