// src/pages/forms/seeds/tabs/SeedPropagationTab.jsx
import { Card, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";
import SortedSelect from "../../../../components/SortedSelect.jsx";

export default function SeedPropagationTab({ formData, updateField, propagationMethods = [] }) {
  const data=formData.propagationMethods || {};
  const methods=Array.isArray(data.method) ? data.method : [];
  const notes=Array.isArray(data.notes) ? data.notes : [];

  const getMethodLabel=(item)=>{
    return item.name || item.title || item.label || item.method || "";
  };

  const getMethodValue=(item)=>{
    return item?._id || item?.id || item?.value || "";
  };

  const addMethod=()=>{
    updateField("propagationMethods.method",[...methods,""]);
  };

  const updateMethod=(index,value)=>{
    const list=[...methods];
    list[index]=value;
    updateField("propagationMethods.method",list);
  };

  const removeMethod=(index)=>{
    const list=[...methods];
    list.splice(index,1);
    updateField("propagationMethods.method",list);
  };

  const addNote=()=>{
    updateField("propagationMethods.notes",[...notes,""]);
  };

  const updateNote=(index,value)=>{
    const list=[...notes];
    list[index]=value;
    updateField("propagationMethods.notes",list);
  };

  const removeNote=(index)=>{
    const list=[...notes];
    list.splice(index,1);
    updateField("propagationMethods.notes",list);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h5 className="mb-3">Propagation Methods</h5>

        <Row className="g-3">
          <Col md={6}>
            <Card className="border">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Propagation Methods</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addMethod}
                >
                  <Plus size={15} />
                  Add Method
                </Button>
              </Card.Header>

              <Card.Body>
                {methods.length === 0 ? (
                  <div className="text-muted small">No propagation methods added.</div>
                ) : (
                  <Row className="g-2">
                    {methods.map((method,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Method {index+1}</InputGroup.Text>
                          <SortedSelect
                            value={method?._id || method || ""}
                            onChange={(e)=>updateMethod(index,e.target.value)}
                            options={propagationMethods}
                            getValue={getMethodValue}
                            getLabel={getMethodLabel}
                            placeholder="Select method"
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeMethod(index)}
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
                <strong>Propagation Notes</strong>

                <Button
                  type="button"
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1"
                  onClick={addNote}
                >
                  <Plus size={15} />
                  Add Note
                </Button>
              </Card.Header>

              <Card.Body>
                {notes.length === 0 ? (
                  <div className="text-muted small">No propagation notes added.</div>
                ) : (
                  <Row className="g-2">
                    {notes.map((note,index)=>(
                      <Col xs={12} key={index}>
                        <InputGroup>
                          <InputGroup.Text className="fw-bold">Note {index+1}</InputGroup.Text>
                          <Form.Control
                            value={note || ""}
                            onChange={(e)=>updateNote(index,e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-danger"
                            className="d-inline-flex align-items-center"
                            onClick={()=>removeNote(index)}
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
