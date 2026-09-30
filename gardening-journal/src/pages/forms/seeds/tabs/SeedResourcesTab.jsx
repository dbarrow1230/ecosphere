// src/pages/forms/seeds/tabs/SeedResourcesTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedResourcesTab({ formData, updateField }) {
  const data=formData.resourcesAndLinks || {};
  const notableReferenceLinks=Array.isArray(data.notableReferenceLinks) ? data.notableReferenceLinks : [];
  const suggestedSeedLinks=Array.isArray(data.suggestedSeedLinks) ? data.suggestedSeedLinks : [];

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

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Resources and Links</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Notable Reference Links</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("resourcesAndLinks.notableReferenceLinks",notableReferenceLinks)}
                >
                  <Plus size={15} />
                  Add Link
                </Button>
              </Card.Header>

              <Card.Body>
                {notableReferenceLinks.length === 0 ? (
                  <div className="text-muted small">No notable reference links added.</div>
                ) : (
                  <Row className="g-2">
                    {notableReferenceLinks.map((link,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Link {index+1}</InputGroup.Text>
                          <Form.Control
                            value={link || ""}
                            onChange={(e)=>updateArrayItem("resourcesAndLinks.notableReferenceLinks",notableReferenceLinks,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("resourcesAndLinks.notableReferenceLinks",notableReferenceLinks,index)}
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

          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Suggested Seed Links</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("resourcesAndLinks.suggestedSeedLinks",suggestedSeedLinks)}
                >
                  <Plus size={15} />
                  Add Link
                </Button>
              </Card.Header>

              <Card.Body>
                {suggestedSeedLinks.length === 0 ? (
                  <div className="text-muted small">No suggested seed links added.</div>
                ) : (
                  <Row className="g-2">
                    {suggestedSeedLinks.map((link,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Link {index+1}</InputGroup.Text>
                          <Form.Control
                            value={link || ""}
                            onChange={(e)=>updateArrayItem("resourcesAndLinks.suggestedSeedLinks",suggestedSeedLinks,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("resourcesAndLinks.suggestedSeedLinks",suggestedSeedLinks,index)}
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