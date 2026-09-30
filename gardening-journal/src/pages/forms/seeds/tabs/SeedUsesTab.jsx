// src/pages/forms/seeds/tabs/SeedUsesTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedUsesTab({ formData, updateField }) {
  const data=formData.usesAndBenefits || {};
  const medicinalUses=data.medicinalUses || {};
  const pros=Array.isArray(medicinalUses.pros) ? medicinalUses.pros : [];
  const cons=Array.isArray(medicinalUses.cons) ? medicinalUses.cons : [];

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
        <h5 className="mb-3">Uses and Benefits</h5>

        <Row className="g-3">
          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Edibility</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.edibility || ""}
                onChange={(e)=>updateField("usesAndBenefits.edibility",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <Form.Check
              type="checkbox"
              label="Medicinal"
              checked={!!data.medicinal}
              onChange={(e)=>updateField("usesAndBenefits.medicinal",e.target.checked)}
            />
          </Col>

          <Col md={6}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Medicinal Pros</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("usesAndBenefits.medicinalUses.pros",pros)}
                >
                  <Plus size={15} />
                  Add Pro
                </Button>
              </Card.Header>

              <Card.Body>
                {pros.length === 0 ? (
                  <div className="text-muted small">No medicinal pros added.</div>
                ) : (
                  <Row className="g-2">
                    {pros.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Pro {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateArrayItem("usesAndBenefits.medicinalUses.pros",pros,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("usesAndBenefits.medicinalUses.pros",pros,index)}
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
                <strong>Medicinal Cons</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={()=>addArrayItem("usesAndBenefits.medicinalUses.cons",cons)}
                >
                  <Plus size={15} />
                  Add Con
                </Button>
              </Card.Header>

              <Card.Body>
                {cons.length === 0 ? (
                  <div className="text-muted small">No medicinal cons added.</div>
                ) : (
                  <Row className="g-2">
                    {cons.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Con {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateArrayItem("usesAndBenefits.medicinalUses.cons",cons,index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeArrayItem("usesAndBenefits.medicinalUses.cons",cons,index)}
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
            <InputGroup>
              <InputGroup.Text className="fw-bold">Toxicity</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.toxicity || ""}
                onChange={(e)=>updateField("usesAndBenefits.toxicity",e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}