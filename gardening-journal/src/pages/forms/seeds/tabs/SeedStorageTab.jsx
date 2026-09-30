// src/pages/forms/seeds/tabs/SeedStorageTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedStorageTab({ formData, updateField }) {
  const storageTips=Array.isArray(formData.storageTips) ? formData.storageTips : [];

  const addStorageTip=()=>{
    updateField("storageTips",[...storageTips,""]);
  };

  const updateStorageTip=(index,value)=>{
    const list=[...storageTips];
    list[index]=value;
    updateField("storageTips",list);
  };

  const removeStorageTip=(index)=>{
    const list=[...storageTips];
    list.splice(index,1);
    updateField("storageTips",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Storage Tips</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Storage Tips</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addStorageTip}
                >
                  <Plus size={15} />
                  Add Tip
                </Button>
              </Card.Header>

              <Card.Body>
                {storageTips.length === 0 ? (
                  <div className="text-muted small">No storage tips added.</div>
                ) : (
                  <Row className="g-2">
                    {storageTips.map((tip,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Tip {index+1}</InputGroup.Text>
                          <Form.Control
                            value={tip || ""}
                            onChange={(e)=>updateStorageTip(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeStorageTip(index)}
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
              <InputGroup.Text className="fw-bold">Growing Notes</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.growingNotes || ""}
                onChange={(e)=>updateField("growingNotes",e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}