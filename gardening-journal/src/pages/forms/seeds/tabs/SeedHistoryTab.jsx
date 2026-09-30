// src/pages/forms/seeds/tabs/SeedHistoryTab.jsx
import { Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

export default function SeedHistoryTab({ formData, updateField }) {
  const data=formData.historicalInformation || {};
  const events=Array.isArray(data.events) ? data.events : [];

  const addEvent=()=>{
    updateField("historicalInformation.events",[...events,{date:"",timePeriod:"",event:""}]);
  };

  const updateEvent=(index,key,value)=>{
    const list=[...events];
    list[index]={...(list[index] || {}),[key]:value};
    updateField("historicalInformation.events",list);
  };

  const removeEvent=(index)=>{
    const list=[...events];
    list.splice(index,1);
    updateField("historicalInformation.events",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Historical Information</h5>

        <Row className="g-3">
          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text className="fw-bold">Food Origin</InputGroup.Text>
              <Form.Control
                as="textarea"
                rows={4}
                value={data.foodOrigin || ""}
                onChange={(e)=>updateField("historicalInformation.foodOrigin",e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col xs={12}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Food History Events</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addEvent}
                >
                  <Plus size={15} />
                  Add Event
                </Button>
              </Card.Header>

              <Card.Body>
                {events.length === 0 ? (
                  <div className="text-muted small">No history events added.</div>
                ) : (
                  events.map((item,index)=>(
                    <Card className="mb-3" key={index}>
                      <Card.Body>
                        <Row className="g-2">
                          <Col md={6}>
                            <InputGroup>
                              <InputGroup.Text>Date</InputGroup.Text>
                              <Form.Control
                                value={item.date || ""}
                                onChange={(e)=>updateEvent(index,"date",e.target.value)}
                              />
                            </InputGroup>
                          </Col>

                          <Col md={6}>
                            <InputGroup>
                              <InputGroup.Text>Time Period</InputGroup.Text>
                              <Form.Control
                                value={item.timePeriod || ""}
                                onChange={(e)=>updateEvent(index,"timePeriod",e.target.value)}
                              />
                            </InputGroup>
                          </Col>

                          <Col xs={12}>
                            <InputGroup>
                              <InputGroup.Text>Event</InputGroup.Text>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={item.event || ""}
                                onChange={(e)=>updateEvent(index,"event",e.target.value)}
                              />
                            </InputGroup>
                          </Col>

                          <Col xs={12}>
                            <Button
                              type="button"
                              variant="outline-danger"
                              size="sm"
                              className="d-inline-flex align-items-center gap-1"
                              onClick={()=>removeEvent(index)}
                            >
                              <Trash2 size={15} />
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}