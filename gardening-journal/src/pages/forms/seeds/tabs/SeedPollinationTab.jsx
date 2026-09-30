// src/pages/forms/seeds/tabs/SeedPollinationTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedPollinationTab({ formData, updateField }) {
  const pollinationInformation=Array.isArray(formData.pollinationInformation) ? formData.pollinationInformation : [];
  const attractingPollinators=Array.isArray(formData.attractingPollinators) ? formData.attractingPollinators : [];

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
        <h5 className="mb-3">Pollination Information</h5>

        <Row className="g-3">
          <Col md={6}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Pollination Information</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("pollinationInformation",pollinationInformation)}
                >
                  <Plus size={15} />
                  Add Item
                </Button>
              </Card.Header>

              <Card.Body>
                {pollinationInformation.length === 0 ? (
                  <div className="text-muted small">No pollination information added.</div>
                ) : (
                  <Row className="g-2">
                    {pollinationInformation.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Item {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateArrayItem("pollinationInformation",pollinationInformation,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("pollinationInformation",pollinationInformation,index)}
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

          <Col md={6}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Attracting Pollinators</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("attractingPollinators",attractingPollinators)}
                >
                  <Plus size={15} />
                  Add Item
                </Button>
              </Card.Header>

              <Card.Body>
                {attractingPollinators.length === 0 ? (
                  <div className="text-muted small">No attracting pollinators added.</div>
                ) : (
                  <Row className="g-2">
                    {attractingPollinators.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Item {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateArrayItem("attractingPollinators",attractingPollinators,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("attractingPollinators",attractingPollinators,index)}
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