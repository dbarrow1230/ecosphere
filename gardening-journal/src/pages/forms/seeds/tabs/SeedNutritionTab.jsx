// src/pages/forms/seeds/tabs/SeedNutritionTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedNutritionTab({ formData, updateField }) {
  const nutritionalInformation=Array.isArray(formData.nutritionalInformation) ? formData.nutritionalInformation : [];

  const addNutritionItem=()=>{
    updateField("nutritionalInformation",[...nutritionalInformation,""]);
  };

  const updateNutritionItem=(index,value)=>{
    const list=[...nutritionalInformation];
    list[index]=value;
    updateField("nutritionalInformation",list);
  };

  const removeNutritionItem=(index)=>{
    const list=[...nutritionalInformation];
    list.splice(index,1);
    updateField("nutritionalInformation",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Nutritional Information</h5>

        <Row className="g-3">
          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Nutritional Information</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addNutritionItem}
                >
                  <Plus size={15} />
                  Add Item
                </Button>
              </Card.Header>

              <Card.Body>
                {nutritionalInformation.length === 0 ? (
                  <div className="text-muted small">No nutritional information added.</div>
                ) : (
                  <Row className="g-2">
                    {nutritionalInformation.map((item,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Item {index+1}</InputGroup.Text>
                          <Form.Control
                            value={item || ""}
                            onChange={(e)=>updateNutritionItem(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeNutritionItem(index)}
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