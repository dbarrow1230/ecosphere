// src/pages/forms/seeds/tabs/SeedCulturalTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedCulturalTab({ formData, updateField }) {
  const culturalInformation=Array.isArray(formData.culturalInformation) ? formData.culturalInformation : [];

  const addCulturalNote=()=>{
    updateField("culturalInformation",[...culturalInformation,""]);
  };

  const updateCulturalNote=(index,value)=>{
    const list=[...culturalInformation];
    list[index]=value;
    updateField("culturalInformation",list);
  };

  const removeCulturalNote=(index)=>{
    const list=[...culturalInformation];
    list.splice(index,1);
    updateField("culturalInformation",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Cultural Information</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Cultural Notes</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addCulturalNote}
                >
                  <Plus size={15} />
                  Add Note
                </Button>
              </Card.Header>

              <Card.Body>
                {culturalInformation.length === 0 ? (
                  <div className="text-muted small">No cultural notes added.</div>
                ) : (
                  <Row className="g-2">
                    {culturalInformation.map((note,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Note {index+1}</InputGroup.Text>
                          <Form.Control
                            value={note || ""}
                            onChange={(e)=>updateCulturalNote(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeCulturalNote(index)}
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