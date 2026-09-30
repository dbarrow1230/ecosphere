// src/pages/forms/seeds/tabs/SeedHarvestingTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedHarvestingTab({ formData, updateField }) {
  const data=formData.harvestingInformation || {};
  const techniques=Array.isArray(data.techniques) ? data.techniques : [];

  const addTechnique=()=>{
    updateField("harvestingInformation.techniques",[...techniques,""]);
  };

  const updateTechnique=(index,value)=>{
    const list=[...techniques];
    list[index]=value;
    updateField("harvestingInformation.techniques",list);
  };

  const removeTechnique=(index)=>{
    const list=[...techniques];
    list.splice(index,1);
    updateField("harvestingInformation.techniques",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Harvesting Techniques</h5>

        <Row className="g-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Harvest Time</InputGroup.Text>
              <Form.Control
                value={data.harvestTime || ""}
                onChange={(e)=>updateField("harvestingInformation.harvestTime",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">After Germination</InputGroup.Text>
              <Form.Control
                value={data.harvestTimeAfterGermination || ""}
                onChange={(e)=>updateField("harvestingInformation.harvestTimeAfterGermination",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Harvesting Techniques</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addTechnique}
                >
                  <Plus size={15} />
                  Add Technique
                </Button>
              </Card.Header>

              <Card.Body>
                {techniques.length === 0 ? (
                  <div className="text-muted small">No harvesting techniques added.</div>
                ) : (
                  <Row className="g-2">
                    {techniques.map((technique,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Technique {index+1}</InputGroup.Text>
                          <Form.Control
                            value={technique || ""}
                            onChange={(e)=>updateTechnique(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeTechnique(index)}
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