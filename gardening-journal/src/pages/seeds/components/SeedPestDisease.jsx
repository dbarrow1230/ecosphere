// src/pages/seeds/components/SeedPestDisease.jsx
import { Card, Table } from "react-bootstrap";
import { Bug, Stethoscope } from "lucide-react";

export default function SeedPestDisease({ pestManagement, diseaseManagement }) {
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
      if (typeof value.name === "string") return value.name;
      if (typeof value.pestName === "string") return value.pestName;
      if (typeof value.diseaseName === "string") return value.diseaseName;
      if (typeof value.title === "string") return value.title;
      if (typeof value.label === "string") return value.label;
      if (typeof value.pest_type === "string") return value.pest_type;
      if (typeof value.pestType === "string") return value.pestType;
      if (typeof value.diseaseType === "string") return value.diseaseType;
      if (typeof value.category === "string") return value.category;
      if (typeof value.type === "string") return objectIdPattern.test(value.type.trim()) ? "" : value.type;
      if (typeof value.treatmentText === "string") return value.treatmentText;
      if (typeof value.treatment === "string") return value.treatment;
      if (typeof value.prevention === "string") return value.prevention;
      if (typeof value.description === "string") return value.description;
    }

    return "";
  };

  const pests = Array.isArray(pestManagement) ? pestManagement : [];
  const diseases = Array.isArray(diseaseManagement) ? diseaseManagement : [];

  const firstText = (...values) => values.map((value) => getText(value)).find(Boolean) || "";

  const getPestName = (item) => firstText(item?.pest?.name, item?.pest?.pestName, item?.pest?.title, item?.pest?.label, item?.name, item?.pestName, item?.title, item?.label);
  const getPestType = (item) => firstText(item?.pest?.type, item?.pest?.pest_type, item?.pest?.pestType, item?.type, item?.pest_type, item?.pestType);
  const getPestCategory = (item) => firstText(item?.pest?.category, item?.category, item?.pestCategory);
  const getPestDescription = (item) => firstText(item?.description, item?.pest?.description);

  const getDiseaseName = (item) => firstText(item?.disease?.name, item?.disease?.diseaseName, item?.disease?.title, item?.disease?.label, item?.diseaseName, item?.name, item?.title, item?.label);
  const getDiseaseType = (item) => firstText(item?.disease?.diseaseType, item?.disease?.type, item?.diseaseType, item?.type);
  const getDiseaseCategory = (item) => firstText(item?.disease?.category, item?.category, item?.diseaseCategory);
  const getDiseaseDescription = (item) => firstText(item?.description, item?.disease?.description, item?.cause, item?.symptoms, item?.disease?.cause, item?.disease?.symptoms);

  const getTreatmentText = (item) => {
    const direct = getText(item?.treatmentText || item?.treatment);
    if (direct) return direct;

    if (Array.isArray(item?.treatments)) {
      return item.treatments.map((treatment) => getText(treatment)).filter(Boolean).join(", ");
    }

    return "";
  };

  const getDiseaseTreatmentText = (item) => {
    const direct = getText(item?.treatment || item?.treatments);
    if (direct) return direct;

    const organic = getText(item?.organicTreatment);
    const chemical = getText(item?.chemicalTreatment);

    return [organic, chemical].filter(Boolean).join(", ");
  };

  const EmptyRow = ({ colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="text-muted">
        Not listed
      </td>
    </tr>
  );

  const FieldStack = ({ items }) => (
    <div className="seed-pest-disease-fields">
      {items.map(({ label, value }) => (
        <div className="seed-pest-disease-field" key={label}>
          <strong>{label}:</strong> {value || "Not listed"}
        </div>
      ))}
    </div>
  );

  const renderPestTable = () => (
    <Table responsive size="sm" className="mb-0 align-middle seed-pest-disease-table">
      <thead>
        <tr>
          <th>Pest</th>
          <th>Type</th>
          <th>Category</th>
          <th>Details</th>
        </tr>
      </thead>

      <tbody>
        {pests.length ? pests.map((item, index) => (
          <tr key={`${getPestName(item) || "pest"}-${index}`}>
            <td className="fw-bold">{getPestName(item) || "Unnamed pest"}</td>
            <td>{getPestType(item) || "Not listed"}</td>
            <td>{getPestCategory(item) || "Not listed"}</td>
            <td>
              <FieldStack
                items={[
                  { label: "Description", value: getPestDescription(item) },
                  { label: "Treatment", value: getTreatmentText(item) },
                  { label: "Prevention", value: getText(item?.prevention) }
                ]}
              />
            </td>
          </tr>
        )) : <EmptyRow colSpan={4} />}
      </tbody>
    </Table>
  );

  const renderDiseaseTable = () => (
    <Table responsive size="sm" className="mb-0 align-middle seed-pest-disease-table">
      <thead>
        <tr>
          <th>Disease</th>
          <th>Type</th>
          <th>Category</th>
          <th>Details</th>
        </tr>
      </thead>

      <tbody>
        {diseases.length ? diseases.map((item, index) => (
          <tr key={`${getDiseaseName(item) || "disease"}-${index}`}>
            <td className="fw-bold">{getDiseaseName(item) || "Unnamed disease"}</td>
            <td>{getDiseaseType(item) || "Not listed"}</td>
            <td>{getDiseaseCategory(item) || "Not listed"}</td>
            <td>
              <FieldStack
                items={[
                  { label: "Description", value: getDiseaseDescription(item) },
                  { label: "Treatment", value: getDiseaseTreatmentText(item) },
                  { label: "Prevention", value: getText(item?.prevention) }
                ]}
              />
            </td>
          </tr>
        )) : <EmptyRow colSpan={4} />}
      </tbody>
    </Table>
  );

  const renderManagementCard = (title, Icon, children) => (
    <Card className="h-100 shadow-sm border-0">
      <Card.Header className="bg-success text-white fw-bold d-flex align-items-center gap-2">
        <Icon size={iconSize} />
        {title}
      </Card.Header>

      <Card.Body>
        {children}
      </Card.Body>
    </Card>
  );

  return (
    <div className="seed-pest-disease-stack">
      {renderManagementCard("Pest Management", Bug, renderPestTable())}
      {renderManagementCard("Disease Management", Stethoscope, renderDiseaseTable())}
    </div>
  );
}
