// src/pages/forms/seeds/tabs/SeedStressTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedStressTab({ formData, updateField }) {
  const data=formData.stressRisk || {};
  const mitigationTips=Array.isArray(data.mitigationTips) ? data.mitigationTips : [];

  const addMitigationTip=()=>{
    updateField("stressRisk.mitigationTips",[...mitigationTips,""]);
  };

  const updateMitigationTip=(index,value)=>{
    const list=[...mitigationTips];
    list[index]=value;
    updateField("stressRisk.mitigationTips",list);
  };

  const removeMitigationTip=(index)=>{
    const list=[...mitigationTips];
    list.splice(index,1);
    updateField("stressRisk.mitigationTips",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Stress Risk</h5>

        <Row className="g-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Stress Risk</InputGroup.Text>
              <Form.Control
                value={data.title || ""}
                onChange={(e)=>updateField("stressRisk.title",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Transplant Shock</InputGroup.Text>
              <Form.Control
                value={data.transplantShock || ""}
                onChange={(e)=>updateField("stressRisk.transplantShock",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Stress Risk Overview</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.overview || ""}
                onChange={(e)=>updateField("stressRisk.overview",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6>Temperature Stress</h6>

                <InputGroup className="mb-2">
                  <InputGroup.Text>Above</InputGroup.Text>
                  <Form.Control
                    value={data.temperatureStress?.above || ""}
                    onChange={(e)=>updateField("stressRisk.temperatureStress.above",e.target.value)}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Below</InputGroup.Text>
                  <Form.Control
                    value={data.temperatureStress?.below || ""}
                    onChange={(e)=>updateField("stressRisk.temperatureStress.below",e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6>Water Stress</h6>

                <InputGroup className="mb-2">
                  <InputGroup.Text>Overwatering</InputGroup.Text>
                  <Form.Control
                    value={data.waterStress?.overwatering || ""}
                    onChange={(e)=>updateField("stressRisk.waterStress.overwatering",e.target.value)}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Underwatering</InputGroup.Text>
                  <Form.Control
                    value={data.waterStress?.underwatering || ""}
                    onChange={(e)=>updateField("stressRisk.waterStress.underwatering",e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6>Nutrient Stress</h6>

                <InputGroup className="mb-2">
                  <InputGroup.Text>Deficiency</InputGroup.Text>
                  <Form.Control
                    value={data.nutrientStress?.deficiency || ""}
                    onChange={(e)=>updateField("stressRisk.nutrientStress.deficiency",e.target.value)}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Excess</InputGroup.Text>
                  <Form.Control
                    value={data.nutrientStress?.excess || ""}
                    onChange={(e)=>updateField("stressRisk.nutrientStress.excess",e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <h6>Light Stress</h6>

                <InputGroup className="mb-2">
                  <InputGroup.Text>Low Light</InputGroup.Text>
                  <Form.Control
                    value={data.lightStress?.lowLight || ""}
                    onChange={(e)=>updateField("stressRisk.lightStress.lowLight",e.target.value)}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Excess Light</InputGroup.Text>
                  <Form.Control
                    value={data.lightStress?.excessLight || ""}
                    onChange={(e)=>updateField("stressRisk.lightStress.excessLight",e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Stress Mitigation Tips</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addMitigationTip}
                >
                  <Plus size={15} />
                  Add Tip
                </Button>
              </Card.Header>

              <Card.Body>
                {mitigationTips.length === 0 ? (
                  <div className="text-muted small">No stress mitigation tips added.</div>
                ) : (
                  <Row className="g-2">
                    {mitigationTips.map((tip,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Tip {index+1}</InputGroup.Text>
                          <Form.Control
                            value={tip || ""}
                            onChange={(e)=>updateMitigationTip(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeMitigationTip(index)}
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
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}