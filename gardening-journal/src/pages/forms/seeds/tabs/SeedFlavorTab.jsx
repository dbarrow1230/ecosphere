// src/pages/forms/seeds/tabs/SeedFlavorTab.jsx
import { Card, Row, Col, Form, InputGroup } from "react-bootstrap";

export default function SeedFlavorTab({ formData, updateField }) {
  const getList=field=>{
    const list=Array.isArray(formData[field]) ? [...formData[field]] : [];
    while(list.length < 3)list.push("");
    return list.slice(0,3);
  };

  const taste=getList("taste");
  const aroma=getList("aroma");
  const mouthfeel=getList("mouthfeel");

  const updateArrayItem=(field,list,index,value)=>{
    const updated=[...list];
    updated[index]=value;
    updateField(field,updated);
  };

  const renderArrayCard=(title,field,list)=>{
    return (
      <Card className="border h-100">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <strong>{title}</strong>
        </Card.Header>

        <Card.Body>
          <Row className="g-2">
            {list.map((item,index)=>(
              <Col xs={12} key={index}>
                <InputGroup>
                  <InputGroup.Text className="fw-bold">{title} {index+1}</InputGroup.Text>
                  <Form.Control
                    value={item || ""}
                    onChange={(e)=>updateArrayItem(field,list,index,e.target.value)}
                  />
                </InputGroup>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Flavor Profile</h5>

        <Row className="g-3">
          <Col md={4}>
            {renderArrayCard("Taste","taste",taste)}
          </Col>

          <Col md={4}>
            {renderArrayCard("Aroma","aroma",aroma)}
          </Col>

          <Col md={4}>
            {renderArrayCard("Mouthfeel","mouthfeel",mouthfeel)}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}