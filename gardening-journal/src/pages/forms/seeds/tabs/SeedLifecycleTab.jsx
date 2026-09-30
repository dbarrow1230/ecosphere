// src/pages/forms/seeds/tabs/SeedLifecycleTab.jsx
import { Card, Row, Col, Form, InputGroup } from "react-bootstrap";
import SortedSelect from "../../../../components/SortedSelect.jsx";

export default function SeedLifecycleTab({
  formData,
  updateField,
  plantTypes = [],
  lifecycleTypes = [],
  lifespans = []
}) {
  const data=formData.lifecycleInformation || {};
  const getOptionValue=(item)=>item?._id || item?.id || item?.value || "";
  const getOptionLabel=(item)=>item?.name || item?.title || item?.label || "";

  const formatMonthValue=value=>{
    const months=Number(value);
    if(!Number.isFinite(months))return "";

    if(months>=12&&months%12===0){
      const years=months/12;
      return `${years} ${years===1 ? "year" : "years"}`;
    }

    return `${months} ${months===1 ? "month" : "months"}`;
  };

  const getLifespanLabel=item=>{
    const name=getOptionLabel(item);
    const min=formatMonthValue(item?.minMonths);
    const max=formatMonthValue(item?.maxMonths);

    if(min&&max&&min===max)return `${name} (${min})`;
    if(min&&max)return `${name} (${min} - ${max})`;
    if(min)return `${name} (${min}+)`;
    if(max)return `${name} (up to ${max})`;

    return name;
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Lifecycle Information</h5>

        <Row className="g-3">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Plant Type</InputGroup.Text>
              <SortedSelect
                value={formData.plantType || ""}
                onChange={(e)=>updateField("plantType",e.target.value)}
                options={plantTypes}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                placeholder="Select plant type"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Lifecycle Type</InputGroup.Text>
              <SortedSelect
                value={data.lifecycleType || ""}
                onChange={(e)=>updateField("lifecycleInformation.lifecycleType",e.target.value)}
                options={lifecycleTypes}
                getValue={getOptionValue}
                getLabel={getOptionLabel}
                placeholder="Select lifecycle type"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Lifespan</InputGroup.Text>
              <SortedSelect
                value={data.lifespan || ""}
                onChange={(e)=>updateField("lifecycleInformation.lifespan",e.target.value)}
                options={lifespans}
                getValue={getOptionValue}
                getLabel={getLifespanLabel}
                placeholder="Select lifespan"
              />
            </InputGroup>
          </Col>

          <Col md={4}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Hardiness</InputGroup.Text>
              <Form.Control
                value={data.hardiness || ""}
                onChange={(e)=>updateField("lifecycleInformation.hardiness",e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
