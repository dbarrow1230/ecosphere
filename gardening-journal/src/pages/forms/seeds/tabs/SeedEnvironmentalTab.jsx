// src/pages/forms/seeds/tabs/SeedEnvironmentalTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedEnvironmentalTab({ formData, updateField }) {
  const data=formData.environmentalImpact || {};
  const impact=Array.isArray(data.impact) ? data.impact : [];

  const addImpact=()=>{
    updateField("environmentalImpact.impact",[...impact,""]);
  };

  const updateImpact=(index,value)=>{
    const list=[...impact];
    list[index]=value;
    updateField("environmentalImpact.impact",list);
  };

  const removeImpact=(index)=>{
    const list=[...impact];
    list.splice(index,1);
    updateField("environmentalImpact.impact",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Environmental Impact</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Environmental Impact</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addImpact}
                >
                  <Plus size={15} />
                  Add Impact
                </Button>
              </Card.Header>

              <Card.Body>
                {impact.length === 0 ? (
                  <div className="text-muted small">No environmental impact items added.</div>
                ) : (
                  <Row className="g-2">
                    {impact.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Impact {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateImpact(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeImpact(index)}
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