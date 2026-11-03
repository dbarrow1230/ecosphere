// src/pages/forms/seeds/tabs/SeedSpecialFeaturesTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedSpecialFeaturesTab({ formData, updateField }) {
  const specialFeatures=Array.isArray(formData.specialFeatures) ? formData.specialFeatures : [];

  const addSpecialFeature=()=>{
    updateField("specialFeatures",[...specialFeatures,""]);
  };

  const updateSpecialFeature=(index,value)=>{
    const list=[...specialFeatures];
    list[index]=value;
    updateField("specialFeatures",list);
  };

  const removeSpecialFeature=(index)=>{
    const list=[...specialFeatures];
    list.splice(index,1);
    updateField("specialFeatures",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Special Features</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Special Features</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addSpecialFeature}
                >
                  <Plus size={15} />
                  Add Feature
                </Button>
              </Card.Header>

              <Card.Body>
                {specialFeatures.length === 0 ? (
                  <div className="text-muted small">No special features added.</div>
                ) : (
                  <Row className="g-2">
                    {specialFeatures.map((feature,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Feature {index+1}</InputGroup.Text>
                          <Form.Control
                            value={feature || ""}
                            onChange={(e)=>updateSpecialFeature(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeSpecialFeature(index)}
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