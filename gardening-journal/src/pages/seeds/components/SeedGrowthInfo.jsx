// /src/pages/seeds/components/SeedGrowthInfo.jsx
import { Card } from "react-bootstrap";
import { Ruler, Sprout, Sun, Wheat } from "lucide-react";

export default function SeedGrowthInfo({ growthInformation, harvestingInformation }) {
  if (!growthInformation) return null;

  const size = growthInformation.matureSize;
  const iconSize = 18;
  const formatSize=dimension=>{
    const parts=[];
    for(const [minKey,maxKey,unit] of [['minIn','maxIn','in'],['minCm','maxCm','cm']]){
      const min=dimension?.[minKey];
      const max=dimension?.[maxKey];
      if(min!=null || max!=null)parts.push(`${min!=null&&max!=null&&min!==max?`${min}–${max}`:min??max} ${unit}`);
    }
    return parts.join(' / ')||'Not listed';
  };

  const getText = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (Array.isArray(value)) {
      return value.map((item) => getText(item)).filter(Boolean).join(", ");
    }

    if (typeof value === "object") {
      if (typeof value.$oid === "string") return value.$oid;
      if (typeof value.name === "string") return value.name;
      if (typeof value.title === "string") return value.title;
      if (typeof value.label === "string") return value.label;
      if (typeof value.zone === "string") return value.zone;
      if (typeof value._id === "string") return value._id;
      if (typeof value.id === "string") return value.id;
      if (typeof value._id?.$oid === "string") return value._id.$oid;
      if (typeof value.id?.$oid === "string") return value.id.$oid;
    }

    return "";
  };

  const getGerminationTime = (value) => {
    if (!value) return "Not listed";

    if (typeof value === "string") return value;

    if (typeof value === "object" && !Array.isArray(value)) {
      const min = getText(value.min);
      const max = getText(value.max);

      if (min && max) return `${min}–${max}`;
      if (min) return min;
      if (max) return max;

      return "Not listed";
    }

    return getText(value) || "Not listed";
  };

  const getUsdaZones = (value) => {
    if (!value) return "Not listed";

    if (Array.isArray(value)) {
      const zones = value
        .map((zone) => {
          if (typeof zone === "object") return zone.zone || zone.name || zone.label || "";
          return getText(zone);
        })
        .filter(Boolean);

      return zones.length ? zones.join(", ") : "Not listed";
    }

    return getText(value) || "Not listed";
  };

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold">
        Growth Information
      </Card.Header>

      <Card.Body>
        <p>
          <Sprout size={iconSize} className="me-2" />
          <strong>Germination:</strong>{" "}
          {getGerminationTime(growthInformation.germinationTime)}
        </p>

        <p>
          <Wheat size={iconSize} className="me-2" />
          <strong>Harvest:</strong>{" "}
          {getText(harvestingInformation?.harvestTimeAfterGermination || harvestingInformation?.harvestTime) || "Not listed"}
        </p>

        <p>
          <Sun size={iconSize} className="me-2" />
          <strong>USDA Zones:</strong>{" "}
          {getUsdaZones(growthInformation.usdaZones?.length ? growthInformation.usdaZones : growthInformation.usdaZoneRange)}
        </p>

        {size && (
          <>
            <p>
              <Ruler size={iconSize} className="me-2" />
              <strong>Height:</strong>{" "}
              {formatSize(size.height)}
            </p>

            <p className="mb-0">
              <Ruler size={iconSize} className="me-2" />
              <strong>Width:</strong>{" "}
              {formatSize(size.width)}
            </p>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
