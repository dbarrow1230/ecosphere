// src/pages/forms/seeds/tabs/SeedGrowingConditionsTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";
import SortedSelect from "../../../../components/SortedSelect.jsx";

export default function SeedGrowingConditionsTab({
  formData,
  updateField,
  soilTypes = [],
  plantSoilTemps = [],
  wateringRequirements = [],
  lightRequirements = []
}) {
  const data=formData.growingConditionsAndRequirements || {};
  const care=data.seasonalCareTips || {};
  const sustainable=formData.sustainableGrowingPractices || {};

  const toArray=(value)=>{
    if(Array.isArray(value)) return value;
    if(typeof value==="string" && value.trim()) return [value];
    return [];
  };

  const pruning=toArray(care.pruning);
  const fertilizing=toArray(care.fertilizing);
  const protection=toArray(care.protection);

  const organicMethods=toArray(sustainable.organicMethods);
  const waterConservation=toArray(sustainable.waterConservation);
  const soilHealthImprovement=toArray(sustainable.soilHealthImprovement);
  const encouragingBiodiversity=toArray(sustainable.encouragingBiodiversity);

  const getOptionValue=(item)=>item?._id || item?.id || item?.value || "";
  const getOptionLabel=(item)=>item?.name || item?.title || item?.label || item?.range || item?.temperature || item?.requirement || "";
  const formatNumber=value=>{
    const number=Number(value);
    if(!Number.isFinite(number))return "";
    return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/,"").replace(/\.$/,"");
  };

  const getSoilTempLabel=item=>{
    const label=getOptionLabel(item);
    const fahrenheit=formatNumber(item?.fahrenheit);
    const celsius=formatNumber(item?.celsius);
    const temperatures=[
      fahrenheit ? `${fahrenheit}°F` : "",
      celsius ? `${celsius}°C` : ""
    ].filter(Boolean).join(" / ");

    return temperatures ? `${label} (${temperatures})` : label;
  };

  const getWateringRequirementLabel=(item)=>{
    const frequency=item?.frequency || "";
    const name=item?.name || item?.title || item?.label || "";

    if(frequency && name) return `${frequency} - ${name}`;
    return frequency || name;
  };

  const addArrayItem=(path,list)=>{
    updateField(path,[...list,""]);
  };

  const updateArrayItem=(path,list,index,value)=>{
    const updated=[...list];
    updated[index]=value;
    updateField(path,updated);
  };

  const removeArrayItem=(path,list,index)=>{
    const updated=[...list];
    updated.splice(index,1);
    updateField(path,updated);
  };

  const renderArraySection=(title,path,list)=>{
    return (
      <Card className="border h-100">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <strong>{title}</strong>

          <Button
            type="button"
            variant="outline-success"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={()=>addArrayItem(path,list)}
          >
            <Plus size={15} />
            Add
          </Button>
        </Card.Header>

        <Card.Body>
          {list.length === 0 ? (
            <div className="text-muted small">No {title.toLowerCase()} added.</div>
          ) : (
            <Row className="g-2">
              {list.map((item,index)=>(
                <Col xs={12} key={index}>
                  <InputGroup>
                    <InputGroup.Text className="fw-bold">Item {index+1}</InputGroup.Text>
                    <Form.Control
                      value={item || ""}
                      onChange={(e)=>updateArrayItem(path,list,index,e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline-danger"
                      className="d-inline-flex align-items-center"
                      onClick={()=>removeArrayItem(path,list,index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </InputGroup>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Growing Conditions and Requirements</h5>

        <Row className="g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Soil Type</InputGroup.Text>
              <SortedSelect
                value={data.soilType || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.soilType",e.target.value)}
                options={soilTypes}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                placeholder="Select soil type"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Soil Temp</InputGroup.Text>
              <SortedSelect
                value={data.plantSoilTemp || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.plantSoilTemp",e.target.value)}
                options={plantSoilTemps}
                getValue={getOptionValue}
                getLabel={getSoilTempLabel}
                placeholder="Select soil temp"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">pH Requirements</InputGroup.Text>
              <Form.Control
                value={data.phRequirements || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.phRequirements",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Climate Tolerance</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={2}
                value={data.climateTolerance || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.climateTolerance",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Watering</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={2}
                value={data.watering || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.watering",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Watering Requirements</InputGroup.Text>
              <SortedSelect
                value={data.wateringRequirements || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.wateringRequirements",e.target.value)}
                options={wateringRequirements}
                getValue={getOptionValue}
                getLabel={getWateringRequirementLabel}
                placeholder="Select watering requirement"
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Light Requirements</InputGroup.Text>
              <SortedSelect
                value={data.lightRequirements || ""}
                onChange={(e)=>updateField("growingConditionsAndRequirements.lightRequirements",e.target.value)}
                options={lightRequirements}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                placeholder="Select light requirement"
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <h6 className="mt-3 mb-2">Seasonal Care Tips</h6>
          </Col>

          <Col md={4}>
            {renderArraySection("Pruning","growingConditionsAndRequirements.seasonalCareTips.pruning",pruning)}
          </Col>

          <Col md={4}>
            {renderArraySection("Fertilizing","growingConditionsAndRequirements.seasonalCareTips.fertilizing",fertilizing)}
          </Col>

          <Col md={4}>
            {renderArraySection("Protection","growingConditionsAndRequirements.seasonalCareTips.protection",protection)}
          </Col>

          <Col xs={12}>
            <h6 className="mt-3 mb-2">Sustainable Growing Practices</h6>
          </Col>

          <Col md={6}>
            {renderArraySection("Organic Methods","sustainableGrowingPractices.organicMethods",organicMethods)}
          </Col>

          <Col md={6}>
            {renderArraySection("Water Conservation","sustainableGrowingPractices.waterConservation",waterConservation)}
          </Col>

          <Col md={6}>
            {renderArraySection("Soil Health Improvement","sustainableGrowingPractices.soilHealthImprovement",soilHealthImprovement)}
          </Col>

          <Col md={6}>
            {renderArraySection("Encouraging Biodiversity","sustainableGrowingPractices.encouragingBiodiversity",encouragingBiodiversity)}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
